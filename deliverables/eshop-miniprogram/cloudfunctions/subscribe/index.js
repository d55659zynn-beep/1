const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 模板 ID：小程序后台「订阅消息 - 公共模板库」选用「发货通知」后复制
// 建议在云函数环境变量里配置 TPL_SHIP，避免硬编码
const TPL_SHIP = process.env.TPL_SHIP || 'REPLACE_TPL_SHIP'

const pad = (n) => String(n).padStart(2, '0')
const fmtTime = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`

const clip = (s, n) => {
  const str = String(s || '')
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action
  const orders = db.collection('orders')

  try {
    // 用户授权成功后，给该订单记一次下发额度（一次性订阅：授权一次可发一条）
    if (action === 'grant') {
      if (!event.orderId) throw new Error('缺少 orderId')
      await orders.doc(event.orderId).update({ data: { subscribeQuota: _.inc(1), updateTime: Date.now() } })
      return { code: 0, data: { orderId: event.orderId } }
    }

    // 商家发货：校验额度 → 下发订阅消息 → 改订单状态 → 扣减额度
    if (action === 'sendShip') {
      const me = await db.collection('users').where({ _openid: OPENID }).limit(1).get()
      if (!me.data[0] || !me.data[0].isAdmin) {
        return { code: 403, message: '无权限：请先把自己设为管理员' }
      }

      const orderRes = await orders.doc(event.orderId).get()
      const order = orderRes.data
      if (!order) throw new Error('订单不存在')
      if (!(order.subscribeQuota > 0)) {
        return { code: -1, message: '买家未授权订阅消息，无法下发通知' }
      }
      if (!event.company || !event.no) throw new Error('请填写快递公司与单号')

      const goodsName = clip((order.items[0] && order.items[0].title) || '商品', 20)

      await cloud.openapi.subscribeMessage.send({
        touser: order._openid,
        templateId: TPL_SHIP,
        page: 'subpackages/trade/pages/orders/index',
        miniprogramState: process.env.MP_STATE || 'formal', // 开发/体验阶段可设为 trial
        lang: 'zh_CN',
        data: {
          // 字段名需与你选用的模板一致，在模板详情页核对后调整
          thing1: { value: goodsName },
          character_string2: { value: order.orderNo },
          time3: { value: fmtTime(new Date()) },
          thing4: { value: clip(event.company, 20) },
          character_string5: { value: clip(event.no, 32) }
        }
      })

      await orders.doc(event.orderId).update({
        data: {
          status: 'shipped',
          express: { company: event.company, no: event.no },
          shipTime: Date.now(),
          subscribeQuota: _.inc(-1),
          updateTime: Date.now()
        }
      })

      return { code: 0, data: { orderId: event.orderId } }
    }

    // 主动召回：券到期 / 降价提醒等，按需扩展
    if (action === 'send') {
      const me = await db.collection('users').where({ _openid: OPENID }).limit(1).get()
      if (!me.data[0] || !me.data[0].isAdmin) {
        return { code: 403, message: '无权限' }
      }
      await cloud.openapi.subscribeMessage.send({
        touser: event.toUser,
        templateId: event.templateId || TPL_SHIP,
        page: event.page || 'pages/index/index',
        miniprogramState: process.env.MP_STATE || 'formal',
        lang: 'zh_CN',
        data: event.data || {}
      })
      return { code: 0, data: {} }
    }

    return { code: -1, message: '未知操作：' + action }
  } catch (err) {
    return { code: err.code || -1, message: err.message || '操作失败' }
  }
}
