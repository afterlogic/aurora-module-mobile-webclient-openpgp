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

  <div class="q-pa-lg full-width flex items-center">
    <div class="full-width">
      <app-button @click="showGenerateKeys = true" :label="$t('OPENPGPWEBCLIENT.ACTION_GENERATE_NEW_KEY')" />
      <app-button @click="showImportKeys = true" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_TEXT')" class="q-mt-lg" />
      <app-button @click="getFiles" :label="$t('OPENPGPMOBILEWEBCLIENT.ACTION_IMPORT_KEY_FILE')" class="q-mt-lg" />
      <q-file ref="fileInput" v-model="files" class="hidden" multiple />
    </div>
  </div>

  <generate-key-dialog v-model="showGenerateKeys" @close="showGenerateKeys = false" />
  <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false" @clear-files="clearFiles" />
</template>

<script>
import { mapActions, mapGetters } from 'pinia'

import AppButton from 'src/components/common/AppButton'

import GenerateKeyDialog from './dialogs/GenerateKeyDialog'
import ImportKeyDialog from './dialogs/ImportKeyDialog'
import OpenPgpTab from './OpenPgpTab'
import { askOpenPgpKeyPassword } from "../../utils";
import { verifyPrivateKeyPassword } from "../../openpgp-utils";
import notification from "src/utils/notification";

export default {
  name: 'MyKeys',
  components: {
    OpenPgpTab,
    GenerateKeyDialog,
    ImportKeyDialog,
    KeyItem: OpenPgpTab,
    AppButton,
  },
  data: () => ({
    showGenerateKeys: false,
    showImportKeys: false,
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
    ...mapGetters('openpgpmobile', ['myPublicKeys', 'myPrivateKeys', 'currentMyKey']),
    ...mapGetters('core', ['userPublicId'])
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
    async check(pass) {
      if (pass !== null) {
        const isVerified = await verifyPrivateKeyPassword(
            this.currentMyKey,
            pass
        )
        if (isVerified) {
          this.$router.push(`/settings/open-pgp/my-keys/${this.currentMyKey.email}`)
        } else {
          notification.showError(this.$t('OPENPGPMOBILEWEBCLIENT.ERROR_INVALID_PASSWORD'))
        }
      }
    },
    openVerifyDialog(key) {
      this.setCurrentMyKey(key)
      askOpenPgpKeyPassword(this.userPublicId, this.$root._getParentComponent, this.check)
    },
  },
}
</script>

<style scoped>
.myKeys__list {
  flex-grow: 1;
}
</style>
