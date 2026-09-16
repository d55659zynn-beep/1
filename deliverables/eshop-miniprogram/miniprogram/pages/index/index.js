const { call } = require('../../utils/cloud')
const app = getApp()

Page({
  data: {
    categories: [],
    categoryId: 'all',
    keyword: '',
    list: [],
    page: 1,
    loading: false,
    noMore: false
  },

  onLoad() {
    this.setData({ categories: app.globalData.categories })
    this.load()
  },

  onShow() {
    app.refreshCartCount().then((count) => {
      if (count) wx.setTabBarBadge({ index: 2, text: String(count) })
      else wx.removeTabBarBadge({ index: 2 })
    })
  },

  onPullDownRefresh() {
    this.setData({ page: 1, list: [], noMore: false })
    this.load().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (!this.data.noMore) this.load(true)
  },

  async load(more) {
    if (this.data.loading) return
    this.setData({ loading: true })
    try {
      const page = more ? this.data.page + 1 : 1
      const list = await call('product', 'list', {
        categoryId: this.data.categoryId,
        keyword: this.data.keyword,
        page
      })
      this.setData({
        page,
        noMore: list.length < 10,
        list: more ? this.data.list.concat(list) : list
      })
    } catch (err) {
      // 错误已在 cloud.js 统一提示
    } finally {
      this.setData({ loading: false })
    }
  },

  onCategory(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.categoryId) return
    this.setData({ categoryId: id, page: 1, list: [], noMore: false })
    this.load()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.setData({ page: 1, list: [], noMore: false })
    this.load()
  },

  onCardTap(e) {
    const id = e.detail.id
    wx.navigateTo({ url: `/subpackages/trade/pages/product/product?id=${id}` })
  },

  async onAdd(e) {
    try {
      await call('cart', 'add', { productId: e.detail.id, quantity: 1 })
      wx.showToast({ title: '已加入购物车' })
      const count = await app.refreshCartCount()
      wx.setTabBarBadge({ index: 2, text: String(count) })
    } catch (err) {
      /* 已提示 */
    }
  },

  onShareAppMessage() {
    return { title: '好物小店 · 精选好货', path: '/pages/index/index' }
  },

  onShareTimeline() {
    return { title: '好物小店 · 精选好货' }
  }
})
