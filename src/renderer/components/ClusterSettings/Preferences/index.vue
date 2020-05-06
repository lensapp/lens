<template>
  <div class="row">
    <div class="col-12">
      <div class="cluster-settings-section">
        <b>HTTP Proxy</b>

        <b-form-group
          label="HTTP Proxy server. Used for communicating with Kubernetes API."
          description="A HTTP proxy server URL (format: http://<address>:<port>)."
        >
          <b-form-input
            v-model="cluster.preferences.httpsProxy"
            id="input-httpsproxy"
            @blur="onHttpsProxySave"
          />
        </b-form-group>
      </div>
    </div>
    <div class="col-12">
      <div class="cluster-settings-section">
        <b>Prometheus</b>
        <p>Use pre-installed Prometheus service for metrics. Please refer to the <a href="https://github.com/lensapp/lens/blob/master/troubleshooting/custom-prometheus.md">guide</a> for possible configuration changes.</p>

        <b-form-group
          label="Prometheus installation method."
          description="What query format is used to fetch metrics from Prometheus"
        >
          <b-form-select
            v-model="prometheusProvider"
            :options="prometheusProviders"
            @change="onPrometheusProviderSave"
          />
        </b-form-group>
        <b-form-group
          label="Prometheus service address."
          description="An address to an existing Prometheus installation (<namespace>/<service>:<port>). Lens tries to auto-detect address if left empty."
          v-if="canEditPrometheusPath"
        >
          <b-form-input
            v-model="prometheusPath"
            placeholder="<namespace>/<service>:<port>"
            id="input-prometheuspath"
            @blur="onPrometheusSave"
          />
        </b-form-group>
      </div>
    </div>
    <div class="col-12">
      <div class="cluster-settings-section">
        <b>Working Directory</b>

        <b-form-group
          label="Terminal working directory."
          description="An explicit start path where the terminal will be launched, this is used as the current working directory (cwd) for the shell process."
        >
          <b-form-input
            v-model="cluster.preferences.terminalCWD"
            placeholder="$HOME"
            id="input-terminalcwd"
            @blur="onTerminalCwdSave"
            :state="errors.terminalcwd"
            :formatter="expandPath"
          />
        </b-form-group>
      </div>
    </div>
  </div>
</template>

<script>
import { lstatSync } from "fs"
import { prometheusProviders } from '../../../../common/prometheus-providers';

export default {
  name: 'ClusterSettingsPreferences',
  props: {
    cluster: {
      type: Object,
      default: null,
    }
  },
  data(){
    return {
      errors: {
        terminalcwd: null
      },
      prometheusPath: "",
      prometheusProvider: "",
    }
  },
  computed: {
    prometheusProviders: function() {
      const providers = prometheusProviders.map((provider) => {
        return { text: provider.name, value: provider.id }
      })
      providers.unshift({text: "Auto detect", value: ""})

      return providers;
    },
    canEditPrometheusPath: function() {
      if (this.prometheusProvider === "") return false
      if (this.prometheusProvider === "lens") return false

      return true
    }
  },
  mounted: async function() {
    this.updateValues()
  },
  methods: {
    updateValues: function(){
      if (this.cluster.preferences.prometheus) {
        const prom = this.cluster.preferences.prometheus;
        this.prometheusPath = `${prom.namespace}/${prom.service}:${prom.port}${prom.prefix}`
      } else {
        this.prometheusPath = ""
      }
      if (this.cluster.preferences.prometheusProvider) {
        this.prometheusProvider = this.cluster.preferences.prometheusProvider.type
      } else {
        this.prometheusProvider = ""
      }
    },
    parsePrometheusPath: function(path) {
      const parsed = path.split(/\/|:/, 3)
      const apiPrefix = path.substring(parsed.join("/").length)
      return {
        namespace: parsed[0],
        service: parsed[1],
        port: parsed[2],
        prefix: apiPrefix
      }
    },
    expandPath: function(value, event) {
      if(value === "") {
        this.errors.terminalcwd = null
        return value;
      }
      if(value.substr(0, 1) == "~") {
        value = process.env.HOME + value.substr(1);
      } else if(value.substr(0, 5) == "$HOME") {
        value = process.env.HOME + value.substr(5);
      }

      try {
        this.errors.terminalcwd = lstatSync(value).isDirectory()
      } catch(_err) {
        this.errors.terminalcwd = false
      }

      return value;
    },
    onHttpsProxySave: function() {
      if(this.cluster.preferences.httpsProxy === "") this.cluster.preferences.httpsProxy = null
      this.$store.dispatch("storeCluster", this.cluster);
    },
    onPrometheusSave: function() {
      if (this.prometheusPath === "") {
        this.cluster.preferences.prometheus = null;
      } else {
        this.cluster.preferences.prometheus = this.parsePrometheusPath(this.prometheusPath);
      }
      this.$store.dispatch("storeCluster", this.cluster);
    },
    onPrometheusProviderSave: function() {
      if (this.prometheusProvider === "") {
        this.cluster.preferences.prometheusProvider = null;
      } else {
        this.cluster.preferences.prometheusProvider = { type: this.prometheusProvider }
      }
      this.$store.dispatch("storeCluster", this.cluster);
    },
    onTerminalCwdSave: function() {
      if(this.cluster.preferences.terminalCWD === "") this.cluster.preferences.terminalCWD = null
      this.$store.dispatch("storeCluster", this.cluster);
    },

  },
  watch: {
    "cluster": "updateValues",
  }
}
</script>

<style lang="scss">

</style>
