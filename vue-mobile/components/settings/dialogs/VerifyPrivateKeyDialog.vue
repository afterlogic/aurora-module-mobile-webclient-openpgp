<template>
  <q-dialog @hide="close" v-bind="$attrs">
    <q-card class="q-dialog-size q-pt-md" style="min-width: 300px">
      <q-item>
        <app-dialog-input
          v-model="password"
          type="password"
          :placeholder="$t('OPENPGPWEBCLIENT.HEADING_VERIFY_PASSWORD')"
          :autofocus="true"
        />
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup class="absolute-top-right q-mr-md" />
      </q-item>

      <q-card-actions class="q-mx-md" align="right">
        <app-button-dialog :action="check" :label="$t('OPENPGPWEBCLIENT.ACTION_CHECK')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import { verifyPrivateKeyPassword } from '../../../openpgp-utils'

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
      }
    },
  },
};
</script>

<style scoped>

</style>
