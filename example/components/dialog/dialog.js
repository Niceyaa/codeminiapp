Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    title: {
      type: String,
      value: '标题',
    },
    buttons:{
      type:Array,
      value:[{
        txt:'确认',
        fun: ''
      }]
    }
  },  
  methods: {
    btnFun:function(e){
      let {item} = e.currentTarget.dataset;      
      this.triggerEvent('ButtonFun', item)
    }
  }
})