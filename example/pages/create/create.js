// example/pages/home/home.js
let app = getApp();
import http from '../../util/request.js'
import { City } from '../../asset/js/city.js';
let cityCodeList = {};
let id = ''
Page({
  data: {
    title:'',
    imgListObj: {
      count: 6,
      list: [],
    },
    countLimitObj: {
      show: false,
      count: 1,
      showType: 1
    },
    cityLimitObj: {
      show: false,
      region: ['北京市', '全部', '全部'],
    },
    rule:[]
  },
  onLoad(options){    
    console.log(123,app)
    this.recursionCity(City) 
    this.getRuleInfo();   
    if (options.id) {
      id = options.id; 
      this.getData(options.id);     
    }
  },
  onHide(){
    if(!app.globalData.chooseImgBox){
      id="";
      this.dataInitial();
    }    
  } ,
  onShareAppMessage: function () {
  },
  dataInitial(){
    this.setData({
      title: '',
      imgListObj: {
        count: 6,
        list: [],
      },
      countLimitObj: {
        show: false,
        count: 1,
        showType: 1
      },
      cityLimitObj: {
        show: false,
        region: ['北京市', '全部', '全部'],
      }
    })
  },
  getData(id){
    http.get('/code/getInfoCode', { id: id })
      .then(res => {
        if (res.sta == 200) {
          let { title, imgListObj, countLimitObj, cityLimitObj} = this.data;
          title = res.data.name;
          imgListObj.list = res.data.imgList.map(item => item.pic);
          countLimitObj.show = res.data.is_see_limit ? true : false;
          countLimitObj.count = res.data.is_see_limit ? res.data.see_limit_num : 1;
          countLimitObj.showType = res.data.is_see_limit == 0 ? 1 : res.data.is_see_limit;
          cityLimitObj.show = res.data.limit_region ? true : false;          
          cityLimitObj.region = [cityCodeList[res.data.province_limit], cityCodeList[res.data.city_limit], '全部'];
          this.setData({
            title,
            imgListObj,
            countLimitObj,
            cityLimitObj,
          })
        }
      });
  },
  getName(v) {
    let {title} = this.data;
    this.data.title = v.detail.value;    
  },
  chooseImg(e) {
    let that = this;
    let {
      count
    } = e.currentTarget.dataset;
    

    app.globalData.chooseImgBox = true;
    wx.chooseImage({
      count: count,
      success: function(res) { 
        app.globalData.chooseImgBox = false;       
        let leng = res.tempFilePaths.length;
        res.tempFilePaths.map(item => {
          wx.showLoading({
            title: '上传中...',
            complete(){
              let timer = setTimeout(() => {
                clearTimeout(timer)
                wx.hideLoading();
              }, 15000)
            }
          })
          wx.uploadFile({
            url: http.origin + '/code/uploadImg', 
            header: {
              token: wx.getStorageSync('token') || null
            }, 
            filePath: item,
            name: 'file',
            success: function(res2) {
              let data = JSON.parse(res2.data);
              that.data.imgListObj.list.push(data.data[0]);
              that.data.imgListObj.count--;
              that.setData({
                imgListObj: that.data.imgListObj
              })
              leng--;
              if (leng <= 0){
                wx.hideLoading();
              }
            }
          })
        })
      }      
    })
  },
  changeCountLimit(v) {
    let {
      countLimitObj
    } = this.data;
    countLimitObj.show = !countLimitObj.show;
    this.setData({
      countLimitObj: countLimitObj
    })
  },
  getCountLimitValue(v) {
    let {
      countLimitObj
    } = this.data;
    countLimitObj.count = parseInt(v.detail.value)
  },
  changeShowType(v) {
    let {
      countLimitObj
    } = this.data;
    countLimitObj.showType = v.currentTarget.dataset.id
    this.setData({
      countLimitObj: countLimitObj
    })
  },
  changeCityLimit() {
    let {
      cityLimitObj
    } = this.data;
    cityLimitObj.show = !cityLimitObj.show;
    this.setData({
      cityLimitObj: cityLimitObj
    })
  },

  bindCityChange: function(e) {
    let {
      cityLimitObj
    } = this.data;
    cityLimitObj.region = e.detail.value;
    this.setData({
      cityLimitObj: cityLimitObj
    })
  },
  formCheck(){
    let { title, imgListObj, countLimitObj, cityLimitObj} = this.data;
    if(!title){
      wx.showToast({
        title: '请输入标题',    
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (imgListObj.list.length <= 0){
      wx.showToast({
        title: '请上传至少一张二维码',
        icon: 'none',
        duration: 2000
      })
      return false;
    }    
    return true;
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
  getCityCode(cityCode){
    let { cityLimitObj } = this.data;
    cityCode.province_limit = cityCodeList[cityLimitObj.region[0]]
    cityCode.city_limit = cityLimitObj.region[1] == '全部' ? cityCodeList[cityLimitObj.region[0]] : cityCodeList[cityLimitObj.region[1]];
  },
  createCode() {  
    let that = this;  
    if(!this.formCheck()){
      return;
    };  
    let { title, imgListObj, countLimitObj, cityLimitObj } = this.data;  
    let cityCode = {
      province_limit:'',
      city_limit:''
    };
    if (cityLimitObj.show){
      this.getCityCode(cityCode);
    }
    let url = ''
    if(id){
      url = '/code/updateCode'
    }else{
      url = '/code/createCode'
    }


    http.post(url, {
      id:id,
      name: title,  // 标题
      imgList: JSON.stringify(imgListObj.list), // 二维码列表
      is_see_limit: countLimitObj.show ? countLimitObj.showType : '', // 图片展示方式
      see_limit_num: countLimitObj.show ? countLimitObj.count : '', // 图片展示次数
      limit_region: cityLimitObj.show ? 1 : 0, // 地区是否开启
      province_limit: cityCode.province_limit,  // 省级代码
      city_limit: cityCode.city_limit,  // 市级代码
      from: 2
    }).then(res => {
      if (res.sta == 200) {
        wx.showToast({
          title: res.msg,
          icon: 'success',
          success:function(){
            
            wx.switchTab({
              url:'/example/pages/list/list'              
            })
          }
        })
      }
    })
  },
  getRuleInfo(){
    http.get('/getUserInfo').then(res => {
      if(res.sta == 200){
        this.setData({
          uploadRule: res.data.uploadRule
        })
      }
    })
  }
  
})