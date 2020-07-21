Page({
  data: {
    agreeFlag: false
  },
  onShareAppMessage: function () {
  },
  bindGetUserInfo(res) {
    if (res.detail.userInfo) {
      wx.redirectTo({
        url: `./pages/home/home?headimgurl=${res.detail.userInfo.avatarUrl}&nickName=${res.detail.userInfo.nickName}`
      })
    }
  },

  agree(v) {
    this.setData({
      agreeFlag: !this.data.agreeFlag
    })
  }
});
