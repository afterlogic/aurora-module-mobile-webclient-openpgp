<template>
  <AppDialog v-model="showDialog" :close="close">
    <template v-slot:content>
      <div class="q-px-lg q-pb-sm dialog__title-text">
        <span>hello</span>
      </div>
      <AppDialogInput
          class="q-mx-lg"
          v-model="keysArmorToImport"
          type="textarea"
          v-if="!showKeys"
          autofocus
          @keyup.enter.stop="importKey"
      />

      <div v-if="showKeys" class="q-mx-lg q-mt-lg">
        <div v-if="keysToImport.length">
          <div class="q-mb-md">
            {{ $t('OPENPGPMOBILEWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_FOR_IMPORT') }}
          </div>
          <ImportKeyItem keysToImport v-for="key in keysToImport" v-model="key.checked" :key="key.id" :pgpKey="key"/>
        </div>

        <div v-if="!keysToImport.length" class="q-mb-md">
          {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_NO_KEYS_TO_IMPORT') }}
        </div>

        <div v-if="keysAlreadyThere.length">
          <div class="q-my-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_ALREADY_IN_SYSTEM') }}
          </div>
          <ImportKeyItem disabled v-for="key in keysAlreadyThere" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateExternal.length">
          <div class="q-my-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_PRIVATE') }}
          </div>
          <ImportKeyItem disabled v-for="key in keysPrivateExternal" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateNotImported.length">
          <div class="q-my-md">
            {{ $t('OPENPGPMOBILEWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_NOT_IMPORTED') }}
          </div>
          <ImportKeyItem disabled v-for="key in keysPrivateNotImported" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="myKeysNotImported.length">
          <div class="q-my-md">
            {{ $t('OPENPGPMOBILEWEBCLIENT.INFO_TEXT_NOT_CONTAINS_KEYS_EXTERNAL_NOT_IMPORTED') }}
          </div>
          <ImportKeyItem disabled v-for="key in myKeysNotImported" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysBroken.length">
          <ImportKeyItem disabled keysBroken v-for="key in keysBroken" :key="key.id" :pgpKey="key" />
        </div>
      </div>

    </template>
    <template v-slot:actions>
      <ButtonDialog class="q-ma-sm"  v-if="!showKeys" :action="check" :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')" />
      <ButtonDialog class="q-ma-sm"
          v-if="showKeys"
          :action="importKey"
          :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEYS')"
          :disabled="!keysToImport.length"
      />
    </template>
  </AppDialog>
</template>

<script>
import AppDialog from "src/components/common/AppDialog";
import AppDialogInput from "src/components/common/AppDialogInput";
import ButtonDialog from "src/components/common/ButtonDialog";
import ImportKeyItem from "../../settings/dialogs/ImportKeyItem";
import OpenPgp from "../../../openpgp-helper";
import eventBus from "src/event-bus";
import { mapGetters } from "pinia"

export default {
  name: "ImportKeyForString",
  components: {
    AppDialog,
    AppDialogInput,
    ButtonDialog,
    ImportKeyItem
  },
  computed: {
    ...mapGetters('openpgpmobile', ['externalKeys', 'myPublicKeys', 'myPrivateKeys', 'filesKeys']),
    ...mapGetters('core', ['userPublicId']),
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
  data: () => ({
    showDialog: false,
    contact: null,
    keysArmorToImport: '',
    saving: false,
    showKeys: false,
    keysToImport: [],
    keysAlreadyThere: [],
    keysPrivateExternal: [],
    myKeysNotImported: [],
    keysBroken: [],
    keysPrivateNotImported: [],
  }),
  methods: {
    close() {
      this.showDialog = false
      this.contact = null
      this.clearKeys()
      this.keysArmorToImport = ''
    },
    openDialog(contact) {
      this.showDialog = true
      this.contact = contact
    },
    async importKey() {
      eventBus.$emit('ContactsMobileWebclient::setPgpKey', this.keysArmorToImport)
      this.clearKeys()
      this.close()
    },
    clearKeys() {
      this.keysBroken = []
      this.keysAlreadyThere = []
      this.keysPrivateExternal = []
      this.keysPrivateNotImported = []
      this.myKeysNotImported = []
      this.keysToImport = []
    },
    async check() {
      console.log(this.contact, 'this.contact')
      const keys = await OpenPgp.getKeysInfo(this.keysArmorToImport)
      keys.forEach( key => {
        if (key.sMail === this.contact.ViewEmail) {
          this.keysToImport.push({
            email: key.sMail,
            addInfo: `(${key.iBitSize}, ${key.sType})`,
            isExternal: false,
            checked: true,
          })
        } else {
          this.keysBroken.push({
            email: key.sMail,
            addInfo: `(${key.iBitSize}, ${key.sType})`,
            isExternal: false,
            checked: false,
          })
        }
      })
    },
  }
}
</script>
