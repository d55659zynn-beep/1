const { call } = require('../../utils/cloud')
const app = getApp()

Page({
  data: {
    list: [],
    total: 0,
    count: 0
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const list = await call('cart', 'list')
      this.calc(list || [])
    } catch (err) {
      this.setData({ list: [], total: 0, count: 0 })
    }
  },

  calc(list) {
    let total = 0
    let count = 0
    list.forEach((item) => {
      if (item.checked) {
        total += item.price * item.quantity
        count += item.quantity
      }
    })
    this.setData({ list, total, count })
    app.globalData.cartCount = count
  },

  async onToggle(e) {
    const id = e.currentTarget.dataset.id
    const list = this.data.list.map((item) =>
      item._id === id ? Object.assign({}, item, { checked: !item.checked }) : item
    )
    this.calc(list)
  },

  async onMinus(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find((i) => i._id === id)
    if (!item) return
    if (item.quantity <= 1) return this.onRemove(e)
    await call('cart', 'update', { id, quantity: item.quantity - 1 })
    this.load()
  },

  async onPlus(e) {
    const id = e.currentTarget.dataset.id
    const item = this.data.list.find((i) => i._id === id)
    if (!item) return
    await call('cart', 'update', { id, quantity: item.quantity + 1 })
    this.load()
  },

  async onRemove(e) {
    const id = e.currentTarget.dataset.id
    await call('cart', 'remove', { id })
    this.load()
  },

  goConfirm() {
    const items = this.data.list.filter((i) => i.checked)
    if (!items.length) return wx.showToast({ title: '请选择商品', icon: 'none' })
    const payload = encodeURIComponent(
      JSON.stringify({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        ids: items.map((i) => i._id)
      })
    )
    wx.navigateTo({ url: `/subpackages/trade/pages/confirm/confirm?payload=${payload}` })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
