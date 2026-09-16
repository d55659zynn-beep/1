const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const PAGE_SIZE = 10

// 商家后台权限校验
async function requireAdmin(openid) {
  const res = await db.collection('users').where({ _openid: openid }).limit(1).get()
  const user = res.data[0]
  if (!user || !user.isAdmin) {
    const err = new Error('无权限：请在云开发控制台把该用户 isAdmin 设为 true')
    err.code = 403
    throw err
  }
  return user
}

function buildQuery(event, isAdmin) {
  const where = {}
  if (event.status === 'all' || !event.status) {
    if (!isAdmin) where.status = 'on'
  } else {
    where.status = event.status
  }
  if (event.categoryId && event.categoryId !== 'all') where.categoryId = event.categoryId
  return where
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const action = event.action || 'list'
  const col = db.collection('products')
  const page = Number(event.page) || 1

  try {
    switch (action) {
      // 前台：在售商品列表（支持分类 / 关键词）
      case 'list': {
        const where = buildQuery(event, false)
        let query = col.where(where)
        if (event.keyword) {
          query = col.where(_.and([where, { title: db.RegExp({ regexp: event.keyword, options: 'i' }) }]))
        }
        const res = await query
          .orderBy('sort', 'desc')
          .orderBy('createTime', 'desc')
          .skip((page - 1) * PAGE_SIZE)
          .limit(PAGE_SIZE)
          .get()
        return { code: 0, data: res.data }
      }

      case 'detail': {
        const res = await col.doc(event.id).get()
        return { code: 0, data: res.data }
      }

      // ---- 以下为商家后台 ----
      case 'adminList': {
        await requireAdmin(OPENID)
        const where = {}
        if (event.status && event.status !== 'all') where.status = event.status
        let query = col.where(where)
        if (event.keyword) {
          query = col.where(_.and([where, { title: db.RegExp({ regexp: event.keyword, options: 'i' }) }]))
        }
        const res = await query.orderBy('createTime', 'desc').skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).get()
        return { code: 0, data: res.data }
      }

      case 'create': {
        await requireAdmin(OPENID)
        const now = Date.now()
        const data = {
          title: event.title,
          subtitle: event.subtitle || '',
          cover: (event.images && event.images[0]) || '',
          images: event.images || [],
          price: Number(event.price) || 0, // 单位：分
          marketPrice: Number(event.marketPrice) || 0,
          categoryId: event.categoryId || 'daily',
          stock: Number(event.stock) || 0,
          sales: 0,
          description: event.description || '',
          status: event.status || 'on', // on 上架 / off 下架
          sort: Number(event.sort) || 0,
          createTime: now,
          updateTime: now
        }
        if (!data.title || data.price <= 0) throw new Error('商品标题和价格必填')
        const res = await col.add({ data })
        return { code: 0, data: { _id: res._id } }
      }

      case 'update': {
        await requireAdmin(OPENID)
        const patch = Object.assign({}, event.payload || {}, { updateTime: Date.now() })
        delete patch._id
        delete patch._openid
        await col.doc(event.id).update({ data: patch })
        return { code: 0, data: { _id: event.id } }
      }

      case 'setStatus': {
        await requireAdmin(OPENID)
        await col.doc(event.id).update({ data: { status: event.status === 'on' ? 'on' : 'off', updateTime: Date.now() } })
        return { code: 0, data: { _id: event.id, status: event.status } }
      }

      case 'remove': {
        await requireAdmin(OPENID)
        await col.doc(event.id).remove()
        return { code: 0, data: { _id: event.id } }
      }

      default:
        return { code: -1, message: '未知操作：' + action }
    }
  } catch (err) {
    return { code: err.code || -1, message: err.message || '操作失败' }
  }
}
