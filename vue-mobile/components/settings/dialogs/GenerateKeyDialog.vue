<template>
  <q-dialog v-bind="$attrs">
    <q-card class="q-dialog-size" style="min-width: 300px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          {{ $t('OPENPGPWEBCLIENT.HEADING_GENERATE_NEW_KEY') }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input
          outlined
          dense
          v-model="mailInput"
          autocomplete="nope"
          :placeholder="$t('COREWEBCLIENT.LABEL_EMAIL')"
          autofocus
          class="q-mb-md"
        />
        <q-input
          outlined
          dense
          v-model="passInput"
          autocomplete="nope"
          type="password"
          :placeholder="$t('COREWEBCLIENT.LABEL_PASSWORD')"
          class="q-mb-md"
        />
        <q-select
          outlined
          dense
          v-model="keyLengthOption"
          :options="keyLengthOptions"
          :label="$t('OPENPGPWEBCLIENT.LABEL_KEY_LENGTH')"
        />
      </q-card-section>

      <q-card-actions align="right">
        <app-button-dialog :action="generate" :label="$t('OPENPGPWEBCLIENT.ACTION_GENERATE')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppDialogInput from 'src/components/common/AppDialogInput'
import AppButtonDialog from "src/components/common/AppButtonDialog";
import ImportKeyItem from './ImportKeyItem'

export default {
  name: 'GenerateKeyDialog',
  components: {
    AppDialogInput,
    AppButtonDialog,
    ImportKeyItem,
  },
  data: () => ({
    mailInput: '',
    passInput: '',
    keyLengthOption: '2048',
    keyLengthOptions: ['2048', '4096', '8192']
  }),
  mounted() {
    this.mailInput = this.userPublicId
  },
  computed: {
    ...mapGetters('core', ['userPublicId']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['generateKeys']),
    generate() {
      this.generateKeys({
        userId: this.mailInput,
        password: this.passInput,
        keyLength: this.keyLengthOption,
        thenFn: () => this.$emit('close'),
      })
    },
  },
}
</script>

<style scoped></style>
