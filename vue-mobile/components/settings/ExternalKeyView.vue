<template>
  <q-scroll-area :thumb-style="{ width: '5px' }" class="externalKey q-px-lg q-pt-lg" v-if="key">
    <div class="q-mb-md text-bold">
      {{ keyName }}
    </div>

    <div class="overflow-hidden">
      <span class="keyView">{{ key.PublicPgpKey }}</span>
    </div>
  </q-scroll-area>

  <div class="q-pa-lg full-width flex items-center" v-if="key">
    <div class="full-width">
      <AppButton @click="downloadKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DOWNLOAD')" />
      <AppButton @click="confirmDelete" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" class="q-mt-lg" />
    </div>
  </div>

  <DeleteKeyDialog v-model="isDeleting" @close="isDeleting = false" @delete="deleteKey" :mail="key?.Email" />
</template>

<script>
import { mapActions, mapGetters } from 'pinia'

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
      const email = this.key.Email.substring(this.key.Email.lastIndexOf("<")+1, this.key.Email.lastIndexOf(">"))
      const isDeleted = await this.asyncRemoveExternalKey(email)
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
  flex-grow: 1;
}
.keyView {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace, serif;
}
</style>
