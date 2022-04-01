<template>
  <app-dialog v-bind="$attrs" :close="close">
    <template v-slot:content>
        <div class="q-mx-lg dialog__title-text">
          {{ $t('COREWEBCLIENT.CONFIRM_ARE_YOU_SURE') }}
        </div>
        <q-space />
    </template>

    <template v-slot:actions>
        <button-dialog class="q-mr-sm" :action="deleteKey" :label="$t('OPENPGPWEBCLIENT.ACTION_DELETE_KEY')" />
    </template>
  </app-dialog>
</template>

<script>
import ButtonDialog from "src/components/common/ButtonDialog";
import ImportKeyItem from './ImportKeyItem'
import AppDialog from "components/common/AppDialog";

export default {
  name: 'DeleteKeyDialog',
  components: {
    ButtonDialog,
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
