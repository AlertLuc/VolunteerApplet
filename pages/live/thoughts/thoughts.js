let app = getApp();
let labelList = ["文化", "音乐", "科学", "绘画", "舞蹈"]
let user
Page({
  data: {
    dataList: [],
    touch: false,
    user: ''
  },
  onShow() {
    let that = this;
    user = wx.getStorageSync('useraccount')
    this.setData({
      user,
    })
    wx.cloud.database().collection('timeline')
      .orderBy('createTime', 'desc') //按发布视频排序
      .get({
        success(res) {
          console.log("请求成功", res.data)
          that.setData({
            dataList: res.data
          })
        },
        fail(res) {
          console.log("请求失败", res)
        }
      })
  },
  //渲染爱心

  // 预览图片
  previewImg: function (e) {
    let imgData = e.currentTarget.dataset.img;
    console.log("eeee", imgData[0])
    console.log("图片s", imgData[1])
    wx.previewImage({
      //当前显示图片
      current: imgData[0],
      //所有图片
      urls: imgData[1]
    })
  },
  //JS代码

  adddetial: function () {
    wx.navigateTo({
      url: '/pages/live/fabu/fabu',
    })
  },
  toDetail(e) {
    if (!user) {
      wx.showToast({
        icon: 'none',
        title: '请先登录',
      })
      return
    }
    let datail = e.currentTarget.dataset.label
    let lindex = 1
    labelList.forEach((item, index) => {
      if (item == datail) {
        lindex = index + 1
      }
    })
    wx.navigateTo({
      url: '/pages/homePage/search/search?num=' + lindex,
    })
  },
  //调用数据库实现点赞功能
  isLove(e) {
    if(!user){
      wx.showToast({
        icon:'none',
        title: '登录后才能点赞',
      })
      return
    }
    let id = e.currentTarget.dataset.id
    let d_l = this.data.dataList
    let ind = 0
    d_l.forEach((item, index) => {
      if (id == item._id) {
        item.touch = !item.touch
        item.love.forEach(item1 => {
          if (item1 == user._id){
            item.touch = false
          }
        })
        if (item.touch) {
          item.love.push(user._id)
          ind = index
        } else {
          ind = index
          item.love.splice(item.love.length - 1, 1)
        }
      }
    })
    // let touch = !this.data.touch
    this.setData({
      dataList: d_l
    })
    console.log("love", this.data.dataList)
    wx.cloud.database().collection('timeline')
      .doc(id)
      .update({
        data: {
          love: d_l[ind].love
        }
      })
      .then(res => {
        console.log("更新成功")
      })

  },
  //调用云函数删除数据
  delete(e) {
    let idd = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除帖子',
      content: '删除后评论的数据都将清除',
      confirmColor: 'skyblue',
      success: res => {
        if (res.confirm) {
          wx.cloud.callFunction({
              name: 'deletePost',
              data: {
                id: idd
              }
            })
            .then(res => {
              console.log("更新成功", res)
              this.onShow()
            })
            .catch(err => {
              console.log("更新失败", err)
            })
        } else if (res.cancel) {
          wx.showToast({
            icon: 'none',
            title: '您点击了取消',
          })
        }
      }
    })
  },
  sendPost(e){
    let id = e.currentTarget.dataset.id
    console.log("id",id)
    wx.navigateTo({
      url: '/pages/live/thoughts_detail/thoughts_detail?id='+JSON.stringify(id),
    })
  },


})