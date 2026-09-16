const { call } = require('../../utils/cloud')
const app = getApp()

Page({
  data: {
    cats: [],
    activeId: '',
    list: []
  },

  onLoad() {
    const cats = app.globalData.categories.filter((c) => c.id !== 'all')
    this.setData({ cats, activeId: cats.length ? cats[0].id : '' })
    this.load()
  },

  async load() {
    try {
      const list = await call('product', 'list', { categoryId: this.data.activeId })
      this.setData({ list })
    } catch (err) {
      this.setData({ list: [] })
    }
  },

  onTap(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.activeId) return
    this.setData({ activeId: id })
    this.load()
  },

  onCardTap(e) {
    wx.navigateTo({ url: `/subpackages/trade/pages/product/product?id=${e.detail.id}` })
  }
})
