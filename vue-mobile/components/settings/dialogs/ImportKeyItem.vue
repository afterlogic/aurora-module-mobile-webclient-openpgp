<template>
  <q-item :disable="disabled" v-if="pgpKey" class="q-px-none" dense tag="label">
    <q-item-section>
      <q-item-label :style="styles" lines="1">
        <div class="text-bold">{{ pgpKey.email }}</div>
        <div class="text-caption text-secondary">
          <span>{{ pgpKey.addInfo }}</span>
          <span v-if="pgpKey.isExternal"> (external)</span>
        </div>
      </q-item-label>
    </q-item-section>
    <q-item-section class="q-mb-md" v-if="keysToImport" side top>
      <app-checkbox :disable="disabled" :leftLabel="true" v-bind="$attrs" />
    </q-item-section>
  </q-item>
</template>

<script>

import AppCheckbox from 'src/components/common/AppCheckbox'

export default {
  name: 'ImportKeyItem',
  components: { AppCheckbox },
  props: {
    pgpKey: {
      type: Object,
      default: null,
    },
    keysBroken: {
      type: Boolean,
      default: false,
    },
    keysToImport: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    styles() {
      if (this.keysBroken) {
        return { color: 'red' }
      }
      return {}
    },
  },
}
</script>

<style scoped></style>
