let user = []
let id
let touchChat
const db = wx.cloud.database()
const _ = db.command
const util = require("../../../utils/util")
Page({
  data: {
    volList: '',
    friends: '',
    myFriend: '',
  },
  onLoad(event) {
    id = event.id
    user = wx.getStorageSync('useraccount')
    console.log("传过来的值", event.id)
    this.getMyFriend()
  },
  onShow() {
    touchChat = 0
    wx.cloud.database().collection('program_record')
    .doc(id)
    .get()
    .then(res => {
      let volList = res.data.volunteer
      this.setData({
        volList,
      })
      console.log(volList)
    })
  },
  deleteVol(e) {
    wx.showModal({
      title: '删除志愿者操作',
      content: '是否确定要删除志愿者',
      success: res => {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index
          let userId = e.currentTarget.dataset.id
          let list = this.data.volList
          let i = 0
          this.setData({
            volList: list,
          })
          list.splice(index, 1)
          wx.cloud.database().collection('user_data')
            .doc(userId)
            .get()
            .then(res => {
              let actList = res.data.activity
              actList.forEach(function (item, index) {
                if (item._id == id) {
                  i = index
                }
              })
              actList.splice(i, 1)
              wx.cloud.database().collection('user_data')
                .doc(userId)
                .update({
                  data: {
                    activity: actList
                  }
                })
                .then(res => {
                  wx.cloud.database().collection('program_record')
                    .doc(id)
                    .update({
                      data: {
                        volunteer: list,
                        residueNum: _.inc(1)
                      }
                    })
                    .then(res => {
                      this.onShow()
                      console.log("更新数据成功", res)
                    })
                    .catch(err => {
                      console.log("更新数据失败", err)
                    })
                })
            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //去聊天页咨询客服
  consultService(e) {
    let volId = e.currentTarget.dataset.id
    let name = e.currentTarget.dataset.name
    let Img = e.currentTarget.dataset.img
    touchChat++;
    let isHave = false
    //做判断数据库里是否跟这个人聊过天（或跟这个人是朋友）
    let promise = new Promise((resolve, reject) => {
      this.data.myFriend.forEach(item => {
        if ((item.userA_id == volId && item.userB_id == user._id) || (item.userA_id == user._id && item.userB_id == volId)) {
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
              userB_id: volId,
              userB_faceImg: Img,
              userB_nickName: name,
              record: [], //聊天记录
              friend_status: 1, //0：申请中，1：已经好友
              time: util.formatTime(new Date()) //发送消息的时间
            },
          })
          .then(res => {
            console.log("建表成功后的数据", res._id)
            wx.navigateTo({
              url: '/pages/live/chat/chat?_id=' + res._id + "&title=" + name,
            })
          })
      } else {
        //已经建好聊天表
        if (touchChat == 1) {
          this.changeId(e)
        }
      }
    })
  },
  //把用户ID转换为记录表的ID
  changeId(e) {
    const _ = wx.cloud.database().command
    wx.cloud.database().collection("chat_record").where(
        _.or([{
          userA_id: user._id,
          userB_id: e.currentTarget.dataset.id,
          friend_status: 1
        }, {
          userB_id: user._id,
          userA_id: e.currentTarget.dataset.id,
          friend_status: 1
        }])
      ).get()
      .then(res => {
        console.log("查到的值", res.data[0]._id)
        wx.navigateTo({
          url: '/pages/live/chat/chat?_id=' + res.data[0]._id + "&title=" + e.currentTarget.dataset.name,
        })
      })
  },
  //获取已有的好友列表
  getMyFriend() {
    const _ = wx.cloud.database().command
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
})