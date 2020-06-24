<template>
  <div id="app">
    <div id="lens-container" />
    <div class="draggable-top" />
    <div class="main-view" :class="{ 'menu-visible': isMenuVisible }">
      <main-menu v-if="isMenuVisible" />
      <router-view />
    </div>
    <bottom-bar v-if="isMenuVisible" />
  </div>
</template>

<script>
import MainMenu from "@/_vue/components/MainMenu/MainMenu";
import BottomBar from "@/_vue/components/BottomBar/BottomBar";

export default {
  name: 'Lens',
  components: {
    BottomBar,
    MainMenu
  },
  computed: {
    isMenuVisible: function () { return this.$store.getters.isMenuVisible }
  }
}
</script>

<style scoped>
  .draggable-top {
    -webkit-app-region: drag;
    left: 0;
    top: 0;
    position: absolute;
    height: 20px;
    width: 100%;
  }
</style>