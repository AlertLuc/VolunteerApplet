let organ
let paId
Page({
  data: {
    procress: [],
  },
  card_ch(e) {
    let that = this
    let time = that.data.procress
    
    setInterval(function () {
      time.forEach(item => {
        that.checkState(item.actBegin, item.timeActBegin, item.actEnd, item.timeActEnd)
        item.state.day = that.data.day
        item.state.signState = that.data.signState
      })
      that.setData({
        procress:time
      })
      console.log(time)
    }, 2000);
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

    if (time1 > 0) {//活动未开始
      this.setData({
        signState: 0,
        day: begin
      })
    } else if (time1 <= 0 && time2 > 0) {//活动未结束
      this.setData({
        signState: 1,
        day: end
      })
    } else if (time1 < 0 && time2 <= 0) {//活动已结束
      this.setData({
        signState: 2
      })
    }
  },

  onShow() {
    organ = wx.getStorageSync('useraccount')
    if (organ == '') {
      wx.showToast({
        icon: 'none',
        title: '未登录状态',
      })
      return
    } else if (organ.isUser) {
      wx.showToast({
        icon: 'none',
        title: '志愿者未开放此功能',
      })
      return
    }
    paId = organ.paId
    let pa = []
    if (paId != '') {
      paId.forEach(item => {
        wx.cloud.database().collection('program_record')
          .doc(item)
          .get()
          .then(res => {
            console.log("已发布的项目", res)
            pa.push(res.data)
            this.setData({
              procress: pa
            })
            this.card_ch()
          })
          .catch(err => {
            console.log("获取项目失败", err)
          })
      })
      console.log("获取成功", this.data.procress)
    }
  },
  lookDetail(e) {
    wx.navigateTo({
      url: '/pages/me/vol_detail/vol_detail?id=' + e.currentTarget.dataset.id,
    })
  },
  getCode(e) {
    wx.navigateTo({
      url: '/pages/me/code/code?id=' + e.currentTarget.dataset.id,
    })
  },
  getCodeNO(){
    wx.showToast({
      icon:'none',
      title: '过时不允许发布签到',
    })

  },
  //删除
  cancel(e) {
    let that = this
    wx.showModal({
      title: '删除项目',
      content: '如果有志愿者已报名则无法删除',
      success(res1) {
        if (res1.confirm) {
          let id = e.currentTarget.dataset.id
          wx.cloud.database().collection('program_record')
            .doc(id)
            .get()
            .then(res => {
              console.log("要删除的数据", res)
              if (res.data.volunteer != '') {
                wx.showToast({
                  icon: 'none',
                  title: '已经有志愿者参与报名，如有问题请联系客服人员',
                })
              } else {
                wx.cloud.database().collection('program_record')
                  .doc(id)
                  .remove()
                  .then(res => {
                    paId.forEach((item, index) => {
                      if (item == id) {
                        organ.paId.splice(index, 1)
                      }
                    })
                    wx.setStorageSync('useraccount', organ)
                    wx.showToast({
                      icon: 'none',
                      title: '删除项目成功',
                    })
                    that.onShow()
                  })
              }
            })
            .catch(err => {
              wx.showToast({
                icon: 'none',
                title: '删除项目失败',
              })
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})