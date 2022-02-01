<template>
  <div class="q-pa-lg" v-if="currentKeys">
    <div>
      <span class="text-bold">
        {{currentKeys.Email}}
      </span>
    </div>
    <div style="overflow-x:hidden; ">
      <span style="white-space: break-spaces">{{ key }}</span>
    </div>
  </div>
</template>

<script>
import {mapActions, mapGetters} from 'vuex'

export default {
  name: 'ExternalKeyView',
  computed: {
    ...mapGetters('openPGP', ['currentKeys']),
    key() {
      const keys = this.currentKeys.keys
      const viewKeysValue = keys.map( key => {
        return key.PublicPgpKey
      } )
      return viewKeysValue.join('\r\n\r\n')
    }
  },
  methods: {
    ...mapActions('openPGP', ['changeCurrentKeys']),
  },
  beforeUnmount() {
    this.changeCurrentKeys(null)
  }
}
</script>

<style scoped>

</style>
