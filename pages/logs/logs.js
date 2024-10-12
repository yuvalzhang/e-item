// logs.js
const util = require('../../utils/util.js')
var app=getApp();
var dateID = app.globalData.dateID;
// function padZero(num) {
//   return num < 10 ? '0' + num : num;
// }
function formatDate(dateTimeStr) {
  var year = dateTimeStr.substring(0, 4);
var month = dateTimeStr.substring(4, 6);
var day = dateTimeStr.substring(6, 8);
var hour = dateTimeStr.substring(8, 10);
var minute = dateTimeStr.substring(10, 12);
var second = dateTimeStr.substring(12, 14);
// var new_date = new Date(year, month - 1, day, hour, minute, second);

return year + '-' + month + '-' + day + ' ' + 
hour + ':' + minute + ':' + second;
}
Page({
  data: {
    logs: [],
    content: [],
    dateID:0,
    formattedDate:0
  },
  
  onLoad() {
    
    var cartinfo=wx.getStorageSync('cart');
    // var cartinfo=app.globalData.cart;
    // var formattedDate = formatDate(dateID);
    var cartArray = cartinfo.map(item => {
      
      return `${item.e_ID}(${item.quantity}件)`;
      
      //需要指定f_Name名称属性才能显示
      });
      console.log(cartArray);
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      }),
      // content:(wx.getStorageSync('cart') || []).map(cart => {
      //   return {
      //     cart: JSON.stringify(app.globalData.cart)
      //   }
      // }),
      content: this.removeDuplicates(cartinfo),
      dateID: app.globalData.dateID
    })
    
    
  },
  removeDuplicates: function(arr) {
    const uniqueObject = {};
  const uniqueArray = [];

  for (var i = 0; i < arr.length; i++) {
    const currentElement = arr[i];
    if (!uniqueObject[currentElement.e_ID]) {
      // 如果 e_ID 不存在，则添加到新数组中，并初始化数量
      uniqueObject[currentElement.e_ID] = { quantity: currentElement.quantity };
      uniqueArray.push(currentElement);
    } else {
      // 如果 e_ID 已存在，则累加数量
      uniqueObject[currentElement.e_ID].quantity = currentElement.quantity;
    }
  }

  // 更新新数组中的元素数量
  uniqueArray.forEach(item => {
    item.quantity = uniqueObject[item.e_ID].quantity;
  });

  console.log('处理后的购物车列表: ', uniqueArray);
  return uniqueArray;
  },
  onUnload(){
    wx.removeStorageSync('cart');
  }
})

