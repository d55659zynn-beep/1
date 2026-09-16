# 液态玻璃按钮（Liquid Glass Button）

还原 [CarGuo/gsy_flutter_demo](https://github.com/CarGuo/gsy_flutter_demo) 中毛玻璃按钮的视觉，并叠加「液态高光扫过 + 浮动气泡」动效。
同时提供 **Flutter** 与 **微信小程序** 两套实现，参数完全一致。

> 说明：你贴的 `lib/widget/liquid_glass_demo.dart` 实际位于 `lib/widget/canvas/` 下，内容是全屏液态玻璃着色器（iOS 26 风格，手指滑动扭曲背景图），本身没有按钮；
> 按钮实现在同目录的 `glass_demo_page.dart`（`_buildGlassButton`：60×60 圆形、1px 白色 22% 描边、`BackdropFilter` sigma 8、白色径向渐变 30%→10%、图标白色 86%）。本目录按这套规范复刻并加了动效。

## 目录结构

```
liquid-glass-button/
├── preview.html                      # 浏览器直接打开的效果预览
├── flutter/
│   ├── liquid_glass_button.dart      # 组件：LiquidGlassButton + LiquidGlassBackdrop
│   └── liquid_glass_demo_page.dart   # 与官方示例一致的演示页
└── miniprogram/
    ├── components/liquid-glass-button/   # 自定义组件（index.js/json/wxml/wxss）
    └── pages/index/                      # 演示页
```

---

## 一、Flutter 用法

1. 把 `flutter/liquid_glass_button.dart` 拷进项目（如 `lib/widget/`）。
2. 直接在需要的地方使用：

```dart
LiquidGlassButton(
  onTap: () {},
  child: const Icon(Icons.favorite, color: LiquidGlassColors.content, size: 24),
)
```

### 参数

| 参数 | 默认值 | 说明 |
|---|---|---|
| `child` | 必填 | 内容，通常放 Icon / Text |
| `size` | 60 | 直径 |
| `blur` | 8 | 背景模糊 sigma，对应原示例 `ImageFilter.blur(sigmaX: 8)` |
| `highlight` | true | 液态高光扫过动效开关 |
| `sheenDuration` | 3s | 高光转一圈的时间 |
| `onTap` | — | 点击回调 |

### 背景气泡

```dart
Stack(
  children: const [
    LiquidGlassBackdrop(bubbleCount: 6),   // 漂浮气泡，位于渐变背景之上
    Center(child: ...),
  ],
)
```

### 实现要点

- `ClipOval` + `BackdropFilter` 做真实背景模糊（原示例结构一致）。
- `SweepGradient` + `Transform.rotate` 实现液态高光：比单层线性渐变更接近玻璃的流体反光。
- 顶部 `FractionallySizedBox` 叠加镜面反光增强立体感。
- 按压缩放 0.92（`CurvedAnimation` + `easeOutCubic`，160ms）。
- 颜色全部用 ARGB 常量（如 `0x4DFFFFFF`），规避 `withOpacity` / `withValues` 的 SDK 版本差异。

---

## 二、微信小程序用法

1. 把 `miniprogram/components/liquid-glass-button/` 整个目录拷到项目的 `components/` 下。
2. 页面 `index.json` 注册：

```json
{
  "usingComponents": {
    "liquid-glass-button": "/components/liquid-glass-button/index"
  }
}
```

3. 使用（内容通过插槽传入，支持图标字体 / 图片 / 文字）：

```xml
<liquid-glass-button size="{{120}}" bg-src="{{bgSrc}}" bind:tap="onFav">
  <text class="btn-text">藏</text>
</liquid-glass-button>
```

### 参数

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `size` | Number | 120 | 尺寸，单位 rpx（正方形） |
| `radius` | Number | 999 | 圆角 rpx，999 = 圆形；设 32 得圆角方块/胶囊 |
| `blur` | Number | 12 | 模糊半径 px |
| `bgSrc` | String | '' | 背景图（网络地址或云存储 fileID），用于「假毛玻璃」二次模糊 |
| `highlight` | Boolean | true | 液态高光扫过 |
| `sheenDuration` | Number | 3 | 高光一圈秒数 |
| `disabled` | Boolean | false | 禁用态（半透明、不响应） |
| `pressScale` | Number | 0.92 | 按压缩放比例 |

事件：`bind:tap`（组件内 `triggerEvent('tap')`）。

### 小程序端的毛玻璃是怎么做的（重要）

小程序 WebView 渲染器对 `backdrop-filter` 支持不稳定（iOS 可用，部分安卓内核无效），所以组件做了**双层降级**：

1. `.lgb__frost` —— `backdrop-filter: blur(Npx)`，iOS 等支持的内核走真实背景模糊；
2. `.lgb__blur` —— 把背景图（`bgSrc`）放大 2 倍后 `filter: blur(Npx)`，作为假毛玻璃垫在下面，安卓内核也能有玻璃感；
3. 没传 `bgSrc` 时用半透明白色渐变兜底，纯色/渐变背景下依然可用。

**建议**：把当前页面的背景图地址传给 `bgSrc`，质感最接近原生；列表页等频繁出现的场景可以不传，用兜底渐变（省渲染开销）。

### 性能注意

- 每个按钮都是一个 `filter: blur()` 图层，同屏按钮建议 **≤ 8 个**；
- 长列表中的商品卡片不要用真模糊，改用静态半透明渐变；
- Skyline 渲染器不支持 `backdrop-filter`，请先确认页面用的是 WebView 渲染器（`app.json` 未开启 `renderer: skyline`）。

---

## 三、视觉参数对照（与官方示例一致）

| 项 | 官方 `glass_demo_page.dart` | 本实现 |
|---|---|---|
| 形状 | 60×60 圆形 | 同（小程序 120rpx ≈ 60px） |
| 模糊 | `ImageFilter.blur(sigmaX: 8)` | 同（小程序 12px，视觉等效） |
| 描边 | `white.withAlpha(55)` ≈ 22%，1px | 同 |
| 填充 | 白色径向渐变 75→25（≈29%→10%） | 30% → 10% |
| 图标 | `white.withAlpha(220)` ≈ 86% | 同 |
| 新增 | — | 旋转液态高光、顶部镜面反光、按压缩放 0.92、漂浮气泡背景 |
