const util = require("../../../utils/util")
var timestamp = Date.parse(new Date());
var date = new Date(timestamp);
//获取年份  
var Y = date.getFullYear();
//获取月份  
var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
//获取当日日期 
var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
let nowdate = Y + '-' + M + '-' + D


Page({
  data: {
    endDate: nowdate,
    userInfo: '',
    phoneNum: '',
    password1: '',
    password: '',
    email: '',
    name: '',
    IDNum: '',
    gender: '',
    date: '',
    phoneLen: '',
    IDLen: '',
    paLen1: '',
    paLen2: '',
    emailCheck: 0,
    //region: '',
    school: '',
    major: '',
    touch: '',
    class: '',
    isAllow: false,
    chooseGender: ["男", "女"],
    chooseClass: ["2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021"]
  },
  onLoad() {
    console.log("页面重新渲染")
    this.setData({
      touch: false
    })
  },
  //输入手机号
  getPhoneNum(e) {
    this.setData({
      phoneNum: e.detail.value,
      phoneLen: e.detail.cursor
    })
  },
  //输入的首次密码
  getPassword1(e) {
    this.setData({
      password1: e.detail.value,
      paLen1: e.detail.cursor
    })
  },
  //输入的二次密码
  getPassword2(e) {
    this.setData({
      password: e.detail.value,
      paLen2: e.detail.cursor
    })
  },
  //输入邮箱
  getEmail(e) {
    this.checkEmail(e.detail.value)
    this.setData({
      email: e.detail.value
    })
  },
  //输入姓名
  getName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  //输入身份证号
  getIDNum(e) {
    this.setData({
      IDNum: e.detail.value,
      IDLen: e.detail.cursor,
    })
  },

  //选择性别
  chooseGender(e) {
    console.log("性别值", e.detail.value)
    if (e.detail.value == 0) {
      this.setData({
        gender: "男"
      })
    } else {
      this.setData({
        gender: "女"
      })
    }
    console.log("性别值", this.data.gender)
  },
  //选择年级
  chooseClass(e) {
    this.setData({
      class: parseInt(e.detail.value) + 2011
    })
    console.log("年级值", this.data.class)
  },
  //选择出生日期
  chooseDate(e) {
    this.setData({
      date: e.detail.value
    })
    console.log("出生日期", e.detail.value)
  },
  //这一块后期要更改
  //选择写入高校
  getSchool(e) {
    this.setData({
      school: e.detail.value
    })
  },
  //填写的专业信息
  getMajor(e) {
    this.setData({
      major: e.detail.value
    })
  },
  //检查邮箱
  checkEmail(email) {
    if (!(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{3}$/.test(email))) {
      this.setData({
        emailCheck: 1
      })
    } else {
      this.setData({
        emailCheck: 2
      })
    }
  },
  //是否同意隐私政策
  isAllow(e) {
    console.log("是否同意", e.detail.value[0])
    if (e.detail.value[0] == "同意") {
      this.setData({
        isAllow: true
      })
      console.log("同意了", this.data.isAllow)
    } else {
      this.setData({
        isAllow: false
      })
    }
  },

  //注册
  login() {
    if (this.data.name == '' || this.data.gender == '' || this.data.date == '' || this.data.school == '' || this.data.major == '' || this.data.calss == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入完整的信息',
      })
    } else if (this.data.phoneLen != 11 || this.data.paLen1 < 8 || this.data.paLen2 < 8 || this.data.emailCheck != 2 || this.data.IDLen != 18) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确格式的信息',
      })
    } else if (this.data.password != this.data.password1) {
      wx.showToast({
        icon: 'none',
        title: '两次输入的密码不一样',
      })
    } else if (this.data.isAllow == false) {
      wx.showToast({
        icon: 'none',
        title: '请认真阅读隐私政策并同意',
      })
    } else {
      let that = this
      wx.showModal({
        content: '我们将采取您的身份信息用于记录您的个人服务时长，请确认是否同意',
        cancelText: "不同意", // 取消按钮的文字  
        confirmText: "同意", // 确认按钮的文字  
        success (res) {
          if (res.confirm) {
            that.log_ok()
            console.log('用户点击确定')
          } else if (res.cancel) {
            wx.showToast({
              icon:'none',
              title: '您点击了不同意，注册失败',
            })
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  generateUuid: function () {
    return Number(Math.random().toString().substr(2, 2) + Date.now()).toString(10);
  },
  log_ok() {

    var promise = new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于展示用户信息',
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
          })
          resolve();
        }
      })
    });
    promise.then(() => {
      wx.cloud.database().collection('user_data')
        .add({
          data: {
            num: 'zy' + this.generateUuid(),
            Img: this.data.userInfo.avatarUrl,
            phoneNum: this.data.phoneNum,
            password: this.data.password,
            email: this.data.email,
            name: this.data.name,
            IDNum: this.data.IDNum,
            gender: this.data.gender,
            date: this.data.date,
            school: this.data.school,
            major: this.data.major,
            class: this.data.class,
            activity: [],
            time: util.formatTime(new Date()),
            isAllow: this.data.isAllow,
            serveTime: 0,
            isUser: true,
          }
        })
        .then(res => {
          wx.navigateTo({
            url: '/pages/login/log_page/log_page',
          })
          wx.showToast({
            icon: 'none',
            title: '注册成功,请登录',
          })
          console.log("添加用户信息成功", res)
        })
        .catch(err => {
          console.log("添加用户信息失败", err)
        })
    })
  },

  //查看隐私政策
  lookPrivacy() {
    wx.navigateTo({
      url: '/pages/login/privacy/privacy',
    })
  },
})