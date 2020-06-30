<template>
  <div class="content">
    <div class="container-fluid whats-new">
      <div class="row">
        <div class="col-md whats-new-text-wrapper">
          <div class="logo">
            <img src="../assets/img/lens-logo.svg">
          </div>
          <!-- Safe to use v-html as we self generate the html locally only -->
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="whats-new-text" v-html="content">
            <!-- What's new content -->
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md whats-new-actions-wrapper">
          <div class="whats-new-actions">
            <button type="button" class="btn btn-primary" @click="toLanding">
              Ok, got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import marked from 'marked'
import {readFileSync} from 'fs'
import { getStaticPath } from "../../../common/register-static"

export default {
  name: 'WhatsNewPage',
  data() {
    let releaseNotes = getStaticPath("RELEASE_NOTES.md");
    let content = marked(readFileSync(releaseNotes, 'utf8'));
    return {
      error: "",
      content: content,
    }
  },
  components: {},
  computed: {
  },
  methods: {
    toLanding: async function() {
      await this.$store.dispatch("updateLastSeenAppVersion")
      this.$router.push({
        name: "landing-page",
      }).catch(err => {})
    },
  },
}
</script>

<style lang="scss" scoped>

.content {
  background: #282b2f url(../assets/img/crane.svg) no-repeat;
  background-position: 0px 35%;
  background-size: 85%;
  background-clip: content-box;
}
.content > .whats-new{
  width: 100%;
  height: 100%;
  background-color:rgba(0, 0, 0, 0.3);

  .whats-new-text-wrapper{
    position: absolute;
    top: 20px;
    bottom: 77px;
    left: 0;
    right: 0;
    overflow-y: scroll;
    .logo {
      padding: 30px 30px;
      max-width: 1000px;
      img {
        width: 200px;
      }
    }
    .whats-new-text{
      padding: 10px 30px;
      max-width: 1000px;
      h1{
        font-size: 24px;
      }
      h2{
        padding: 0;
      }
    }
  }

  .whats-new-actions-wrapper{
    position: absolute;
    height: 77px;
    left: 0;
    right: 0;
    bottom: 0;
    border-top: 1px solid #333;
    background: var(--lens-pane-bg);
    .whats-new-actions{
      padding: 20px;
      text-align: center;
    }
  }

}

</style>
