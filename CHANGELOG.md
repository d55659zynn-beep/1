# 更新日志

本文件由 WorkBuddy 在每次交付后自动追加，记录当天完成的工作与产物路径。

## 2026-09-16

### 1. 电商小程序架构设计
- 明确选型：电商零售 / 原生小程序 / 微信云开发 / 四类增长能力（分享裂变、订阅消息、公众号联动、搜索优化）
- 产出 `小程序架构设计-电商云开发版.md`：分包策略、10 个数据库集合、10 个云函数、支付与增长链路、审核避坑、三周路线图
- 新增三张架构图：`docs/diagrams/architecture.svg`、`subpackages.svg`、`growth-loop.svg`

### 2. 液态玻璃按钮（Flutter + 微信小程序双端）
- 复刻 `CarGuo/gsy_flutter_demo` 的毛玻璃按钮（源码定位：`lib/widget/canvas/glass_demo_page.dart` 的 `_buildGlassButton`）
- 新增液态高光扫过动效；小程序端做三层降级（backdrop-filter / 背景图二次模糊 / 半透明渐变）
- 产出 `deliverables/liquid-glass-button/`（Flutter 组件、小程序自定义组件、浏览器预览、接入文档）

### 3. 电商小程序 MVP 落地（可运行代码，73 个文件）
- 原生 + 云开发骨架：主包 4 个 tabBar 页，trade 分包（商品详情/确认订单/支付结果/订单列表）预加载，admin 分包（商品管理/发布编辑）
- 云函数 6 个：`login` / `product` / `cart` / `order` / `pay` / `payCallback`
- 打通「商家后台上架商品 → 前台浏览 → 加购 → 下单 → 支付 → 订单」全链路；金额统一用「分」存库
- 产出 `deliverables/eshop-miniprogram/`

### 4. iPhone 15 Pro Max 高保真原型
- 430×932 逻辑尺寸手机外壳（灵动岛、钛金属边框），暗色玻璃拟态 + 冷色霓虹渐变
- 4 个 Tab + 商品详情抽屉，底部导航固底不溢出；含分类筛选、加购角标、数量步进、秒杀倒计时
- 产出 `deliverables/prototypes/eshop-ios-prototype.html`

### 5. 其他
- `deliverables/prototypes/pelican-cycling.html`：SVG + CSS 的鹈鹕骑自行车 2D 动画（可暂停）
- `tools/`：GitHub REST API 上传脚本、Git 推送脚本、图标生成脚本

### 6. 订阅消息闭环（发货通知召回）
- 新增云函数 `subscribe`：`grant`（支付成功记一次下发额度）、`sendShip`（商家发货校验额度→发订阅消息→改状态→扣额度）、`send`（主动召回扩展）
- 小程序端：支付结果页 `pay-result` 支付成功后弹授权框；`utils/config.js` 存模板 ID 并做「未配置则跳过」；`mine` 页新增「订单管理（发货通知）」入口
- 商家后台 `subpackages/admin/order-manage`：按状态查订单、填快递公司与单号一键发货并触发服务通知；`order` 云函数新增 `adminList`
- 闭环：支付成功 → 申请授权 → 记录额度 → 商家发货 → 下发通知 → 扣减额度（一次性订阅，额度为 0 时提示「买家未授权」）
- 修复 `mine` 页「我的订单 / 商品管理」跳转路径（原指向不存在的 `orders/orders`、`goods-list/goods-list`）
- `eshop-miniprogram/README.md` 新增「四、接订阅消息」配置步骤，并同步目录结构与边界清单

### 待办
- SKU 多规格
- 优惠券 / 新人券
- 物流与售后、数据看板

## 2026-09-19

- 自动同步到 GitHub 仓库 d55659zynn-beep/1 main 分支，共 101 个文件
  - 新增：CHANGELOG.md、deliverables/eshop-miniprogram/cloudfunctions/cart/index.js、deliverables/eshop-miniprogram/cloudfunctions/cart/package.json、deliverables/eshop-miniprogram/cloudfunctions/login/index.js、deliverables/eshop-miniprogram/cloudfunctions/login/package.json、deliverables/eshop-miniprogram/cloudfunctions/order/index.js、deliverables/eshop-miniprogram/cloudfunctions/order/package.json、deliverables/eshop-miniprogram/cloudfunctions/pay/index.js、deliverables/eshop-miniprogram/cloudfunctions/pay/package.json、deliverables/eshop-miniprogram/cloudfunctions/payCallback/index.js、deliverables/eshop-miniprogram/cloudfunctions/payCallback/package.json、deliverables/eshop-miniprogram/cloudfunctions/product/index.js 等 101 项
  - 提交：7209585

## 2026-09-20

- 自动同步到 GitHub 仓库 d55659zynn-beep/1 main 分支，共 101 个文件
  - 修复同步脚本读取上次清单时的编码问题（旧清单按 ANSI 解码，中文文件名被误判为「新增 + 删除」）
  - 实际交付内容无增删改，本次为修正编码后的校验性同步（提交 e7aa67a、899ed09）
  - 修正后再次比对已正确识别为「无变更」

## 2026-09-21

- 自动同步到 GitHub 仓库 d55659zynn-beep/1 main 分支，共 101 个文件
  - 更新：CHANGELOG.md
  - 提交：316e27d
