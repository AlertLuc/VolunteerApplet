let user = ''
let Name = ''
let Phone = ''
let School = ''
let Major = ''
let Class = ''
let phoneLen = 0
let dbo = wx.cloud.database().collection('organiza_data')
let dbu = wx.cloud.database().collection('user_data')
Page({
  data: {
    user: '',
    phone: '',
    ID: '',
    name: '',
    school: '',
    major: '',
    class: '',
    Img: '',
    isOn1: false,
    isOn2: false,
    isOn3: false
  },
  onLoad() {
    user = wx.getStorageSync('useraccount')
    this.PhoneType()
    this.IDType()
  },
  //手机号转变格式
  PhoneType() {
    let changeNum = user.phoneNum;
    this.setData({
      phone: changeNum.substring(0, 3) + "****" + changeNum.substring(7, 11),
    })
  },
  //身份证号转换格式
  IDType() {
    let changeID = user.IDNum;
    this.setData({
      user,
      Img: user.Img,
      school: user.school,
      major: user.major,
      class: user.class,
      name: user.name,
      ID: changeID.substring(0, 2) + "***********" + changeID.substring(13, 17),
    })
  },
  changeUserImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        console.log("长传成功后的数据", res)
        this.upload(res.tempFiles[0].tempFilePath, dbu)
      }
    })
  },
  changeOrganImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.upload(res.tempFiles[0].tempFilePath, dbo)
      }
    })
  },
  //生成唯一不重复ID
  generateUuid: function (length = 5) {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
  },
  upload(imgUrl, db) {
    let cloudPath = "userPhoto/" + user._openid + Date.now() + ".jpg";
    wx.cloud.uploadFile({
      cloudPath,
      filePath: imgUrl, // 文件路径
      success: res => {
        db.doc(user._id)
          .update({
            data: {
              Img: res.fileID
            }
          })
        this.setData({
          Img: res.fileID
        })
        user.Img = res.fileID
        wx.setStorageSync('useraccount', user)
        console.log("上传成功的数据", user)
        console.log("更新后的数据", res)
        wx.showToast({
          icon: 'none',
          title: '更新成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '更新失败',
        })
      }
    })
  },
  //改变负责人姓名
  changeName() {
    this.setData({
      isOn1: true,
    })
  },
  changePhone() {
    this.setData({
      isOn2: true,
      Phone: ''
    })
  },
  changeClass() {
    this.setData({
      isOn3: true,
    })
  },
  updataUserName() {
    this.updataName(dbu);
  },
  updataOrganName() {
    this.updataName(dbo);
  },
  //更新姓名
  updataName(db) {
    this.setData({
      isOn1: false,
    })
    if (Name != '') {
      db.doc(user._id)
        .update({
          data: {
            name: Name
          }
        })
        .then(res => {
          user.name = Name
          this.setData({
            name: Name,
          })
          Name = '',
            wx.setStorageSync('useraccount', user)
          console.log("更新成功后的数据", res)
          wx.showToast({
            title: '更新成功',
          })
        })
    } else {
      wx.showToast({
        icon: 'error',
        title: '更新失败',
      })
    }
  },
  getName(e) {
    Name = e.detail.value
  },
  getPhone(e) {
    Phone = e.detail.value
    phoneLen = e.detail.cursor
    console.log(phoneLen)
  },
  getSchool(e) {
    School = e.detail.value
  },
  getMajor(e) {
    Major = e.detail.value
  },
  getClass(e) {
    Class = e.detail.value
  },
  updataUserPhone() {
    this.updataPhone(dbu)
  },
  updataOrganPhone() {
    this.updataPhone(dbo)
  },
  updataPhone(db) {
    if (phoneLen == 11) {
      db.doc(user._id)
        .update({
          data: {
            phoneNum: Phone
          }
        })
        .then(res => {
          user.phoneNum = Phone
          this.setData({
            phone: Phone
          })
          this.PhoneType()
          Phone = ''
          wx.setStorageSync('useraccount', user)
          wx.showToast({
            title: '更新成功',
          })
        })
    } else {
      wx.showToast({
        icon: 'error',
        title: '输入的格式有误，更新失败',
      })
    }
    this.setData({
      isOn2: false,
    })
  },
  updataUserClass() {
    this.setData({
      isOn3: false,
    })
    if (School == '' && Major == '' && Class == '') {
      wx.showToast({
        icon: 'error',
        title: '输入的格式有误，更新失败',
      })
    } else {
      //dbu获取用户的数据库
      if(School!=''){
        dbu.doc(user._id).update({
          data: {
            school: School,
          }
        })
        .then(res => {
          user.school = School
          this.setData({
            school: School,
          })
          School = ''
          wx.setStorageSync('useraccount', user)
          wx.showToast({
            title: '更新成功',
          })
        })
      }
      if(Major!=''){
        dbu.doc(user._id).update({
          data: {
            major: Major,
          }
        })
        .then(res => {
          user.major = Major
          this.setData({
            major: Major,
          })
          Major = ''
          wx.setStorageSync('useraccount', user)
          wx.showToast({
            title: '更新成功',
          })
        })
      }
      if(Class!=''){
        dbu.doc(user._id).update({
          data: {
            class: Class,
          }
        })
        .then(res => {
          user.class = Class
          this.setData({
            class: Class
          })
          Class = ''
          wx.setStorageSync('useraccount', user)
          wx.showToast({
            title: '更新成功',
          })
        })
      }
    }
  },
    //注销账户
    unsubscribe() {
      wx.navigateTo({
        url: '/pages/login/log_out/log_out',
      })
    },
    


})