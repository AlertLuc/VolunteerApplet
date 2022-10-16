Page({
  data: {
    id: 0,
    test:false
  },
  onLoad(e) {
    this.setData({
      id:e.index,
      test:false
    })
    console.log("传过来的值", e.index)
  },
  isTouch(){
    let test = this.data.test
    test = !test
    this.setData({
      test,
    })
  }

})