const { call } = require('../../../../utils/cloud')

Page({
  data: {
    list: [],
    active: 'paid',
    forms: {}
  },

  onShow() {
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  async load() {
    try {
      const list = await call('order', 'adminList', { status: this.data.active })
      this.setData({ list: list || [] })
    } catch (err) {
      this.setData({ list: [] })
    }
  },

  onTab(e) {
    this.setData({ active: e.currentTarget.dataset.key })
    this.load()
  },

  onInput(e) {
    const { id, field } = e.currentTarget.dataset
    this.setData({ [`forms.${id}.${field}`]: e.detail.value })
  },

  async onShip(e) {
    const id = e.currentTarget.dataset.id
    const f = this.data.forms[id] || {}
    if (!f.company || !f.no) {
      return wx.showToast({ title: '请填写快递公司与单号', icon: 'none' })
    }
    wx.showLoading({ title: '发货中', mask: true })
    try {
      await call('subscribe', 'sendShip', { orderId: id, company: f.company, no: f.no })
      wx.showToast({ title: '已发货并通知买家' })
      this.load()
    } finally {
      wx.hideLoading()
    }
  }
})
