<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="keys_list q-px-lg q-pt-lg" v-if="!loading">
    <div v-if="!keysFromArmor.length" class="q-px-lg text-grey text-subtitle1 text-center">
      {{ $t('OPENPGPWEBCLIENT.INFO_EMPTY_PUBLIC_KEYS') }}
    </div>

    <open-pgp-tab v-for="key in keysFromArmor" :key="key" :label="key.Email" @click="openKey(key)" />
  </q-scroll-area>

  <div class="q-pa-lg full-width flex items-center" v-if="!loading">
    <div>
      <app-button @click="exportAllKeys" :label="$t('OPENPGPWEBCLIENT.ACTION_EXPORT_ALL_PUBLIC_KEYS')" :disabled="!keysFromArmor.length" />
      <app-button @click="showImportKeys = true" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_TEXT')" class="q-mt-lg" />
      <app-button @click="getFiles" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_FILE')" class="q-mt-lg" />
      <q-file ref="fileInput" v-model="files" class="hidden" multiple />
    </div>
  </div>

  <div class="q-mt-xl flex items-center justify-center" v-if="loading">
    <q-circular-progress
      indeterminate
      size="40px"
      color="primary"
      class="q-ma-md"
    />
  </div>

  <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false" @clear-files="clearFiles" is-external-keys />
</template>

<script>
import { mapActions, mapGetters } from 'pinia'

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
    loading: false,
    showImportKeys: false,
    files: [],
    keysFromArmor: [],
  }),
  watch: {
    async files() {
      if (this.files.length) {
        const filesList = []
        for (const file of this.files) {
          filesList.push(await file.text())
        }
        this.setFilesKeys(filesList)
        this.showImportKeys = true
      }
    },

    async externalKeys() {
      const armorText = this.externalKeys.reduce((acc, value) => {
        acc += value.armor
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
      this.loading = true
      await this.asyncGetExternalsKeys()
      this.loading = false
    },
    getFiles() {
      this.$refs.fileInput.$el.click()
    },
    clearFiles() {
      this.files = []
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
  flex-grow: 1;
}
</style>
