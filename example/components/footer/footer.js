Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    index: {
      type: Number,
      value: 1,
    }    
  },
  
  methods: {
    tab: function (e) {
      let { index } = e.currentTarget.dataset;
      this.setData({
        index:index
      })
      this.triggerEvent('FooterTab', index)
    }    
  }
})