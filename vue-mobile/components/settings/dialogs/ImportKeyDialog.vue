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
          <app-button-dialog :saving="saving" :action="check" :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')"/>
        </q-card-actions>
      </div>

      <div v-if="showKeys">
        <div v-if="keysToImport.length">
          <div class="q-ma-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_FOR_IMPORT') }}
          </div>
          <import-key-item keysToImport v-for="key in keysToImport" v-model="key.checked" :key="key.id" :pgpKey="key"/>
        </div>

        <div v-if="!keysToImport.length" class="q-ma-md">
          {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_NO_KEYS_TO_IMPORT') }}
        </div>

        <div v-if="keysAlreadyThere.length">
          <div class="q-ma-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_ALREADY_IN_SYSTEM') }}
          </div>
          <import-key-item disabled v-for="key in keysAlreadyThere" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateExternal.length">
          <div class="q-ma-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_PRIVATE') }}
          </div>
          <import-key-item disabled v-for="key in keysPrivateExternal" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysBroken.length">
          <import-key-item disabled keysBroken v-for="key in keysBroken" :key="key.id" :pgpKey="key" />
        </div>

        <q-card-actions class="q-mr-md q-my-sm" align="right">
          <app-button-dialog :saving="saving" :action="importKeys" :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEYS')"/>
        </q-card-actions>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import { checkPgpKeys } from '../../../openpgp-utils'
import OpenPgp from '../../../openpgp-helper'

import AppDialogInput from 'src/components/common/AppDialogInput'
import AppButtonDialog from "src/components/common/AppButtonDialog";
import ImportKeyItem from './ImportKeyItem'

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
  watch: {
    filesKeys() {
      if (this.filesKeys.length) {
        this.keysArmorToImport = this.filesKeys.join('/n');
      }
    }
  },
  computed: {
    ...mapGetters('openpgpmobile', ['externalKeys', 'myPublicKeys', 'myPrivateKeys', 'filesKeys']),
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
    ...mapActions('openpgpmobile', ['asyncAddPublicKeys']),
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
      const checkedExternalKeys = []
      const checkedMyKeys = []
      this.keysToImport.forEach(key => {
        if (key.isExternal && key.checked) {
          checkedExternalKeys.push({
            Email: key.email.substring(key.email.lastIndexOf("<")+1,key.email.lastIndexOf(">")),
            Key: key.armor,
            Name: ''
          })
        } else if (!key.isExternal && key.checked) {
          checkedMyKeys.push(key.armor)
        }
      })
      const resultExternal = await this.asyncAddPublicKeys(checkedExternalKeys)
      const resultMy = await OpenPgp.importMyKeys(checkedMyKeys)

      if (resultExternal && resultMy) {
        this.clearKeys()
        this.$emit('close')
      }
    },
    async check() {
      const myKeys = [...this.myPublicKeys, ...this.myPrivateKeys]
      const keysFromArmor = await checkPgpKeys(
        this.keysArmorToImport,
        this.externalKeys,
        myKeys
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
