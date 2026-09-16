Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    // 按钮尺寸（rpx），正方形
    size: { type: Number, value: 120 },
    // 圆角（rpx），默认 999 即圆形；改成 16 可得胶囊/圆角方块
    radius: { type: Number, value: 999 },
    // 模糊半径（px）
    blur: { type: Number, value: 12 },
    // 背景图（网络地址或云存储 fileID），用于「假毛玻璃」二次模糊
    // 不传时使用半透明白色渐变兜底
    bgSrc: { type: String, value: '' },
    // 液态高光扫过动效
    highlight: { type: Boolean, value: true },
    // 高光转一圈的秒数
    sheenDuration: { type: Number, value: 3 },
    disabled: { type: Boolean, value: false },
    // 按压缩放比例，1 表示不缩放
    pressScale: { type: Number, value: 0.92 },
  },

  data: {
    active: false,
  },

  methods: {
    _onDown() {
      if (this.data.disabled) return;
      this.setData({ active: true });
    },

    _onUp() {
      if (!this.data.active) return;
      this.setData({ active: false });
    },

    _onTap(e) {
      if (this.data.disabled) return;
      this._onUp();
      this.triggerEvent('tap', e.detail || {});
    },
  },
});
