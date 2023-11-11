<template>
  <div class="icon-action flex justify-center items-center">
    <component :is="icon" />
  </div>
</template>

<script>
import CopyIcon from "./actions/CopyIcon";
import DeleteIcon from "./actions/DeleteIcon";
import DownloadIcon from "./actions/DownloadIcon";

export default {
  name: 'IconAction',
  props: {
    icon: { type: String, required: true },
  },
  components: {
    CopyIcon,
    DeleteIcon,
    DownloadIcon
  },
}
</script>

<style scoped>
.icon-action {
  width: 16px;
}
</style>
