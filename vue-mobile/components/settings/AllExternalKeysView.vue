<template>
  <q-scroll-area :thumb-style="{ width: '5px' }" class="keys_list__all q-px-lg q-pt-lg" v-if="currentKeys.length">
    <template v-for="key of keysFromArmor">
      <div class="key_email q-mb-md text-bold">
        {{ key.Email }}
      </div>

      <div class="overflow-hidden">
        <span class="keyView">{{ key.PublicPgpKey }}</span>
      </div>
    </template>
  </q-scroll-area>

  <div class="q-pa-lg full-width flex items-center" style="height: 50%" v-if="currentKeys.length">
    <div>
      <app-button @click="sendAllKeys" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_SEND_ALL')" />
      <app-button @click="downloadAllKeys" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_DOWNLOAD_ALL')" class="q-mt-lg" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'
import { downloadKey } from '../../utils';
import openPgpHelper from '../../openpgp-helper';

export default {
  name: 'AllExternalKeysView',
  components: {
    AppButton,
  },
  data: () => ({
    keysFromArmor: [],
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentKeys']),
    armorText() {
      return this.currentKeys.reduce((acc, value) => {
        acc += value.PublicPgpKey
        return acc += '\n'
      }, '')
    }
  },
  methods: {
    ...mapActions('openpgpmobile', ['changeCurrentKeys']),
    sendAllKeys() {},
    downloadAllKeys() {
      return downloadKey(this.armorText, 'public_keys.asc')
    },
  },
  async mounted() {
    if (!this.currentKeys.length) {
      this.$router.push('/settings/open-pgp/external-keys')
    }

    const keysArmor = await openPgpHelper.getArmorInfo(this.armorText)
    this.keysFromArmor = keysArmor?.map(item => ({
      PublicPgpKey: item.armor(),
      Email: item.getUserIds()[0],
    }))
  },
  beforeUnmount() {
    this.changeCurrentKeys([])
  }
}
</script>

<style scoped>
.keys_list__all {
  height: 50%;
}
.key_email:not(:first-child) {
  margin-top: 16px;
}
.keyView {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace, serif;
}
</style>
