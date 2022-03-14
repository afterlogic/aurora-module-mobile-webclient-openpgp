<template>
  <app-dialog v-bind="$attrs" :close="close">
    <template v-slot:head>
        <div class="q-mx-lg dialog__header-text">
          {{ $t('COREWEBCLIENT.CONFIRM_ARE_YOU_SURE') }}
        </div>
        <q-space />
    </template>

    <template v-slot:actions>
        <app-button-dialog :action="deleteKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" />
    </template>
  </app-dialog>
</template>

<script>
import AppButtonDialog from "src/components/common/AppButtonDialog";
import ImportKeyItem from './ImportKeyItem'
import AppDialog from "components/common/AppDialog";

export default {
  name: 'DeleteKeyDialog',
  components: {
    AppButtonDialog,
    ImportKeyItem,
    AppDialog
  },
  props: {
    mail: String
  },
  methods: {
    deleteKey() {
      this.$emit('delete')
    },
    close() {
      this.$emit('close')
    }
  },
}
</script>

<style scoped></style>
