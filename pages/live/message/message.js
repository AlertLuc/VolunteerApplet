let counter = []
Page({
  data:{
    newMsg:'',
    friends:'',
  },
  onLoad(options) {
    let user = wx.getStorageSync('useraccount')
    if(user==''){
      wx.showToast({
        icon:'none',
        title: '未登录状态',
      })
      return
    }
    counter = JSON.parse(options.counter)
    this.setData({
      friends: user,
    })
    console.log("传过来的值",JSON.parse(options.counter))
    console.log("获取到缓存数据", this.data.friends)
  },
  //展示新的消息
  onShow(){
    this.getMsg()
  },
  //获取好友列表
  getMsg(){
    var that = this;
    const _ = wx.cloud.database().command
    wx.cloud.database().collection("chat_record").where(
      _.or([
        {
          userA_id:this.data.friends._id,
        },{
          userB_id:this.data.friends._id,
        }
      ])
    ).get()
    .then(res=>{
      let record = res.data
      record.forEach((item,index)=>{
        item.time = counter[index]
      })
      this.setData({
        newMsg:res.data
      })
      console.log("好友列表的数据",this.data.newMsg)
    })
  },
  
  //跳转到聊天页面
  toChat(e){
    console.log("获取到的数据",e.currentTarget.dataset.title)
    wx.navigateTo({
      url: '/pages/live/chat/chat?_id='+e.currentTarget.dataset.id+"&title="+e.currentTarget.dataset.title,
    })
  },
  //去注册
  zhuce(){
    wx.navigateTo({
      url: '/pages/index/index',
    })
  }
})