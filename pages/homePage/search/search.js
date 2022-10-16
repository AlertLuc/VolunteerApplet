const db = wx.cloud.database()
const _ = db.command
let record = []
let hot = ''
//搜索记录放进缓存里
Page({
  data: {
    inputValue: '',
    inputHide: true,
    searchData: '', //展示列表的值
    searchRecord: '', //展示搜索记录
    searchData: '',
    searchWhere: true, //记录点击了哪里
    card: [{
      name: "全部分类",
      select: false,
    }, {
      name: "文化",
      select: false,
    }, {
      name: "音乐",
      select: false,
    }, {
      name: "科学",
      select: false,
    }, {
      name: "绘画",
      select: false,
    }, {
      name: "舞蹈",
      select: false,
    }],
    record: [] //只在初始化用
  },
  onLoad(e) {
    this.card_ch(e.num)
    this.ready()
  },
  //获取之前的搜索记录
  ready() {
    record = this.data.record
    record = wx.getStorageSync('searchRecord')
    this.setData({
      searchRecord: record
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
  //点击搜索历史后搜索
  historySearch(e) {
    console.log("点击的搜索历史", e.currentTarget.dataset.record)
    this.setData({
      inputValue: e.currentTarget.dataset.record,
      searchWhere: false
    })
    this.search()
  },
  //获取输入的数据
  getInputData(e) {
    console.log("输入的数据", e.detail.value)
    this.setData({
      inputValue: e.detail.value
    })
  },
  //查询缓存里有没有该值
  isHave() {
    let isRecord = false
    if (record.length == 0) {
      record.push(this.data.inputValue)
      wx.setStorageSync('searchRecord', record)
    } else if (record.length > 0) {
      record.forEach(item => {
        if (item == this.data.inputValue) {
          isRecord = true
        }
      })
      if (!isRecord) {
        record.push(this.data.inputValue)
        wx.setStorageSync('searchRecord', record)
      }
    }
  },
  //点击搜索，按照title,content,address,work,paName,
  search() {
    if (!this.data.inputValue) {
      wx.showToast({
        icon: 'none',
        title: '请输入内容',
      })
    } else {
      if (this.data.searchWhere) {
        //将搜索的值存入数据库中
        this.isHave()
      }
      db.collection('program_record')
        .where(_.or([{
          title: db.RegExp({
            regexp: this.data.inputValue,
            options: 'i',
          })
        }, {
          region: db.RegExp({
            regexp: this.data.inputValue,
          })
        }, {
          content: db.RegExp({
            regexp: this.data.inputValue,
            options: 'i',
          })
        }, {
          address: db.RegExp({
            regexp: this.data.inputValue,
          })
        }, {
          paName: db.RegExp({
            regexp: this.data.inputValue,
            options: 'i',
          })
        }, ]))
        .orderBy("residueNum", 'asc')
        .get()
        .then(res => {
          console.log("从数据库中查出来的数据", res)
          if (res.data.length) {
            this.setData({
              searchData: res.data,
              inputHide: true
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '没有找到数据',
            })
          }
          console.log("搜索的值成功", res)
          this.ready()
        })
        .catch(err => {
          console.log("搜索的值失败", err)
        })
    }
  },
  //清除所有的搜索记录
  moveAllRecord() {
    wx.setStorageSync('searchRecord', [])
    this.setData({
      searchRecord: ''
    })
    record = []
  },
  todetail(e) {
    wx.navigateTo({
      url: '/pages/homePage/detail/detail?id=' + e.currentTarget.dataset.id + "&title=" + e.currentTarget.dataset.title,
    })
    console.log("页面传来的数据", e.currentTarget.dataset.id)
  },
  card_ch(e) {
    let position = ''
    let that = this
    let card = this.data.card
    card.forEach((item, index) => {
      if (index == e) {
        position = item.name
        item.select = true
      } else {
        item.select = false
      }
    })
    this.setData({
      card,
    })

    if (e == 0) {

      wx.cloud.callFunction({
          name: 'getPaData'
        })
        .then(res => {
          console.log("云函数获取数据成功", res)
          hot = res.result
          let D = []
          console.log("hot", hot)
          hot.forEach(item => {
            that.checkState(item.signBegin, item.timeSignBegin, item.signEnd, item.timeSignEnd)
            item.state.day = that.data.day
            item.state.signState = that.data.signState
            D.push(new Date(item.signEnd.replace(/-/g, "/")).getTime())
          })
          let s_data = hot
          for (let i = 0; i < D.length; i++) {
            for (let j = i; j < D.length; j++) {
              let temp = s_data[i]
              if (D[i] < D[j]) {
                s_data[i] = s_data[j]
                s_data[j] = temp
              }
            }
          }
          this.setData({
            searchData: s_data
          })
        })
        .catch(err => {
          console.log("获取到的项目数据失败", err)
        })
    } else {
      wx.cloud.database().collection('program_record')
        .where({
          label: position
        })
        .get()
        .then(res => {
          hot = res.data
          console.log("hot", hot)
          let D = []
          hot.forEach(item => {
            that.checkState(item.signBegin, item.timeSignBegin, item.signEnd, item.timeSignEnd)
            item.state.day = that.data.day
            item.state.signState = that.data.signState
            D.push(new Date(item.signEnd.replace(/-/g, "/")).getTime())
          })
          let s_data = hot
          for (let i = 0; i < D.length; i++) {
            for (let j = i; j < D.length; j++) {
              let temp = s_data[i]
              if (D[i] < D[j]) {
                s_data[i] = s_data[j]
                s_data[j] = temp
              }
            }
          }
          this.setData({
            searchData: s_data
          })
          console.log("获取到的项目数据", this.data.searchData)
        })
    }
  },
  //选择哪个卡片
  chooseCard(e) {
    console.log(e)
    console.log(e.currentTarget.dataset.index)
    let index_ch = e.currentTarget.dataset.index
    this.card_ch(index_ch)
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

  //隐藏搜索历史
  touchInput() {
    console.log("您点击了搜索")
    this.setData({
      inputHide: false
    })
  },
  //刚发布的在前


})