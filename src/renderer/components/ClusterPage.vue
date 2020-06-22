<template>
  <div class="content">
    <div class="h-100">
      <div class="wrapper" v-if="status === 'LOADING'">
        <cube-spinner text="" />
        <div class="auth-output">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <pre class="auth-output" v-html="authOutput" />
        </div>
      </div>
      <div class="wrapper" v-if="status === 'ERROR'">
        <div class="error">
          <i class="material-icons">{{ error_icon }}</i>
          <div class="text-center">
            <h2>{{ cluster.preferences.clusterName }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <pre v-html="authOutput" />
            <b-button variant="link" @click="tryAgain">
              Reconnect
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CubeSpinner from "@/components/CubeSpinner";
import { remote, shell } from 'electron';
export default {
  name: "ClusterPage",
  components: {
    CubeSpinner
  },
  data(){
    return {
      authOutput: ""
    }
  },
  computed: {
    cluster: function() {
      return this.$store.getters.clusterById(this.$route.params.id);
    },
    online: function() {
      if (!this.cluster) { return false }
      return this.cluster.online;
    },
    accessible: function() {
      if (!this.cluster) { return false }
      return this.cluster.accessible;
    },
    lens: function() {
      return this.$store.getters.lensById(this.cluster.id);
    },
    status: function() {
      if (this.cluster) {
        if (this.cluster.accessible && this.lens.loaded === true) {
          return "SUCCESS";
        } else if (this.cluster.accessible === false) {
          return "ERROR";
        }
        return "LOADING";
      }
      return "ERROR";
    },
    error_icon: function() {
      if (!this.cluster.online) {
        return "cloud_off"
      } else {
        return "https"
      }
    }
  },
  methods: {
    tryAgain: function() {
      this.authOutput = ""
      this.cluster.accessible = null
      setTimeout(() => {
        this.loadLens()
      }, 1000)

    },
    loadLens: function() {
      this.authOutput = "Connecting ...\n";
      this.$promiseIpc.on(`kube-auth:${this.cluster.id}`, (output) => {
        this.authOutput += output.data;
      })
      this.toggleLens();
      return this.$store.dispatch("refineCluster", this.$route.params.id);
    },
    lensLoaded: function() {
      console.log("lens loaded")
      this.lens.loaded = true;
      remote.webContents.fromId(this.lens.webview.getWebContentsId()).on('new-window', (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
      })
      this.$store.commit("updateLens", this.lens);
    },
    // Called only when online state changes
    toggleLens: function() {
      if (!this.lens) { return }
      if (this.accessible) {
        setTimeout(this.activateLens, 0); // see: https://github.com/electron/electron/issues/10016
      } else {
        this.hideLens();
      }
    },
    activateLens: async function() {
      console.log("activate lens")
      if (!this.lens.webview) {
        console.log("create webview")
        const webview = document.createElement('webview');
        webview.addEventListener('did-finish-load', this.lensLoaded);
        webview.src = this.cluster.url;
        this.lens.webview = webview;
      }
      this.$store.dispatch("attachWebview", this.lens);
      this.$tracker.event("cluster", "open");
    },
    hideLens: function() {
      this.$store.dispatch("hideWebviews");
    }
  },
  created() {
    this.loadLens();
  },
  destroyed() {
    this.hideLens();
  },
  watch: {
    "$route": "loadLens",
    "online": "toggleLens",
    "cluster": "toggleLens",
    "accessible": function(newStatus, oldStatus) {
      console.log("accessible watch, vals:", newStatus, oldStatus);
      if(newStatus === false) { // accessble == false
        this.$tracker.event("cluster", "open-failed");
      }
    },
  }
};
</script>
<style scoped lang="scss">
div.auth-output {
  padding-top: 250px;
  width: 70%;
  pre {
    height: 100px;
    text-align: center;
  }
}
.error {
  width: 90%;
}
pre {
  font-size: 80%;
  overflow: auto;
  max-height: 150px;
}
</style>
