<template>
  <div class="content">
    <div class="landing-page">
      <b-container fluid class="h-100">
        <!-- wrapper for center/center align -->
        <b-row class="h-100">
          <b-col sm="12" class="my-auto">
            <div>
              <b-row align-h="center" class="banner">
                <b-col sm="8">
                  <h1 v-if="user && clusters.length === 0" class="display-4 text-center">
                    Welcome, {{ greetingName }}!
                  </h1>
                  <p v-if="clusters.length === 0" class="text-center">
                    Get started by associating one or more clusters to Lens.
                  </p>
                </b-col>
              </b-row>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  components: {},
  methods: {},
  computed: {
    workspaces: function() {
      return this.$store.getters.workspaces;
    },
    clusters: function() {
      return this.$store.getters.clusters;
    },
    user: function() {
      return this.$store.getters.user;
    },
    greetingName: function() {
      return (this.user['first-name'] && this.user['first-name'] !== "") ? this.user['first-name'] : this.user.username
    }
  }
}
</script>

<style scoped lang="scss">
.landing-page{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #282b2f url(../assets/img/crane.svg) no-repeat;
  background-position: 0px 35%;
  background-size: 85%;
  background-clip: content-box;
  .banner {
    h1 {
      text-align: center;
      font-size: 28px;
      font-weight: normal;
    }
    p {
      font-size: 14px;
    }
  }
}
</style>
