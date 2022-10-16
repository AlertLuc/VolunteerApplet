const util = require("../../../utils/util")
const DB = wx.cloud.database().collection('chat_record')
const innerAudioContext = wx.createInnerAudioContext()
var msg = {}
let user = ''
let chatListRecord = []

Page({
  data: {
    me: '', //登录者的缓存
    recordId: '', //记录这是谁的Id
    chatList: [], //在页面显示的聊天记录
    inputValue: '', //输入框的值
    Height: '', //页面的高度
    isTabs: '', //input框下面选择表情包或者文件
    isOn: false, //底部页面是否上拉
    scrollTop: 0,
    imgList: [], //插入图片的列表
    fileIDs: [], //存入云端的路径
    into: '', //最后一条数据库表的_Id
    //文件的数据
    fileId: '', //上传的文件Id
    fileName: '', //文件名称
    filePath: '', //文件下载路径
    fileSize: '', //文件的大小
    //视频的数据
    moviePath: '',
    //音频的数据
    audioPath: '',
    audioName: '',
    audioSize: '', //音频的大小
    playUrl: '/images/play.png', //播放的路径
    isPlay: true,

    emoji_list: [{
      name: '[爱你]',
      imgSrc: '../../../images/emoji/1.png'
    }, {
      name: '[思考]',
      imgSrc: '../../../images/emoji/2.png'
    }, {
      name: '[偷笑]',
      imgSrc: '../../../images/emoji/3.png'
    }, {
      name: '[大笑]',
      imgSrc: '../../../images/emoji/4.png'
    }, {
      name: '[开心]',
      imgSrc: '../../../images/emoji/5.png'
    }, {
      name: '[微笑]',
      imgSrc: '../../../images/emoji/6.png'
    }, {
      name: '[还行]',
      imgSrc: '../../../images/emoji/8.png'
    }, {
      name: '[大哭]',
      imgSrc: '../../../images/emoji/9.png'
    }, {
      name: '[得意]',
      imgSrc: '../../../images/emoji/10.png'
    }, {
      name: '[疑惑]',
      imgSrc: '../../../images/emoji/11.png'
    }, {
      name: '[期待]',
      imgSrc: '../../../images/emoji/12.png'
    }, {
      name: '[不屑]',
      imgSrc: '../../../images/emoji/13.png'
    }, {
      name: '[淘气]',
      imgSrc: '../../../images/emoji/14.png'
    }, {
      name: '[呲牙]',
      imgSrc: '../../../images/emoji/15.png'
    }, {
      name: '[受伤]',
      imgSrc: '../../../images/emoji/16.png'
    }, {
      name: '[调皮]',
      imgSrc: '../../../images/emoji/17.png'
    }, {
      name: '[呆]',
      imgSrc: '../../../images/emoji/18.png'
    }, {
      name: '[倒立]',
      imgSrc: '../../../images/emoji/20.png'
    }, {
      name: '[不理解]',
      imgSrc: '../../../images/emoji/21.png'
    }, {
      name: '[悲伤]',
      imgSrc: '../../../images/emoji/22.png'
    }, {
      name: '[擦鼻涕]',
      imgSrc: '../../../images/emoji/23.png'
    }, {
      name: '[不要]',
      imgSrc: '../../../images/emoji/24.png'
    }, {
      name: '[吐]',
      imgSrc: '../../../images/emoji/25.png'
    }, {
      name: '[可怕]',
      imgSrc: '../../../images/emoji/26.png'
    }, {
      name: '[打瞌睡]',
      imgSrc: '../../../images/emoji/27.png'
    }, {
      name: '[闭嘴]',
      imgSrc: '../../../images/emoji/28.png'
    }, {
      name: '[愤怒]',
      imgSrc: '../../../images/emoji/29.png'
    }, {
      name: '[戴口罩]',
      imgSrc: '../../../images/emoji/30.png'
    }, {
      name: '[哦]',
      imgSrc: '../../../images/emoji/31.png'
    }, {
      name: '[懵]',
      imgSrc: '../../../images/emoji/32.png'
    }, {
      name: '[不服]',
      imgSrc: '../../../images/emoji/33.png'
    }, {
      name: '[不满]',
      imgSrc: '../../../images/emoji/34.png'
    }, {
      name: '[生气]',
      imgSrc: '../../../images/emoji/35.png'
    }, {
      name: '[哭泣]',
      imgSrc: '../../../images/emoji/36.png'
    }, {
      name: '[不好意思]',
      imgSrc: '../../../images/emoji/37.png'
    }, ]
  },


  //长按删除消息
  removeMsg(e) {
    let that = this
    console.log("长按的结果", e.currentTarget.dataset.index)
    let index = e.currentTarget.dataset.index
    //let idD = e.currentTarget.dataset.id
    DB.doc(this.data.recordId).get({
      success: res => {
        var record = res.data.record
        record.splice(index, 1)
        DB.doc(this.data.recordId).update({
          data: {
            record: record
          },
          success: res => {
            wx.showToast({
              icon: 'none',
              title: '撤销成功！',
            })
            that.getChatRecord()
          }
        })
      }
    })

  },
  // 关闭所有tab框
  offEmoji() {
    if (this.data.isOn == true) {
      this.setData({
        isOn: false,
        Height: this.data.Height + 150
      })
      this.onReady()
      console.log("关闭页面后页面的高度", this.data.Height)
    }
  },

  onLoad(options) {
    //修改页面标题
    wx.setNavigationBarTitle({
      title: options.title //页面标题为路由参数
    })
    //获取页面的高度
    var _this = this;
    const query = wx.createSelectorQuery()
    query.select('.page2').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        Height: res[1].scrollHeight,
      })
      console.log("获取页面高度的数据", _this.data.Height)
    })
    //取用户登录的缓存
    user = wx.getStorageSync('useraccount')

    let userInfo = wx.getStorageSync('userInfo')
    this.setData({
      me: user,
      recordId: options._id,
      userInfo: userInfo
    })
    console.log("拿到用户微信的数据", userInfo)
    console.log("拿到用户的数据", this.data.me)
    console.log("传过来的值", options)
    this.getChatRecord()

  },

  //检测发送文字的变化
  onReady() {
    let _this = this;
    DB.doc(this.data.recordId)
      .watch({
        onChange: (res) => {
          console.log("监听页面的变化", res.docs)
          if (res.docs.length != 0) {
            chatListRecord = res.docs[0].record
            //判断是否有记录表
            if (chatListRecord.length != 0) {
              _this.setData({
                chatList: chatListRecord,
                into: chatListRecord[chatListRecord.length - 1]._id
              })
            }
            _this.readMessage()
            console.log("准备的值", _this.data.chatList)
          }
        },
        onError(err) {
          console.log("失败", err)
        }
      })
    if (chatListRecord.length != 0) {
      
    }
  },
  //将未读变为已读
  readMessage() {
    let change = false
    chatListRecord.forEach(item => {
      if (item.userId != user._id && !item.read) {
        item.read = true
        change = true
      }
    })
    if(change){
      DB.doc(this.data.recordId)
      .update({
        data: {
          record: chatListRecord
        }
      })
      .then(res => {
        console.log("更新数据成功", res)
      })
      .catch(err => {
        console.log("更新数据失败", err)
      })
    }
  },
  //获取聊天列表
  getChatRecord() {
    DB.doc(this.data.recordId)
      .get()
      .then(res => {
        let chatRecord = res.data.record
        if (chatRecord.length == 1) {
          chatRecord[0].timeOver = true
          DB.doc(this.data.recordId).update({
            data: {
              record: chatRecord
            },
          })
        } else if (chatRecord.length > 1) {
          let timestamp1 = new Date(res.data.record[chatRecord.length - 2].time).getTime();
          let timestamp2 = new Date(res.data.record[chatRecord.length - 1].time).getTime();
          let timestamp = (timestamp2 - timestamp1) / 60000
          if (timestamp >= 3) {
            chatRecord[chatRecord.length - 1].timeOver = true
            DB.doc(this.data.recordId).update({
              data: {
                record: chatRecord
              },
            })
          }
          console.log("时间戳", timestamp);
        }
        console.log("查询数据失败的原因", chatRecord)
        this.setData({
          chatList: res.data.record
        })
        console.log("获取列表数据成功", this.data.chatList)
      })
      .catch(res => {
        console.log("获取列表数据失败", res)
      })
  },
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

  //收到输入框里的内容
  getInputValue(event) {
    console.log(event.detail.value)
    this.data.inputValue = event.detail.value
  },

  //生成唯一不重复ID
  generateUuid: function () {
    return Number(Math.random().toString().substr(3, 8) + Date.now()).toString(36);
  },
  //创造msg对象
  creatMsg() {
    msg = {}
    msg._id = this.generateUuid()
    msg.timeOver = false //时间是否超过三分钟
    msg.userId = this.data.me._id
    msg.nickName = this.data.me.name
    msg.faceImg = this.data.me.Img
    msg.openid = this.data.me._id
    msg.read = false //对方是否已读

    msg.time = util.formatTime(new Date())
  },
  //发送文本内容
  publishText() {
    //判断输入框的值是否为空
    if (!this.data.inputValue) {
      return false;
    }
    //将输入的数据记录在数据表record里
    var that = this;
    DB.doc(that.data.recordId).get({
      success(res) {
        var record = res.data.record
        //创建一个对象
        that.creatMsg()
        msg.text = that.data.inputValue

        record.push(msg)
        DB.doc(that.data.recordId).update({
          data: {
            record: record
          },
          success(res) {
            //刷新下页面
            that.getChatRecord()
            that.setData({
              inputValue: ''
            })
          }
        })
      }
    })
  },
  //打开发送emoji功能
  openSendEmoji() {
    console.log("isOn的值", this.data.isOn)
    if (this.data.isOn == false) {
      this.setData({
        isTabs: 'emoji',
        isOn: true,
        Height: this.data.Height - 150
      })
      console.log("页面的变化-open+", this.data.Height)
      this.onReady()
    } else if (this.data.isOn) {
      if (this.data.isTabs == "features") {
        this.setData({
          isTabs: 'emoji',
        })
        this.onReady()
      } else {
        this.setData({
          isOn: false,
          Height: this.data.Height + 150
        })
        console.log("页面的变化-open-", this.data.Height)
        this.onReady()
      }
    }
  },
  //打开加号，使用扩展功能
  openSendFile() {
    if (this.data.isOn == false) {
      this.setData({
        isTabs: "features",
        isOn: true,
        Height: this.data.Height - 150
      })
      this.onReady()

    } else if (this.data.isOn) {
      if (this.data.isTabs == 'emoji') {
        this.setData({
          isTabs: 'features',
        })
        this.onReady()
      } else {
        this.setData({
          isOn: false,
          Height: this.data.Height + 150
        })
        this.onReady()
      }
    }
  },
  //发送表情包
  sendEmoji(e) {
    var that = this;
    DB.doc(that.data.recordId).get({
      success(res) {
        var record = res.data.record
        //创建一个对象
        that.creatMsg()
        msg.text = e.currentTarget.dataset.name
        msg.emoji = e.currentTarget.dataset.src
        record.push(msg)
        DB.doc(that.data.recordId).update({
          data: {
            record: record
          },
          success(res) {
            console.log(res)
            wx.showToast({
              icon: 'none',
              title: '发送成功！',
            })
            //刷新下页面
            that.getChatRecord()
          }
        })
      }
    })
  },

  //选择图片
  ChooseImage() {
    wx.chooseImage({
      count: 8, //默认9,我们这里最多选择8张
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log("选择图片成功", res)
        this.setData({
          imgList: res.tempFilePaths
        })
        this.sendPicture()
        console.log("路径", this.data.imgList)
      }
    });
  },

  //发送图片
  sendPicture() {
    let imgList = this.data.imgList //将要插入的图片列表
    if (!imgList || imgList.length < 1) {
      wx.showToast({
        icon: "none",
        title: '请选择图片'
      })
      return
    }
    wx.showLoading({
      title: '发送中...',
    })

    const promiseArr = []
    let cloudPath = "userPhoto/" + user._openid + Date.now() + ".jpg";
    //只能一张张上传 遍历临时的图片数组
    for (let i = 0; i < imgList.length; i++) {
      let filePath = imgList[i]
      let suffix = /\.[^\.]+$/.exec(filePath)[0]; // 正则表达式，获取文件扩展名
      //在每次上传的时候，就往promiseArr里存一个promise，只有当所有的都返回结果时，才可以继续往下执行
      promiseArr.push(new Promise((reslove, reject) => {
        wx.cloud.uploadFile({
          cloudPath,
          filePath: filePath, // 文件路径
        }).then(res => {
          // get resource ID
          console.log("上传结果", res)
          this.setData({
            fileIDs: this.data.fileIDs.concat(res.fileID)
          })
          reslove()
        }).catch(error => {
          console.log("上传失败", error)
        })
      }))
    }
    //保证所有图片都上传成功
    Promise.all(promiseArr).then(res => {
      var that = this;
      DB.doc(that.data.recordId).get({
        success(res) {
          var record = res.data.record
          //创建一个对象
          that.creatMsg()
          msg.text = "[图片]"
          msg.image = that.data.imgList
          msg.fileIDs = that.data.fileIDs
          record.push(msg)
          DB.doc(that.data.recordId).update({
            data: {
              record: record
            },
            success: res => {
              wx.hideLoading()
              wx.showToast({
                icon: 'none',
                title: '发送成功',
              })
              that.setData({
                imgList: [],
                fileIDs: []
              })
              console.log('发送成功', res)
            },
            fail: err => {
              wx.hideLoading()
              wx.showToast({
                icon: 'none',
                title: '网络不给力....'
              })
              console.error('发送失败', err)
            }
          })
        }
      })
    })
  },

  //选择文件
  upFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'all',
      success: res => {
        let size = res.tempFiles[0].size / 1024
        let FileSize = ''
        console.log(size)
        if (size < 1024) {
          FileSize = size.toFixed(2) + 'k'
        } else if (size < 1048576) {
          FileSize = (size / 1024).toFixed(2) + 'M'
        } else {
          FileSize = (size / 1048576).toFixed(2) + 'G'
        }
        this.setData({
          fileName: res.tempFiles[0].name,
          fileSize: FileSize,
          filePath: res.tempFiles[0].path
        })
        console.log("接受的文件的name", this.data.fileName)
        console.log("接受的文件大小", this.data.fileSize)
        console.log("接受的文件路径", this.data.filePath)
        this.uploadFile(res.tempFiles[0].name, res.tempFiles[0].path)
      }
    })
  },
  //上传文件
  uploadFile(name, tempUrl) {
    let that = this;
    let cloudPath = "userFile/" + user._openid + Date.now() + name;
    wx.cloud.uploadFile({
      filePath: tempUrl,
      cloudPath,
      success: (result) => {
        console.log("上传成功", result)
        this.setData({
          fileId: result.fileID
        })
        console.log("文件上传的ID", this.data.fileId)
        DB.doc(that.data.recordId).get({
          success(res) {
            var record = res.data.record
            //创建一个对象
            that.creatMsg()
            console.log("msg的值", msg)
            msg.text = "[文件]"
            msg.fileName = that.data.fileName
            msg.fileID = result.fileID
            msg.filePath = that.data.filePath
            msg.fileSize = that.data.fileSize
            console.log("之后msg的值", msg)

            record.push(msg)
            DB.doc(that.data.recordId).update({
              data: {
                record: record
              },
              success(res) {
                console.log(res)
                wx.showToast({
                  icon: 'none',
                  title: '发送成功！',
                })
                //刷新下页面
                that.getChatRecord()
              }
            })
          }
        })
      },
      fail: (res) => {},
      complete: (res) => {},
    })
  },
  //下载并打开文件
  downLoadFile(e) {
    let fileId = e.currentTarget.dataset.id
    let filePath = e.currentTarget.dataset.path
    console.log("打印fileId", e)
    wx.cloud.downloadFile({
        fileID: fileId
      }).then(res => {
        wx.openDocument({
          filePath: filePath,
          success(res) {
            console.log("打开文档成功")
          }
        })
        console.log("下载成功", res)
      })
      .catch(res => {
        console.log("下载失败", res)
      })
  },

  //上传并显示视频
  upMovie() {
    let that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success: res => {
        console.log("选择视频成功", res)
        this.setData({
          moviePath: res.tempFilePath
        })
        let cloudPath = "userFile/" + user._openid + Date.now() + '.mp4';
        wx.cloud.uploadFile({
          cloudPath,
          filePath: res.tempFilePath, // 文件路径
          success: res1 => {
            //将信息记录到数据库
            DB.doc(that.data.recordId).get({
              success(res2) {
                var record = res2.data.record
                //创建一个对象
                that.creatMsg()
                msg.text = "[视频]"
                msg.moviePath = that.data.moviePath
                msg.movieID = res1.fileID
                record.push(msg)
                DB.doc(that.data.recordId).update({
                  data: {
                    record: record
                  },
                  success(res3) {
                    console.log(res3)
                    wx.showToast({
                      icon: 'none',
                      title: '发送成功！',
                    })
                    //刷新下页面
                    that.getChatRecord()
                  }
                })
              }
            })
            console.log("res", res.tempFilePath)
            console.log("上传视频成功res1", res1.fileID)
          },
          fail: err => {
            // handle error
          }
        })
      }
    })
  },
  //上传音频
  upAudio() {
    let that = this;
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success: res => {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFiles[0].path
        let size = res.tempFiles[0].size / 1024
        let FileSize = ''
        if (size < 1024) {
          FileSize = size.toFixed(2) + 'k'
        } else if (size < 1048576) {
          FileSize = (size / 1024).toFixed(2) + 'M'
        } else {
          FileSize = (size / 1048576).toFixed(2) + 'G'
        }
        this.setData({
          audioPath: res.tempFiles[0].path,
          audioSize: FileSize,
          audioName: res.tempFiles[0].name,
          playUrl: '/images/play.png'
        })
        console.log("选择音频成功", res.tempFiles[0])
        let cloudPath = "userMP3/" + user._openid + Date.now() + '.mp3';
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePaths, // 文件路径
          success: res1 => {
            // get resource ID
            DB.doc(that.data.recordId).get({
              success(res2) {
                var record = res2.data.record
                //创建一个对象
                that.creatMsg()
                msg.text = "[音频]"
                msg.audioName = that.data.audioName
                msg.audioPath = that.data.audioPath
                msg.audioSize = FileSize
                msg.audioID = res1.fileID
                console.log("res1.fileID", res1.fileID)
                record.push(msg)
                DB.doc(that.data.recordId).update({
                  data: {
                    record: record
                  },
                  success(res3) {
                    console.log(res3)
                    wx.showToast({
                      icon: 'none',
                      title: '发送成功！',
                    })
                    //刷新下页面
                    that.getChatRecord()
                  }
                })
              }
            })
            console.log("上传音频成功", res1)
            console.log("选择音频成功", res)
          },
          fail: err => {
            console.log("失败的原因", err)
          }
        })
      }
    })
  },
  //播放或暂停音乐
  audioPlay(e) {
    console.log("传来的值", e)

    innerAudioContext.src = e.currentTarget.dataset.path
    if (this.data.isPlay) {
      innerAudioContext.play()
    } else {
      innerAudioContext.pause()
      console.log("您点击了暂停")
    }
    this.setData({
      isPlay: !this.data.isPlay
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  }
})