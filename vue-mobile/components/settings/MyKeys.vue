<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="myKeys__list q-px-lg q-pt-lg">
    <div class="q-mb-md">
      {{ $t('OPENPGPWEBCLIENT.LABEL_PUBLIC_KEYS') }}
    </div>

    <open-pgp-tab v-for="key in myPublicKeys" :key="key" :label="key.email" @click="openKey(key)" />

    <div class="q-my-md">
      {{ $t('OPENPGPWEBCLIENT.LABEL_PRIVATE_KEYS') }}
    </div>

    <open-pgp-tab v-for="key in myPrivateKeys" :key="key" :label="key.email" @click="openVerifyDialog(key)" />
  </q-scroll-area>

  <div class="q-pa-lg full-width">
    <app-button @click="showGenerateKeys = true" :label="$t('OPENPGPWEBCLIENT.ACTION_GENERATE_NEW_KEY')" />
    <app-button @click="showImportKeys = true" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_TEXT')" class="q-mt-lg" />
    <app-button @click="getFiles" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_FILE')" class="q-mt-lg" />
    <q-input ref="myFileInput" style="display:none" multiple @update:model-value="(val) => this.files = val" type="file" />
  </div>

  <generate-key-dialog v-model="showGenerateKeys" @close="showGenerateKeys = false" />
  <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false" />
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
    files: null,
  }),
  watch: {
    async files() {
      const filesList = []
      for (const file of this.files) {
        filesList.push(await file.text())
      }
      this.setFilesKeys(filesList)
      this.showImportKeys = true
    }
  },
  computed: {
    ...mapGetters('openpgpmobile', ['myPublicKeys', 'myPrivateKeys']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['setCurrentMyKey', 'setMyPublicKeys', 'setMyPrivateKeys', 'setFilesKeys']),
    getFiles() {
      this.$refs.myFileInput.$el.click()
    },
    openKey(key) {
      this.setCurrentMyKey(key)
      this.$router.push(`/settings/open-pgp/my-keys/${key.email}`)
    },
    openVerifyDialog(key) {
      this.showVerifyPrivateKey = true
      this.setCurrentMyKey(key)
    },
  },
}
</script>

<style scoped>
.myKeys__list {
  height: calc(100vh - 295px);
}
</style>
