<template>
  <div class="settings-section">
    <b>Cluster Icon</b>
    <p>
      Define cluster icon. By default automatically generated.
    </p>
    <div class="row">
      <span class="cluster-settings-icon">
        <img v-if="preferences.icon" :src="preferences.icon" class="cluster-icon">
        <hashicon v-else :name="cluster.preferences.clusterName" size="38" />
      </span>
      <div class="col">
        <b-form-file
          ref="fileUpload"
          v-model="file"
          accept="image/jpeg, image/png, image/gif"
          :state="Boolean(file)"
          placeholder="Browse for new icon..."
          drop-placeholder="Drop file here..."
          browse-text=""
          @input="upload"
        />
      </div>
    </div>
    <div class="mt-3">
      <a href="#" @click.prevent="reset" v-if="preferences.icon" class="text-muted">
        Use automatically generated icon
      </a>
      <b-alert show variant="danger" v-if="status === 'ERROR'">
        {{ errorMsg }}
      </b-alert>
    </div>
  </div>
</template>

<script>
import hashicon from "../../hashicon/hashicon";
export default {
  name: 'ClusterIcon',
  components: {
    hashicon
  },
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    }
  },
  data(){
    return {
      status: "",
      errorMsg: "",
      file: null,
    }
  },
  computed:{
    preferences: function() {
      return this.cluster.preferences;
    },
    isProcessing: function() {
      return this.status === "PROCESSING";
    },
    isResetProcessing: function() {
      return this.resetStatus === "PROCESSING";
    },
  },
  methods: {
    reset: async function(){
      this.resetStatus = "PROCESSING";
      let error = null;

      let result = await this.$store.dispatch("resetClusterIcon", {
        clusterId: this.cluster.id
      }).catch(e => {
        error = e;
        return false; // just returning false to promise
      })

      // handle exceptions here; but oh why, why do we have to???
      if(error){
        this.resetStatus = "ERROR";
        this.errorMsg = error;
        return false;
      }

      // now let's look at result...
      if(result.success === false) {
        this.resetStatus = "ERROR"
        this.errorMsg = result.message
      } else {
        this.resetStatus = "";
        this.errorMsg = "";
      }
    },
    upload: async function(file){
      if(!file) {
        return
      }
      this.status="PROCESSING";
      let error = null;

      let result = await this.$store.dispatch("uploadClusterIcon", {
        clusterId: this.cluster.id,
        name: file.name,
        path: file.path
      }).catch(e => {
        error = e;
        return false; // just returning false to promise
      })
      // handle exceptions here; but oh why, why do we have to???
      if(error){
        this.status = "ERROR";
        this.errorMsg = error;
        return false;
      }

      // now let's look at result...
      if(result.success === false) {
        this.status = "ERROR"
        this.errorMsg = result.message
      } else {
        this.status = "";
        this.errorMsg = "";
        this.file = null;
      }

    },
  },
  mounted: function(){
  }
}
</script>
<style scoped lang="scss">
.description{
  padding: 0.75rem;
}
.actions{
  border-top: 1px solid rgba(255,255,255,0.10);
  padding: 15px;
}

.cluster-settings-icon {
  background: #252729;
  margin-left: 15px;
  padding: 5px;
}
</style>
