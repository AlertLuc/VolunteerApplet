let counter = []
Page({

  data: {
    cardSort: [{ //分类
      src: "/images/home/curture.jpg",
      name: "/images/homeFont/culture.png",
    }, {
      src: "/images/home/music.jpg",
      name: "/images/homeFont/music.png",
    }, {
      src: "/images/home/sen.jpg",
      name: "/images/homeFont/sic.png",
    }, {
      src: "/images/home/draw.jpg",
      name: "/images/homeFont/draw.png",
    }, {
      src: "cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/swper/首页图片/舞蹈.jpg",
      name: "/images/homeFont/dance.png",
    }],
    showIndex: 0, //折叠
    code: '', //扫码
    // display: '',
    // // command: '',
    user: '',
    chatCounter: 0,

  },

  onLoad(options) {
    let user = wx.getStorageSync('useraccount')
    this.setData({
      user,
    })
  },
  onShow(){
    this.read()
  },
  //q去交流
  toChat() {
    wx.navigateTo({
      url: '/pages/live/message/message?counter=' + JSON.stringify(counter),
    })
  },
 
  toThoughts() {
    wx.navigateTo({
      url: '/pages/live/thoughts/thoughts',
    })

  },

  //判断传入的id是否在志愿者的work里，并且口令是否相对应
  confirm() {
    let actState = false
    let that = this
    let user = this.data.user
    console.log("组件user", user)
    console.log(this.data.command)
    let str = this.data.code
    let str_id = str.substring(0, 32) //取下划线前的字符
    let str_command = str.substring(32) //取下划线后的字符
    if (user.isUser) {
      wx.cloud.database().collection('user_data')
        .doc(user._id)
        .get()
        .then(res => {
          let userAct = res.data.activity
          let promise = new Promise((resolve, reject) => {
            userAct.forEach(item => {
              if (item._id == str_id) {
                item.actState = true
                actState = true
              }
            })
            resolve();
            console.log('actState', actState)
          })
          promise.then(() => {
            if (actState && str_command == that.data.command) {
              wx.cloud.database().collection('user_data')
                .doc(user._id)
                .update({
                  data: {
                    activity: userAct
                  }
                })
                .then(res => {
                  user.activity = userAct
                  wx.setStorageSync('useraccount', user)
                  that.setData({
                    display: "none"
                  })
                  wx.showToast({
                    title: '签到成功',
                  })
                })
                .catch(err => {
                  wx.showToast({
                    icon: 'error',
                    title: '签到失败',
                  })
                })
            } else {
              wx.showToast({
                icon: 'error',
                title: '签到失败',
              })
            }
          })
        })
    } else {
      wx.showToast({
        icon: 'error',
        title: '管理员无法签到',
      })
    }
  },
  scanCode() {
    let that = this
    wx.scanCode({
      success: res => {
        console.log("扫码的结果", res.result)
        this.setData({
          // display: "block",
          code: res.result
        })
        wx.showModal({
          title: '请输入签到口令',
          editable: true,
          cancelText: "取消签到",
          cancelColor: 'skyblue',
          confirmText: "签到",
          confirmColor: 'skyblue',
          success(res1) {
            console.log(res1)
            that.setData({
              command: res1.content
            })
            if (res1.confirm) {
              that.confirm()
            } else if (res1.cancel) {
              wx.showToast({
                icon:'none',
                title: '您点击了取消签到',
              })
            }
          }
        })
      }
    })
  },
  //去个人中心
  oneself() {
    wx.navigateTo({
      url: (this.data.user) ? '/pages/me/me' : '/pages/login/log_page/log_page',
    })
  },

  //去分类
  toSortDetail(e) {
    let index = e.currentTarget.dataset.index + 1
    wx.navigateTo({
      url: '/pages/homePage/search/search?num=' + index,
    })
  },
  //去发现游戏
  getGame() {
    wx.navigateTo({
      url: '/pages/live/game/game',
    })
  },
  toManage() {
    if (this.data.user.isUser) {
      wx.showToast({
        icon: 'none',
        title: '不对志愿者开放',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/me/manage/manage',
    })
  },
  particiteAct() {
    wx.navigateTo({
      url: '/pages/me/participate/participate',
    })
  },
  toPublish() {
    if (this.data.user.isUser) {
      wx.showToast({
        icon: 'none',
        title: '不对志愿者开放',
      })
      return
    }
    wx.navigateTo({
      url: '/pages/me/publish/publish',
    })
  },
  //统计还有多少条消息未读
  read() {
    let userNum = this.data.user
    const _ = wx.cloud.database().command
    if (userNum) {
      wx.cloud.database().collection("chat_record").where(
          _.or([{
            userA_id: userNum._id,
          }, {
            userB_id: userNum._id,
          }])
        ).get()
        .then(res => {
          let chat_len = []
          let chatCounter = 0
          let len = res.data.length
          if (res.data.length > 0) {
            for (let i = 0; i < len; i++) {
              chat_len[i] = res.data[i].record
            }
            for (let i = 0; i < chat_len.length; i++) {
              counter[i] = 0
              for (let j = 0; j < chat_len[i].length; j++) {
                let record = chat_len[i][j]
                if (record.userId != userNum._id && !record.read) {
                  counter[i]++
                }
              }
              chatCounter += counter[i]
            }
          }
          this.setData({
            chatCounter,
          })
          console.log("获取到的聊天数据成功", res.data)
          console.log("获取到的聊天的条数", chatCounter)
        })
        .catch(err => {
          console.log("获取到的聊天数据失败", err)
        })
    }
  },

  //折叠
  panel(e) {
    if (e.currentTarget.dataset.index != this.data.showIndex) {
      this.setData({
        showIndex: e.currentTarget.dataset.index
      })
    } else {
      this.setData({
        showIndex: 0
      })
    }
  },


})