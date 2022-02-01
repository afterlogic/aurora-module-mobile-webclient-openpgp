<template>
  <q-dialog @hide="close" v-bind="$attrs">
    <q-card class="q-dialog-size q-pt-md" style="min-width: 300px">
      <div v-if="!showKeys">
        <q-item>
          <app-dialog-input
            v-model="keysArmorToImport"
            type="textarea"
            :placeholder="$t('OPENPGPWEBCLIENT.HEADING_IMPORT_KEY')"
            :autofocus="true"
          />
        </q-item>
        <q-card-actions class="q-mx-md" align="right">
          <app-button-dialog
            :saving="saving"
            :action="check"
            :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')"
          />
        </q-card-actions>
      </div>
      <div v-if="showKeys">
        <div v-if="keysToImport.length">
          <div class="q-mx-lg">
            The text contains the following keys that are available for import
          </div>
          <import-key-item
            keysToImport
            v-for="key in keysToImport"
            v-model="key.checked"
            :key="key.id"
            :pgpKey="key"
          />
        </div>
        <div v-if="keysAlreadyThere.length">
          <import-key-item
            disabled
            v-for="key in keysAlreadyThere"
            :key="key.id"
            :pgpKey="key"
          />
        </div>
        <div v-if="keysPrivateExternal.length">
          <import-key-item
            disabled
            v-for="key in keysPrivateExternal"
            :key="key.id"
            :pgpKey="key"
          />
        </div>
        <div v-if="keysBroken.length">
          <import-key-item
            disabled
            keysBroken
            v-for="key in keysBroken"
            :key="key.id"
            :pgpKey="key"
          />
        </div>
        <q-card-actions class="q-mr-md q-my-sm" align="right">
          <app-button-dialog
            :saving="saving"
            :action="importKeys"
            :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEYS')"
          />
        </q-card-actions>
      </div>
      <div></div>
    </q-card>
  </q-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppDialogInput from 'src/components/common/AppDialogInput'
import AppButtonDialog from "src/components/common/AppButtonDialog";

import ImportKeyItem from './ImportKeyItem'
import { checkPgpKeys } from 'src/utils/openPGP/utils'

export default {
  name: 'ImportKeyDialog',
  components: {
    AppDialogInput,
    AppButtonDialog,
    ImportKeyItem,
  },
  data: () => ({
    saving: false,
    keysArmorToImport: '',
    keysBroken: [],
    keysAlreadyThere: [],
    keysPrivateExternal: [],
    keysToImport: [],
  }),
  computed: {
    ...mapGetters('openPGP', ['externalKeys']),
    showKeys() {
      return (
        this.keysBroken.length ||
        this.keysAlreadyThere.length ||
        this.keysPrivateExternal.length ||
        this.keysToImport.length
      )
    },
  },
  methods: {
    ...mapActions('openPGP', ['asyncAddPublicKeys']),
    close() {
      this.clearKeys()
    },
    clearKeys() {
      this.keysBroken = []
      this.keysAlreadyThere = []
      this.keysPrivateExternal = []
      this.keysToImport = []
    },
    async importKeys() {
      const checkedKeys = []
        this.keysToImport.forEach( key => {
        if (key.checked) {
          checkedKeys.push({
            Email: key.email.substring(key.email.lastIndexOf("<")+1,key.email.lastIndexOf(">")),
            Key: key.armor,
            Name: ''
          })
        }
      })
      const result = await this.asyncAddPublicKeys(checkedKeys)
      if (result) {
        this.clearKeys()
        this.$emit('close')
      }
    },
    async check() {
      const keysFromArmor = await checkPgpKeys(
        this.keysArmorToImport,
        this.externalKeys
      )
      this.keysArmorToImport = ''
      this.keysBroken = keysFromArmor.keysBroken
      this.keysAlreadyThere = keysFromArmor.keysAlreadyThere
      this.keysPrivateExternal = keysFromArmor.keysPrivateExternal
      this.keysToImport = keysFromArmor.keysToImport
    },
  },
}
</script>

<style scoped></style>
