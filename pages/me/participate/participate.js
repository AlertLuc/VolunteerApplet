const util = require("../../../utils/util")
let pa
Page({
  data: {
    act: '',
    signState:0,
    day:0,
    currentData: 0,
  },
  onShow() {
    let that = this
    let user = wx.getStorageSync('useraccount')
    if(user==''){
      wx.showToast({
        icon:'none',
        title: '未登录状态',
      })
      return
    }
    wx.cloud.database().collection('user_data')
      .doc(user._id)
      .get()
      .then(res => {
        console.log("获取到的项目数据", res.data.activity)
        pa = res.data.activity
        console.log("pa", pa)
        pa.forEach(item => {
          this.checkState( item.actBegin,item.timeActBegin, item.actEnd, item.timeActEnd)
          item.state.day = that.data.day
          item.state.signState = that.data.signState
        })
        this.setData({
          act: pa
        })
        console.log("获取到的项目数据", this.data.act)
      })
      .catch(err => {
        console.log("获取到的项目数据失败", err)
      })
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

    console.log("time1",time1)
    console.log("time2",time2)
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

  //获取当前滑块的index
  bindchange: function (e) {
    const that = this;
    that.setData({
      currentData: e.detail.current
    })
  },

  //点击切换，滑块index赋值
  checkCurrent: function (e) {
    const that = this;
    if (that.data.currentData === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentData: e.target.dataset.current
      })
    }
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/homePage/detail/detail?id=' + e.currentTarget.dataset.id + "&title=" + e.currentTarget.dataset.title,
    })
  }
})