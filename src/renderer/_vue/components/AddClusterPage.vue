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
        <b-col lg="5" class="help d-none d-lg-block">
          <h3>Clusters associated with Lens</h3>
          <p>
            Add clusters by clicking the <span class="text-primary">Add Cluster</span> button.
            You'll need to obtain a working kubeconfig for the cluster you want to add.
          </p>
          <p>
            Each <a href="https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/#context">cluster context</a> is added as a separate item in the left-side cluster menu to allow you to operate easily on multiple clusters and/or contexts.
          </p>
          <p>
            For more information on kubeconfig see <a href="https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/">Kubernetes docs</a>
          </p>
          <p>
            NOTE: Any manually added cluster is not merged into your kubeconfig file.
          </p>
          <p>
            To see your currently enabled config with <code>kubectl</code>, use <code>kubectl config view --minify --raw</code> command in your terminal.
          </p>
          <p>
            When connecting to a cluster, make sure you have a valid and working kubeconfig for the cluster. Following lists known "gotchas" in some authentication types used in kubeconfig with Lens app.
          </p>
          <a href="https://kubernetes.io/docs/reference/access-authn-authz/authentication/#option-1-oidc-authenticator">
            <h4>OIDC (OpenID Connect)</h4>
          </a>
          <div>
            <p>
              When connecting Lens to OIDC enabled cluster, there's few things you as a user need to take into account.
            </p>
            <b>Dedicated refresh token</b>
            <p>
              As Lens app utilized kubeconfig is "disconnected" from your main kubeconfig Lens needs to have it's own refresh token it utilizes.
              If you share the refresh token with e.g. <code>kubectl</code> who ever uses the token first will invalidate it for the next user.
              One way to achieve this is with <a href="https://github.com/int128/kubelogin">kubelogin</a> tool by removing the tokens (both <code>id_token</code> and <code>refresh_token</code>) from the config and issuing <code>kubelogin</code> command. That'll take you through the login process and will result you having "dedicated" refresh token.
            </p>
          </div>
          <h4>Exec auth plugins</h4>
          <p>
            When using <a href="https://kubernetes.io/docs/reference/access-authn-authz/authentication/#configuration">exec auth</a> plugins make sure the paths that are used to call any binaries are full paths as Lens app might not be able to call binaries with relative paths. Make also sure that you pass all needed information either as arguments or env variables in the config, Lens app might not have all login shell env variables set automatically.
          </p>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import * as PrismEditor from 'vue-prism-editor'
import * as k8s from "@kubernetes/client-node"
import { dumpConfigYaml } from "../../../main/k8s"
import ClustersMixin from "@/_vue/mixins/ClustersMixin";

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
    this.$store.dispatch("reloadAvailableKubeContexts");
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
    isOidcAuth: function(authProvider) {
      if (!authProvider) { return false }
      if (authProvider.name === "oidc") { return true }

      return false;
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
        const clusterInfo = {
          kubeConfig: dumpConfigYaml(kc),
          preferences: {
            clusterName: kc.currentContext
          },
          workspace: this.$store.getters.currentWorkspace.id
        }
        if (this.httpsProxy) {
          clusterInfo.preferences.httpsProxy = this.httpsProxy
        }
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
