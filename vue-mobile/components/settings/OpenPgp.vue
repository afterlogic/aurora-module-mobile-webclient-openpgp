<template>
  <div class="q-pa-lg settings" data-test-id="settings-openpgp">
    <template v-if="isMailAvailable">
      <AppCheckbox
        data-test-id="settings-openpgp-enable-mail"
        class="settings__label"
        left-label
        v-model="enableOpenPgpInMail"
        :label="$t('OPENPGPWEBCLIENT.LABEL_ENABLE_OPENPGP')"
      />
      <div class="settings__caption text-secondary q-mt-md">
        <span>{{ $t('OPENPGPWEBCLIENT.INFO_ALLOW_AUTOSAVE') }}</span>
      </div>
    </template>
    <AppCheckbox
      class="settings__label"
      left-label
      v-model="rememberPassphrase"
      :label="$t('OPENPGPMOBILEWEBCLIENT.LABEL_STORE_KEYS_WITHIN_SESSION')"
    />
    <div class="settings__caption text-secondary q-mt-md">
      <span>{{ $t('OPENPGPWEBCLIENT.INFO_REMEMBER_PASSPHRASE') }}</span>
    </div>
    <div class="q-my-md">
      <OpenPgpTab
        data-test-id="settings-openpgp-external-keys"
        @click="$router.push('/settings/open-pgp/external-keys')"
        :label="$t('OPENPGPMOBILEWEBCLIENT.LABEL_EXTERNAL_PUBLIC_KEYS')"
      />
      <OpenPgpTab
        data-test-id="settings-openpgp-my-keys"
        @click="$router.push('/settings/open-pgp/my-keys')"
        :label="$t('OPENPGPMOBILEWEBCLIENT.LABEL_MY_KEYS')"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'pinia'

import eventBus from 'src/event-bus'
import modulesManager from 'src/modules-manager'
import { getOpenPgpSettings, setOpenPgpSettings } from '../../settings'
import { useOpenPGPStore } from '../../store/index-pinia'

import AppCheckbox from 'src/components/common/AppCheckbox'
import OpenPgpTab from './OpenPgpTab'

export default {
  name: 'OpenPgp',
  components: {
    AppCheckbox,
    OpenPgpTab,
  },
  data: () => ({
    enableOpenPgpInMail: false,
    rememberPassphrase: false,
  }),
  computed: {
    isMailAvailable() {
      return modulesManager.isModuleAvailable('Mail')
    },
  },
  mounted() {
    const openPgpSettings = getOpenPgpSettings()
    this.enableOpenPgpInMail = openPgpSettings.enableOpenPgpInMail
    this.rememberPassphrase = openPgpSettings.rememberPassphrase

    eventBus.$on('OpenPgpMobileWebclient::SaveSettings', this.save)
  },
  beforeUnmount() {
    eventBus.$off('OpenPgpMobileWebclient::SaveSettings', this.save)
  },
  methods: {
    ...mapActions(useOpenPGPStore, ['asyncChangeOpenPgpSettings']),
    async save() {
      eventBus.$emit('SettingsMobileWebclient::SetHeaderActionSaving', true)
      try {
        const parameters = {
          EnableModule: this.enableOpenPgpInMail,
          RememberPassphrase: this.rememberPassphrase,
        }
        const result = await this.asyncChangeOpenPgpSettings(parameters)
        if (result) {
          setOpenPgpSettings(this.enableOpenPgpInMail, this.rememberPassphrase)
        }
      } finally {
        eventBus.$emit('SettingsMobileWebclient::SetHeaderActionSaving', false)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.settings {
  &__label {
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.3px;

    .settings__caption + & {
      margin-top: 20px;
    }
  }
  &__caption {
    font-size: 12px;
    line-height: 14px;
  }
}
</style>
