
// 获取应用实例
const app = getApp()
const db = wx.cloud.database()
const db_user = wx.cloud.database().collection('user_data')
const db_organzia = wx.cloud.database().collection('organiza_data')

Page({
  data: {
    currentData: 0,
    userInfo: '',
    phone: '',
    password: '',
    user: '', //检测是否有账号信息
    chooseLogin: ["志愿个人注册", "志愿组织注册"],
  },
  //取缓存
  onLoad() {

  },
  //获取账号
  getPhone(e) {
    this.setData({
      phone: e.detail.value
    })
    console.log("获取的账号", e.detail.value)
  },
  //获取密码
  getPassword(e) {
    this.setData({
      password: e.detail.value
    })
    console.log("获取的密码", e.detail.value)
  },
  //志愿者登录
  user_log() {
    this.log(db_user)
  },
  //志愿组织登录
  organiza_log() {
    this.log(db_organzia)
  },
  log(dbs) {
    const _ = db.command
    dbs.where(_.or([{
          phoneNum: this.data.phone,
          password: this.data.password
        },
        {
          IDNum: this.data.phone,
          password: this.data.password
        }
      ], ))
      .get()
      .then(res => {
        console.log("查询成功", res.data)
        this.setData({
          user: res.data[0]
        })
        wx.setStorageSync('useraccount', res.data[0])
      })
      .catch(err => {
        console.log("查询失败", err)
      })
    this.getUserProfile()
  },
  //获取个人信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        if (this.data.user) {
          if (this.data.user.isPass||this.data.user.isUser) {
            this.setData({
              userInfo: res.userInfo,
            })
            //把数据放入全局变量
            app.globalData.userInfo = this.data.user
            //把数据放入缓存
            wx.setStorageSync('userInfo', res.userInfo)
            wx.setStorageSync('searchRecord', [])
            wx.navigateTo({
              url: '/pages/homeTest/homeTest',
            })
            wx.showToast({
              icon: 'none',
              title: '登录成功',
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '工作人员正在审核中，请耐心等待……',
            })
          }
        } else {
          wx.showToast({
            icon: 'none',
            title: '账号或密码错误',
          })
        }
      }
    })
  },
  //去注册账号
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/log_in/log_in',
    })
  },
  //忘记密码
  to_repassword() {
    wx.navigateTo({
      url: '/pages/login/retrieve_organ_pa/retrieve_organ_pa',
    })
  },
  //忘记密码
  to_reUserpassword() {
    wx.navigateTo({
      url: '/pages/login/retrieve_passwoord/retrieve_password',
    })
  },
  chooseLogin(e) {
    let log = parseInt(e.detail.value)
    console.log("选择了什么", parseInt(e.detail.value))
    if (log == 0) {
      wx.navigateTo({
        url: '/pages/login/log_in/log_in',
      })
    } else {
      wx.navigateTo({
        url: '/pages/login/log_organization_in/log_organization_in',
      })
    }
  },
  //获取当前滑块的index
  bindchange: function (e) {
    let that = this;
    that.setData({
      currentData: e.detail.current
    })
  },
  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    let that = this;
    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        phone: '',
        password: '',
        currentData: e.target.dataset.current
      })
    }
  }



})