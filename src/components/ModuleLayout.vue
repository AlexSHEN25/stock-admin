<template>
  <a-layout class="layout-root">
    <a-layout-sider width="280" class="left-sider">
      <div class="logo">在庫管理</div>
      <a-menu
        class="left-menu"
        mode="inline"
        :items="menuItems"
        :selectedKeys="selectedKeys"
        :openKeys="openKeys"
        @click="onMenuClick"
        @openChange="(keys) => (openKeys = keys)"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="top-header">
        <div class="top-header-title">{{ activeLabel }}</div>
        <a-space>
          <a-switch :checked="darkMode" checked-children="黒" un-checked-children="白" @change="(v) => $emit('toggle-theme', v)" />
          <a-button type="link" @click="$emit('logout')">ログアウト</a-button>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content-wrap">
        <module-table :moduleKey="activeModule" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref } from 'vue';
import ModuleTable from './ModuleTable.vue';
import { MODULE_GROUPS, toMenuItems } from '../utils/module';

defineProps({
  darkMode: { type: Boolean, default: false },
});

defineEmits(['logout', 'toggle-theme']);

const menuItems = ref(toMenuItems());
const firstModule = MODULE_GROUPS[0].children[0].key;
const activeModule = ref(firstModule);
const activeLabel = ref(findLabelByKey(firstModule));
const selectedKeys = ref([firstModule]);
const openKeys = ref([MODULE_GROUPS[0].key]);
const nodeMap = ref(new Map());
const allowedModules = new Set(MODULE_GROUPS.flatMap((g) => g.children.map((c) => c.key)));

rebuildMap(menuItems.value);

function rebuildMap(items) {
  const m = new Map();
  walk(items, m);
  nodeMap.value = m;
}

function walk(items, map) {
  items.forEach((item) => {
    map.set(item.key, item);
    if (item.children?.length) walk(item.children, map);
  });
}

function normalizeModuleKey(key) {
  const val = String(key || '');
  const parts = val.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts[parts.length - 1] === 'page' && parts.length > 1) {
    return parts[parts.length - 2];
  }
  return parts[parts.length - 1];
}

function onMenuClick({ key, keyPath }) {
  const node = nodeMap.value.get(key);
  if (node?.children?.length) return;
  const moduleKey = normalizeModuleKey(key);
  if (!isValidModule(moduleKey)) return;
  activeModule.value = moduleKey;
  activeLabel.value = findLabelByKey(key);
  selectedKeys.value = [key];
}

function isValidModule(moduleKey) {
  return Boolean(moduleKey) && allowedModules.has(moduleKey);
}

function findLabelByKey(key) {
  for (const group of MODULE_GROUPS) {
    const hit = group.children.find((item) => item.key === key);
    if (hit) return hit.label;
  }
  return '';
}
</script>
