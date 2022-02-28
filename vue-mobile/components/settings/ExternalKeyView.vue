<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="keys_list__all q-px-lg q-pt-lg" v-if="key">
    <div class="q-mb-md text-bold">
      {{ key.Email }}
    </div>

    <div class="overflow-hidden">
      <span style="word-break: break-all;">{{ key.PublicPgpKey }}</span>
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

export default {
  name: 'ExternalKeyView',
  components: {
    DeleteKeyDialog,
    AppButton,
  },
  data: () => ({
    isDeleting: false
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentKeys']),
    key() {
      return this.currentKeys?.[0]
    }
  },
  methods: {
    ...mapActions('openpgpmobile', ['changeCurrentKeys', 'asyncRemoveExternalKey']),
    confirmDelete() {
      this.isDeleting = true
    },
    downloadKey() {
      return downloadKey(this.key.PublicPgpKey, `${this.key.Email}_public.asc`)
    },
    async deleteKey() {
      const isDeleted = await this.asyncRemoveExternalKey(this.key.Email)
      if (isDeleted) {
        this.$router.replace('/settings/open-pgp/external-keys')
      }
    }
  },
  mounted() {
    if (!this.currentKeys.length) {
      this.$router.push('/settings/open-pgp/external-keys')
    }
  },
  beforeUnmount() {
    this.changeCurrentKeys([])
  }
}
</script>

<style scoped>
.keys_list__all {
  height: calc(100vh - 223px);
}
</style>
