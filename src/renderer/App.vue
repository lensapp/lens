<template>
  <div id="app">
    <div class="draggable-top" />
    <div id="lens-container" />
    <div class="main-view" :class="{ 'menu-visible': isMenuVisible }">
      <main-menu v-if="isMenuVisible" />
      <router-view />
    </div>
    <bottom-bar v-if="isMenuVisible" />
  </div>
</template>

<script>
import MainMenu from "@/components/MainMenu/MainMenu";
import BottomBar from "@/components/BottomBar/BottomBar";
export default {
  name: 'Lens',
  components: {
    BottomBar,
    MainMenu
  },
  computed:{
    isMenuVisible: function(){ return this.$store.getters.isMenuVisible }
  }
}
</script>
<style>
#lens-container {
  position: absolute;
  top: 0;
  left: 70px;
  right: 0;
  height: 100%;
  z-index: 100;
  display: none;
}
</style>
