<template>
  <div class="content">
    <ClosePageButton />
    <div class="container-fluid lens-preferences">
      <div class="header sticky-top">
        <h2>Preferences</h2>
      </div>
      <!-- <div class="row">
        <div class="col-3" />
        <div ref="content" class="global-settings col-6">
          <h2>Kontena Lens PRO License</h2>

          <b-form-group
            label="No Kontena Lens PRO license assigned. Assign license by entering license key below:"
            label-for="input-license-key"
            v-if="!licenceData || licenceData.status !== 'valid'"
          >
            <b-form-input
              id="input-license-key"
              v-model="licenseKey"
              trim
              @blur="onLicenseKeySave"
              placeholder="Enter license key"
              :disabled="!isLoggedIn"
              :state="errors.licenseKey"
            />
          </b-form-group>
          <div v-if="licenceData">
            <p v-if="licenceData.status === 'valid'">
              Valid Kontena Lens PRO license assigned. Valid until {{ licenceData.valid_until }}<span v-if="licenceData.recurring">(renews automatically)</span>.
            </p>
          </div>
        </div>
        <div class="col-3" />
      </div> -->
      <div class="row">
        <div class="col-3" />
        <div ref="content" class="global-settings col-6">
          <h2>Color Theme</h2>

          <b-form-group
            label="Cluster Color theme:"
            label-for="input-color-theme"
          >
            <b-form-select
              id="input-color-theme"
              v-model="preferences.colorTheme"
              @change="onSave"
              :options="colorThemeOptions"
            />
          </b-form-group>
        </div>
        <div class="col-3" />
      </div>
      <div class="row">
        <div class="col-3" />
        <div ref="content" class="global-settings col-6">
          <h2>Helm</h2>

          <b-form-group
            label="Repositories:"
            label-for="textarea-helm-repositories"
          >
            <b-input-group>
              <b-form-select
                :options="hubRepositories"
                v-model="selectedHubRepo"
              >
                <template v-slot:first>
                  <option value="">
                    Select Helm repository
                  </option>
                </template>
              </b-form-select>
              <b-input-group-append>
                <b-button :disabled="!selectedHubRepo" @click="addHubRepo" variant="primary">
                  Add <b-spinner small v-if="isHelmProcessing" label="Small Spinner" />
                </b-button>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
          <b-list-group>
            <b-list-group-item v-for="repo in helmRepos" :key="repo.name">
              <span v-b-tooltip.hover v-b-tooltip.right :title="repo.url">{{ repo.name }}</span>
              <button @click="removeRepo(repo)" :data-repo="repo.name" class="close">
                <i class="material-icons">delete</i>
              </button>
            </b-list-group-item>
          </b-list-group>
        </div>
        <div class="col-3" />
      </div>
      <div class="row">
        <div class="col-3" />
        <div ref="content" class="global-settings col-6">
          <h2>HTTP Proxy</h2>

          <b-form-group
            label="Proxy URL:"
            label-for="input-https-proxy"
            description="Proxy is used only for non-cluster communication."
          >
            <b-form-input
              id="input-https-proxy"
              v-model="preferences.httpsProxy"
              trim
              @blur="onSave"
              placeholder="Type HTTP proxy url (example: http://proxy.acme.org:8080)"
            />
          </b-form-group>
          <h2>Certificate Trust</h2>
          <b-form-group
            label-for="checkbox-allow-untrusted-cas"
            description="This will make Lens to trust ANY certificate authority without any validations. Needed with some corporate proxies that do certificate re-writing. Does not affect cluster communications!"
          >
            <b-form-checkbox
              id="checkbox-allow-untrusted-cas"
              switch
              v-model="preferences.allowUntrustedCAs"
              @input="onSave"
            >
              Allow untrusted Certificate Authorities
            </b-form-checkbox>
          </b-form-group>
          <h2>Telemetry & Usage Tracking</h2>
          <b-form-group
            label-for="checkbox-allow-telemetry"
            description="Telemetry & usage data is collected to continuously improve the Kontena Lens experience."
          >
            <b-form-checkbox
              id="checkbox-allow-telemetry"
              switch
              v-model="preferences.allowTelemetry"
              :disabled="licenceData && licenceData.status === 'valid'"
              @input="onSave"
            >
              Allow telemetry & usage tracking
            </b-form-checkbox>
          </b-form-group>
        </div>
        <div class="col-3" />
      </div>
    </div>
  </div>
