<template>
  <q-dialog v-bind="$attrs">
    <q-card class="q-dialog-size" style="min-width: 300px">
      <q-card-section class="row no-wrap items-center">
        <div class="text-subtitle1">
          {{ $t('COREWEBCLIENT.CONFIRM_ARE_YOU_SURE') }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <app-button-dialog v-close-popup :label="$t('COREWEBCLIENT.ACTION_CANCEL')"/>
        <q-space />
        <app-button-dialog :action="deleteKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')"/>
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
    deleteKey() {
      this.$emit('delete')
    },
  },
}
</script>

<style scoped></style>
