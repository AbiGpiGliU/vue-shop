import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
axios.defaults.baseURL = 'http://www.tangxiaoyang.vip:8888/api/v2/'

//添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  //得到userInfo
  const userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
  config.headers.Authorization = userInfo ? userInfo.token : ''
  return config;
});

Vue.config.productionTip = false

Vue.prototype.$http = axios
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
