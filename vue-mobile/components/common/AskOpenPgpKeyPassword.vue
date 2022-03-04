<template>
  <app-dialog v-model="enterOpenPgpKeyPassword" @close="close" :close="close">
    <template v-slot:head>
      <q-card-section>
        <div class="text-h6">Enter password</div>
      </q-card-section>
      <q-card-section>
        <span>Enter password for {{ openPgpKeyFullEmail }} OpenPGP key</span>
      </q-card-section>
      <q-item>
        <q-item-section side>
          <q-item-label>OpenPGP key password</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-input outlined dense v-model="openPgpKeyPassword" @keyup.enter="setOpenPgpKeyPassword" ref="openPgpPassword" />
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:actions>
      <q-btn flat label="Ok" color="primary" @click="setOpenPgpKeyPassword" />
      <q-btn flat label="Cancel" color="grey-6" @click="close" />
    </template>
  </app-dialog>
</template>

<script>
import AppDialog from "components/common/AppDialog";
export default {
  name: "AskOpenPgpKeyPassword",
  data: () => ({
    enterOpenPgpKeyPassword: false,
    openPgpKeyCallback: null,
    openPgpKeyFullEmail: '',
    openPgpKeyPassword: ''
  }),
  components: {
    AppDialog
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
      this.$refs.openPgpPassword.$el.focus()
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
