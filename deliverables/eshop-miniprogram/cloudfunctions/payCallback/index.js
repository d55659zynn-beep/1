const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 微信支付回调（云调用）：在云开发控制台把「支付回调」配置为这个云函数
exports.main = async (event) => {
  try {
    if (event.resultCode !== 'SUCCESS' || event.returnCode !== 'SUCCESS') {
      return { errcode: 0, errmsg: 'success' }
    }

    const oRes = await db.collection('orders').where({ orderNo: event.outTradeNo }).limit(1).get()
    const order = oRes.data[0]
    if (!order || order.status !== 'unpaid') {
      return { errcode: 0, errmsg: 'success' } // 幂等：已处理过直接返回成功
    }

    await db.collection('orders').doc(order._id).update({
      data: {
        status: 'paid',
        paidTime: Date.now(),
        transactionId: event.transactionId || '',
        updateTime: Date.now()
      }
    })

    // 扣库存、加销量
    for (const item of order.items) {
      await db.collection('products').doc(item.productId).update({
        data: { stock: _.inc(-item.quantity), sales: _.inc(item.quantity) }
      })
    }

    return { errcode: 0, errmsg: 'success' }
  } catch (err) {
    return { errcode: -1, errmsg: err.message || '回调处理失败' }
  }
}
