const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()
  if (!OPENID) return { code: -1, message: '无法获取 openid' }

  const users = db.collection('users')
  const now = Date.now()

  try {
    const exist = await users.where({ _openid: OPENID }).limit(1).get()
    if (exist.data.length) {
      const user = exist.data[0]
      await users.doc(user._id).update({ data: { lastLoginAt: now } })
      return { code: 0, data: { openid: OPENID, user: Object.assign({}, user, { lastLoginAt: now }) } }
    }

    const doc = {
      _openid: OPENID,
      nickName: '',
      avatarUrl: '',
      phone: '',
      isAdmin: false, // 商家后台权限：在云开发控制台把该字段改为 true 即开通
      points: 0,
      createTime: now,
      lastLoginAt: now
    }
    const addRes = await users.add({ data: doc })
    return { code: 0, data: { openid: OPENID, user: Object.assign({ _id: addRes._id }, doc) } }
  } catch (err) {
    return { code: -1, message: err.message || '登录失败' }
  }
}
