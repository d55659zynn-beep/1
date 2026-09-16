const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
// 微信支付商户号：云开发控制台「云调用 - 微信支付」绑定后，也可配置在云函数环境变量 WXPAY_MCHID
const MCHID = process.env.WXPAY_MCHID || 'REPLACE_MCHID'
const ENV_ID = process.env.TCB_ENV || cloud.DYNAMIC_CURRENT_ENV

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { orderId } = event

  try {
    const oRes = await db.collection('orders').doc(orderId).get()
    const order = oRes.data
    if (!order || order._openid !== OPENID) throw new Error('订单不存在')
    if (order.status !== 'unpaid') throw new Error('订单已支付或已关闭')

    const res = await cloud.cloudPay.unifiedOrder({
      body: (order.items[0] && order.items[0].title) || '商品订单',
      outTradeNo: order.orderNo,
      spbillCreateIp: '127.0.0.1',
      subMchId: MCHID,
      totalFee: order.total,
      envId: ENV_ID,
      functionName: 'payCallback'
    })

    if (res && res.payment && res.payment.package) {
      await db.collection('orders').doc(orderId).update({
        data: { prepayId: res.payment.package, updateTime: Date.now() }
      })
    }

    return { code: 0, data: res.payment }
  } catch (err) {
    return { code: -1, message: err.message || '支付下单失败' }
  }
}
