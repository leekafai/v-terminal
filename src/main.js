import Vue from 'vue'
import App from './App.vue'
import router from './router'
import '@/scss/index.scss'
import 'remixicon/fonts/remixicon.css'
import store from './store'
console.log(process.env.NODE_ENV, 'process.env.NODE_ENV')
if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
}

Vue.config.productionTip = false
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
