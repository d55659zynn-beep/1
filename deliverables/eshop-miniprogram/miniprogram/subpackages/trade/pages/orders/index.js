const { call } = require('../../../../utils/cloud')

const STATUS_TEXT = {
  unpaid: '待付款',
  paid: '待发货',
  shipped: '待收货',
  done: '已完成',
  canceled: '已取消'
}

Page({
  data: {
    list: [],
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'unpaid', name: '待付款' },
      { key: 'paid', name: '待发货' },
      { key: 'done', name: '已完成' }
    ],
    active: 'all'
  },

  onShow() {
    this.load()
  },

  async load() {
    try {
      const list = await call('order', 'list', { status: this.data.active })
      this.setData({
        list: (list || []).map((o) =>
          Object.assign({}, o, { statusText: STATUS_TEXT[o.status] || o.status })
        )
      })
    } catch (err) {
      this.setData({ list: [] })
    }
  },

  onTab(e) {
    this.setData({ active: e.currentTarget.dataset.key })
    this.load()
  },

  async onCancel(e) {
    const id = e.currentTarget.dataset.id
    const res = await new Promise((resolve) => {
      wx.showModal({
        title: '取消订单',
        content: '确定取消这笔订单吗？',
        success: (r) => resolve(r.confirm)
      })
    })
    if (!res) return
    await call('order', 'cancel', { id })
    this.load()
  }
})
