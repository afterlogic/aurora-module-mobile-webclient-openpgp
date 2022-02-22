<template>
  <svg :width="width" :height="height" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g filter="url(#filter0_d_445_735)">
      <path d="M5.83333 4V3V4ZM4 4.78571V13.4286H6V4.78571H4ZM6.66667 16H13V14H6.66667V16ZM10 3H5.83333V5H10V3ZM4 13.4286C4 14.9034 5.25016 16 6.66667 16V14C6.24223 14 6 13.6895 6 13.4286H4ZM6 4.78571C6 4.86457 5.96433 4.92543 5.93009 4.95772C5.89687 4.98905 5.86036 5 5.83333 5V3C4.87706 3 4 3.74487 4 4.78571H6Z" fill="black"/>
      <rect x="9" y="2" width="8" height="10" rx="1" stroke="black" stroke-width="2"/>
    </g>
    <defs>
      <filter id="filter0_d_445_735" x="-1" y="0" width="24" height="24" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feFlood flood-opacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_445_735"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_445_735" result="shape"/>
      </filter>
    </defs>
  </svg>

</template>

<script>
export default {
  name: "CopyIcon",
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
  }
}
</script>

<style scoped>

</style>
