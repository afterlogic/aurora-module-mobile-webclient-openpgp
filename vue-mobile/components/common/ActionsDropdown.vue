<template>
  <div class="dropdown-more flex justify-center items-center">
    <q-btn-dropdown :menu-offset="[8, -45]" flat unelevated dense>
      <template v-slot:label>
        <IconAction class="q-mr-md" icon="MoreIcon" />
      </template>
      <q-list>
        <q-item
            clickable
            v-close-popup
            v-for="action in actions"
            :key="action.name"
            @click="action.action"
        >
          <IconAction class="q-mr-md" :icon="action.icon" />
          <q-item-section>
            <q-item-label>{{ action.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>
import IconAction from "../icons/IconAction";
export default {
  name: "ActionsDropdown",
  components: {
    IconAction
  },
  props: {
    actions: { type: Array, default: [] }
  }
}
</script>
