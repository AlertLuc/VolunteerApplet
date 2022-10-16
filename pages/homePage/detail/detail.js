let id = ''
let exist = false
let user = []
let userInfo = {}
let OrganInfo = {}
let touch
let touchChat
let db = wx.cloud.database()
const _ = db.command
const util = require("../../../utils/util")


Page({
  data: {
    processData: '',
    userDetail: '',
    friends: '',
    myFriend: '',
    signState: '',
    state: '报名未开始',
    img: ["https://tse3-mm.cn.bing.net/th/id/OIP-C.M_9nxBlgeGwHcL-sQ3JAxAHaNK?w=187&h=333&c=7&r=0&o=5&dpr=1.25&pid=1.7", "https://tse2-mm.cn.bing.net/th/id/OIP-C.IU-ohpFpz-iUZctkWOHUEAHaLz?w=198&h=315&c=7&r=0&o=5&dpr=1.25&pid=1.7", "https://tse4-mm.cn.bing.net/th/id/OIP-C.uxSJYCCOu15-EApyXHlykwHaKq?w=207&h=298&c=7&r=0&o=5&dpr=1.25&pid=1.7"]
  },
  onLoad(event) {
    //修改页面标题
    touch = 0
    touchChat = 0
    exist = false
    wx.setNavigationBarTitle({
      title: event.title
    })
    id = event.id
    user = wx.getStorageSync('useraccount')
    this.setData({
      userDetail: user
    })
    console.log("user", id)
    this.getUserInfo()
    this.getMyFriend()

  },

  //获取项目数据
  onShow() {
    wx.cloud.database().collection('program_record')
      .doc(id)
      .get()
      .then(res => {
        console.log("项目数据获取成功", res.data)
        this.setData({
          processData: res.data
        })
        this.getOrganInfo()
        console.log("项目的数据", this.data.signState)
      })
      .catch(err => {
        console.log("获取数据失败", err)
      })
    var that = this
    setInterval(function () {
      that.checkState(that.data.processData.signBegin, that.data.processData.timeSignBegin, that.data.processData.signEnd, that.data.processData.timeSignEnd)
    }, 1000);
  },
  //计算min
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

    //原理是 开始减去现在 <0,已经开始过了； 结束减现在 <0,已经结束了；   
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

    if (time1 > 0) {
      this.setData({
        signState: "报名未开始",
      })
    } else if (time1 <= 0 && time2 > 0) {
      this.setData({
        signState: "火热报名中",
      })
    } else if (time1 < 0 && time2 <= 0) {
      this.setData({
        signState: "报名已结束"
      })
    }

  },

  //去聊天页咨询客服
  consultService() {
    touchChat++
    if (user) {
      let isHave = false
      //做判断数据库里是否跟这个人聊过天（或跟这个人是朋友）
      let promise = new Promise((resolve, reject) => {
        this.data.myFriend.forEach(item => {
          if ((item.userA_id == this.data.processData.leader._id && item.userB_id == user._id) || (item.userA_id == user._id && item.userB_id == this.data.processData.leader._id)) {
            isHave = true
          }
        })
        resolve();
      })
      promise.then(() => {
        if (!isHave && touchChat == 1) {
          wx.cloud.database().collection('chat_record').add({
              data: {
                //自己的数据
                userA_id: user._id,
                userA_faceImg: user.Img,
                userA_nickName: user.name,
                //对方的数据
                userB_id: this.data.processData.leader._id,
                userB_faceImg: this.data.processData.leader.Img,
                userB_nickName: this.data.processData.leader.name,
                record: [], //聊天记录
                friend_status: 1, //0：申请中，1：已经好友
                time: util.formatTime(new Date()) //发送消息的时间
              },
            })
            .then(res => {
              console.log("建表成功后的数据", res)
              wx.navigateTo({
                url: '/pages/live/chat/chat?_id=' + res._id + '&title=' + this.data.processData.title,
              })
            })
        } else {
          //已经建好聊天表
          if (touchChat == 1) {
            this.changeId()
          }
        }
      })
    } else {
      this.goLogIn()
    }
  },
  //把用户ID转换为记录表的ID
  changeId() {
    console.log("progressData", this.data.processData)
    console.log("user", user)

    wx.cloud.database().collection("chat_record").where(
        _.or([{
          userA_id: user._id,
          userB_id: this.data.processData.leader._id,
          friend_status: 1
        }, {
          userB_id: user._id,
          userA_id: this.data.processData.leader._id,
          friend_status: 1
        }])
      ).get()
      .then(res => {
        console.log("查到的值", res)
        wx.navigateTo({
          url: '/pages/live/chat/chat?_id=' + res.data[0]._id + '&title=' + this.data.processData.title,
        })
      })
  },
  //获取已有的好友列表
  getMyFriend() {
    var that = this;
    wx.cloud.database().collection("chat_record").where(
        _.or([{
          userA_id: user._id,
          friend_status: 1
        }, {
          userB_id: user._id,
          friend_status: 1
        }])
      ).get()
      .then(res => {
        this.setData({
          myFriend: res.data
        })
        console.log("好友列表的数据", this.data.myFriend)
      })
  },

  //获取用户的部分信息
  getUserInfo() {
    userInfo = {
      userID: user.num,
      name: user.name,
      phoneNum: user.phoneNum,
      school: user.school,
      major: user.major,
      class: user.class,
      Img: user.Img,
      actState: false,
      isEnd: false,
      serveTime: user.serveTime,
      _id: user._id
    }
    console.log("用户的部分信息", userInfo)
  },
  //志愿项目的部分信息
  getOrganInfo() {
    OrganInfo = {
      _id: this.data.processData._id,
      Img: this.data.processData.imgUrl,
      organizaName: this.data.processData.leader.organizaName,
      address: this.data.processData.address,
      actState: false,
      isEnd: false,
      state: this.data.processData.state,
      actBegin: this.data.processData.actBegin,
      actEnd: this.data.processData.actEnd,
      timeActBegin: this.data.processData.timeActBegin,
      timeActEnd: this.data.processData.timeActEnd,
      title: this.data.processData.title,
      region: this.data.processData.region,
      serveTime: this.data.processData.serveTime,
      paName: this.data.processData.paName,
      leaderlogo: this.data.processData.leader.Img,
      leaderName: this.data.processData.leader.name,
      leaderPhone: this.data.processData.leader.phoneNum,
    }
  },
  //判断是否已经报名
  checkEnroll() {
    let vol = this.data.processData.volunteer
    vol.forEach(item => {
      if (item.userID == user.num) {
        exist = true
      }
    })
  },
  //点击报名后对数据进行减一操作
  minusOne() {
    touch++;
    if (touch == 1) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'jianyi',
        data: {
          _id: id,
          info: userInfo
        },
        success: res => {
          let actL  = user.activity
          actL.push(OrganInfo)
          console.log("云函数报名成功", res)
          if (res.result.stats.updated == 1) {
            //将项目的部分信息写到个人数据库里
            db.collection('user_data')
              .doc(user._id)
              .update({
                data: {
                  activity: actL
                },
              }).then(res => {
                console.log("数据库更新成功", res)
                if(res.stats.updated==0){
                  wx.showToast({
                    icon: 'none',
                    title: '报名失败',
                  })
                }else{
                  wx.setStorageSync('useraccount', user)
                  wx.showToast({
                    icon: 'none',
                    title: '报名成功',
                  })
                  this.onShow()
                }
              })
          } else {
            wx.showToast({
              icon: 'none',
              title: '报名失败，人数已满',
            })
          }
        },
        fail: err => {
          console.log("失败的原因", err)
          wx.showToast({
            icon: 'none',
            title: '报名失败,人数已满',
          })
        }
      })
    }
  },
  //去登录函数
  goLogIn() {
    wx.showModal({
      title: "未登录状态",
      content: "是否要去登录志愿者账号",
      cancelText: "再看看",
      confirmText: "去登录",
      success: res => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/login/log_page/log_page',
          })
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //点击项目报名
  signUp() {
    this.checkEnroll()
    if (user == '' || !user.isUser) {
      this.goLogIn()
    } else if (!exist) {
      this.minusOne()
    } else {
      wx.showToast({
        icon: 'none',
        title: '已报名，请勿重复报名',
      })
    }
  },
  //去首页
  skipHomepage() {
    wx.navigateTo({
      url: '/pages/homeTest/homeTest',
    })
  },
  // 转发分享
  onShareAppMessage: function () {
    var title = this.data.processData.title;
    var cover_img = this.data.processData.imgUrl;
    return {
      title: title,
      path: '/pages/homePage/detail/detail',
      imageUrl: cover_img,
      success: function (res) {}
    }
  },

})