// pages/chose/chose.js
// var config = require('../../../utils/config.js');
// var http = require('../../../utils/request.js');
const util = require('../../utils/util.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{ft_name: "打包套数(必选)",ft_id: "a"},
    {ft_name: "电阻",ft_id: "b"},
    {ft_name: "LED",ft_id: "c"},
    {ft_name: "三极管",ft_id: "d"}],
    tabsList: [
        //1
            {ft_id: "a",e_ID:'packages',f_Img:'../../images/包装.png', f_Name:'打包的套数',f_Description:'请选择打包多少套元器件',
            quantity:'0',e_status:'1'
            },

            {ft_id: "c",e_ID:'LED',f_Img:'../../images/LED.png',f_Name:'LED',f_Description:'二极管',f_Price:'18',quantity:'0',
            stock:'20', rest:'20'
            },
            //2
            {ft_id: "b",e_ID:'R1',f_Img:'../../images/R-C.png',f_Name:'R1',f_Description:'2k电阻',
            f_DPrice:'',f_Price:'18',quantity:'0',
            stock:'20', rest:'20'
            },

            //3
            {ft_id: "b",e_ID:'R2',f_Img:'../../images/R-C.png',f_Name:'R2',f_Description:'4.7k电阻',
            f_DPrice:'',f_Price:'18',quantity:'0',
            stock:'20', rest:'20'
            },

            
            //4
            {ft_id: "b",e_ID:'R3',f_Img:'../../images/R-C.png',f_Name:'R3',f_Description:'5.1k电阻',
            f_DPrice:'',f_Price:'18',quantity:'0',
            stock:'20', rest:'20'
            },
            
            //5

            {ft_id: "d",e_ID:'dynatron',f_Img:'../../images/dynatron.jpg',f_Name:'dynatron',f_Description:'三极管',
            f_DPrice:'',f_Price:'18',quantity:'0',
            stock:'10', rest:'10'
            }],
            
    indexId: 0,
    toTitle: "title-0",
    scrollTop: 0,
    top: [],
    // totalPrice: 0, //选中商品总价格
    totalNum: 0, //选中商品数量
    cartList: [], //选中商品列表
    restList: [20, 20, 20, 20, 10], //库存列表
    
    date:[],
    // 购物车动画
    animationData: {},
    animationMask: {},
    maskVisual: "hidden",
    maskFlag: true,
  },
  getRandomInt(min, max) {
    var randomArr = wx.getStorageSync('random') || []
    var randomNum = Math.floor(Math.random() * (max - min + 1)) + min
    for(var i in randomArr){
      if(randomArr[i] == randomNum){
        randomNum = Math.floor(Math.random() * (2000 - randomNum + 1)) + min
      }
    }
    randomArr.push(randomNum)
    console.log('随机数防止重复: ', randomNum)
    wx.setStorageSync('randomArr', randomArr)
    return randomNum;
  },
  // checkRandomInt(num) {

  // },
  // 左侧点击事件
  jumpIndex(e) {
    let index = e.currentTarget.dataset.menuindex;
    let ft_id = e.currentTarget.dataset.ft_id;
    let that = this
    that.setData({
      indexId: index,
      toTitle: "title-" + ft_id
    });
  },
  scrollToLeft(res) {
    this.setData({
      scrollTop: res.detail.scrollTop
    })
    var length = this.data.top.length;
    for (var i = 0; i < this.data.top.length; i++) {
      if (this.data.top[i] - this.data.top[0] <= this.data.scrollTop && (i < length - 1 && this.data.top[i + 1] - this.data.top[0] > this.data.scrollTop)) {
        if (this.data.indexId != i) {
          this.setData({
            indexId: i,
          });
        }
      }
    }
  },
  onLoad: async function (options) {
    // console.log(this.data.tabsList)
    var that = this;
    var app = getApp();
    //轮询函数
  this.polling = setInterval(() => {
    this.fetchData();
    this.refreshData();
    // this.data.restList = app.globalData.restList
    // for  (var p = 0; p < 5; p++){
    //   this.data.tabsList[p+1].rest = this.data.restList[p];
    // }
  }, 3000);


  
    wx.showLoading({
      mask: true,
      title: '加载中…',
    })
    wx.hideLoading()
    // console.log(that.data.tabsList)
    //赋值
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winHeight: res.windowHeight - 100
        });
        var top2 = new Array();
        for (var i = 0; i < that.data.tabs.length; i++) {
          wx.createSelectorQuery().select('#view-' + that.data.tabs[i].ft_id).boundingClientRect(function (rect) {
            var isTop = Number(rect.top);
            top2.push(isTop);
            console.log("view-c:" + JSON.stringify(rect));
          }).exec();
        }
        that.setData({
          top: top2
        });
      }
    });
    this.onShow()
  },
  onUnload: function() {
    // 清除轮询定时器
    clearInterval(this.polling);
  },
  refreshData: function(){
    wx.request({
      url: 'http://8.138.165.162:5000/api/download_stockData',
      method:'GET',
      success:(res) => {
        
        this.setData({
          restList : res.data,
        })
        console.log("更新库存数据：",this.data.restList)
        
      }
    })
  },
  onShow: function (options) {
    var that = this;
    // 获取购物车缓存数据
    var arr = wx.getStorageSync('cart') || [];

    // 进入页面后判断购物车是否有数据，如果有，将菜单与购物车quantity数据统一
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
    // 进入页面计算购物车总数
    
    var totalNum = 0;
    if (arr.length > 0) {
      for (var i in arr) {
        totalNum += Number(arr[i].quantity);
        if(totalNum < 0){
          totalNum = 0
        }
      }
    }
    // console.log('已进入页面计算购物车总数')

    // 赋值数据
    this.setData({
      cartList: arr,
      tabsList: that.data.tabsList,
      totalNum: totalNum
    })
  },
  // 购物车增加数量
  addCart: function (e) {
    var id = e.currentTarget.dataset.id;
    var arr = wx.getStorageSync('cart') || [];
    var f = false;
    var totalNum = this.data.totalNum;
    // arr = this.removeDuplicates(arr)
    
    for (var i in this.data.tabsList) { // 遍历菜单找到被点击的菜品，数量加1
      if (this.data.tabsList[i].e_ID == id ) {
        if(this.data.tabsList[0].quantity == null || this.data.tabsList[0].quantity == 0){
          this.data.tabsList[0].quantity = 1;
        }
        
        this.data.tabsList[i].quantity = this.data.tabsList[i].quantity ? this.data.tabsList[i].quantity + 1 : 1;   //使用三目运算符来增加数量
        
        if (this.data.tabsList[i].e_ID != "packages"){
          var rest = this.data.tabsList[i].stock - this.data.tabsList[i].quantity * this.data.tabsList[0].quantity;
        //超出元器件库存判断
        if (rest < 0){
          wx.showToast({
            title: '元器件库存不足！',
          })
          this.data.tabsList[i].quantity -= 1;
        }
        else{
          this.data.tabsList[i].rest = rest;
        }
        }
        else {
          for(var j = 1; j<=5; j++){
              var rest2 = this.data.tabsList[j].stock - this.data.tabsList[j].quantity * this.data.tabsList[0].quantity;
              //超出元器件库存判断
              if (rest2 < 0 ){
                wx.showToast({
                  title: '元器件库存不足！',
                })
              }
              else{
                this.data.tabsList[j].rest = rest2;
              }
          }
          
        }
      
          if (arr.length >= 0) {
            for (var j in arr) { // 遍历购物车找到被点击的元器件，数量加1
              if (arr[j].e_ID == id) {
                if(arr[j].e_ID != 'packages'){
                  arr[j].quantity += 1;
                      totalNum += arr[j].quantity
                  }
                  else {
                      totalNum *= this.data.tabsList[0].quantity
                      console.log('减少套数又添加:', totalNum)
                    }
                      
                if(totalNum < 0){
                  totalNum = 0
                }
                f = true;
                arr.push(this.data.tabsList[i]);
                try {
                  wx.setStorageSync('cart', arr)
                } catch (e) {
                  console.log(e)
                }
                break;
              }
            }
            
            if (!f) {
              f = true
              arr.push(this.data.tabsList[i]);
            }
          } 
          else{
            f = true
            arr.push(this.data.tabsList[i]);
          }
        
        try {
          wx.setStorageSync('cart', arr)
        } catch (e) {
          console.log(e)
        }
        break;
      }
      
    }
    this.setData({
      cartList: arr,
      tabsList: this.data.tabsList,
      totalNum: totalNum,
      restList: this.data.restList
    })
    this.getTotalPrice();
    //获取购物车总数
  },
  
  // 购物车减少数量
  delCart: function (e) {
    var id = e.currentTarget.dataset.id;
    var arr = wx.getStorageSync('cart') || [];
    var totalNum = this.data.totalNum;  //要用一个值来接收, 这样就不会出现空值问题
    // var temp = 1;
    arr = this.removeDuplicates(arr)
    console.log('确保arr处理完毕: ', arr)
    for (var i in this.data.tabsList) {
      if (this.data.tabsList[i].e_ID == id) {
        if(this.data.tabsList[0].quantity == null || this.data.tabsList[0].quantity == 0){
          this.data.tabsList[0].quantity = 1;
        }
        
        this.data.tabsList[i].quantity = this.data.tabsList[i].quantity ? this.data.tabsList[i].quantity - 1 : 1; 
        
        if (this.data.tabsList[i].e_ID != "packages"){
          this.data.tabsList[i].rest += this.data.tabsList[0].quantity
          if (this.data.tabsList[i].rest > this.data.tabsList[i].stock){
            this.data.tabsList[i].rest = this.data.tabsList[i].stock;
          }
        }
        else{
          for(var j = 1; j<5; j++){
            this.data.tabsList[j].rest += this.data.tabsList[j].quantity
            if (this.data.tabsList[j].rest > this.data.tabsList[j].stock){
              this.data.tabsList[j].rest = this.data.tabsList[j].stock;
            }
          }
        }
        console.log('减少购物车时的库存列表:', this.data.restList)
        if (arr.length > 0) {
          for (var j in arr) {
            // if(arr[j].e_ID == 'packages'){
            //   tem = arr[j].quantity
            // }
            //点了按钮之后的代码
            if (arr[j].e_ID == id) {
              if(arr[j].e_ID != 'packages'){
                arr[j].quantity -= 1;
              totalNum -= this.data.tabsList[0].quantity; 
              }
              else{
                console.log('点击减少套数: ', totalNum / (this.data.tabsList[0].quantity + 1))
                totalNum = totalNum - totalNum / (this.data.tabsList[0].quantity + 1) ;
                
            }
              console.log('点了减号之后:', arr[j].quantity)
              console.log('点了减号之后总数:', totalNum)
              if(totalNum < 0){
                  totalNum = 0
              }
              if (arr[j].quantity <= 0) {
                this.removeByValue(arr, id) //77
              }
              
              try {
                wx.setStorageSync('cart', arr)
              } catch (e) {
                console.log(e)
              }
            }
          }
        }
        else if (arr.length <= 0) {
          this.setData({
            tabsList: this.data.tabsList,
            cartList: [],
            totalNum: 0,
            
          })
          this.cascadeDismiss()
        }
      }
      
    }
    
    // this.data.restList.push(this.data.tabsList[i])
    this.setData({
      cartList: arr,
      tabsList: this.data.tabsList,
      totalNum:totalNum,
      // restList: this.data.restList
    })
  },
  //
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
  // 定义根据id删除数组的方法
  removeByValue: function (array, val) {
    for (var i = 0; i < array.length; i++) {
      if (array[i].e_ID == val) {
        array.splice(i, 1);
        break;
      }
    }
  },
  // 获取购物车总数
  getTotalPrice: function () {
    // var cartList = wx.getStorageSync('cart'); // 获取购物车列表
    var cartList = this.data.cartList; // 获取购物车列表arr
    var totalN = 0;
    var totalNUM = 0;
    cartList = this.removeDuplicates(cartList)
    for (var i in cartList) {   
      if(cartList[i].e_ID != 'packages' ){
      totalN += cartList[i].quantity
        // if(cartList[i].quantity > 1){
        //   totalN -= cartList[i].quantity - 1
        //   console.log('乘以套数之前的总数:', totalN)
        // }
      } 
    }
    for(var j in cartList){
      if(cartList[j].e_ID == 'packages'){
        totalNUM = totalN * cartList[j].quantity
      }
    }
    
    if(totalN < 0 ){
      totalN = 0
    }
    console.log('单套元器件总数: ', totalN)
    console.log('最终的总数: ', totalNUM)
    this.setData({ // 最后赋值到data中渲染到页面
      cartList: cartList,
      totalNum: totalNUM ? totalNUM : totalN,
    });
  },
  // 清空购物车
  cleanList: function (e) {
    for (var t in this.data.tabs) {
      for (var j in this.data.tabsList) {
        this.data.tabsList[j].quantity = 0;
      }
    }
    try {
      wx.setStorageSync('cart', "")
    } catch (e) {
      console.log(e)
    }
    this.setData({
      tabsList: this.data.tabsList,
      cartList: [],
      cartFlag: false,
      totalNum: 0,
      // totalPrice: 0,
    })
    this.cascadeDismiss()
  },
  //删除购物车单项
  deleteOne: function (e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var arr = wx.getStorageSync('cart');
    var totalNum = this.data.totalNum;
    for (var i = 0; i < this.data.tabsList.length; i++) {
      if (this.data.tabsList[i].e_ID == id) {
        this.data.tabsList.splice(i, 1); 
      totalNum -= this.data.tabsList[i].quantity;
      if(totalNUm < 0){
        totalNum = 0
      }
      break; // 找到并删除后，不需要继续循环
      }
      
    }
    arr.splice(index, 1);
    if (arr.length <= 0) {
      this.setData({
        tabsList: this.data.tabsList,
        cartList: [],
        cartFlag: false,
        totalNum: 0,
        // totalPrice: 0,
      })
      this.cascadeDismiss()
    }
    try {
      wx.setStorageSync('cart', arr)
    } catch (e) {
      console.log(e)
    }
    this.setData({
      cartList: arr,
      tabsList: this.data.tabsList,
      totalNum: totalNum
    })
    this.getTotalPrice()
  },
  //切换购物车开与关
  cascadeToggle1: function () {
    var that = this;
    var arr = this.data.cartList
    if (arr.length > 0) {
      if (that.data.maskVisual == "hidden") {
        that.cascadePopup()
      } else {
        that.cascadeDismiss()
      }
    } else {
      that.cascadeDismiss()
    }

  },
  // 打开购物车方法
  cascadePopup1: function () {
    var that = this;
    // 购物车打开动画
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in-out',
      delay: 0
    });
    that.animation = animation;
    animation.translate(0, -285).step();
    that.setData({
      animationData: that.animation.export(),
    });
    // 遮罩渐变动画
    var animationMask = wx.createAnimation({
      duration: 200,
      timingFunction: 'linear',
    });
    that.animationMask = animationMask;
    animationMask.opacity(0.8).step();
    that.setData({
      animationMask: that.animationMask.export(),
      maskVisual: "show",
      maskFlag: false,
    });
  },
  // 关闭购物车方法
  cascadeDismiss1: function () {
    var that = this
    // 购物车关闭动画
    that.animation.translate(0, 285).step();
    that.setData({
      animationData: that.animation.export()
    });
    // 遮罩渐变动画
    that.animationMask.opacity(0).step();
    that.setData({
      animationMask: that.animationMask.export(),
    });
    // 隐藏遮罩层
    that.setData({
      maskVisual: "hidden",
      maskFlag: true
    });
  },
  
  // toDetail: function (e) {
  //   var id = e.currentTarget.dataset.id;
  //   var goodDetail = [];
  //   for (var i = 0; i < this.data.tabsList.length; i++) {
  //     if (this.data.tabsList[i].e_ID == id) {
  //       goodDetail.push(this.data.tabsList[i]);
  //     }
  //   }
    
  // },
  //轮询函数
  fetchData: function() {
    
    var cartinfo=wx.getStorageSync('cart');
    var app=getApp();
    app.globalData.cart=cartinfo
    // 使用wx.request发起网络请求
    wx.request({
      url: 'http://8.138.165.162:5000/api/download_stockData', // 需要轮询的
      //8.138.165.162
      method: 'GET',
      data:{
      },
      success: (res) => {
        console.log('接收数据成功!',res.data[0]);
        // app.globalData.restList = res.data[0]
        for (var k = 1; k <= 5; k++){
          this.data.tabsList[k].stock = res.data[0][k-1];
        }
        
       
      },
      fail: (err) => {
        // 请求失败的处理逻辑
        console.error('接收数据失败!', err);
      }
    });
  },

  gotoOrder: function () {
    var count=wx.getStorageSync('cart').length;
    var packnum=this.data.tabsList[0].quantity;
    var cartinfo=wx.getStorageSync('cart');
    var app=getApp();
    var dateTimeNumber = generateDateTimeNumber();
    var orderDate = new Date();
    //8.138.165.162
    let urlString = "http:///8.138.165.162:5000/api/upload_data";
    //116.63.87.221
    var randomInt = this.getRandomInt(1, 1000);
    //对购物车数据整理
    // console.log(cartinfo[1].f_Name)
    console.log(count)
    if(count<=0){
      wx.showToast({
        title: '请先选择需要打包的电子元器件!',
        icon:"none"
      })
      return
    }
    else if(count>=1 && packnum<=0)
    {
      wx.showToast({
        title: '请先选择需要打包的套数!',
        icon:"none"
      })
      return
    }
    
    else{
      app.globalData.cart=cartinfo,
      app.globalData.dateID=dateTimeNumber;
      let cartData = app.globalData.cart.map(item => ({
        e_ID: item.e_ID,
        quantity: item.quantity,
      }));
      
      console.log(cartData);
      app.globalData.cart = [];
      app.globalData.cart = cartData;
    
    let Params = app.globalData.cart.map(item => {
      return `${encodeURIComponent(item.e_ID)}=${encodeURIComponent(item.quantity)}`;
    }).join('&');
    let fullUrl = urlString + '?' + Params;
    console.log("start request");

      wx.request({
        url:fullUrl,
        method:"GET",
        data: {
          random: randomInt,
              date:orderDate,
              status:1},
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
      //打包后再把库存数量存进数据库
      wx.request({
        url: 'http://8.138.165.162:5000/api/upload_stockData', 
        //8.138.165.162
        method: 'GET',
        data:{
          LEDrest: this.data.tabsList[1].rest,
          R1rest: this.data.tabsList[2].rest,
          R2rest: this.data.tabsList[3].rest,
          R3rest: this.data.tabsList[4].rest,
          dynatronRest: this.data.tabsList[5].rest,
        },
        success: (res) => {
          
        },
        fail: (err) => {
          
        }
      });
    }
   
    this.setData({
      date: (wx.getStorageSync('logs') || []).map(log => {
        return {
          date: util.formatTime(new Date(log)),
          timeStamp: log
        }
      }),
    }),
    wx.navigateTo({
      url: '/pages/logs/logs',
    })
    
    //  for(var j in this.data.tabsList){
    //   //为什么无效?
    //   this.data.tabsList[j].quantity = 0
    // }
  },
  // 清除所有缓存
  clearStorage: function() {
    wx.clearStorage({
      success: function (res) {
        console.log('缓存清除成功');
      }
    });
  },

  // 监听用户下拉动作
  onPullDownRefresh: function () {
    // 下拉刷新时清除缓存
    this.clearStorage();

    // 停止下拉刷新
    wx.stopPullDownRefresh();
  }
})


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

