const { call } = require('../../../../utils/cloud')

Page({
  data: {
    list: [],
    status: 'all',
    keyword: ''
  },

  onShow() {
    this.load()
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh())
  },

  async load() {
    try {
      const list = await call('product', 'adminList', {
        status: this.data.status,
        keyword: this.data.keyword
      })
      this.setData({ list: list || [] })
    } catch (err) {
      this.setData({ list: [] })
    }
  },

  onTab(e) {
    this.setData({ status: e.currentTarget.dataset.key })
    this.load()
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value })
    this.load()
  },

  async onToggle(e) {
    const { id, status } = e.currentTarget.dataset
    const next = status === 'on' ? 'off' : 'on'
    await call('product', 'setStatus', { id, status: next })
    wx.showToast({ title: next === 'on' ? '已上架' : '已下架' })
    this.load()
  },

  async onRemove(e) {
    const id = e.currentTarget.dataset.id
    const ok = await new Promise((resolve) => {
      wx.showModal({
        title: '删除商品',
        content: '删除后不可恢复，确定删除吗？',
        success: (r) => resolve(r.confirm)
      })
    })
    if (!ok) return
    await call('product', 'remove', { id })
    this.load()
  },

  onCreate() {
    wx.navigateTo({ url: '/subpackages/admin/pages/goods-edit/index' })
  },

  onEdit(e) {
    wx.navigateTo({ url: `/subpackages/admin/pages/goods-edit/index?id=${e.currentTarget.dataset.id}` })
  }
})
