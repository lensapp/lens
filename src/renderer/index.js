import "../common/system-ca"
import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import App from './App'
import router from './router'
import store from './store'
import { PromiseIpc } from 'electron-promise-ipc'
import ElectronStore from 'electron-store'
import { Tracker } from "../common/tracker"
import { remote } from "electron"
import Clipboard from 'v-clipboard'

//load prism somewhere
import "prismjs";
import "prismjs/components/prism-yaml"
import "prismjs/themes/prism-tomorrow.css";
//vue-prism-editor dependency
import "vue-prism-editor/dist/VuePrismEditor.css";

Vue.use(BootstrapVue)
Vue.use(Clipboard)

import "./assets/css/app.scss"

const persist = new ElectronStore();
const promiseIpc = new PromiseIpc( { maxTimeoutMs: 6000 } );
const tracker = new Tracker(remote.app);

promiseIpc.on('logout', async (_) => {
  await store.dispatch('logout');
  if(router.currentRoute.name !== 'login-page') {
    router.push({name: 'login-page'});
  }
});

promiseIpc.on('navigate', async ( view ) => {
  router.push( view ).catch(err => {})
});

/**
 * Generic store related IPC handler
 * actions in form of:
 * {
 *  action: "foobar",
 *  data: {
 *    someValue: 42,
 *    otherValue: "foobar"
 *  }
 * }
 * where:
 * - action: the store action name
 * - data: the data obect passed as argument to the store action
 */
promiseIpc.on('store-dispatch', async (action) => {
  store.dispatch(action.action, action.data)
});

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.mixin({
  created: function () {
    this.$persist = persist;
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
      persist,
      store,
      router,
      template: '<App/>'
    }).$mount('#app')
  })
}, 0)
