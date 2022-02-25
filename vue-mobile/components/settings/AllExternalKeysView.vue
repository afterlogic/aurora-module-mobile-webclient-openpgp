<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="keys_list__all q-px-lg q-pt-lg" v-if="currentKeys.length">
    <template v-for="key of currentKeys">
      <div class="q-mb-md text-bold">
        {{ key.Email }}
      </div>

      <div class="overflow-hidden">
        <span style="word-break: break-all;">{{ key.PublicPgpKey }}</span>
      </div>
    </template>
  </q-scroll-area>

  <div class="q-pa-lg full-width" v-if="currentKeys.length">
    <app-button @click="sendAllKeys" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_SEND_ALL')" />
    <app-button @click="downloadAllKeys" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_DOWNLOAD_ALL')" class="q-mt-lg" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'

export default {
  name: 'AllExternalKeysView',
  components: {
    AppButton,
  },
  mounted() {},
  computed: {
    ...mapGetters('openpgpmobile', ['currentKeys']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['changeCurrentKeys']),
    sendAllKeys() {},
    downloadAllKeys() {},
  },
  beforeUnmount() {
    this.changeCurrentKeys([])
  }
}
</script>

<style scoped>
.keys_list__all {
  height: calc(100vh - 223px);
}
</style>
