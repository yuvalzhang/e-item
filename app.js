// app.js
const util = require('/utils/util.js')
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

  },
  globalData: {
    userInfo: null,
    date:util.formatTime(new Date()),
    dateID:0,
    logs:[],
    cart:[],
    content:[],//存放购物车列表以便在浏览器中显示
    restList:[20, 20, 20, 20, 10],
    // restList:[],
    headers:{
      'Content-Type': 'application/json'
    }
  },

  comfirmToPack: function() {
    var that = this;
    var arr = wx.getStorageSync('cart') || [];
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      }),

      
    })
  }
})
