<template>
  <div class="q-pa-lg settings">
    <div>
      <app-checkbox
        class="settings__label"
        left-label
        v-model="rememberPassphrase"
        :label="$t('OPENPGPMOBILEWEBCLIENT.LABEL_STORE_KEYS_WITHIN_SESSION')"
      />
      <div class="q-my-md">
        <open-pgp-tab
          :action="() => $router.push('/settings/open-pgp/external-keys')"
          :label="$t('OPENPGPWEBCLIENT.LABEL_EXTERNAL_PUBLIC_KEYS')"
        />
        <open-pgp-tab
          :action="() => $router.push('/settings/open-pgp/my-keys')"
          :label="$t('OPENPGPMOBILEWEBCLIENT.LABEL_MY_KEYS')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getOpenPgpSettings } from '../../settings'

import AppCheckbox from 'src/components/common/AppCheckbox'
import OpenPgpTab from './OpenPgpTab'

export default {
  name: 'OpenPgp',
  components: {
    AppCheckbox,
    OpenPgpTab,
  },
  data: () => ({
    rememberPassphrase: false,
  }),
  mounted () {
    const openPgpSettings = getOpenPgpSettings()
    this.rememberPassphrase = openPgpSettings.rememberPassphrase
  }
}
</script>

<style lang="scss" scoped>
.settings {
  height: 86vh;
  &__label {
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.3px;
  }
  &__caption {
    font-size: 12px;
    line-height: 14px;
  }
  &__save-btn {
    margin-bottom: 40px;
  }
}
</style>
