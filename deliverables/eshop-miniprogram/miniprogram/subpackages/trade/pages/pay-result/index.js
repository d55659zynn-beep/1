Page({
  data: {
    ok: false,
    msg: '',
    orderId: ''
  },

  onLoad(options) {
    this.setData({
      ok: options.ok === '1',
      msg: options.msg || '',
      orderId: options.orderId || ''
    })
    wx.setNavigationBarTitle({ title: options.ok === '1' ? '支付成功' : '支付未完成' })
  },

  goOrders() {
    wx.redirectTo({ url: '/subpackages/trade/pages/orders/index' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
