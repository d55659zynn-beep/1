Component({
  options: { addGlobalClass: true },
  properties: {
    item: { type: Object, value: {} },
    // 是否显示「加入购物车」按钮（首页列表用，管理端不用）
    showAdd: { type: Boolean, value: false },
    // 价格单位统一为「分」
    price: { type: Number, value: 0 }
  },
  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.data.item._id })
    },
    onAdd(e) {
      if (e && e.stopPropagation) e.stopPropagation()
      this.triggerEvent('add', { id: this.data.item._id })
    }
  }
})
