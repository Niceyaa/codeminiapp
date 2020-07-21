import http from '../../util/request.js'
import { City } from '../../asset/js/city.js';
let cityCodeList = {};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],    
  },
  onShow(){
    this.recursionCity(City);
    this.getDataList();
  },
  onShareAppMessage: function () {
  },
  getDataList() {    
    http.get("/code/listCode").then(res => {      
      res.data.map(item => {
        item.province = cityCodeList[item.province_limit]
        item.city = cityCodeList[item.city_limit]        
      })
      this.setData({
        list: res.data
      })
    })
  },
  delDialog(v) {
    let that = this;
    let { item } = v.currentTarget.dataset    
    wx.showModal({
      title: '删除活码',
      content: '你确定删除该活码信息吗',
      success(res) {
        if (res.confirm) {          
          that.del(item);
        } else if (res.cancel) {
          return;
        }
      }
    })        
  },
  del(item) {    
    http.get("/code/deleteCode", {
      id: item.id
    }).then(res => {
      if (res.sta == 200) {                
        this.getDataList()        
      }
    })
  },
  

  updateCode(v) {
    let { item } = v.currentTarget.dataset
    
    wx.reLaunch({
      url: '/example/pages/create/create?id=' + item.id,      
    })
  },

  recursionCity(arr) {
    arr.map(item => {
      cityCodeList[item.label] = item.value;
      cityCodeList[item.value] = item.label;
      if (item.children && !arguments[1]) {
        this.recursionCity(item.children, 1);
      }
    });
  },
  creatNewCode(v) { // currentTarget.dataset.id
    http.post("/code/updateQrCode", {
      id: v.currentTarget.dataset.item.id
    }).then(res => {
      if (res.sta == 200) {
        this.getDataList()
      }
    })
  },
  openDialog(v) {
    wx.previewImage({
      current: v.currentTarget.dataset.item.oss_pic, // 当前显示图片的http链接   
      urls: [v.currentTarget.dataset.item.oss_pic]
    })  
  },

})