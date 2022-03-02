<template>
  <q-scroll-area :thumb-style="{ width: '5px' }" class="externalKey q-px-lg q-pt-lg" v-if="key">
    <div class="q-mb-md text-bold">
      {{ keyName }}
    </div>

    <div class="overflow-hidden">
      <span style="white-space: pre;">{{ key.PublicPgpKey }}</span>
    </div>
  </q-scroll-area>

  <div class="q-pa-lg full-width" v-if="key">
    <app-button @click="downloadKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DOWNLOAD')" />
    <app-button @click="confirmDelete" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" class="q-mt-lg" />
  </div>

  <delete-key-dialog v-model="isDeleting" @close="isDeleting = false" @delete="deleteKey" :mail="key?.Email" />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import AppButton from 'src/components/common/AppButton'
import DeleteKeyDialog from './dialogs/DeleteKeyDialog';
import { downloadKey } from '../../utils';
import openPgpHelper from '../../openpgp-helper';

export default {
  name: 'ExternalKeyView',
  components: {
    DeleteKeyDialog,
    AppButton,
  },
  data: () => ({
    isDeleting: false,
    keyArmor: {}
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentKeys']),
    key() {
      return this.currentKeys[0]
    },
    keyName() {
      return this.keyArmor[0]?.getUserIds()[0]
    }
  },
  methods: {
    ...mapActions('openpgpmobile', ['changeCurrentKeys', 'asyncRemoveExternalKey']),
    confirmDelete() {
      this.isDeleting = true
    },
    async downloadKey() {
      const fileName = `${this.keyName.replace(/[<>]/g, '')} OpenPGP public key.asc`

      return downloadKey(this.key.PublicPgpKey, fileName)
    },
    async deleteKey() {
      const isDeleted = await this.asyncRemoveExternalKey(this.key.Email)
      if (isDeleted) {
        this.$router.replace('/settings/open-pgp/external-keys')
      }
    }
  },
  async mounted() {
    if (!this.currentKeys.length) {
      this.$router.push('/settings/open-pgp/external-keys')
    }
    this.keyArmor = await openPgpHelper.getArmorInfo(this.currentKeys[0]?.PublicPgpKey)
  },
  beforeUnmount() {
    this.changeCurrentKeys([])
  }
}
</script>

<style scoped>
.externalKey {
  height: calc(100vh - 223px);
}
</style>
