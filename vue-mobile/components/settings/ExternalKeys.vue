<template>
  <div
    style="flex-flow: row wrap; height: 93vh"
    class="flex content-between q-py-lg"
  >
    <div class="q-px-lg">External public keys</div>
    <div style="max-height: 50vh; overflow-y: auto" class="full-width keys-list">
      <div>
        <div class="q-px-lg">
          <key-item
            v-for="key in externalKeys"
            :key="key"
            :label="key.Email"
            @click="openKey(key)"
          />
        </div>
      </div>
    </div>
    <div class="q-px-lg full-width">
      <app-button
        @click="enableBackwardCompatibility = true"
        :label="$t('OPENPGPWEBCLIENT.ACTION_EXPORT_ALL_PUBLIC_KEYS')"
        class="q-mt-lg"
      />
      <app-button
        @click="showImportKeys = true"
        :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEY')"
        class="q-mt-lg"
      />
      <app-button
        @click="enableBackwardCompatibility = true"
        label="Import keys from file"
        class="q-mt-lg"
      />
    </div>
    <import-key-dialog v-model="showImportKeys" @close="showImportKeys = false"/>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'

import ImportKeyDialog from './dialogs/ImportKeyDialog'
import KeyItem from './OpenPgpTab'

export default {
  name: 'ExternalKeys',
  components: {
    ImportKeyDialog,
    KeyItem,
    AppButton,
  },
  data: () => ({
    showImportKeys: false,
  }),
  mounted() {
    this.getExternalKeys()
  },
  computed: {
    ...mapGetters('openPGP', ['externalKeys']),
  },
  methods: {
    ...mapActions('openPGP', ['asyncGetExternalsKeys', 'changeCurrentKeys']),
    async getExternalKeys() {
      await this.asyncGetExternalsKeys()
    },
    openKey(key) {
      const keys = {
        type: 'external',
        keys: [key]
      }
      this.changeCurrentKeys(keys)
      this.$router.push(`/settings/open-pgp/external-keys/${key.Email}`)
    },
    viewKeys (aKeys) {
      // if (aKeys.length === 1) {
      //   if (aKeys[0].bPublic) {
      //     this.viewKeysHeader = 'View OpenPGP public key for ' + aKeys[0].sEmail
      //     this.viewKeysFileName = aKeys[0].sEmail + ' OpenPGP public key.asc'
      //   } else {
      //     this.viewKeysHeader = 'View OpenPGP private key for ' + aKeys[0].sEmail
      //     this.viewKeysFileName = aKeys[0].sEmail + ' OpenPGP private key.asc'
      //   }
      // } else {
      //   this.viewKeysHeader = 'View all OpenPGP public keys'
      //   this.viewKeysFileName = 'OpenPGP public keys.asc'
      // }
      // let aArmors = _.map(aKeys, function (oKey) {
      //   return oKey.sArmor
      // })
      // this.viewKeysValue = aArmors.join('\r\n\r\n')
      // this.viewKeysDialog = true
    },
  },
}
</script>

<style scoped>
.keys-list::-webkit-scrollbar {
  width: 0;
}
</style>
