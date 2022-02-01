<template>
  <div @click="action" class="q-pt-md">
    <div class="flex content-between">
      <div class="flex-1">
        <p>{{ label }}</p>
      </div>
      <div class="flex items-end content-center icon-margin">
        <arrow-right-icon />
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
    label: { type: String, default: '' },
    action: { type: Function, default: null },
  },
}
</script>

<style scoped>
.flex-1 {
  flex: 1;
}
.icon-margin {
  margin-right: 13px;
}
</style>
