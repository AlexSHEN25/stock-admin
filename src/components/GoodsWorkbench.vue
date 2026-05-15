<template>
  <module-table
    moduleKey="goods"
    :permissionCodes="permissionCodes"
    :permissionReady="permissionReady"
    :currentLang="currentLang"
  />
</template>

<script setup>
import ModuleTable from './ModuleTable.vue';

defineProps({
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentLang: { type: String, default: 'ja-JP' },
});
</script>
