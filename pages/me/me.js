let userNum = ''
let act
let user
let modelL
const app = getApp()
Page({
  data: {
    userInfo: '',
    userDetail: '',
    serveTime: 0,
    hour: '',
    min: '',
    leftRate: -180, //从-180到0
    rightRate: -180, //从-180到-0
    differTime: 0,
    modelL: [],
    modelList: [{
      name: '青铜',
      state: false,
      get_no: '/images/model/11.jpg',
      get_yes: '/images/model/11-1.jpg'
    }, {
      name: '白银',
      state: false,
      get_no: '/images/model/22.jpg',
      get_yes: '/images/model/22-1.jpg'
    }, {
      name: '黄金',
      state: false,
      get_no: '/images/model/33.jpg',
      get_yes: '/images/model/33-1.jpg'
    }, {
      name: '铂金',
      state: false,
      get_no: '/images/model/44.jpg',
      get_yes: '/images/model/44-1.jpg'
    }, {
      name: '砖石',
      state: false,
      get_no: '/images/model/55.jpg',
      get_yes: '/images/model/55-1.jpg'
    }, ],
    model: [{
      state: false,
      get_no: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/11.png',
      get_yes: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/11.1.png'
    }, {
      state: false,
      get_no: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/42.png',
      get_yes: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/42.1-1.png'
    }, {
      state: false,
      get_no: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/33.png',
      get_yes: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/33.1-1.png'
    }, {
      state: false,
      get_no: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/24.png',
      get_yes: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/24.1-1.png'
    }, {
      state: false,
      get_no: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/55.png',
      get_yes: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/medal/55.1-1.png'
    }, ],
  },
  //获取用户的缓存
  onShow() {
    user = wx.getStorageSync('userInfo')
    userNum = wx.getStorageSync('useraccount')
    console.log("userNum", userNum)
    this.getServeTime()
    this.getRate()
    this.showMedal()
    console.log(modelL)
  },

  //原理是 开始减去现在 <0,已经开始过了； 结束减现在 <0,已经结束了；   
  checkState(sb, tsb, se, tse) { //日期 时间
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var Y = date.getFullYear();
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let now = Y + '-' + M + '-' + D
    var hour = new Date().getHours()
    var minute = new Date().getMinutes()
    var nowDate = new Date(now.replace(/-/g, "/")).getTime();

    var start_date = new Date(sb.replace(/-/g, "/"));
    var end_date = new Date(se.replace(/-/g, "/"));
    var msd = start_date.getTime() - nowDate;
    var med = end_date.getTime() - nowDate;
    let signBegin = parseInt(msd / (1000 * 60)); //<0开始
    let signEnd = parseInt(med / (1000 * 60)); //<0开始
    let timeSignBeginHour = tsb.substring(0, 2) //<0开始
    let timeSignBeginMin = tsb.substring(3, 5)
    let timeSignEndHour = tse.substring(0, 2) //<0开始
    let timeSignEndMin = tse.substring(3, 5)
    let time1 = (signBegin + (timeSignBeginHour - hour) * 60 + (timeSignBeginMin - minute))
    let time2 = (signEnd + (timeSignEndHour - hour) * 60 + (timeSignEndMin - minute))

    let begin = parseInt(msd / (1000 * 60 * 60 * 24)); //<0开始
    let end = parseInt(med / (1000 * 60 * 60 * 24)); //<0开始

    if (time1 > 0) {
      this.setData({
        signState: 0,
        day: begin
      })
    } else if (time1 <= 0 && time2 > 0) {
      this.setData({
        signState: 1,
        day: end
      })
    } else if (time1 < 0 && time2 <= 0) {
      this.setData({
        signState: 2
      })
    }
  },

  //统计时长
  getServeTime() {
    let time = 0
    let that = this

    let hour = parseInt(userNum.serveTime / 60)
    let min = userNum.serveTime % 60
    if (userNum.isUser) {
      act = userNum.activity
      act.forEach(item => {
        that.checkState(item.actBegin, item.timeActBegin, item.actEnd, item.timeActEnd)
        if (that.data.signState == 2) {
          item.isEnd = true
        } else {
          item.isEnd = false
        }
      })
      console.log("act", act)
      this.setData({
        userInfo: user,
        userDetail: userNum,
        hour,
        min,
      })
      //做判断是否是志愿者
      if (userNum.isUser && act.length != 0) {
        act.forEach(item => {
          if (item.actState && item.isEnd) {
            time += item.serveTime
          }
        })
        console.log("time", time)
        wx.cloud.database().collection('user_data')
          .doc(userNum._id)
          .update({
            data: {
              serveTime: time,
              activity: act
            }
          })
          .then(res => {
            userNum.serveTime = time
            userNum.activity = act
            wx.setStorageSync('useraccount', userNum)
            console.log("更新服务时长成功")
          })
      }
    } else {
      this.setData({
        userInfo: user,
        userDetail: userNum,
      })
    }
  },

  //根据志愿时长画出进度,志愿标志的档次2 20 300 1500 8000h
  //对应分钟 120 1200 18000 90000 480000
  //每个阶段 120 1080 16800 72000 390000
  getRate() {
    let serveTime = userNum.serveTime
    let tranTime = 0
    let differTime = 0
    let modell = this.data.modelList
    if (serveTime < 120) {
      differTime = 120 - serveTime
      tranTime = serveTime / 120 * 360
      modell.forEach(item => {
        item.state = false
      })
    } else if (serveTime < 1200) {
      differTime = 1200 - serveTime
      tranTime = (serveTime - 120) / 1080 * 360
      modell[0].state = true
    } else if (serveTime < 18000) {
      differTime = 18000 - serveTime
      tranTime = (serveTime - 1200) / 16800 * 360
      for (let i = 0; i < 2; i++) {
        modell[i].state = true
      }
    } else if (serveTime < 90000) {
      differTime = 90000 - serveTime
      tranTime = (serveTime - 18000) / 72000 * 360
      for (let i = 0; i < 3; i++) {
        modell[i].state = true
      }
    } else if (serveTime < 480000) {
      differTime = 480000 - serveTime
      tranTime = (serveTime - 90000) / 390000 * 360
      for (let i = 0; i < 4; i++) {
        modell[i].state = true
      }
    } else {
      tranTime = 360
      for (let i = 0; i < 5; i++) {
        modell[i].state = true
      }
    }
    this.setData({
      modelList: modell
    })
    if (tranTime < 180) {
      this.setData({
        leftRate: -180,
        rightRate: tranTime - 180,
        differTime,
      })
    } else {
      this.setData({
        rightRate: 0,
        leftRate: tranTime - 360,
        differTime,
      })
    }
    console.log("志愿服务的进度", tranTime)
  },
  //获取到当前显示勋章的列表
  showMedal() {
    modelL = []
    this.data.modelList.forEach(item => {
      if (item.state) {
        modelL.push(item.get_yes)
      } else {
        modelL.push(item.get_no)
      }
    })
    this.setData({
      modelL,
    })
  },
  //退出登录
  logOut() {
    wx.showModal({
      title: '退出登录',
      content: '是否要退出登录',
      success: res => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/homeTest/homeTest',
          })
          this.setData({
            userInfo: '',
            userDetail: ''
          })
          wx.setStorageSync('userInfo', '')
          wx.setStorageSync('useraccount', '')

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //根据服务时长判断奖牌,共计5枚

  goPage: function () {
    wx.navigateTo({
      url: '/pages/login/modify_info/modify_info',
    })
  },

  sitUp() {
    console.log(this.data.userDetail)
    wx.navigateTo({
      url: '/pages/login/modify_info/modify_info',
    })
  },

  previewImage(e) {
    let src = e.currentTarget.dataset.index
    let img_src = ''
    let m_l = this.data.model
    m_l.forEach((item, index) => {
      if (index == src) {
        if (item.state)
          img_src = item.get_yes
        else
          img_src = item.get_no
      }
    })
    console.log("点击了预览", src)
    console.log("点击了预览", e)
    wx.previewImage({
      current: img_src, // 当前显示图片的http链接
      urls: this.data.model, // 需要预览的图片http链接列表
    })
  }
})