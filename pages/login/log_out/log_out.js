const db = wx.cloud.database().collection('user_data')

Page({
  data: {
    name: '',
    phone: '',
    IDNum: '',
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

  //修改密码
  change() {
    let that = this
    wx.showModal({
      title: '是否要真的注销',
      content: '一旦注销，在平台上保存的志愿记录将会被清空',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.remove()
        } else if (res.cancel) {
          wx.showToast({
            icon: 'none',
            title: '取消了注册',
          })
        }
      }
    })
  },
  remove() {
    if (this.data.phone == '' || this.data.name == '' || this.data.IDNum == '') {
      wx.showToast({
        icon: 'none',
        title: '请把数据输入完',
      })
    } else {
      db.where({
          IDNum: this.data.IDNum,
          name: this.data.name,
          phoneNum: this.data.phone
        })
        .get()
        .then(res => {
          console.log("查询数据成功", res)
          if (res.data.length == 1) {
            db.doc(res.data[0]._id).remove()
              .then(res1 => {
                wx.setStorageSync('userInfo', '')
                wx.setStorageSync('useraccount', '')
                wx.navigateTo({
                  url: '/pages/homeTest/homeTest',
                })
                wx.showToast({
                  icon: 'none',
                  title: '注销成功',
                })
              })
              .catch(err => {
                console.log("修改失败", err)
              })
          } else {
            wx.showToast({
              icon: 'none',
              title: '注销失败，账号或密码错误',
            })
          }
        })
    }

  },


})