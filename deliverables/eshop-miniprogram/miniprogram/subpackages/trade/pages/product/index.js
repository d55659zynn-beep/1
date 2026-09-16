const { call } = require('../../../../utils/cloud')

Page({
  data: {
    id: '',
    detail: null
  },

  onLoad(options) {
    this.setData({ id: options.id || '' })
    this.load()
  },

  async load() {
    try {
      const detail = await call('product', 'detail', { id: this.data.id })
      this.setData({ detail })
      wx.setNavigationBarTitle({ title: detail.title || '商品详情' })
    } catch (err) {
      this.setData({ detail: null })
    }
  },

  async onAddCart() {
    try {
      await call('cart', 'add', { productId: this.data.id, quantity: 1 })
      wx.showToast({ title: '已加入购物车' })
    } catch (err) {
      /* 已提示 */
    }
  },

  onBuy() {
    const payload = encodeURIComponent(
      JSON.stringify({ items: [{ productId: this.data.id, quantity: 1 }], ids: [] })
    )
    wx.navigateTo({ url: `/subpackages/trade/pages/confirm/confirm?payload=${payload}` })
  },

  onShareAppMessage() {
    const d = this.data.detail || {}
    return {
      title: d.title || '好物推荐',
      path: `/subpackages/trade/pages/product/product?id=${this.data.id}`,
      imageUrl: d.cover || ''
    }
  },

  onShareTimeline() {
    const d = this.data.detail || {}
    return { title: d.title || '好物推荐', query: `id=${this.data.id}`, imageUrl: d.cover || '' }
  }
})
