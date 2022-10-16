let leader = []
const util = require("../../../utils/util")
var timestamp = Date.parse(new Date());
var date = new Date(timestamp);
//获取年份  
var Y = date.getFullYear();
//获取月份  
var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
//获取当日日期 
var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

Page({
  data: {
    startDate: '',
    signBegin: '',
    signEnd: '',
    actBegin: '',
    actEnd: '',
    timeSignBegin: '',
    timeSignEnd: '',
    timeActBegin: '',
    timeActEnd: '',
    name: '',
    num: '',
    address: '',
    work: '',
    title: '',
    content: '',
    region: '',
    condition: '',
    serveTime: 0,
    signTime: 0,
    diffTime: 0,
    label: '',
    Img: '',
    state: {
      signState: 0,
      day: 0
    },
    applyList: [{
      Item_Name: "科学",
      isSelect: false
    }, {
      Item_Name: "文化",
      isSelect: false
    }, {
      Item_Name: "音乐",
      isSelect: false
    }, {
      Item_Name: "舞蹈",
      isSelect: false
    }, {
      Item_Name: "绘画",
      isSelect: false
    }, ],
    serve: []
  },
  onLoad() {
    leader = wx.getStorageSync('useraccount')
    if (leader == '') {
      wx.showToast({
        icon: 'none',
        title: '未登录状态',
      })
      return
    } else if (leader.isUser) {
      wx.showToast({
        icon: 'none',
        title: '志愿者未开放此功能',
      })
      return
    }
    let nowdate = Y + '-' + M + '-' + D
    this.setData({
      startDate: nowdate
    })
    console.log("leader", leader)
    console.log("当前日期：", nowdate);
  },

  //正则标识
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  chooseSignBegin(e) {
    this.setData({
      signBegin: e.detail.value
    })
    console.log("获得到的日期", e)
  },
  chooseSignEnd(e) {
    this.setData({
      signEnd: e.detail.value
    })
    console.log("获得到的日期", this.data.timeSignBegin)
  },
  chooseActBegin(e) {
    this.setData({
      actBegin: e.detail.value
    })
    console.log("获得到的日期", e)
  },
  chooseActEnd(e) {
    this.setData({
      actEnd: e.detail.value
    })
  },
  chooseTimeSignBegin(e) {
    this.setData({
      timeSignBegin: e.detail.value
    })
    console.log("获取到的开始时间", e)
  },
  chooseTimeSignEnd(e) {
    this.setData({
      timeSignEnd: e.detail.value
    })
  },
  chooseTimeActBegin(e) {
    this.setData({
      timeActBegin: e.detail.value
    })
  },
  chooseTimeActEnd(e) {
    this.setData({
      timeActEnd: e.detail.value
    })
  },

  getName(e) {
    this.setData({
      name: e.detail.value
    })
  },
  getNum(e) {
    let num = this.validateNumber(e.detail.value)
    this.setData({
      num: parseInt(num)
    })
  },
  chooseRegion(e) {
    this.setData({
      region: e.detail.value
    })
  },
  getAddress(e) {
    this.setData({
      address: e.detail.value
    })
  },
  getWork(e) {
    this.setData({
      work: e.detail.value
    })
  },
  getTitle(e) {
    this.setData({
      title: e.detail.value
    })
  },
  getContent(e) {
    this.setData({
      content: e.detail.value
    })
  },
  getCondition(e) {
    this.setData({
      condition: e.detail.value
    })
  },
  //记录输入的数据
  getImg() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'back',
      success: res => {
        console.log(res.tempFiles[0].tempFilePath)
        console.log(res.tempFiles[0].size)
        this.upload(res.tempFiles[0].tempFilePath)
      }
    })
  },
  upload(imgUrl) {
    let cloudPath = "userPhoto/" + leader._openid + Date.now() + ".jpg";
    wx.cloud.uploadFile({
      cloudPath,
      filePath: imgUrl, // 文件路径
      success: res => {
        this.setData({
          Img: res.fileID
        })
        console.log("ID", this.data.Img)
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

  //计算min
  checkDate(tab, tae, ab, ae, n) {
    if (tab != '' && tae != '' && ab != '' && ae != '') {
      //日期转换成分钟
      var start_date = new Date(ab.replace(/-/g, "/"));
      var end_date = new Date(ae.replace(/-/g, "/"));
      var ms = end_date.getTime() - start_date.getTime();
      var day = parseInt(ms / (1000 * 60 * 60 * 24));

      let min1 = tae.substring(3, 5);
      let hour1 = tae.substring(0, 2);
      let min2 = tab.substring(3, 5);
      let hour2 = tab.substring(0, 2);

      //时间转换成分钟

      if (n == 1) {
        let totalMin = ((hour1 - hour2) * 60 + (min1 - min2)) * (day + 1)
        this.setData({
          serveTime: totalMin
        })
      } else if (n == 2) {
        let totalMin = ((hour1 - hour2) * 60 + (min1 - min2)) * (day + 1)
        this.setData({
          signTime: totalMin
        })
      } else if (n == 3) {
        let totalMin = ((hour1 - hour2) * 60 + (min1 - min2)) * (day + 1)
        if (((hour1 - hour2) * 60 + (min1 - min2)) <= 0) {
          if (day > 0) {
            this.setData({
              diffTime: 1
            })
          } else {
            this.setData({
              diffTime: 0
            })
          }
        } else {
          this.setData({
            diffTime: totalMin
          })
        }
      }
      console.log("day = ", day);
    }
  },
  //发布项目
  publish() {
    this.checkDate(this.data.timeActBegin, this.data.timeActEnd, this.data.actBegin, this.data.actEnd, 1)
    this.checkDate(this.data.timeSignBegin, this.data.timeSignEnd, this.data.signBegin, this.data.signEnd, 2)
    this.checkDate(this.data.timeSignEnd, this.data.timeActEnd, this.data.signEnd, this.data.actEnd, 3)
    if (this.data.name == '' || this.data.num == '' || this.data.title == '' || this.data.content == '' || this.data.address == '' || this.data.region == '' || this.data.work == '' || this.data.condition == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入详细信息',
      })
    } else if (this.data.Img == '') {
      wx.showToast({
        icon: 'none',
        title: '请选择照片',
      })
    } else if (this.data.signEnd == '' || this.data.signBegin == '' || this.data.actBegin == '' || this.data.actEnd == '') {
      wx.showToast({
        icon: 'none',
        title: '请选择日期',
      })
    } else if (this.data.timeActBegin == '' || this.data.timeActEnd == '' || this.data.timeSignEnd == '' || this.data.timeSignBegin == '') {
      wx.showToast({
        icon: 'none',
        title: '请选择时间',
      })
    } else if (this.data.serveTime <= 0 || this.data.signTime <= 0) {
      wx.showToast({
        icon: 'none',
        title: '选择的服务日期有错',
      })
    } else if (this.data.diffTime <= 0) {
      wx.showToast({
        icon: 'none',
        title: '报名结束时间不能大于服务结束时间',
      })
    } else if (this.data.label == '') {
      wx.showToast({
        icon: 'none',
        title: '请添加标签',
      })
    } else {
      wx.showToast({
        icon: 'loading',
        title: '发布中'
      })
      wx.cloud.database().collection('program_record')
        .add({
          data: {
            signBegin: this.data.signBegin,
            signEnd: this.data.signEnd,
            actBegin: this.data.actBegin,
            actEnd: this.data.actEnd,
            timeSignBegin: this.data.timeSignBegin,
            timeSignEnd: this.data.timeSignEnd,
            timeActBegin: this.data.timeActBegin,
            timeActEnd: this.data.timeActEnd,
            paName: this.data.name,
            totalNum: this.data.num,
            residueNum: this.data.num,
            address: this.data.address,
            work: this.data.work,
            title: this.data.title,
            content: this.data.content,
            region: this.data.region,
            serveTime: this.data.serveTime,
            residueNum: this.data.num,
            imgUrl: this.data.Img,
            label: this.data.label,
            state: this.data.state,
            leader: leader,
            volunteer: [],
            time: util.formatTime(new Date())
          }
        }).then(res => {
          console.log("发布成功的数据", res._id)
          this.addPa(res._id)
          // let paId = {paId:res._id}
          // leader.push(paId)
          // wx.setStorageSync('useraccount', leader)
          wx.navigateTo({
            url: '/pages/homeTest/homeTest',
          })
        }).catch(err2 => {
          wx.showToast({
            icon: 'none',
            title: '发布失败',
          })
        })
    }
  },
  //先获取paid数据，再在尾部添加
  addPa(paid) {
    let pa = wx.getStorageSync('useraccount')
    let paId = pa.paId
    paId.push(paid)
    wx.cloud.database().collection('organiza_data')
      .doc(leader._id)
      .update({
        data: {
          paId,
        }
      })
      .then(res1 => {
        leader.paId.push(paid)
        wx.setStorageSync('useraccount', leader)
        console.log("存入负责人的数据成功", res1)
      })
      .catch(err => {
        console.log("存入负责人的数据失败", err)
      })
  },
  //多选框，最多只能选择一个
  selectApply(e) {
    var index = e.currentTarget.dataset.index;
    var item = this.data.applyList[index];
    for (let i = 0; i <= 4; i++) {
      if (this.data.applyList[i].isSelect) {
        this.data.applyList[i].isSelect = !this.data.applyList[i].isSelect
      }
    }
    item.isSelect = !item.isSelect;
    this.setData({
      applyList: this.data.applyList,
      label: item.Item_Name
    });
    console.log("选中标签的值", this.data.label)
  },
  //请选择

})