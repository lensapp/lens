<template>
  <span>
    <a
      id="add-cluster"
      class="add-cluster menu-item"
      :class="[{
        'active':isActive(),
      }]"
      @click.prevent="addCluster"
      v-b-tooltip.hover.right
      title="Add clusters"
    >
      <i class="material-icons">add_box</i>
      <span v-if="newContexts.length > 0" class="badge badge-success">{{ newContexts.length }}</span>
    </a>
  </span>
</template>

<script>
import ClustersMixin from "@/_vue/mixins/ClustersMixin";
import { newContexts } from '@kubernetes/client-node/dist/config_types';
export default {
  name: "AddClusterMenuItem",
  mixins: [ClustersMixin],
  data(){
    return {

    }
  },
  computed: {
  },
  methods: {
    isActive: function( id ){
      return "new" === this.$route.params.id;
    },
    addCluster: async function(){
      this.$router.push({
        name: "add-cluster-page",
        params: {
          id: "new"
        },
      }).catch(err => {})
    }
  },
  mounted() {
    console.log(this.newContexts.length)
    this.$store.dispatch("reloadAvailableKubeContexts");
  }
}
</script>

<style scoped lang="scss">
.add-cluster{
  position: relative;
  display: block;
  color: #fff;
  padding: 6px 8px 6px 9px;
  opacity: 0.4;
  cursor: pointer;
  &.active{
    opacity: 0.75;
  }
  i {
    font-size: 50px;
  }
  .badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}
</style>
