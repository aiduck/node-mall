// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyLoad from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import Vuex from 'vuex'
import axios from 'axios'
import {currency} from './util/currency'

import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/product.css'
Vue.filter('currency', currency)
Vue.config.productionTip = false
Vue.use(VueLazyLoad, {
// loading 是图片加载出来之前，默认的效果
  loading: '/static/loading-svg/loading-bars.svg',
  try: 3 // default 1
})

Vue.use(infiniteScroll)
Vue.use(Vuex)
// 不一定需要在src中建立store文件 以及一系列文件
const store = new Vuex.Store({
  state: {
    nickName: '',
    cartCount: 0
  },
  mutations: {
    // 更新用户信息
    updateUserInfo (state, nickName) {
      state.nickName = nickName
    },
    updateCartCount (state, cartCount) {
      state.cartCount += cartCount
    },
    initCartCount (state, cartCount) {
      state.cartCount = cartCount
    }
  }
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  mounted () {
    this.checkLogin()
    this.getCartCount()
  },
  methods: {
    checkLogin () {
      axios.get('/api/users/checkLogin').then(response => {
        var res = response.data
        if (res.status === '200') {
          this.$store.commit('updateUserInfo', res.result)
        } else {
          if (this.$route.path !== '/goods') {
            this.$router.push('/goods')
          }
        }
      })
    },
    getCartCount () {
      axios.get('/api/users/getCartCount').then(response => {
        var res = response.data
        if (res.status === '200') {
          this.$store.commit('updateCartCount', res.result)
        }
      })
    }
  },
  components: { App },
  template: '<App/>'
  // 就是render：（h）=>{h(app)}这个写法
})
// el的另一种写法就是.$mount("#app")
