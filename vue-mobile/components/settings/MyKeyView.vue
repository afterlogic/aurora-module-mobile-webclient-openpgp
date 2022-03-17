<template>
  <q-scroll-area  :thumb-style="{ width: '5px' }" class="myKey q-px-lg q-pt-lg" v-if="currentMyKey">
    <div class="q-mb-md text-bold">
      {{ keyName }}
    </div>

    <div class="overflow-hidden">
      <span class="keyView">{{ currentMyKey.armor }}</span>
    </div>
  </q-scroll-area>

  <div class="q-pa-lg full-width flex items-center" v-if="currentMyKey">
    <div class="full-width">
      <app-button @click="downloadKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DOWNLOAD')" />
      <app-button @click="confirmDelete" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" class="q-mt-lg" />
    </div>
  </div>

  <delete-key-dialog v-model="isDeleting" @close="closeDeleteKeyDialog" @delete="deleteKey" :mail="currentMyKey?.email" />
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppButton from 'src/components/common/AppButton'
import DeleteKeyDialog from './dialogs/DeleteKeyDialog';
import { downloadKey } from '../../utils';
import openPgpHelper from '../../openpgp-helper';

export default {
  name: 'MyKeyView',
  components: {
    DeleteKeyDialog,
    AppButton,
  },
  data: () => ({
    isDeleting: false,
    keyArmor: {}
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentMyKey']),
    keyName() {
      return this.keyArmor[0]?.getUserIds()[0]
    }
  },
  methods: {
    ...mapActions('openpgpmobile', ['setCurrentMyKey', 'deleteMyKey']),
    confirmDelete() {
      this.isDeleting = true
    },
    downloadKey() {
      const fileName = `${this.keyName.replace(/[<>]/g, '')} OpenPGP ${this.currentMyKey.isPublic ? 'public' : 'private'} key.asc`

      return downloadKey(this.currentMyKey.armor, fileName)
    },
    size() {
      console.log(window, 'window')
    },
    deleteKey() {
      const isDeleted = this.deleteMyKey(this.currentMyKey)
      if (isDeleted) {
        this.$router.replace('/settings/open-pgp/my-keys')
      }
    },
    closeDeleteKeyDialog() {
      this.isDeleting = false
    }
  },
  async mounted() {
    if (!this.currentMyKey) {
      this.$router.push('/settings/open-pgp/my-keys')
    }
    this.keyArmor = await openPgpHelper.getArmorInfo(this.currentMyKey?.armor)
  },
  beforeUnmount() {
    this.setCurrentMyKey(null)
  }
}
</script>

<style scoped>
.myKey {
  flex-grow: 1;
}
.keyView {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace, serif;
}
</style>
