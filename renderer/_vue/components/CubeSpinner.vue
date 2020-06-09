<template>
  <div class="loading">
    <div class="CubeSpinner">
      <p>{{ text }}</p>
      <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1" />
        <div class="sk-cube sk-cube2" />
        <div class="sk-cube sk-cube3" />
        <div class="sk-cube sk-cube4" />
        <div class="sk-cube sk-cube5" />
        <div class="sk-cube sk-cube6" />
        <div class="sk-cube sk-cube7" />
        <div class="sk-cube sk-cube8" />
        <div class="sk-cube sk-cube9" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CubeSpinner',
  components: {},
  methods: {},
  props: {
    text: {
      type: String,
      required: false,
      default: "Connecting ..."
    }
  },
}
</script>
<style scoped lang="scss">
.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: -44px;
  margin-top: -70px;
  z-index: 1000;
}

/* http://tobiasahlin.com/spinkit/ */
.CubeSpinner {
  --size: 70px;
  .sk-cube-grid {
    width: 70px;
    height: 70px;
    transform: rotate(45deg);
    margin: 24px auto;
    border-bottom-left-radius: 3px;
    border-top-right-radius: 3px;
    overflow: hidden;
  }
  .sk-cube-grid .sk-cube {
    width: 33%;
    height: 33%;
    float: left;
    -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
    animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  }
  .sk-cube-grid .sk-cube1 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
  .sk-cube-grid .sk-cube2 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }
  .sk-cube-grid .sk-cube3 {
    -webkit-animation-delay: 0.4s;
    animation-delay: 0.4s;
  }
  .sk-cube-grid .sk-cube4 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }
  .sk-cube-grid .sk-cube5 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
  .sk-cube-grid .sk-cube6 {
    -webkit-animation-delay: 0.3s;
    animation-delay: 0.3s;
  }
  .sk-cube-grid .sk-cube7 {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
  }
  .sk-cube-grid .sk-cube8 {
    -webkit-animation-delay: 0.1s;
    animation-delay: 0.1s;
  }
  .sk-cube-grid .sk-cube9 {
    -webkit-animation-delay: 0.2s;
    animation-delay: 0.2s;
  }
  @-webkit-keyframes sk-cubeGridScaleDelay {
    0%, 35% {
      background-color: #36393e;
    }
    0%, 70%, 100% {
      -webkit-transform: scale3D(1, 1, 1);
      transform: scale3D(1, 1, 1);
    }
    35% {
      -webkit-transform: scale3D(0, 0, 1);
      transform: scale3D(0, 0, 1);
    }
    100% {
      background-color: #3d90ce;
    }
  }
}
</style>
