<template>
  <a-layout class="layout-root">
    <a-layout-sider width="280" class="left-sider">
      <div class="logo">在庫管理</div>
      <a-menu
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
        <div></div>
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
import { onMounted, ref } from 'vue';
import ModuleTable from './ModuleTable.vue';
import { fetchSchemaMenu } from '../api/module';
import { MODULE_GROUPS, toMenuItems } from '../utils/module';

defineProps({
  darkMode: { type: Boolean, default: false },
});

defineEmits(['logout', 'toggle-theme']);

const menuItems = ref(toMenuItems());
const firstModule = MODULE_GROUPS[0].children[0].key;
const activeModule = ref(firstModule);
const selectedKeys = ref([firstModule]);
const openKeys = ref([MODULE_GROUPS[0].key]);
const nodeMap = ref(new Map());
const allowedModules = new Set(MODULE_GROUPS.flatMap((g) => g.children.map((c) => c.key)));

onMounted(async () => {
  await loadSchemaMenu();
});

async function loadSchemaMenu() {
  try {
    const menu = await fetchSchemaMenu();
    const source = Array.isArray(menu) ? menu : [];
    const mapped = source.length > 0 ? toSchemaMenuItems(source) : toMenuItems();
    menuItems.value = mapped.length > 0 ? mapped : toMenuItems();
    rebuildMap(menuItems.value);
    const firstLeaf = findFirstValidLeaf(menuItems.value);
    if (firstLeaf) {
      const mk = normalizeModuleKey(firstLeaf);
      if (isValidModule(mk)) activeModule.value = mk;
      selectedKeys.value = [firstLeaf];
    } else {
      activeModule.value = firstModule;
      selectedKeys.value = [firstModule];
    }
  } catch {
    const fallback = toMenuItems();
    menuItems.value = fallback;
    rebuildMap(fallback);
    activeModule.value = firstModule;
    selectedKeys.value = [firstModule];
  }
}

function toSchemaMenuItems(list) {
  const sorted = [...list].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));
  return sorted.map((item) => {
    const key = normalizePath(item.path, item.menuId);
    const children = Array.isArray(item.children) ? toSchemaMenuItems(item.children) : undefined;
    return {
      key,
      label: item.name || key,
      children: children && children.length > 0 ? children : undefined,
    };
  });
}

function normalizePath(path, id) {
  if (path && String(path).trim()) return String(path).replace(/^\//, '');
  return `menu_${id || Math.random()}`;
}

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

function findFirstValidLeaf(items) {
  for (const item of items) {
    if (item.children?.length) {
      const k = findFirstValidLeaf(item.children);
      if (k) return k;
    } else {
      const mk = normalizeModuleKey(item.key);
      if (isValidModule(mk)) return item.key;
    }
  }
  return null;
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
  selectedKeys.value = [key];
  if (keyPath?.[1]) openKeys.value = [keyPath[1]];
}

function isValidModule(moduleKey) {
  return Boolean(moduleKey) && allowedModules.has(moduleKey);
}
</script>
