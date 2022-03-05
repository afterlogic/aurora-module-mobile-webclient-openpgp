<template>
  <q-dialog @hide="close" v-bind="$attrs">
    <q-card class="q-dialog-size" style="min-width: 300px">
      <q-card-section class="row items-center q-pb-none q-px-lg">
        <div class="text-h6">
          {{ $t('OPENPGPWEBCLIENT.HEADING_VERIFY_PASSWORD') }}
        </div>
        <q-space />
        <q-btn icon="close" color="blue" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="row items-center q-pb-none q-px-lg">
        <div class="text-caption text-grey">
          {{ $t('OPENPGPWEBCLIENT.INFO_VERIFY_PASSWORD') }}
        </div>
      </q-card-section>

      <q-item class="q-px-sm">
        <app-dialog-input
          outlined
          autofocus
          v-model="password"
          type="password"
        />
      </q-item>

      <q-card-actions align="right">
        <app-button-dialog :action="check" :label="$t('OPENPGPWEBCLIENT.ACTION_VIEW_KEY')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import { verifyPrivateKeyPassword } from '../../../openpgp-utils'

import notification from 'src/utils/notification';
import AppDialogInput from 'src/components/common/AppDialogInput'
import AppButtonDialog from "src/components/common/AppButtonDialog";

export default {
  name: 'VerifyPrivateKeyDialog',
  components: {
    AppDialogInput,
    AppButtonDialog,
  },
  data: () => ({
    password: '',
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentMyKey']),
  },
  methods: {
    ...mapActions('openpgpmobile', []),
    close() {
      this.password = ''
    },
    async check() {
      const isVerified = await verifyPrivateKeyPassword(
        this.currentMyKey,
        this.password
      )

      if (isVerified) {
        this.$router.push(`/settings/open-pgp/my-keys/${this.currentMyKey.email}`)
      } else {
        notification.showError(this.$t('OPENPGPMOBILEWEBCLIENT.ERROR_INVALID_PASSWORD'))
      }
    },
  },
};
</script>

<style scoped>

</style>
