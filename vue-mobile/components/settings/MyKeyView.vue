<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="myKey q-px-lg q-pt-lg" v-if="currentMyKey">
    <div class="q-mb-md">
      &lt;{{ currentMyKey.email }}&gt;
    </div>
    <div class="overflow-hidden">
      <span style="word-break: break-all;">{{ currentMyKey.armor }}</span>
    </div>
  </q-scroll-area>

  <div class="q-pa-lg full-width" v-if="currentMyKey">
    <app-button @click="downloadKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DOWNLOAD')" />
    <app-button @click="confirmDelete" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" class="q-mt-lg" />
  </div>

  <delete-key-dialog v-model="isDeleting" @close="isDeleting = false" @delete="deleteKey" :mail="currentMyKey?.email" />
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

import AppButton from 'src/components/common/AppButton'
import DeleteKeyDialog from './dialogs/DeleteKeyDialog';

export default {
  name: 'MyKeyView',
  components: {
    DeleteKeyDialog,
    AppButton,
  },
  data: () => ({
    isDeleting: false
  }),
  computed: {
    ...mapGetters('openpgpmobile', ['currentMyKey']),
  },
  methods: {
    ...mapActions('openpgpmobile', ['setCurrentMyKey', 'deleteMyKey']),
    confirmDelete() {
      this.isDeleting = true
    },
    downloadKey() {
      const makeTextFile = function (text) {
        const data = new Blob([text], {type: 'text/plain'})
        return window.URL.createObjectURL(data)
      };

      const link = document.createElement('a')
      link.setAttribute('download', `${this.currentMyKey.email}_${this.currentMyKey.isPublic ? 'public' : 'private'}.asc`)
      link.href = makeTextFile(this.currentMyKey.armor)
      document.body.appendChild(link);

      window.requestAnimationFrame(() => {
        const event = new MouseEvent('click');
        link.dispatchEvent(event)
        document.body.removeChild(link)
      });
    },
    deleteKey() {
      const isDeleted = this.deleteMyKey(this.currentMyKey)
      if (isDeleted) {
        this.$router.replace('/settings/open-pgp/my-keys')
      }
    }
  },
  mounted() {
    if (!this.currentMyKey) {
      this.$router.push('/settings/open-pgp/my-keys')
    }
  },
  beforeUnmount() {
    this.setCurrentMyKey(null)
  }
}
</script>

<style scoped>
.myKey {
  height: calc(100vh - 223px);
}
</style>
