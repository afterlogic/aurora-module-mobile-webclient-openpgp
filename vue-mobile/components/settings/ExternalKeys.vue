<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="keys_list q-px-lg q-pt-lg">
    <div v-if="!keysFromArmor.length">
      {{ $t('OPENPGPWEBCLIENT.INFO_EMPTY_EXTERNAL_PUBLIC_KEYS') }}
    </div>

    <open-pgp-tab v-for="key in keysFromArmor" :key="key" :label="key.Email" @click="openKey(key)" />
  </q-scroll-area>

  <div class="q-pa-lg full-width">
    <app-button @click="exportAllKeys" :label="$t('OPENPGPWEBCLIENT.ACTION_EXPORT_ALL_PUBLIC_KEYS')" :disabled="!keysFromArmor.length" />
    <app-button @click="showImportKeys = true" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_TEXT')" class="q-mt-lg" />
    <app-button @click="getFiles" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_FILE')" class="q-mt-lg" />
    <q-input ref="fileInput" class="hidden" multiple @update:model-value="(val) => this.files = val" type="file" />
  </div>

  <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false" is-external-keys />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'

import ImportKeyDialog from './dialogs/ImportKeyDialog'
import OpenPgpTab from './OpenPgpTab'
import openPgpHelper from '../../openpgp-helper';

export default {
  name: 'ExternalKeys',
  components: {
    OpenPgpTab,
    ImportKeyDialog,
    AppButton,
  },
  data: () => ({
    showImportKeys: false,
    files: null,
    keysFromArmor: [],
  }),
  watch: {
    async files() {
      const filesList = []
      for (const file of this.files) {
        filesList.push(await file.text())
      }
      this.setFilesKeys(filesList)
      this.showImportKeys = true
    },

    async externalKeys() {
      const armorText = this.externalKeys.reduce((acc, value) => {
        acc += value.PublicPgpKey
        return acc += '\n'
      }, '')

      const keysArmor = await openPgpHelper.getArmorInfo(armorText)
      this.keysFromArmor = keysArmor?.map(item => ({
        PublicPgpKey: item.armor(),
        Email: item.getUserIds()[0],
      }))
    }
  },
  mounted() {
    this.getExternalKeys()
  },
  computed: {
    ...mapGetters('openpgpmobile', ['externalKeys']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['asyncGetExternalsKeys', 'changeCurrentKeys', 'setFilesKeys']),
    async getExternalKeys() {
      await this.asyncGetExternalsKeys()
    },
    getFiles() {
      this.$refs.fileInput.$el.click()
    },
    exportAllKeys() {
      this.changeCurrentKeys(this.externalKeys)
      this.$router.push('/settings/open-pgp/all-external-keys')
    },
    openKey(key) {
      this.changeCurrentKeys([key])
      this.$router.push(`/settings/open-pgp/external-keys/${key.Email}`)
    },
  },
}
</script>

<style scoped>
.keys_list {
  height: calc(100vh - 355px);
}
</style>
