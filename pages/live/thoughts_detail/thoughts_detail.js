let user
let msg
const app = getApp();
Page({
  data: {
    detail: {},
    content: '',
    user: '',
    userNum: '',
    chat: [],
    nameLen: 0,
    showIndex: 0,
    replyIndex: -1,
    dindex: 0,
    replyText: '请输入文字'
  },
  onLoad(options) {
    user = wx.getStorageSync('userInfo')
    let userNum = wx.getStorageSync('useraccount')
    console.log(JSON.parse(options.id))
    this.setData({
      detail: JSON.parse(options.id),
      user,
      userNum,
      replyIndex: -1,
    })
    this.show()
  },
  panel: function (e) {
    if(e.currentTarget.dataset.index!=this.data.showIndex){
      this.setData({
        showIndex: e.currentTarget.dataset.index,
        dindex: e.currentTarget.dataset.dindex
      })
    }else{
      this.setData({
        showIndex:0,
      })
    }

  },
  show() {
    wx.cloud.database().collection('timeline')
      .doc(this.data.detail._id)
      .get()
      .then(res => {
        let dis = res.data.discuss
        let D = []
        dis.forEach(item => {
          D.push(new Date(item.date.replace(/-/g, "/")).getTime())
        })
        for (let i = 0; i < D.length; i++) {
          for (let j = i; j < D.length; j++) {
            let temp = dis[i]
            if (D[i] < D[j]) {
              dis[i] = dis[j]
              dis[j] = temp
            }
          }
        }
        this.setData({
          chat: dis
        })
      })
  },
  getInputValue(e) {
    this.setData({
      content: e.detail.value
    })
    let L = this.data.content.substring(0, this.data.nameLen)
    if (L != this.data.replyText && this.data.replyIndex != -1) {
      this.setData({
        content: ''
      })
    }
    if (this.data.content == '') {
      this.setData({
        replyIndex: -1
      })
    }
    console.log("content", this.data.content)
  },
  //创建对象
  creatMsg() {
    msg = {}
    console.log("content", this.data.content)
    msg.date = app.getNowFormatDate(),
      msg.openid = this.data.userNum._openid
    msg.nickName = this.data.user.nickName
    msg.Img = this.data.user.avatarUrl
    msg.reply = []
  },

  publishText() {
    if (!user) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return
    }
    if (this.data.content == '' || (this.data.replyIndex >= 0 && this.data.content.length == this.data.nameLen)) {
      wx.showToast({
        icon: 'none',
        title: '请先输入值',
      })
      return
    }

    //回复下面的话
    if (this.data.replyIndex != -1) {
      this.creatMsg()
      let content = this.data.content
      content.substring(this.data.nameLen)
      msg.content = content
      let detail = this.data.detail.discuss
      let maxLen = detail.length
      let Rdetail = this.data.detail.discuss[maxLen - this.data.replyIndex - 1].reply
      Rdetail.push(msg)
      detail.reply = Rdetail

      this.update(detail)
    } else { //自己评论
      this.creatMsg()
      msg.content = this.data.content
      console.log(msg)
      let detail = this.data.detail.discuss
      detail.push(msg)
      this.update(detail)
    }
  },
  //封装更新的函数
  update(e) {
    wx.cloud.database().collection('timeline')
      .doc(this.data.detail._id)
      .update({
        data: {
          discuss: e
        }
      })
      .then(res => {
        wx.showToast({
          icon: 'none',
          title: '评论成功',
        })
        this.setData({
          replyIndex: -1,
          content: ''
        })
        this.show()
      })
  },
  reply(e) {

    let name = e.currentTarget.dataset.name
    let replyIndex = e.currentTarget.dataset.index
    console.log(name)
    this.setData({
      content: "@" + name + " ",
      replyIndex,
      nameLen: name.length + 2
    })
  },

})