</template>

<script>
import * as request from 'request-promise-native'
import { globalRequestOpts } from "../../common/request"
import ClosePageButton from "@/components/common/ClosePageButton";

export default {
  name: 'PreferencesPage',
  components: {
    ClosePageButton
  },
  data(){
    return {
      licenseKey: "",
      hubRepositories: [],
      selectedHubRepo: "",
      colorThemeOptions: [
        { value: "dark", text: "Dark" },
        { value: "light", text: "Light" },
      ],
      errors: {
        licenseKey: null
      },
      isHelmProcessing: null,
    }
  },
  computed: {
    helmRepos: function() {
      return this.$store.getters.repos;
    },
    preferences: function() {
      return this.$store.getters.preferences;
    },
    licenceData: function() {
      return this.$store.getters.licenseData;
    },
    isLoggedIn: function() {
      console.log(this.$store.getters.isLoggedIn)
      return this.$store.getters.isLoggedIn;
    }
  },
  methods: {
    onSave: function() {
      this.$store.commit("savePreferences", this.preferences);
    },
    onLicenseKeySave: async function() {
      if (this.licenseKey !== "") {
        try {
          await this.$store.dispatch("exhangeKey", {
            key: this.licenseKey,
            user: this.$store.getters.user
          })
          this.errors.licenseKey = true;
        } catch(error) {
          this.errors.licenseKey = false;
        }
      } else {
        this.errors.licenseKey = null;
      }
    },
    request: async function(opts) {
      const o = Object.assign({
        timeout: 10000,
        headers: {},
        resolveWithFullResponse: true,
        json: true
      }, globalRequestOpts(opts))

      return await request(o)
    },
    repoCompare: function( a, b ) {
      if ( a.name < b.name ){
        return -1;
      }
      if ( a.name > b.name ){
        return 1;
      }
      return 0;
    },
    addHubRepo: async function() {
      if(!this.selectedHubRepo || this.selectedHubRepo === "") {
        return
      }
      this.isHelmProcessing = true
      const [name, url ] = this.selectedHubRepo.split("|")
      await this.$store.dispatch('addHelmRepo', { name, url })
      this.selectedHubRepo = ""
      this.isHelmProcessing = false
    },
    removeRepo: async function(repo) {
      await this.$store.dispatch('removeHelmRepo', repo)
    },
    loadHubRepositories: async function() {
      const res = await this.request({ uri: "https://hub.helm.sh/assets/js/repos.json"}).catch((error) => { this.hubRepositories = [] })
      this.hubRepositories = res.body.data.sort(this.repoCompare).map((repo) => {
        return { text: repo.name, value: repo.name+"|"+repo.url}
      })
    }
  },
  created() {
    this.$store.dispatch('refreshHelmRepos')
  },
  mounted: async function() {
    this.$store.commit("hideMenu");
    this.loadHubRepositories()
  },
  destroyed: function() {
    this.$store.commit("showMenu");
  }
}
</script>

<style lang="scss" scoped>
#app > .main-view > .content {
  left: 70px;
  right: 70px;
}
.lens-preferences {
  height: 100%;
  overflow-y: scroll;
  & input {
    background-color: #252729 !important;
    border: 0px !important;
    color: #87909c !important;
  }
  .header {
    padding-top: 15px;
  }
  .close {
    text-shadow: none;
  }
  .list-group-item {
    background-color: #252729 !important;
    color: #87909c !important;
  }
  & i {
    color: #87909c !important;
  }
}

.global-settings {
  padding-top: 0.75em;
}
</style>
