// 登录态与身份
const ensureLogin = async () => {
  const app = getApp()
  await app.ensureLogin()
  return app.globalData
}

const isAdmin = () => !!(getApp() && getApp().globalData && getApp().globalData.isAdmin)

// 金额：分 -> 元字符串（统一用「分」存库，避免浮点误差）
const fen2yuan = (fen) => (Number(fen || 0) / 100).toFixed(2)

const yuan2fen = (yuan) => Math.round(Number(yuan || 0) * 100)

module.exports = { ensureLogin, isAdmin, fen2yuan, yuan2fen }
