<template>
  <a-layout class="layout-root">
    <a-layout-sider v-if="hasMenus" width="280" class="left-sider">
      <div class="logo">{{ navText.logo }}</div>
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
        <a-space class="top-header-tools" :size="12">
          <a-select
            :value="currentLang"
            class="lang-switch"
            :options="langOptions"
            @change="(v) => $emit('change-lang', v)"
          />
          <a-switch
            :checked="darkMode"
            :checked-children="navText.themeDark"
            :un-checked-children="navText.themeLight"
            @change="(v) => $emit('toggle-theme', v)"
          />
          <div class="user-badge">
            <span class="user-badge-name">{{ currentUser || '-' }}</span>
          </div>
          <a-button type="link" @click="$emit('logout')">{{ navText.logout }}</a-button>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content-wrap">
        <module-table :moduleKey="activeModule" :permissionCodes="permissionCodes" :permissionReady="permissionReady" :currentLang="currentLang" />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import ModuleTable from './ModuleTable.vue';
import { MODULE_GROUPS, getLocalizedModuleGroups } from '../utils/module';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  menuCodes: { type: Array, default: () => [] },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentLang: { type: String, default: 'ja-JP' },
  currentUser: { type: String, default: '' },
});

defineEmits(['logout', 'toggle-theme', 'change-lang']);

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
const langOptions = [
  { label: '日本語', value: 'ja-JP' },
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
];
const NAV_I18N = {
  ja: { logo: '在庫管理', themeDark: '黒', themeLight: '白', logout: 'ログアウト' },
  zh: { logo: '库存管理', themeDark: '暗', themeLight: '亮', logout: '退出登录' },
  en: { logo: 'Inventory', themeDark: 'Dark', themeLight: 'Light', logout: 'Logout' },
};
const navText = computed(() => {
  const low = String(props.currentLang || '').toLowerCase();
  const locale = low.startsWith('zh') ? 'zh' : low.startsWith('en') ? 'en' : 'ja';
  return NAV_I18N[locale];
});

watch(
  () => [props.menuCodes, props.permissionCodes, props.permissionReady, props.currentLang],
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
  const localized = getLocalizedModuleGroups(props.currentLang);
  for (const group of localized) {
    const hit = group.children.find((item) => item.key === key);
    if (hit) return hit.label;
  }
  return '';
}

async function initMenus() {
  const allowed = buildAllowedModulesByCodes();
  allowedModules.value = allowed.size > 0 ? allowed : new Set(allModules);

  const localized = getLocalizedModuleGroups(props.currentLang);
  const filtered = localized.map((group) => ({
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
    if (moduleKey === 'goods') {
      const menuCandidates = ['GOODS_MANAGEMENT', 'GOODS_BUNDLE'];
      const dataCandidates = ['GOODS_MANAGEMENT', 'GOODS_BUNDLE'];
      const hasMenu = menuCandidates.some((x) => menuCodes.has(`MENU_${x}`));
      const hasData = dataCandidates.some((x) => permCodes.has(`DATA_${x}_READ`) || permCodes.has(`DATA_${x}_WRITE`));
      if (hasMenu && hasData) allowed.add(moduleKey);
      return;
    }

    const upper = moduleToUpperSnake(moduleKey);
    const menuCode = `MENU_${upper}`;
    const readCode = `DATA_${upper}_READ`;
    const writeCode = `DATA_${upper}_WRITE`;
    const hasMenu = menuCodes.has(menuCode);
    const hasData = permCodes.has(readCode) || permCodes.has(writeCode);
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
