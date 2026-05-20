<template>
  <a-layout class="layout-root">
    <a-layout-sider
      v-if="hasMenus"
      width="280"
      class="left-sider"
    >
      <div class="logo">
        在庫管理
      </div>
      <a-menu
        class="left-menu"
        mode="inline"
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="onMenuClick"
        @open-change="(keys) => (openKeys = keys)"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="top-header">
        <div class="top-header-title">
          {{ activeLabel }}
        </div>
        <a-space
          class="top-header-tools"
          :size="12"
        >
          <a-switch
            :checked="darkMode"
            checked-children="夜"
            un-checked-children="昼"
            @change="(v) => $emit('toggle-theme', v)"
          />
          <div class="user-badge">
            <span class="user-badge-name">{{ currentUser || '-' }}</span>
          </div>
          <a-button
            type="link"
            @click="$emit('logout')"
          >
            ログアウト
          </a-button>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content-wrap">
        <module-table
          :module-key="activeModule"
          :permission-codes="permissionCodes"
          :permission-ready="permissionReady"
          @navigate-module="onNavigateModule"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, watch } from 'vue';
import ModuleTable from './ModuleTable.vue';
import { MODULE_GROUPS } from '../utils/module';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  menuCodes: { type: Array, default: () => [] },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
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
const HIDDEN_MODULES = ['stockOrderItem'];
const HIDDEN_MODULE_CONFIG = {
  stockOrderItem: { parent: 'stockOrder', label: '入出庫明細' },
};
const MODULE_PERMISSION_ALIASES = {
  goods: ['GOODS_MANAGEMENT', 'GOODS_BUNDLE'],
};
const allModules = MODULE_GROUPS.flatMap((g) => g.children.map((c) => c.key));
const allowedModules = ref(new Set([...allModules, ...HIDDEN_MODULES]));

watch(
  () => [props.menuCodes, props.permissionCodes, props.permissionReady],
  () => initMenus(),
  { immediate: true, deep: true },
);

function rebuildMap(items) {
  const map = new Map();
  walk(items, map);
  nodeMap.value = map;
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

function onNavigateModule(moduleKey) {
  const target = normalizeModuleKey(moduleKey);
  if (!isValidModule(target)) return;
  const hiddenConfig = HIDDEN_MODULE_CONFIG[target];
  const menuKey = hiddenConfig?.parent || target;
  activeModule.value = target;
  selectedKeys.value = [menuKey];
  activeLabel.value = findLabelByKey(target);
  const parent = MODULE_GROUPS.find((g) => g.children.some((c) => c.key === menuKey));
  if (parent) {
    openKeys.value = [parent.key];
  }
}

function isValidModule(moduleKey) {
  return Boolean(moduleKey) && allowedModules.value.has(moduleKey);
}

function findLabelByKey(key) {
  if (HIDDEN_MODULE_CONFIG[key]?.label) return HIDDEN_MODULE_CONFIG[key].label;
  for (const group of MODULE_GROUPS) {
    const hit = group.children.find((item) => item.key === key);
    if (hit) return hit.label;
  }
  return '';
}

function initMenus() {
  const allowed = buildAllowedModulesByCodes();
  const mergedAllowed = allowed.size > 0 ? allowed : new Set(allModules);
  HIDDEN_MODULES.forEach((m) => mergedAllowed.add(m));
  allowedModules.value = mergedAllowed;

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
    return;
  }

  activeLabel.value = findLabelByKey(selectedKeys.value[0] || activeModule.value);
}

function buildAllowedModulesByCodes() {
  if (!props.permissionReady) return new Set(allModules);

  const menuCodes = new Set((props.menuCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const permCodes = new Set((props.permissionCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const allowed = new Set();

  allModules.forEach((moduleKey) => {
    const aliases = MODULE_PERMISSION_ALIASES[moduleKey] || [moduleToUpperSnake(moduleKey)];
    const hasMenu = aliases.some((x) => menuCodes.has(`MENU_${x}`));
    const hasData = aliases.some((x) => permCodes.has(`DATA_${x}_READ`) || permCodes.has(`DATA_${x}_WRITE`));
    if (hasMenu && hasData) allowed.add(moduleKey);
  });

  return allowed;
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}
</script>
