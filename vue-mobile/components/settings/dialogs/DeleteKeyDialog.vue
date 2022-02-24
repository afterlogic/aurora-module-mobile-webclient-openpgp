<template>
  <q-dialog v-bind="$attrs">
    <q-card class="q-dialog-size" style="min-width: 300px">
      <q-card-section class="row no-wrap items-center q-pb-none">
        <div class="">
          {{ $t('OPENPGPWEBCLIENT.CONFIRM_DELETE_KEY', {KEYEMAIL: mail}) }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-actions class="q-mx-md" align="right">
        <app-button-dialog :action="deleteKey" :label="$t('COREWEBCLIENT.ACTION_OK')"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import AppButtonDialog from "src/components/common/AppButtonDialog";
import ImportKeyItem from './ImportKeyItem'

export default {
  name: 'DeleteKeyDialog',
  components: {
    AppButtonDialog,
    ImportKeyItem,
  },
  props: {
    mail: String
  },
  methods: {
    async deleteKey() {
      this.$emit('delete')
    },
  },
}
</script>

<style scoped></style>
