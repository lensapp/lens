<template>
  <a
    class="menu-item"
    :class="[{
      'active':isActive,
      'online':(activated && !isActive),
    }]"
    @click.prevent="openClusterPage()"
    @contextmenu.prevent="openContextMenu()"
    :title="preferences.clusterName"
    v-b-tooltip.hover.right
  >
    <div
      class="icon-frame"
      :class="[{
        'active':isActive
      }]"
    >
      <img v-if="preferences.icon" :src="preferences.icon">
      <hashicon v-else :name="preferences.clusterName" size="38" />
      <span v-if="isAdmin && eventCount > 0" class="badge badge-danger">{{ eventCount >= 1000 ? "1000+" : eventCount }}</span>
    </div>
  </a>
</template>

<script>
import hashicon from "../hashicon/hashicon";
import { setInterval, clearInterval } from "timers";
const { remote } = require('electron')
const { Menu, MenuItem } = remote

export default {
  name: "ClusterMenuItem",
  components: {
    hashicon
  },
  data(){
    return {
      eventPoller: null,
      eventCount: 0,
      activated: false
    }
  },
  props: {
    cluster: {
      type: Object,
      required: true,
      default: null
    },
  },
  computed: {
    preferences: function() {
      return this.cluster.preferences;
    },
    clusterAccessible: function() {
      return this.$store.getters.clusterById(this.cluster.id).accessible;
    },
    isActive: function() {
      return this.cluster.id === this.$route.params.id;
    },
    isAdmin: function() {
      return this.cluster.isAdmin;
    }
  },
  methods: {
    openClusterPage() {
      this.activated = true;
      this.$router.push({
        name: "cluster-page",
        params: {
          id: this.cluster.id
        },
      }).catch(err => {})
    },
    openContextMenu(){
      const self = this;
      const menu = new Menu()
      menu.append(new MenuItem({ label: 'Settings', click() {
        self.$router.push({
          name: "cluster-settings-page",
          params: {
            id: self.cluster.id
          },
        }).catch(err => {})
      } }))
      if (this.activated) {
        menu.append(new MenuItem({ label: 'Disconnect', click() {
          self.activated = false;
          self.stopPolling();
          self.$store.dispatch("stopCluster", self.cluster.id);
          if (self.isActive) {
            self.$router.push({
              name: "landing-page"
            }).catch(err => {})
          }
        } }))
      }

      menu.popup({ window: remote.getCurrentWindow() })
    },
    toggleEventPolling: function() {
      if(this.clusterAccessible && !this.eventPoller && this.activated && !this.isActive) {
        this.fetchEvents()
        this.eventPoller = setInterval(async () => {
          await this.fetchEvents()
        }, 30 * 1000);
      } else {
        this.eventCount = 0;
        this.stopPolling()
      }
    },
    fetchEvents: async function() {
      try {
        this.eventCount = await this.$promiseIpc.send("getClusterEvents", this.cluster.id);
      } catch (error) {
        console.error("Failed to get event count for cluster:", error)
      }
    },
    stopPolling: function() {
      if (this.eventPoller) {
        clearInterval(this.eventPoller)
        this.eventPoller = null
      }
    }
  },
  watch: {
    clusterAccessible: "toggleEventPolling",
    isActive: "toggleEventPolling"
  },
  beforeDestroy() {
    this.stopPolling();
  }
}
</script>

<style scoped lang="scss">
.badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 4px;
  i {
    font-size: 8px;
  }
}
img {
  width: 38px;
  max-height: 42px;
}
span.hashicon {
  margin-top: 6px;
}
div.icon-frame {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;

  &.active, &:hover {
    margin-left: -3px;
    padding: 0px 0px 0px 3px;
    background-color: #f8f9fa;
    border-radius: 3px;
  }
}
</style>
