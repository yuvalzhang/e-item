// logs.js
const util = require('../../utils/util.js')
var app = getApp()
Page({
  data: {
    dateTime:0,
    logs: [],
    content: [],
    dateID:0
  },
  onLoad() {
    var dateTimeNumber = generateDateTimeNumber();
    var dateTime = generateDateTime();
    // app.globalData.dateID=dateTimeNumber;
    // var app=getApp();
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      }),
      dateID: dateTimeNumber,
      // dateTime: dateTime
    })
  },
  
});

function generateDateTimeNumber() {
  const now = new Date();
  
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  // 拼接成字符串
  // return `${year}${month}${day}${hours}${minutes}${seconds}`;
  return year + '-' + month + '-' + day + ' ' + 
  hours + ':' + minutes + ':' + seconds;
}

function generateDateTime(){
  const now = new Date();
  
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以+1
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
