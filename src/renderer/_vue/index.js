import "../../common/system-ca"
import "./assets/css/app.scss"
import "prismjs";
import "prismjs/components/prism-yaml"
import { remote } from "electron"
import Vue from 'vue'
import VueElectron from 'vue-electron'
import BootstrapVue from 'bootstrap-vue'
import { PromiseIpc } from 'electron-promise-ipc'
import { Tracker } from "../../common/tracker"
import App from './App'
import router from './router'
import store from './store'

const tracker = new Tracker(remote.app);
const promiseIpc = new PromiseIpc({maxTimeoutMs: 6000});

promiseIpc.on('navigate', async (view) => {
  router.push(view).catch(err => {})
});

Vue.config.productionTip = false
Vue.use(VueElectron)
Vue.use(BootstrapVue)

Vue.mixin({
  created: function () {
    this.$promiseIpc = promiseIpc;
    this.$tracker = tracker;
  }
})

// any initialization we want to do for app state
setTimeout(() => {
  store.dispatch('init', ).catch((error) => {
    console.error(error)
  }).finally(() => {
    /* eslint-disable no-new */
    console.log("start vue")
    new Vue({
      components: { App },
      store,
      router,
      template: '<App/>'
    }).$mount('#app')
  })
}, 0)
