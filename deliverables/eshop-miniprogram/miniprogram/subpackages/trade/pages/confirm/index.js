const { call } = require('../../../../utils/cloud')

const requestPayment = (params) =>
  new Promise((resolve, reject) => {
    wx.requestPayment(Object.assign({}, params, { success: resolve, fail: reject }))
  })

Page({
  data: {
    items: [],
    total: 0,
    remark: '',
    address: { name: '', phone: '', detail: '' }
  },

  cartIds: [],

  async onLoad(options) {
    let payload = {}
    try {
      payload = JSON.parse(decodeURIComponent(options.payload || '{}'))
    } catch (err) {
      payload = {}
    }
    this.cartIds = payload.ids || []

    const picks = payload.items || []
    const details = await Promise.all(
      picks.map((p) => call('product', 'detail', { id: p.productId }).catch(() => null))
    )
    const items = []
    let total = 0
    picks.forEach((p, i) => {
      const d = details[i]
      if (!d) return
      items.push({
        productId: d._id,
        title: d.title,
        cover: d.cover,
        price: d.price,
        quantity: Number(p.quantity) || 1
      })
      total += d.price * (Number(p.quantity) || 1)
    })
    this.setData({ items, total })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`address.${field}`]: e.detail.value })
  },

  onRemark(e) {
    this.setData({ remark: e.detail.value })
  },

  async onSubmit() {
    const { name, phone, detail } = this.data.address
    if (!name || !phone || !detail) {
      return wx.showToast({ title: '请填写完整收货信息', icon: 'none' })
    }
    if (!/^1\d{10}$/.test(phone)) {
      return wx.showToast({ title: '手机号格式不正确', icon: 'none' })
    }

    wx.showLoading({ title: '提交中', mask: true })
    try {
      const order = await call('order', 'create', {
        items: this.data.items,
        address: this.data.address,
        remark: this.data.remark,
        clearCartIds: this.cartIds
      })
      await this.pay(order._id)
    } catch (err) {
      /* 已提示 */
    } finally {
      wx.hideLoading()
    }
  },

  async pay(orderId) {
    let payment
    try {
      payment = await call('pay', 'unifiedOrder', { orderId })
    } catch (err) {
      // 支付未配置时也能看到订单，方便调试
      return wx.redirectTo({
        url: `/subpackages/trade/pages/pay-result/index?orderId=${orderId}&ok=0&msg=${encodeURIComponent('支付未配置')}`
      })
    }
    try {
      await requestPayment(payment)
      wx.redirectTo({ url: `/subpackages/trade/pages/pay-result/index?orderId=${orderId}&ok=1` })
    } catch (err) {
      const cancelled = (err.errMsg || '').indexOf('cancel') > -1
      wx.redirectTo({
        url: `/subpackages/trade/pages/pay-result/index?orderId=${orderId}&ok=0&msg=${encodeURIComponent(cancelled ? '已取消支付' : '支付失败')}`
      })
    }
  }
})
