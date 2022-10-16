Page({
  data: {
    userInfo: '',
    userdetail:''
  },
  onLoad() {
    let user = wx.getStorageSync('userInfo')
    let userdetail = wx.getStorageSync('useraccount')
    this.setData({
      userInfo: user,
      userdetail:userdetail
    })
  },
  //注销账户
  unsubscribe() {
    wx.navigateTo({
      url: '/pages/login/log_out/log_out',
    })
  },
  
})