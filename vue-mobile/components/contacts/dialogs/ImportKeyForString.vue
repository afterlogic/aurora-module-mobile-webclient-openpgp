<template>
  <AppDialog v-model="showDialog" :close="close">
    <template v-slot:content>
      <div class="q-px-lg q-pb-sm dialog__title-text">
        <span>{{ $t('OPENPGPWEBCLIENT.HEADING_IMPORT_KEY') }}</span>
      </div>
      <AppDialogInput
          class="q-mx-lg"
          v-model="keysArmorToImport"
          type="textarea"
          v-if="!showKeys"
          autofocus
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

        <div v-if="keysNotForContact.length">
          <div class="q-my-md">
            {{ disabledForContactHeading }}
          </div>
          <ImportKeyItem disabled v-for="key in keysNotForContact" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysPrivateExternal.length">
          <div class="q-my-md">
            {{ $t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_KEYS_EXTERNAL_PRIVATE') }}
          </div>
          <ImportKeyItem disabled v-for="key in keysPrivateExternal" :key="key.id" :pgpKey="key" />
        </div>

        <div v-if="keysBroken.length">
          <ImportKeyItem disabled keysBroken v-for="key in keysBroken" :key="key.id" :pgpKey="key" />
        </div>
      </div>

    </template>
    <template v-slot:actions>
      <ButtonDialog
        class="q-ma-sm"
        v-if="!showKeys"
        :action="check"
        :disabled="!canCheck"
        :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')"
      />
      <ButtonDialog
        class="q-ma-sm"
        v-if="showKeys"
        :action="importKey"
        :label="$t('OPENPGPWEBCLIENT.ACTION_IMPORT_KEYS')"
        :disabled="!canImport"
      />
    </template>
  </AppDialog>
</template>

<script>
import addressUtils from 'src/utils/address'

import AppDialog from 'src/components/common/AppDialog'
import AppDialogInput from 'src/components/common/AppDialogInput'
import ButtonDialog from 'src/components/common/ButtonDialog'
import ImportKeyItem from '../../settings/dialogs/ImportKeyItem'
import OpenPgp from '../../../openpgp-helper'
import eventBus from 'src/event-bus'

export default {
  name: 'ImportKeyForString',
  components: {
    AppDialog,
    AppDialogInput,
    ButtonDialog,
    ImportKeyItem,
  },
  computed: {
    showKeys() {
      return (
          this.keysBroken.length > 0 ||
          this.keysNotForContact.length > 0 ||
          this.keysPrivateExternal.length > 0 ||
          this.keysToImport.length > 0
      )
    },
    canCheck() {
      return !!(this.keysArmorToImport || '').trim()
    },
    canImport() {
      return this.keysToImport.some((key) => key.checked)
    },
    disabledForContactHeading() {
      const contactEmail = this.getPrimaryContactEmail()
      return this.$t('OPENPGPWEBCLIENT.INFO_TEXT_CONTAINS_NOT_PUBLIC_KEYS_OR_WITHOUT_EMAIL', {
        EMAIL: contactEmail || '',
      })
    },
  },
  data: () => ({
    showDialog: false,
    contact: null,
    keysArmorToImport: '',
    keysToImport: [],
    keysNotForContact: [],
    keysPrivateExternal: [],
    keysBroken: [],
  }),
  methods: {
    close() {
      this.showDialog = false
      this.contact = null
      this.clearKeys()
      this.keysArmorToImport = ''
    },
    openDialog(contact, armor = '') {
      this.contact = contact
      this.clearKeys()
      this.keysArmorToImport = armor || ''
      this.showDialog = true
      if (armor) {
        this.$nextTick(() => {
          this.check()
        })
      }
    },
    getPrimaryContactEmail() {
      if (!this.contact) {
        return ''
      }
      return this.contact.ViewEmail
        || this.contact.PersonalEmail
        || this.contact.BusinessEmail
        || this.contact.OtherEmail
        || ''
    },
    getContactEmails() {
      if (!this.contact) {
        return []
      }
      return [
        this.contact.ViewEmail,
        this.contact.PersonalEmail,
        this.contact.BusinessEmail,
        this.contact.OtherEmail,
      ]
        .filter(Boolean)
        .map(email => addressUtils.getEmailParts(email).email.toLowerCase())
    },
    matchesContact(keyEmail) {
      const contactEmails = this.getContactEmails()
      if (!contactEmails.length) {
        return true
      }
      const keyEmailParts = addressUtils.getEmailParts(keyEmail)
      return contactEmails.includes(keyEmailParts.email.toLowerCase())
    },
    importKey() {
      if (!this.canImport) {
        return
      }
      const keyToImport = this.keysToImport.find(key => key.checked)
      if (keyToImport?.armor) {
        eventBus.$emit('ContactsMobileWebclient::setPgpKey', keyToImport.armor)
      }
      this.close()
    },
    clearKeys() {
      this.keysBroken = []
      this.keysNotForContact = []
      this.keysPrivateExternal = []
      this.keysToImport = []
    },
    async check() {
      if (!this.keysArmorToImport.trim()) {
        return
      }

      this.clearKeys()
      const keys = await OpenPgp.getArmorInfo(this.keysArmorToImport)

      keys.forEach(key => {
        if (!key) {
          return
        }

        const keyUsersIds = key.getUserIds()
        const keyEmail = keyUsersIds.length > 0 ? keyUsersIds[0] : ''
        const bitSize = key.primaryKey.params[0].byteLength() * 8
        const keyData = {
          id: key.getFingerprint(),
          email: keyEmail,
          armor: key.armor(),
          addInfo: `(${bitSize}-bit, ${key.isPublic() ? 'public' : 'private'})`,
          isExternal: false,
          checked: true,
        }

        if (!addressUtils.isCorrectEmail(addressUtils.getEmailParts(keyEmail).email)) {
          this.keysBroken.push({ ...keyData, checked: false })
        } else if (!key.isPublic()) {
          this.keysPrivateExternal.push({ ...keyData, checked: false })
        } else if (this.matchesContact(keyEmail)) {
          this.keysToImport.push(keyData)
        } else {
          this.keysNotForContact.push({ ...keyData, checked: false })
        }
      })

      this.keysArmorToImport = ''
    },
  },
}
</script>
