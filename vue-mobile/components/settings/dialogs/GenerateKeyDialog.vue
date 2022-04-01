<template>
  <app-dialog v-bind="$attrs" :close="() => $emit('close')">
    <template v-slot:content>
      <div class="dialog__title-text q-mx-lg q-mb-lg">
        {{ $t('OPENPGPWEBCLIENT.HEADING_GENERATE_NEW_KEY') }}
      </div>
      <div class="q-mx-lg">
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
      </div>
    </template>
    <template v-slot:actions>
      <button-dialog class="q-ma-sm" :action="generate" :label="$t('OPENPGPWEBCLIENT.ACTION_GENERATE')" />
    </template>
  </app-dialog>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppDialog from "src/components/common/AppDialog";
import AppDialogInput from 'src/components/common/AppDialogInput'
import ButtonDialog from "src/components/common/ButtonDialog";
import ImportKeyItem from './ImportKeyItem'

export default {
  name: 'GenerateKeyDialog',
  components: {
    AppDialogInput,
    ButtonDialog,
    ImportKeyItem,
    AppDialog
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
