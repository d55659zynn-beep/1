const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const cart = db.collection('carts')
  const action = event.action || 'list'

  try {
    if (action === 'list') {
      const res = await cart.where({ _openid: OPENID }).orderBy('createTime', 'desc').limit(100).get()
      return { code: 0, data: res.data }
    }

    if (action === 'add') {
      const productId = event.productId
      const qty = Number(event.quantity) || 1
      const pRes = await db.collection('products').doc(productId).get()
      const goods = pRes.data
      if (!goods || goods.status !== 'on') throw new Error('商品已下架')
      if (goods.stock < qty) throw new Error('库存不足')

      const exist = await cart.where({ _openid: OPENID, productId }).limit(1).get()
      if (exist.data.length) {
        const item = exist.data[0]
        const next = item.quantity + qty
        if (next > goods.stock) throw new Error('超出库存')
        await cart.doc(item._id).update({
          data: { quantity: next, price: goods.price, title: goods.title, cover: goods.cover }
        })
        return { code: 0, data: { _id: item._id, quantity: next } }
      }

      const addRes = await cart.add({
        data: {
          _openid: OPENID,
          productId,
          title: goods.title,
          cover: goods.cover,
          price: goods.price,
          quantity: qty,
          checked: true,
          createTime: Date.now()
        }
      })
      return { code: 0, data: { _id: addRes._id, quantity: qty } }
    }

    if (action === 'update') {
      const qty = Number(event.quantity)
      if (qty <= 0) {
        await cart.doc(event.id).remove()
      } else {
        await cart.doc(event.id).update({ data: { quantity: qty } })
      }
      return { code: 0, data: { _id: event.id, quantity: qty } }
    }

    if (action === 'remove') {
      await cart.doc(event.id).remove()
      return { code: 0, data: { _id: event.id } }
    }

    if (action === 'clear') {
      const ids = event.ids
      if (ids && ids.length) {
        await cart.where({ _openid: OPENID, _id: _.in(ids) }).remove()
      } else {
        await cart.where({ _openid: OPENID }).remove()
      }
      return { code: 0, data: {} }
    }

    return { code: -1, message: '未知操作：' + action }
  } catch (err) {
    return { code: -1, message: err.message || '操作失败' }
  }
}
