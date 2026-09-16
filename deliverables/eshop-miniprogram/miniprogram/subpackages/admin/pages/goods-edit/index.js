const { call, chooseImage, uploadImage } = require('../../../../utils/cloud')
const app = getApp()

Page({
  data: {
    id: '',
    cats: [],
    categoryIndex: 0,
    images: [],
    form: {
      title: '',
      subtitle: '',
      priceYuan: '',
      marketYuan: '',
      stock: '',
      description: '',
      status: 'on',
      sort: 0
    }
  },

  onLoad(options) {
    const cats = app.globalData.categories.filter((c) => c.id !== 'all')
    this.setData({ cats, id: options.id || '' })
    wx.setNavigationBarTitle({ title: options.id ? '编辑商品' : '发布商品' })
    if (options.id) this.loadDetail(options.id)
  },

  async loadDetail(id) {
    try {
      const d = await call('product', 'detail', { id })
      const idx = Math.max(0, this.data.cats.findIndex((c) => c.id === d.categoryId))
      this.setData({
        categoryIndex: idx,
        images: d.images && d.images.length ? d.images : d.cover ? [d.cover] : [],
        form: {
          title: d.title || '',
          subtitle: d.subtitle || '',
          priceYuan: String((d.price || 0) / 100),
          marketYuan: d.marketPrice ? String(d.marketPrice / 100) : '',
          stock: String(d.stock || 0),
          description: d.description || '',
          status: d.status || 'on',
          sort: d.sort || 0
        }
      })
    } catch (err) {
      /* 已提示 */
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onCategory(e) {
    this.setData({ categoryIndex: Number(e.detail.value) })
  },

  onStatus(e) {
    this.setData({ 'form.status': e.detail.value ? 'on' : 'off' })
  },

  async onChooseImage() {
    const remain = 6 - this.data.images.length
    if (remain <= 0) return wx.showToast({ title: '最多 6 张', icon: 'none' })
    const files = await chooseImage(remain).catch(() => [])
    if (!files.length) return
    wx.showLoading({ title: '上传中', mask: true })
    try {
      for (const file of files) {
        const fileID = await uploadImage(file, 'goods')
        this.data.images.push(fileID)
      }
      this.setData({ images: this.data.images })
    } finally {
      wx.hideLoading()
    }
  },

  onRemoveImage(e) {
    const index = Number(e.currentTarget.dataset.index)
    const images = this.data.images.slice()
    images.splice(index, 1)
    this.setData({ images })
  },

  async onSave() {
    const f = this.data.form
    if (!f.title.trim()) return wx.showToast({ title: '请填写商品标题', icon: 'none' })
    const price = Math.round(Number(f.priceYuan) * 100)
    if (!(price > 0)) return wx.showToast({ title: '请填写正确的售价', icon: 'none' })
    if (!this.data.images.length) return wx.showToast({ title: '至少上传一张商品图', icon: 'none' })

    const payload = {
      title: f.title.trim(),
      subtitle: f.subtitle.trim(),
      images: this.data.images,
      price,
      marketPrice: f.marketPrice || (f.marketYuan ? Math.round(Number(f.marketYuan) * 100) : 0),
      categoryId: this.data.cats[this.data.categoryIndex].id,
      stock: Number(f.stock) || 0,
      description: f.description,
      status: f.status,
      sort: Number(f.sort) || 0
    }

    wx.showLoading({ title: '保存中', mask: true })
    try {
      if (this.data.id) {
        await call('product', 'update', { id: this.data.id, payload })
      } else {
        await call('product', 'create', payload)
      }
      wx.showToast({ title: '已保存' })
      setTimeout(() => wx.navigateBack(), 600)
    } finally {
      wx.hideLoading()
    }
  }
})
