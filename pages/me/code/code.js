import drawQrcode from '../../../utils/weapp.qrcode.js'
let user
let id
Page({
  data: {
    inputValue: '',
    text: '小青蛙不迷路',
    isHide: true,
    inter:''

  },
  onLoad(e) {
    id = e.id
    user = wx.getStorageSync('useraccount')
    console.log("user", user)
  },

  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
    console.log(e.detail.value)
  },
  load(){
    this.data.inter= setInterval(
      function () {
         
      }, 5000);

  },
  //将文字转换为二维码
  changeText() {
    this.load()
    
    
    console.log("inputValue", this.data.inputValue)
    if (this.data.inputValue != '') {
      this.setData({
        text: this.data.inputValue,
        isHide: false
      })
      this.draw()
    } else {
      wx.showModal({
        title: '提示',
        content: '请先输入要转换的内容！',
        showCancel: false
      })
    }

  },
  hideview: function () {
    this.setData({
      isHide: true
    })
  },

  //创建二维码的大小
  draw() {
    drawQrcode({
      width: 160,
      height: 160,
      x: 20,
      y: 20,
      canvasId: 'myQrcode',
      // ctx: wx.createCanvasContext('myQrcode'),
      typeNumber: 10,
      text: id + this.data.text,
      // image: {
      //   imageResource: user.Img,
      //   dx: 70,
      //   dy: 70,
      //   dWidth: 60,
      //   dHeight: 60
      // },
      callback(e) {
        console.log('e: ', e)
      }
    })
  },

  // 导出图片

  download: function () {

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      destWidth: 300,
      destHeight: 300,
      canvasId: 'myQrcode',
      success: (res => {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '图片保存成功',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }),
      fail: function (err) {
        if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
          // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
          wx.showModal({
            title: '提示',
            content: '需要您授权保存相册',
            showCancel: false,
            success: modalSuccess => {
              wx.openSetting({
                success(settingdata) {
                  console.log("settingdata", settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限成功,再次点击图片即可保存',
                      showCancel: false,
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限失败，将无法保存到相册哦~',
                      showCancel: false,
                    })
                  }
                },
                fail(failData) {
                  console.log("failData", failData)
                },
                complete(finishData) {
                  console.log("finishData", finishData)
                }
              })
            }
          })
        }
      },
      //console.log("保存图片,大画布", that.data.postUrl)
    })
  },
  onUnload: function () {
    clearInterval(this.data.inter)
  },


})