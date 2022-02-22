<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 3V1H5C5 0.447715 5.44772 0 6 0H10C10.5523 0 11 0.447715 11 1H15V3H1Z" fill="black"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M2 4H3H13H14V5V14C14 15.1046 13.1046 16 12 16H4C2.89543 16 2 15.1046 2 14V5V4ZM4 6V14H12V6H4Z" fill="black"/>
  </svg>

</template>

<script>
export default {
  name: "DeleteIcon",
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
  }
}
</script>

<style scoped>

</style>
