// 订阅消息模板 ID 配置
// 获取方式：小程序后台 → 订阅消息 → 公共模板库 → 选用「发货通知」→ 复制模板 ID
// 同一个 ID 也要填到云函数 subscribe 的环境变量 TPL_SHIP（或在云函数里改默认值）
const TPL_SHIP = 'REPLACE_TPL_SHIP'

// 判断模板是否已配置，未配置时跳过授权弹窗，避免开发环境报错
const isConfigured = (id) => !!id && id.indexOf('REPLACE') !== 0

module.exports = { TPL_SHIP, isConfigured }
