import Vue from 'vue'
export default new Vue({
  data: {
    compressCheckTimer: null,
    thumbnailCheckTimer:null
  },
  beforeDestroy() {
    clearInterval(this.compressCheckTimer)
    clearInterval(this.thumbnailCheckTimer)
  }
})