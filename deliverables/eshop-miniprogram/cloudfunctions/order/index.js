const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

const genOrderNo = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6, '0')
  return `ES${date}${rand}`
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const orders = db.collection('orders')
  const action = event.action || 'list'

  try {
    if (action === 'create') {
      // 下单：服务端重新取价，不信任客户端金额
      const picks = event.items || []
      if (!picks.length) throw new Error('请先选择商品')

      const items = []
      let total = 0
      for (const pick of picks) {
        const pRes = await db.collection('products').doc(pick.productId).get()
        const goods = pRes.data
        const qty = Number(pick.quantity) || 1
        if (!goods || goods.status !== 'on') throw new Error(`「${(goods && goods.title) || '商品'}」已下架`)
        if (goods.stock < qty) throw new Error(`「${goods.title}」库存不足`)
        items.push({
          productId: goods._id,
          title: goods.title,
          cover: goods.cover,
          price: goods.price,
          quantity: qty
        })
        total += goods.price * qty
      }

      const orderNo = genOrderNo()
      const addRes = await orders.add({
        data: {
          _openid: OPENID,
          orderNo,
          items,
          total, // 单位：分
          status: 'unpaid', // unpaid / paid / shipped / done / canceled
          address: event.address || null,
          remark: event.remark || '',
          createTime: Date.now(),
          updateTime: Date.now()
        }
      })

      // 清空已下单的购物车条目
      if (event.clearCartIds && event.clearCartIds.length) {
        await db.collection('carts').where({ _openid: OPENID, _id: _.in(event.clearCartIds) }).remove()
      }

      return { code: 0, data: { _id: addRes._id, orderNo, total } }
    }

    if (action === 'list') {
      const where = { _openid: OPENID }
      if (event.status && event.status !== 'all') where.status = event.status
      const res = await orders.where(where).orderBy('createTime', 'desc').limit(50).get()
      return { code: 0, data: res.data }
    }

    if (action === 'detail') {
      const res = await orders.doc(event.id).get()
      return { code: 0, data: res.data }
    }

    if (action === 'cancel') {
      await orders.doc(event.id).update({ data: { status: 'canceled', updateTime: Date.now() } })
      return { code: 0, data: { _id: event.id } }
    }

    return { code: -1, message: '未知操作：' + action }
  } catch (err) {
    return { code: -1, message: err.message || '操作失败' }
  }
}
