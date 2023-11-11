<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 16V14H5H11H15V16H1Z" fill="black"/>
    <path d="M6 1L10 1L10 8L12.5 8L8 12L3.5 8L6 8L6 1Z" fill="black"/>
  </svg>
</template>

<script>
export default {
  name: "DownloadIcon",
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
  }
}
</script>
