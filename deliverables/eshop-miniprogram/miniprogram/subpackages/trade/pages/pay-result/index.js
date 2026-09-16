const { call } = require('../../../../utils/cloud')
const { TPL_SHIP, isConfigured } = require('../../../../utils/config')

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
    // 支付成功后立刻申请订阅授权，此时用户意愿最强
    if (options.ok === '1') this.requestSubscribe()
  },

  // 授权成功后把「一次下发额度」记到订单上，发货时消耗
  async requestSubscribe() {
    const orderId = this.data.orderId
    if (!orderId || !isConfigured(TPL_SHIP)) return
    try {
      const res = await new Promise((resolve, reject) => {
        wx.requestSubscribeMessage({ tmplIds: [TPL_SHIP], success: resolve, fail: reject })
      })
      if (res[TPL_SHIP] === 'accept') {
        await call('subscribe', 'grant', { orderId })
      }
    } catch (err) {
      // 用户拒绝或基础库不支持，都不影响主流程
      console.log('[subscribe] skipped', err)
    }
  },

  goOrders() {
    wx.redirectTo({ url: '/subpackages/trade/pages/orders/index' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
