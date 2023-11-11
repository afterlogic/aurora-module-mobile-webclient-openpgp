<template>
  <div class="q-pt-md cursor-pointer">
    <div class="flex content-between">
      <div class="flex-1">
        <p>{{ label }}</p>
      </div>
      <div class="flex items-end content-center q-mr-sm">
        <ArrowRightIcon />
      </div>
    </div>
    <q-separator class="q-mt-md" />
  </div>
</template>

<script>

import ArrowRightIcon from 'src/components/common/icons/ArrowRightIcon'

export default {
  name: 'OpenPgpTab',
  components: {
    ArrowRightIcon,
  },
  props: {
    label: String,
  },
}
</script>

<style scoped>
.flex-1 {
  flex: 1;
}
</style>
