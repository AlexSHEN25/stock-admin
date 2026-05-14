<template>
  <a-layout class="layout-root">
    <a-layout-sider v-if="hasMenus" width="280" class="left-sider">
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
        <goods-meta-panel v-if="activeModule === 'goodsMeta'" :permissionCodes="permissionCodes" :permissionReady="permissionReady" />
        <module-table v-else :moduleKey="activeModule" :permissionCodes="permissionCodes" :permissionReady="permissionReady" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue';
import ModuleTable from './ModuleTable.vue';
import GoodsMetaPanel from './GoodsMetaPanel.vue';
import { MODULE_GROUPS } from '../utils/module';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  menuCodes: { type: Array, default: () => [] },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
});

defineEmits(['logout', 'toggle-theme']);

const menuItems = ref([]);
const hasMenus = ref(false);
const firstModule = MODULE_GROUPS[0].children[0].key;
const activeModule = ref(firstModule);
const activeLabel = ref(findLabelByKey(firstModule));
const selectedKeys = ref([firstModule]);
const openKeys = ref([MODULE_GROUPS[0].key]);
const nodeMap = ref(new Map());
const allModules = MODULE_GROUPS.flatMap((g) => g.children.map((c) => c.key));
const allowedModules = ref(new Set(allModules));

watch(
  () => [props.menuCodes, props.permissionCodes, props.permissionReady],
  () => initMenus(),
  { immediate: true, deep: true },
);

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

function onMenuClick({ key }) {
  const node = nodeMap.value.get(key);
  if (node?.children?.length) return;
  const moduleKey = normalizeModuleKey(key);
  if (!isValidModule(moduleKey)) return;
  activeModule.value = moduleKey;
  activeLabel.value = findLabelByKey(key);
  selectedKeys.value = [key];
}

function isValidModule(moduleKey) {
  return Boolean(moduleKey) && allowedModules.value.has(moduleKey);
}

function findLabelByKey(key) {
  for (const group of MODULE_GROUPS) {
    const hit = group.children.find((item) => item.key === key);
    if (hit) return hit.label;
  }
  return '';
}

async function initMenus() {
  const allowed = buildAllowedModulesByCodes();
  allowedModules.value = allowed.size > 0 ? allowed : new Set(allModules);

  const filtered = MODULE_GROUPS.map((group) => ({
    ...group,
    children: group.children.filter((item) => allowedModules.value.has(item.key)),
  })).filter((group) => group.children.length > 0);

  menuItems.value = filtered.map((group) => ({
    key: group.key,
    label: group.label,
    children: group.children.map((item) => ({ key: item.key, label: item.label })),
  }));
  hasMenus.value = menuItems.value.length > 0;

  rebuildMap(menuItems.value);
  ensureActiveModule();
}

function ensureActiveModule() {
  const first = menuItems.value[0]?.children?.[0];
  if (!first) return;
  if (!allowedModules.value.has(activeModule.value)) {
    activeModule.value = first.key;
    selectedKeys.value = [first.key];
    activeLabel.value = first.label || findLabelByKey(first.key);
    openKeys.value = [menuItems.value[0].key];
  }
}

function buildAllowedModulesByCodes() {
  if (!props.permissionReady) return new Set(allModules);

  const menuCodes = new Set((props.menuCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const permCodes = new Set((props.permissionCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const allowed = new Set();

  allModules.forEach((moduleKey) => {
    const targets = menuTargets(moduleKey);
    const hasAny = targets.some((target) => {
      const upper = moduleToUpperSnake(target);
      const menuCode = `MENU_${upper}`;
      const readCode = `DATA_${upper}_READ`;
      const writeCode = `DATA_${upper}_WRITE`;
      return menuCodes.has(menuCode) && (permCodes.has(readCode) || permCodes.has(writeCode));
    });
    if (hasAny) allowed.add(moduleKey);
  });

  return allowed;
}

function menuTargets(moduleKey) {
  if (moduleKey === 'goodsMeta') return ['maker', 'brand', 'category', 'series'];
  return [moduleKey];
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}
</script>
