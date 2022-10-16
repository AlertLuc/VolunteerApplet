const db = wx.cloud.database().collection('user_data')
Page({
  data: {
    name: '',
    phone: '',
    IDNum: '',
    password: '',
    password1: '',
    paLen1:'',
    paLen2:''
  },
  getName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  getPhoneNum(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  getIDNum(e) {
    this.setData({
      IDNum: e.detail.value
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
  //修改密码
  change() {
    if (this.data.phone == '' || this.data.name == '' || this.data.IDNum == '' || this.data.password == '' || this.data.password1 == '') {
      wx.showToast({
        icon: 'none',
        title: '请把数据输入完',
      })
    } else if (this.data.paLen1<8 || this.data.paLen2<8) {
      wx.showToast({
        icon: 'none',
        title: '密码格式有误',
      })
    }else if (this.data.password != this.data.password1) {
      wx.showToast({
        icon: 'none',
        title: '输入的密码不一致',
      })
    } else {
      console.log("身份证号",this.data.IDNum)
      console.log("手机号",this.data.phone)
      db.where({
          IDNum: this.data.IDNum,
          name: this.data.name,
          phoneNum: this.data.phone
        })
        .get()
        .then(res => {
          console.log("查询数据成功", res)
          if (res.data.length == 1) {
            db.doc(res.data[0]._id).update({
              data:{
                password:this.data.password
              }
            })
            .then(res1=>{
              wx.navigateTo({
                url: '/pages/login/log_page/log_page',
              })
              wx.showToast({
                icon:'none',
                title: '修改成功请重新登录',
              })
            })
            .catch(err=>{
              console.log("修改失败",err)
            })
          }else{
            wx.showModal({
              title: '查询失败',
              content: '是否要去注册',
              success (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateTo({
                    url: '/pages/login/log_in/log_in',
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
    }
  }


})