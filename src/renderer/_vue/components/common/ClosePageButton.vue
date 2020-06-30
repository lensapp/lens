<template>
  <div class="close-page-button">
    <a @click.prevent="navigateBack" href="#">
      <i class="material-icons">close</i>
    </a>
  </div>
</template>

<script>

export default {
  name: "ClosePageButton",
  data() {
    return {}
  },
  methods: {
    navigateBack: () => {
      window.history.back();
    }
  }
}
</script>

<style scoped lang="scss">
div.close-page-button {
  position: absolute;
  top: 20px;
  right: 25px;
  z-index: 1100;
  a {
    position: relative;
    display: block;
    color: #fff;
    opacity: 0.4;
  }
  i {
    font-size: 30px;
  }
}
</style>
