<template>
  <app-dialog v-model="enterOpenPgpKeyPassword" :close="close">
    <template v-slot:head>
      <div class="q-px-lg dialog__title-text">
        <span>Enter password</span>
      </div>
      <div class="q-px-lg q-py-md text__caption">
        <span>Please enter OpenPGP key's password to unlock the key.</span>
      </div>
      <q-item>
        <app-input
            class="q-mx-sm"
            placeholder="Password"
            outlined
            autofocus
            dense
            v-model="openPgpKeyPassword"
            style="width: 100%"
            type="password"
            @keyup.enter="setOpenPgpKeyPassword"
        />
      </q-item>
    </template>
    <template v-slot:actions>
      <button-dialog
          class="q-ma-sm"
          :action="setOpenPgpKeyPassword"
          label="Unlock"
      />
    </template>
  </app-dialog>
</template>

<script>
import AppDialog from "components/common/AppDialog";
import AppInput from "components/common/AppInput";
import ButtonDialog from "components/common/ButtonDialog";

export default {
  name: "AskOpenPgpKeyPassword",
  data: () => ({
    enterOpenPgpKeyPassword: false,
    openPgpKeyCallback: null,
    openPgpKeyFullEmail: '',
    openPgpKeyPassword: '',
    isDataSent: false,
  }),
  components: {
    AppDialog,
    AppInput,
    ButtonDialog
  },
  watch: {
    enterOpenPgpKeyPassword(val) {
      if (!val) {
        this.close()
      }
    }
  },
  methods: {
    askOpenPgpKeyPassword: async function (sFullEmail, fCallback) {
      this.enterOpenPgpKeyPassword = true
      this.openPgpKeyFullEmail = sFullEmail
      this.openPgpKeyPassword = ''
      this.openPgpKeyCallback = fCallback || null

      await this.$nextTick()
    },
    setOpenPgpKeyPassword() {
      this.openPgpKeyCallback(this.openPgpKeyPassword)
      this.isDataSent = true
      this.enterOpenPgpKeyPassword = false
    },
    close() {
      if (!this.isDataSent) {
        this.enterOpenPgpKeyPassword = false
        this.openPgpKeyCallback(null)
      }
      this.isDataSent = false
    }
  }
}
</script>

<style scoped>

</style>
