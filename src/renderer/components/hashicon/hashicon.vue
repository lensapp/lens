<template>
  <span class="hashicon" ref="hashicon" />
</template>
<script>
import hashicon from 'hashicon'

export default {
  name:'Hashicon',
  props:{
    name: {
      default: null,
      type: String
    },
    size: {
      default: null,
      type: String
    },
  },
  mounted() {
    const params = {
      size: this.size || 48,
      lightness: { min: 45, max: 65 },
      saturation: { min: 30, max: 60 }
    }
    this.$refs.hashicon.appendChild(hashicon(this.name, params))
  }
}
</script>
