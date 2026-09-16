// 云环境 ID：开通云开发后，在「云开发控制台 - 设置 - 环境 ID」复制，替换下面这行
const ENV_ID = 'eshop-prod-REPLACE_ME'

App({
  globalData: {
    openid: '',
    userInfo: null,
    isAdmin: false,
    cartCount: 0,
    categories: [
      { id: 'all', name: '全部' },
      { id: 'food', name: '食品' },
      { id: 'daily', name: '日用' },
      { id: 'digital', name: '数码' },
      { id: 'cloth', name: '服饰' }
    ]
  },

  onLaunch() {
    if (!wx.cloud) {
      wx.showModal({ title: '基础库过低', content: '请升级微信或调高基础库版本到 2.2.3 以上', showCancel: false })
      return
    }
    wx.cloud.init({ env: ENV_ID, traceUser: true })
    this._loginTask = this._login()
  },

  async _login() {
    try {
      const { result } = await wx.cloud.callFunction({ name: 'login' })
      if (result && result.code === 0) {
        this.globalData.openid = result.data.openid
        this.globalData.userInfo = result.data.user
        this.globalData.isAdmin = !!(result.data.user && result.data.user.isAdmin)
      }
    } catch (err) {
      console.error('[login] failed', err)
    }
  },

  // 页面里 await getApp().ensureLogin() 再拿 openid，避免时序问题
  ensureLogin() {
    if (!this._loginTask) this._loginTask = this._login()
    return this._loginTask
  },

  async refreshCartCount() {
    try {
      const list = await require('./utils/cloud').call('cart', 'list')
      const count = (list || []).reduce((sum, item) => sum + item.quantity, 0)
      this.globalData.cartCount = count
      return count
    } catch (err) {
      return this.globalData.cartCount
    }
  }
})
