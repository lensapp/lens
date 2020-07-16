<template>
  <div class="content">
    <b-container fluid class="h-100">
      <b-row align-h="around">
        <b-col lg="7">
          <div class="card">
            <h2>Add Cluster</h2>
            <div class="add-cluster">
              <b-form @submit.prevent="doAddCluster">
                <b-form-group
                  label="Choose config:"
                >
                  <b-form-file
                    v-model="file"
                    :state="Boolean(file)"
                    placeholder="Choose a file or drop it here..."
                    drop-placeholder="Drop file here..."
                    @input="reloadKubeContexts()"
                  />

                  <div class="mt-3">
                    Selected file: {{ file ? file.name : '' }}
                  </div>

                  <b-form-select
                    id="kubecontext-select"
                    v-model="kubecontext"
                    :options="contextNames"
                    @change="onSelect($event)"
                  />
                  <b-button v-b-toggle.collapse-advanced variant="link">
                    Proxy settings
                  </b-button>
                </b-form-group>
                <b-collapse id="collapse-advanced">
                  <b-form-group
                    label="HTTP Proxy server. Used for communicating with Kubernetes API."
                    description="A HTTP proxy server URL (format: http://<address>:<port>)."
                  >
                    <b-form-input
                      v-model="httpsProxy"
                    />
                  </b-form-group>
                </b-collapse>
                <b-form-group
                  label="Kubeconfig:"
                  v-if="status === 'ERROR' || kubecontext === 'custom'"
                >
                  <div class="editor">
                    <prism-editor v-model="clusterconfig" language="yaml" />
                  </div>
                </b-form-group>
                <b-alert variant="danger" show v-if="status === 'ERROR'">
                  {{ errorMsg }}
                  <div v-if="errorDetails !== ''">
                    <b-button v-b-toggle.collapse-error variant="link" size="sm">
                      Show details
                    </b-button>
                    <b-collapse id="collapse-error">
                      <code>
                        {{ errorDetails }}
                      </code>
                    </b-collapse>
                  </div>
                </b-alert>
                <b-form-row>
                  <b-col>
                    <b-button variant="primary" type="submit" :disabled="clusterconfig === ''">
                      <b-spinner small v-if="isProcessing" label="Small Spinner" />
                      {{ addButtonText }}
                    </b-button>
                  </b-col>
                </b-form-row>
              </b-form>
            </div>
          </div>
        </b-col>
        <!--info-panel-->
      </b-row>
    </b-container>
  </div>
</template>

<script>
import * as PrismEditor from 'vue-prism-editor'
import * as k8s from "@kubernetes/client-node"
import { dumpConfigYaml } from "../../../common/kube-helpers"
import ClustersMixin from "@/_vue/mixins/ClustersMixin";
import * as path from "path"
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid';

class ClusterAccessError extends Error {}

export default {
  name: 'AddClusterPage',
  mixins: [ClustersMixin],
  props: { },
  components: {
    PrismEditor,
  },
  data(){
    return {
      file: null,
      filepath: null,
      clusterconfig: "",
      httpsProxy: "",
      kubecontext: "",
      status: "",
      errorMsg: "",
      errorCluster: "",
      errorDetails: "",
      seenContexts: []
    }
  },
  mounted: function() {
    this.filepath = path.join(process.env.HOME, '.kube', 'config')
    this.file = new File(fs.readFileSync(this.filepath), this.filepath)
    this.$store.dispatch("reloadAvailableKubeContexts", this.filepath);
    this.seenContexts = JSON.parse(JSON.stringify(this.$store.getters.seenContexts)) // clone seenContexts from store
    this.storeSeenContexts()
  },
  computed: {
    isProcessing: function() {
      return this.status === "PROCESSING";
    },
    addButtonText: function() {
      if (this.kubecontext === "custom") {
        return "Add Cluster(s)"
      } else {
        return "Add Cluster"
      }
    },
    contextNames: function() {
      const configs = this.availableContexts
      const names = configs.map((kc) => {
        return { text: kc.currentContext + (this.isNewContext(kc.currentContext) ? " (new)": ""), value: dumpConfigYaml(kc) }
      })
      names.unshift({text: "Select kubeconfig", value: ""})
      names.push({text: "Custom ...", value: "custom"})

      return names;
    },
  },
  methods: {
    reloadKubeContexts() {
      this.filepath = this.file.path
      this.$store.dispatch("reloadAvailableKubeContexts", this.file.path);
    },
    isNewContext(context) {
      return this.newContexts.indexOf(context) > -1
    },
    storeSeenContexts() {
      const configs = this.$store.getters.availableKubeContexts
      const contexts = configs.map((kc) => {
        return kc.currentContext
      })
      this.$store.dispatch("addSeenContexts", contexts)
    },
    onSelect: function() {
      this.status = "";
      if (this.kubecontext === "custom") {
        this.clusterconfig = "";
      } else {
        this.clusterconfig = this.kubecontext;
      }
    },
    doAddCluster: async function() {
      // Clear previous error details
      this.errorMsg = ""
      this.errorCluster = ""
      this.errorDetails = ""
      this.status = "PROCESSING"
      try {
        const kc = new k8s.KubeConfig();
        kc.loadFromString(this.clusterconfig); // throws TypeError if we cannot parse kubeconfig
        const clusterId = uuidv4();
        // We need to store the kubeconfig to "app-home"/
        if (this.kubecontext === "custom") {
          this.filepath = saveConfigToAppFiles(clusterId, this.clusterconfig)
        }
        const clusterInfo = {
          id: clusterId,
          kubeConfigPath: this.filepath,
          contextName: kc.currentContext,
          preferences: {
            clusterName: kc.currentContext
          },
          workspace: this.$store.getters.currentWorkspace.id
        }
        if (this.httpsProxy) {
          clusterInfo.preferences.httpsProxy = this.httpsProxy
        }
        console.log("sending clusterInfo:", clusterInfo)
        let res = await this.$store.dispatch('addCluster', clusterInfo)
        console.log("addCluster result:", res)
        if(!res){
          this.status = "ERROR";
          return false;
        }
        this.status = "SUCCESS"
        this.$router.push({
          name: "cluster-page",
          params: {
            id: res.id
          },
        }).catch((err) => {})
      } catch (error) {
        console.log("addCluster raised:", error)
        if(typeof error === 'string') {
          this.errorMsg = error;
        } else if(error instanceof TypeError) {
          this.errorMsg = "cannot parse kubeconfig";
        } else if(error.response && error.response.statusCode === 401) {
          this.errorMsg = "invalid kubeconfig (access denied)"
        } else if(error.message) {
          this.errorMsg = error.message
        } else if(error instanceof ClusterAccessError) {
          this.errorMsg = `Invalid kubeconfig context ${error.context}`
          this.errorCluster = error.cluster
          this.errorDetails = error.details
        }
        this.status = "ERROR";
        return false;
      }
      return true;
    }
  }
}
</script>

<style scoped lang="scss">
.help{
  border-left: 1px solid #353a3e;
  padding-top: 20px;
  &:first-child{
    padding-top: 0;
  }
  h3{
    padding: 0.75rem 0 0.75rem 0;
  }
  height: 100vh;
  overflow-y: auto;
}

h2{
  padding: 0.75rem;
}

.card {
  margin-top: 20px;
}

.add-cluster {
  padding: 0.75rem;
}

.btn-link {
  padding-left: 0;
}
</style>
