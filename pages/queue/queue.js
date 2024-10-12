// pages/home/home.js
var app = getApp()

Page({
  data:{
content:[],
history:[],
isHidden:true,
items:[],

totalNum: 0, //选中商品数量
    cartList: [], //选中商品列表
    restList: [20, 20, 20, 20, 10], //库存列表
  },
onLoad: function() {
  this.createView();
},

createView: function(){
var that = this;
//模拟异步操作(从服务器获取数据), 到时候需要修改
setTimeout(function(){
  that.data.items.push({unique:'item' + (that.data.items.length + 1)});
  //添加新数据
  that.setData({
    items: that.data.items
  });

});//1秒后执行, 模拟网络请求时间
},
getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
},

sorting:function(){
  var orderDate = new Date();
  //8.138.165.162
  let urlString = "http://8.138.165.162:5000/api/upload_data";
  //116.63.87.221
  var randomInt = this.getRandomInt(1, 1000);
  
  // let i = 1
  // let Params = "&date="
  wx.request({
    url:urlString,
    method:"GET",
    data: {
      random: randomInt,
      date: orderDate,
      status: 0
    },
    success: function(res) {
      console.log('上传成功', res.data);
      try{
        wx.showModal({
          title: '提示',
          content: '数据上传成功',
          showCancel: false
        });
      }catch(error){
        wx.showModal({
          title: '错误',
          content: '上传数据失败',
          showCancel: false
      });
    }
    },
    fail: function(error) {
      console.log('上传失败', error);
    }
  })
  // this.fetchData()
  wx.navigateTo({
    url: '/pages/sorting/sorting',
  })
},

fetchData: function() {
  var restList = app.globalData.restList
  console.log('globalData的值', app.globalData.restList)
  wx.request({
    url: 'http://8.138.165.162:5000/api/download_stockData', // 需要轮询的URL
    //116.63.87.221
    method: 'GET',
    data:{
    },
    success: (res) => {
      // 请求成功的处理逻辑
      console.log('接收数据成功!',res.data);
      restList = res.data
      // this.setData({
      //   restList: res.data
      // })
      // console.log('请求成功之后', resList)
    },
    fail: (err) => {
      // 请求失败的处理逻辑
      console.error('接收数据失败!', err);
    },
  });
  
  console.log('分拣之后的库存值:', restList)
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
    
    //获取打包时的购物车数据
    if (arr.length > 0) {
      for (var j in that.data.tabsList) {
      for (var i in arr) {
          if (that.data.tabsList[j].e_ID == arr[i].e_ID) {
            that.data.tabsList[j].quantity = arr[i].quantity;
            break
          } else {
            that.data.tabsList[j].quantity = 0;
          }
        }
      }
    } else {
      for (var j in that.data.tabsList) {
        that.data.tabsList[j].quantity = 0;
      }
    }

    var totalNum = 0;
    if (arr.length > 0) {
      for (var i in arr) {
        totalNum += Number(arr[i].quantity);
      }
    }
  },

})