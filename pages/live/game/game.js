Page({

  data: {
    isRefresh: false,
    currentTab: 0,
    list: [{
        src: '/images/live/qiqiaoban.jpg',
        detail: '七巧板'
      },
      {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/飞花令.jpg',
        detail: '飞花令',
      },
      {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/故事接龙.jpg',
        detail: '故事接龙',
      },
      {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/数字华容道.jpg',
        detail: '数字华容道',
      },
      {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/数独.jpg',
        detail: '数独',
      }, {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/让我考考你.jpg',
        detail: '让我考考你',
      }, {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/踢毽球.jpg',
        detail: '踢毽球',
      }, {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/九点相连.jpg',
        detail: '九点连线',
      }, {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/绕口令.jpg',
        detail: '绕口令',
      }, {
        src: 'cloud://text01-8g94lw8d90a79de6.7465-text01-8g94lw8d90a79de6-1310958072/game/猜数字.jpg',
        detail: '猜数字',
      },
    ],
  },
  toDetail(e) {
    wx.navigateTo({
      url: '/pages/live/gameDetail/gameDetail?index=' + e.currentTarget.dataset.index,
    })
  },

  tabNav(e) {
    let currentTab = e.currentTarget.dataset.index
    this.setData({
      currentTab
    })
  },
  handleSwiper(e) {
    let {
      current,
      source
    } = e.detail
    if (source === 'autoplay' || source === 'touch') {
      const currentTab = current
      this.setData({
        currentTab
      })
    }
  },

})