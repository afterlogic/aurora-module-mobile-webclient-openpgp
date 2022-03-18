<template>
  <app-dialog v-bind="$attrs" :close="close">
    <template v-slot:head>
      <div class="q-px-lg q-pb-sm dialog__title-text">
            <span>{{
                $t('OPENPGPWEBCLIENT.HEADING_IMPORT_KEY')
              }}</span>
      </div>
      <div v-if="!showKeys" class="q-mx-md">
        <app-dialog-input
            v-model="keysArmorToImport"
            type="textarea"
            :autofocus="true"
        />
      </div>

      <div v-if="showKeys" class="q-mx-lg q-mt-lg">
        <div v-if="keysToImport.length">
          <div class="q-mb-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_FOR_IMPORT') }}
          </div>
          <import-key-item keysToImport v-for="key in keysToImport" v-model="key.checked" :key="key.id" :pgpKey="key"/>
        </div>

        <div v-if="!keysToImport.length" class="q-mb-md">
          {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_NO_KEYS_TO_IMPORT') }}
        </div>

        <div v-if="keysAlreadyThere.length">
          <div class="q-my-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_ALREADY_IN_SYSTEM') }}
          </div>
          <import-key-item disabled v-for="key in keysAlreadyThere" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateExternal.length">
          <div class="q-my-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_PRIVATE') }}
          </div>
          <import-key-item disabled v-for="key in keysPrivateExternal" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateNotImported.length">
          <div class="q-my-md">
            {{ $t('OPENPGPMOBILEWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_NOT_IMPORTED') }}
          </div>
          <import-key-item disabled v-for="key in keysPrivateNotImported" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="myKeysNotImported.length">
          <div class="q-my-md">
            {{ $t('OPENPGPMOBILEWEBCLIENT.INFO_TEXT_NOT_CONTAINS_KEYS_EXTERNAL_NOT_IMPORTED') }}
          </div>
          <import-key-item disabled v-for="key in myKeysNotImported" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysBroken.length">
          <import-key-item disabled keysBroken v-for="key in keysBroken" :key="key.id" :pgpKey="key" />
        </div>
      </div>

    </template>
    <template v-slot:actions>
      <button-dialog class="q-ma-sm"  v-if="!showKeys" :action="check" :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')" />
      <button-dialog class="q-ma-sm"
          v-if="showKeys"
          :action="importKeys"
          :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEYS')"
          :disabled="!keysToImport.length"
      />
    </template>
  </app-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import { checkPgpKeys } from '../../../openpgp-utils'

import AppDialogInput from 'src/components/common/AppDialogInput'
import ButtonDialog from "src/components/common/ButtonDialog";
import ImportKeyItem from './ImportKeyItem'
import AppDialog from "src/components/common/AppDialog";

export default {
  name: 'ImportKeyDialog',
  components: {
    AppDialogInput,
    ImportKeyItem,
    AppDialog,
    ButtonDialog
  },
  props: {
    isExternalKeys: Boolean
  },
  data: () => ({
    keysArmorToImport: '',
    keysBroken: [],
    keysAlreadyThere: [],
    keysPrivateExternal: [],
    keysPrivateNotImported: [],
    myKeysNotImported: [],
    keysToImport: [],
  }),
  watch: {
    filesKeys() {
      if (this.filesKeys.length) {
        this.keysArmorToImport = this.filesKeys.join('/n')
        this.check()
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
        this.keysPrivateNotImported.length ||
        this.myKeysNotImported.length ||
        this.keysToImport.length
      )
    },
  },
  methods: {
    ...mapActions('openpgpmobile', ['asyncAddPublicKeys', 'importMyKeys']),
    close() {
      if (this.showKeys) {
        this.clearKeys()
        this.$emit('clearFiles')
      } else {
        this.keysArmorToImport = ''
        this.$emit('close')
      }
    },
    clearKeys() {
      this.keysBroken = []
      this.keysAlreadyThere = []
      this.keysPrivateExternal = []
      this.keysPrivateNotImported = []
      this.myKeysNotImported = []
      this.keysToImport = []
    },
    async importKeys() {
      const checkedExternalKeys = []
      const checkedMyKeys = []
      this.keysToImport.forEach(key => {
        if (key.isExternal && key.checked) {
          checkedExternalKeys.push({
            Email: key.email.substring(key.email.lastIndexOf("<") + 1, key.email.lastIndexOf(">")),
            Key: key.armor,
            Name: key.email.substring(0, key.email.lastIndexOf("<")),
          })
        } else if (!key.isExternal && key.checked) {
          checkedMyKeys.push(key.armor)
        }
      })
      const resultExternal = await this.asyncAddPublicKeys(checkedExternalKeys)
      const resultMy = checkedMyKeys.length ? await this.importMyKeys(checkedMyKeys) : true

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
        myKeys,
        this.isExternalKeys
      )
      this.keysArmorToImport = ''
      this.keysBroken = keysFromArmor.keysBroken
      this.keysAlreadyThere = keysFromArmor.keysAlreadyThere
      this.keysPrivateExternal = keysFromArmor.keysPrivateExternal
      this.keysPrivateNotImported = keysFromArmor.keysPrivateNotImported
      this.myKeysNotImported = keysFromArmor.myKeysNotImported
      this.keysToImport = keysFromArmor.keysToImport
    },
  },
}
</script>

<style scoped></style>
