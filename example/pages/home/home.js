// example/pages/home/home.js
import http from '../../util/request.js'

Page({ 
  data: {    
    isLogin:1,
    userInfo: {},
    bannerList:[],
    argObj:{
      show:false,
      btn:[
        {
          txt:'确认',
          fun:'argSuccessCallback'          
        }
      ]
    },
    vipObj:{
      show:false,
      src:'',
      txt:'长按分享到微信再识别\n即可添加客服微信'
    }
  },
  onLoad(options){
    if (options.relogin){
      let isLogin = this.data.isLogin = 0;
      this.setData({
        isLogin
      })
      return;
    }
    
  },
  onShow(){
    if (wx.getStorageSync('token') && this.data.isLogin == 1) {
      this.getUserInfo();
      this.getBannerList();      
      this.setData({
        isLogin: 1
      })
    }
  },
  getUserInfo(){
    http.get('/getUserInfo').then(res => {
      if (res.sta == 200) {        
        this.setData({
          userInfo:res.data,
          isLogin: 1
        })
      } 
    })
  },
  onShareAppMessage: function () {
  },
  agrOpen() {
    this.data.argObj.show = true;
    this.setData({
      argObj: this.data.argObj
    })
  },
  agrCallback(e){
    let {detail} = e;
    this[detail.fun]();
  },
  argSuccessCallback(){    
    this.data.argObj.show = false;    
    this.setData({
      argObj: this.data.argObj
    })
  }, 

  bindGetUserInfo(res1) {    
    console.log("res1",res1.detail.userInfo)
    if (res1.detail.userInfo) {
      wx.login({
        success: res2 => {  
          console.log("res2",res2)
          wx.getUserInfo({
            success: res3 => {
              console.log("res3",res3)
              http.post("/login/wechatLoginSmallProgramTest", {
                code: res2.code,
                headimgurl: res1.detail.userInfo.avatarUrl,
                nickname: res1.detail.userInfo.nickName,
                userInfo: res3.userInfo,
                rawData: res3.rawData,
                signature: res3.signature,
                encryptedData: res3.encryptedData,
                iv: res3.iv,
              }).then(res2 => {
                console.log("res2",res2)
                wx.setStorage({
                  key: "token",
                  data: res2.data.token,
                  success: res => {
                    this.getUserInfo();
                    this.getBannerList();                 
                    this.setData({
                      isLogin: 1,
                      userInfo: res2.data
                    })
                  },
                  fail: res => {
                    return
                  }
                })

              })
            }
          })
        }
      })
    } else {      
      app.globalData.login = false;
      app.globalData.authorization = false;
    }
  },
  switchTab(v){    
    let { url } = v.currentTarget.dataset
    console.log(url)
    wx.switchTab({
      url: url
    })
  },
  go(v){
    let { url } = v.currentTarget.dataset
    console.log(url)
    wx.navigateTo({
      url: url
    })
  },
  getBannerList(){
    http.get('/banner/getList').then(res => {
      if (res.sta == 200) {     
        console.log(res.data.data)   
        this.setData({
          bannerList: res.data.data
        })
      }
    })
  },
  vipCustom(){
    http.get('/getCallCenter').then(res => {
      if (res.sta == 200) {
        let { vipObj } = this.data;
        vipObj.src = res.data.value;
        vipObj.show = true;
        this.setData({
          vipObj,
        })
      }
    })
  },
  closeVipBox(){
    let { vipObj } = this.data;
    vipObj.show = false;
    this.setData({
      vipObj,
    })
  }
})
