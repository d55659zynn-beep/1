const { ensureLogin } = require('../../utils/auth')

Page({
  data: {
    isAdmin: false,
    userInfo: null,
    openidTail: ''
  },

  async onShow() {
    const g = await ensureLogin()
    this.setData({
      isAdmin: g.isAdmin,
      userInfo: g.userInfo,
      openidTail: (g.openid || '').slice(-6)
    })
  },

  goOrders() {
    wx.navigateTo({ url: '/subpackages/trade/pages/orders/index' })
  },

  goAdmin() {
    if (!this.data.isAdmin) {
      return wx.showModal({
        title: '未开通管理权限',
        content: '在云开发控制台 - 数据库 - users 集合，把当前用户的 isAdmin 改为 true 即可',
        showCancel: false
      })
    }
    wx.navigateTo({ url: '/subpackages/admin/pages/goods-list/index' })
  },

  goOrderManage() {
    if (!this.data.isAdmin) {
      return wx.showModal({
        title: '未开通管理权限',
        content: '在云开发控制台 - 数据库 - users 集合，把当前用户的 isAdmin 改为 true 即可',
        showCancel: false
      })
    }
    wx.navigateTo({ url: '/subpackages/admin/pages/order-manage/index' })
  },

  onShareAppMessage() {
    return { title: '好物小店', path: '/pages/index/index' }
  }
})
