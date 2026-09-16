// 云函数统一调用：约定返回 { code: 0, data } 或 { code: -1, message }
const call = (name, action, data = {}) => {
  return wx.cloud
    .callFunction({ name, data: Object.assign({ action }, data) })
    .then((res) => {
      const r = res.result || {}
      if (r.code !== 0) {
        throw Object.assign(new Error(r.message || '请求失败'), { code: r.code })
      }
      return r.data
    })
    .catch((err) => {
      wx.showToast({ title: err.message || '网络异常', icon: 'none' })
      throw err
    })
}

// 上传图片到云存储，返回 fileID（可直接给 image 组件用）
const uploadImage = (filePath, dir = 'goods') => {
  const ext = filePath.split('.').pop() || 'png'
  const cloudPath = `${dir}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
  return wx.cloud.uploadFile({ cloudPath, filePath }).then((res) => res.fileID)
}

// 隐私协议授权：wx.chooseMedia 属于隐私接口，未处理会导致线上上传图片静默失败
const ensurePrivacy = () =>
  new Promise((resolve, reject) => {
    if (!wx.getPrivacySetting) return resolve()
    wx.getPrivacySetting({
      success: (res) => {
        if (!res.needAuthorization) return resolve()
        wx.requirePrivacyAuthorize({
          success: resolve,
          fail: () => reject(new Error('需要同意隐私协议后才能上传图片'))
        })
      },
      fail: () => resolve()
    })
  })

const chooseImage = (count = 1) => {
  return ensurePrivacy().then(
    () =>
      new Promise((resolve, reject) => {
        wx.chooseMedia({
          count,
          mediaType: ['image'],
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => resolve(res.tempFiles.map((f) => f.tempFilePath)),
          fail: reject
        })
      })
  )
}

module.exports = { call, uploadImage, chooseImage }
