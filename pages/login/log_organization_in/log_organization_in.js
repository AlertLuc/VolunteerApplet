const util = require("../../../utils/util")
Page({
  data: {
    logo: '',
    logoID: '',
    phoneNum: '',
    password1: '',
    password: '',
    email: '',
    name: '',
    IDNum: '',
    organizaName: '',
    governName: '',
    type: '',
    gender: '',
    longitude: '',
    latitude: '',
    region: '',
    isAllow: false,
    serve: [],
    filePath: '',
    fileID: '',
    address: '',
    path: '',
    phoneLen: '',
    IDLen: '',
    paLen1: '',
    paLen2: '',
    emailCheck: '',
    isStandard: '',
    isHideMask: true,
    chooseType: ["党政机关", "社会各事业单位", "其他"],
    applyList: [{
        Item_Name: "科学",
        isSelect: false
      },
      {
        Item_Name: "文化",
        isSelect: false
      },
      {
        Item_Name: "舞蹈",
        isSelect: false
      },
      {
        Item_Name: "音乐",
        isSelect: false
      },
      {
        Item_Name: "绘画",
        isSelect: false
      },
    ],
  },
  onLoad() {

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
  //生成唯一不重复ID
  generateUuid: function (length = 5) {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
  },
  //选择并上传logo
  chooseLogo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({
          logo: res.tempFiles[0].tempFilePath
        })
        this.upload(res.tempFiles[0].tempFilePath)
      }
    })
  },
  upload(imgUrl) {
    let cloudPath = "userPhoto/" + this.generateUuid() + ".jpg";
    wx.cloud.uploadFile({
      cloudPath,
      filePath: imgUrl, // 文件路径
      success: res => {
        console.log(res)
        this.setData({
          path: res.fileID,
          logoID: res.fileID
        })
        wx.showToast({
          icon: 'none',
          title: '上传成功',
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      }
    })
  },
  //预览logo
  lookLogo() {
    wx.previewImage({
      urls: this.data.logo, // 需要预览的图片http链接列表
    })
  },

  //输入团体名称
  getOrganizationName(e) {
    this.setData({
      organizaName: e.detail.value
    })
  },
  //选择单位类型
  chooseType(e) {
    let types = e.detail.value
    console.log("单位类型", types)
    if (types == 0) {
      this.setData({
        type: '党政机关'
      })
    } else if (types == 1) {
      this.setData({
        type: '社会各事业单位'
      })
    } else if (types == 2) {
      this.setData({
        type: '其他'
      })
    }
  },
  //输入主管单位名称
  getGovernName(e) {
    this.setData({
      governName: e.detail.value
    })
  },
  //选择文件
  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: res => {
        console.log("选择文件的路径", res)
        this.uploadFile(res.tempFiles[0].name, res.tempFiles[0].path)
      }
    })
  },
  //上传文件
  uploadFile(name, tempUrl) {
    let that = this
    let cloudPath = "userFile/" + this.generateUuid() + Date.now() + name;
    wx.cloud.uploadFile({
      filePath: tempUrl,
      cloudPath,
      success: (result) => {
        wx.showToast({
          icon: 'none',
          title: '上传成功，请等待工作人员1~3天的审核',
        })
        console.log("上传成功", result)
        that.setData({
          fileID: result.fileID,
          filePath: result.filePath
        })

      },
      fail: (res) => {},
      complete: (res) => {},
    })
  },
  //下载并打开文件
  downLoadFile() {
    wx.cloud.downloadFile({
        fileID: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/homeMildeIcon/VolunteerTeamApplication.doc'
      }).then(res => {
        console.log("下载成功", res)
        let tempFilePath = res.tempFilePath
        wx.openDocument({
          filePath: tempFilePath,
          showMenu: true,
          success(res) {
            console.log("打开文档成功")
          }
        })
      })
      .catch(res => {
        console.log("下载失败", res)
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
  },

  //选择服务的地区
  chooseRegion(e) {
    this.setData({
      region: e.detail.value
    })
    console.log("服务的地区", e.detail.value)
  },
  getInputLoct(e) {
    console.log("位置信息", e.detail.value)
    this.setData({
      address: e.detail.value
    })
  },

  getLocation() {
    this.checkLocation();
    let that = this;
    wx.chooseLocation({
      success: function (res) {
        console.log(res)
        that.setData({
          longitude: Number(res.longitude),
          latitude: Number(res.latitude),
          address: res.address,
        })
      }
    });
  },
  //校验位置权限是否打开
  checkLocation() {
    let that = this;
    //选择位置，需要用户授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              wx.showToast({ //这里提示失败原因
                title: '授权成功！',
                duration: 1500
              })
            },
            fail() {
              wx.showToast({ //这里提示失败原因
                title: '授权失败,定位未打开！',
                duration: 1500
              })
            }
          })
        }
      }
    })
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

  //选择服务类型
  selectApply(e) {
    let serve = []
    let index = e.currentTarget.dataset.index;
    let item = this.data.applyList[index];
    if (this.data.serve.length <= 2) {
      item.isSelect = !item.isSelect;
    } else if (item.isSelect) {
      item.isSelect = !item.isSelect;
    }
    this.data.applyList.forEach(items => {
      if (items.isSelect && serve.length <= 2) {
        serve.push(items.Item_Name)
      }
    })
    this.setData({
      serve,
      applyList: this.data.applyList,
    });
    console.log("选择的值", this.data.serve)
    console.log("applyList的值", this.data.applyList)
  },

  //打开蒙层
  changeMask() {
    this.setData({
      isHideMask: !this.data.isHideMask
    })
  },

  generateUuid: function () {
    return Number(Math.random().toString().substr(2, 2) + Date.now()).toString(10);
  },
  //注册
  login() {
    if (this.data.name == '' || this.data.organizaName == '' || this.data.governName == '' || this.data.region == '' || this.data.type == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入完整的信息',
      })
    } else if (this.data.phoneLen != 11 || this.data.paLen1 < 8 || this.data.paLen2 < 8 || this.data.emailCheck != 2 || this.data.IDLen != 18) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的格式内容',
      })
    } else if (this.data.logo == '') {
      wx.showModal({
        title: '提示',
        content: '请上传组织的logo',
      })
    } else if (this.data.password != this.data.password1) {
      wx.showToast({
        icon: 'none',
        title: '两次输入的密码不一样',
      })
    } else if (this.data.fileID == '') {
      wx.showToast({
        icon: 'none',
        title: '请上传需要审核的文件',
      })
    } else if (this.data.address == '') {
      wx.showToast({
        icon: 'none',
        title: '请点击地图获取到详细地址',
      })
    } else if (this.data.isAllow == false) {
      wx.showToast({
        icon: 'none',
        title: '请认真阅读隐私政策并同意',
      })
    } else {
      let that = this
      wx.showModal({
        content: '我们将会记录该组织的信息，用于公安处备案，请确认是否同意',
        cancelText: "不同意", // 取消按钮的文字  
        confirmText: "同意", // 确认按钮的文字  
        success(res) {
          if (res.confirm) {
            wx.cloud.database().collection('organiza_data')
              .add({
                data: {
                  num: 'ozy' + that.generateUuid(),
                  logo: that.data.logo,
                  phoneNum: that.data.phoneNum,
                  password: that.data.password,
                  email: that.data.email,
                  name: that.data.name,
                  organizaName: that.data.organizaName,
                  IDNum: that.data.IDNum,
                  address: that.data.address,
                  latitude: that.data.latitude,
                  longitude: that.data.longitude,
                  type: that.data.type,
                  serve: that.data.serve,
                  region: that.data.region,
                  isAllow: that.data.isAllow,
                  fileID: that.data.fileID,
                  Img: that.data.logoID,
                  paId: [],
                  filePath: that.data.filePath,
                  time: util.formatTime(new Date()),
                  isPass: false, //测试没问题改为false
                  isUser: false,
                }
              })
              .then(res => {
                wx.navigateTo({
                  url: '/pages/login/log_page/log_page',
                })
                wx.showToast({
                  icon: 'none',
                  title: '注册成功,等待官方审核结果',
                })
                console.log("添加用户信息成功", res)
              })
              .catch(err => {
                console.log("添加用户信息失败", err)
              })
            console.log('用户点击确定')
          } else if (res.cancel) {
            wx.showToast({
              icon:'none',
              title: '您点击了不同意，注册失败',
            })
          }
        }
      })

    }
  },
  //检查手机号
  checkPhoneNum(phoneNumber) {
    let str = /^1\d{10}$/
    if (str.test(phoneNumber)) {
      return true
    } else {
      wx.showToast({
        title: '手机号不正确',
        // image: '/images/false.png'
      })
      return false
    }
  },
  lookPrivacy() {
    wx.navigateTo({
      url: '/pages/login/privacy/privacy',
    })
  }



})