<template>
  <app-dialog v-model="enterOpenPgpKeyPassword" @close="close" :close="close">
    <template v-slot:head>
      <div class="q-px-md dialog__header-text">
        <span>Enter password</span>
      </div>
      <div class="q-px-md q-py-md text__caption">
        <span>Please enter OpenPGP key's password to unlock the key.</span>
      </div>
      <q-item>
        <app-input
            placeholder="Enter folder name"
            outlined
            autofocus
            dense
            v-model="openPgpKeyPassword"
            style="width: 100%"
            @keyup.enter="setOpenPgpKeyPassword"
        />
      </q-item>
    </template>
    <template v-slot:actions>
      <button-dialog
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
    openPgpKeyPassword: ''
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
      this.enterOpenPgpKeyPassword = false
    },
    close() {
      this.enterOpenPgpKeyPassword = false
      this.openPgpKeyCallback(null)
    }
  }
}
</script>

<style scoped>

</style>
