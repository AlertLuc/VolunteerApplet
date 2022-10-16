let app = getApp();
Page({
  data: {
    imgList: [], //插入图片的列表
    fileIDs: [], //存入云端的路径
    inputValue: '', //输入框的值
    label: '',
    applyList: [{
      Item_Name: "科学",
      isSelect: false
    }, {
      Item_Name: "文化",
      isSelect: false
    }, {
      Item_Name: "音乐",
      isSelect: false
    }, {
      Item_Name: "舞蹈",
      isSelect: false
    }, {
      Item_Name: "绘画",
      isSelect: false
    }, ],
  },
  onLoad() {
    let user = wx.getStorageSync('userInfo')
    this.setData({
      user,
      label: ''
    })
  },

  //获取输入内容
  getInput(event) {
    console.log("输入的内容", event.detail.value)
    this.setData({
      inputValue: event.detail.value
    })
  },


  //选择图片
  ChooseImage() {
    wx.chooseMedia({
      count: 8 - this.data.imgList.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        console.log(res.tempFiles[0].tempFilePath)
        console.log("选择图片成功", res)
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFiles)
          })
        } else {
          this.setData({
            imgList: res.tempFiles
          })
        }
        console.log("路径", this.data.imgList)
      }
    });
  },
  //删除图片
  DeleteImg(e) {
    wx.showModal({
      title: '要删除这张照片吗？',
      content: '',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },

  //上传数据
  publish() {
    let inputValue = this.data.inputValue //输入框的值
    let imgList = this.data.imgList //将要插入的图片列表
    if (!inputValue || inputValue.length < 20) {
      wx.showToast({
        icon: "none",
        title: '内容大于20个字'
      })
      return
    }
    if (!imgList || imgList.length < 1) {
      wx.showToast({
        icon: "none",
        title: '请选择图片'
      })
      return
    }
    if (!this.data.label) {
      wx.showToast({
        icon: "none",
        title: '请选择标签'
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
    })

    const promiseArr = []
    //只能一张张上传 遍历临时的图片数组
    for (let i = 0; i < this.data.imgList.length; i++) {
      let filePath = this.data.imgList[i].tempFilePath
      
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      let cloudPath = "showPhoto/" + this.data.user._openid + Date.now() + suffix;
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: filePath, // 文件路径
        }).then(res => {
          // get resource ID
          console.log("上传结果", res.fileID)
          this.setData({
            fileIDs: this.data.fileIDs.concat(res.fileID)
          })
          reslove()
        }).catch(error => {
          console.log("上传失败", error)
        })
      }))
    }
    //保证所有图片都上传成功
    let db = wx.cloud.database()
    Promise.all(promiseArr).then(res => {
      db.collection('timeline').add({
        data: {
          fileIDs: this.data.fileIDs,
          date: app.getNowFormatDate(),
          createTime: db.serverDate(),
          inputValue: this.data.inputValue,
          images: this.data.imgList,
          name: this.data.user.nickName,
          Img: this.data.user.avatarUrl,
          label: this.data.label,
          discuss: [],
          love: [],
          touch:false
        },
        success: res => {
          wx.hideLoading()
          wx.showToast({
            title: '发布成功',
          })
          wx.navigateTo({
            url: '/pages/live/thoughts/thoughts',
          })
          console.log('发布成功', res)
        },
        fail: err => {
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '网络不给力....'
          })
          console.error('发布失败', err)
        }
      })
    })
  },
  //多选框，最多只能选择一个
  selectApply(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.applyList[index];
    for (let i = 0; i <= 4; i++) {
      if (this.data.applyList[i].isSelect) {
        this.data.applyList[i].isSelect = !this.data.applyList[i].isSelect
      }
    }
    item.isSelect = !item.isSelect;
    this.setData({
      applyList: this.data.applyList,
      label: item.Item_Name
    });
    console.log("选中标签的值", this.data.label)
  },
})