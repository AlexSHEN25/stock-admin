<template>
  <a-card :title="null" :bordered="false">
    <a-tabs v-model:activeKey="activeKey" :items="tabItems" />
    <module-table :moduleKey="activeKey" :permissionCodes="permissionCodes" :permissionReady="permissionReady" />
  </a-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import ModuleTable from './ModuleTable.vue';

const props = defineProps({
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
});

const tabDefs = [
  { key: 'maker', label: 'メーカー管理' },
  { key: 'brand', label: 'ブランド管理' },
  { key: 'category', label: 'カテゴリ管理' },
  { key: 'series', label: 'シリーズ管理' },
];

const activeKey = ref('maker');
const tabItems = computed(() => tabDefs.filter((x) => canAccessModule(x.key)));

watch(
  () => tabItems.value,
  (items) => {
    if (!items.length) return;
    if (!items.find((x) => x.key === activeKey.value)) {
      activeKey.value = items[0].key;
    }
  },
  { immediate: true, deep: true },
);

function canAccessModule(moduleKey) {
  if (!props.permissionReady) return true;
  const upper = moduleToUpperSnake(moduleKey);
  const readCode = `DATA_${upper}_READ`;
  const writeCode = `DATA_${upper}_WRITE`;
  return (props.permissionCodes || []).includes(readCode) || (props.permissionCodes || []).includes(writeCode);
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}
</script>
