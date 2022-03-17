<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="myKeys__list q-px-lg q-pt-lg">
    <div class="q-mb-md text-body1 text-weight-bold">
      {{ $t('OPENPGPWEBCLIENT.LABEL_PUBLIC_KEYS') }}
    </div>

    <div v-if="!myPublicKeys.length">
      {{ $t('OPENPGPWEBCLIENT.ERROR_NO_PUBLIC_KEYS_FOR_USERS_PLURAL') }}
    </div>

    <open-pgp-tab v-for="key in myPublicKeys" :key="key" :label="key.email" @click="openKey(key)" />

    <div class="q-my-md text-body1 text-weight-bold">
      {{ $t('OPENPGPWEBCLIENT.LABEL_PRIVATE_KEYS') }}
    </div>

    <div v-if="!myPrivateKeys.length">
      {{ $t('OPENPGPWEBCLIENT.ERROR_NO_PRIVATE_KEYS_FOR_USERS_PLURAL') }}
    </div>

    <open-pgp-tab v-for="key in myPrivateKeys" :key="key" :label="key.email" @click="openVerifyDialog(key)" />
  </q-scroll-area>

  <div class="q-pa-lg full-width flex items-center" style="height: 60%">
    <div class="full-width">
      <app-button @click="showGenerateKeys = true" :label="$t('OPENPGPWEBCLIENT.ACTION_GENERATE_NEW_KEY')" />
      <app-button @click="showImportKeys = true" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_TEXT')" class="q-mt-lg" />
      <app-button @click="getFiles" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_FILE')" class="q-mt-lg" />
      <q-file ref="fileInput" v-model="files" class="hidden" multiple />
    </div>
  </div>

  <generate-key-dialog v-model="showGenerateKeys" @close="showGenerateKeys = false" />
  <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false" @clear-files="clearFiles" />
  <verify-private-key-dialog v-model="showVerifyPrivateKey" @close="showVerifyPrivateKey = false" />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'

import GenerateKeyDialog from './dialogs/GenerateKeyDialog'
import ImportKeyDialog from './dialogs/ImportKeyDialog'
import VerifyPrivateKeyDialog from './dialogs/VerifyPrivateKeyDialog'
import OpenPgpTab from './OpenPgpTab'

export default {
  name: 'MyKeys',
  components: {
    OpenPgpTab,
    GenerateKeyDialog,
    ImportKeyDialog,
    VerifyPrivateKeyDialog,
    KeyItem: OpenPgpTab,
    AppButton,
  },
  data: () => ({
    showGenerateKeys: false,
    showImportKeys: false,
    showVerifyPrivateKey: false,
    files: [],
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
  },
  computed: {
    ...mapGetters('openpgpmobile', ['myPublicKeys', 'myPrivateKeys']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['setCurrentMyKey', 'setMyPublicKeys', 'setMyPrivateKeys', 'setFilesKeys']),
    getFiles() {
      this.$refs.fileInput.$el.click()
    },
    clearFiles() {
      this.files = []
    },
    openKey(key) {
      this.setCurrentMyKey(key)
      this.$router.push(`/settings/open-pgp/my-keys/${key.id}`)
    },
    openVerifyDialog(key) {
      this.setCurrentMyKey(key)
      this.showVerifyPrivateKey = true
    },
  },
}
</script>

<style scoped>
.myKeys__list {
  height: 40%;
}
</style>
