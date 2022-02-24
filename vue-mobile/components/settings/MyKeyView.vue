<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="myKey q-px-lg q-pt-lg" v-if="currentMyKey">
    <div class="q-mb-md">
      &lt;{{ currentMyKey.email }}&gt;
    </div>
    <div class="overflow-hidden">
      <span style="word-break: break-all;">{{ currentMyKey.armor }}</span>
    </div>
  </q-scroll-area>

  <div class="q-pa-lg full-width" v-if="currentMyKey">
    <app-button @click="" :label="$t('OPENPGPWEBCLIENT.ACTION_DOWNLOAD')" />
    <app-button @click="" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" class="q-mt-lg" />
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppButton from 'src/components/common/AppButton'

export default {
  name: 'MyKeyView',
  components: {
    AppButton,
  },
  computed: {
    ...mapGetters('openpgpmobile', ['currentMyKey']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['setCurrentMyKey']),
  },
  beforeUnmount() {
    this.setCurrentMyKey(null)
  }
}
</script>

<style scoped>
.myKey {
  height: calc(100vh - 223px);
}
</style>
