import { computed, ref, watch } from 'vue';
import { MODULE_GROUPS } from '../utils/module';
import { MODULE_LAYOUT_CONFIG } from '../utils/module-ui';

const HIDDEN_MODULES = MODULE_LAYOUT_CONFIG.hiddenModules;
const HIDDEN_MODULE_SET = new Set(HIDDEN_MODULES);
const HIDDEN_MODULE_CONFIG = MODULE_LAYOUT_CONFIG.hiddenModuleMap;
const ALL_MODULES = MODULE_GROUPS.flatMap((group) => group.children.map((child) => child.key));
const DEFAULT_MODULE = MODULE_GROUPS[0]?.children?.[0]?.key || '';

export function useModuleMenu(options) {
  const {
    menuCodes,
    permissionCodes,
    menuScopes,
    permissionReady,
  } = options;

  const menuItems = ref([]);
  const activeModule = ref(DEFAULT_MODULE);
  const activeLabel = ref(findLabelByKey(DEFAULT_MODULE));
  const selectedKeys = ref(DEFAULT_MODULE ? [DEFAULT_MODULE] : []);
  const openKeys = ref(MODULE_GROUPS[0] ? [MODULE_GROUPS[0].key] : []);
  const nodeMap = ref(new Map());
  const allowedModules = ref(new Set([...ALL_MODULES, ...HIDDEN_MODULES]));

  const hasMenus = computed(() => menuItems.value.length > 0);

  watch(
    () => [
      menuCodes?.value || [],
      permissionCodes?.value || [],
      menuScopes?.value || [],
      permissionReady?.value || false,
    ],
    () => initMenus(),
    { immediate: true, deep: true },
  );

  function normalizeModuleKey(key) {
    const value = String(key || '');
    const parts = value.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts[parts.length - 1] === 'page' && parts.length > 1) {
      return parts[parts.length - 2];
    }
    return parts[parts.length - 1];
  }

  function rebuildMap(items) {
    const map = new Map();
    walk(items, map);
    nodeMap.value = map;
  }

  function walk(items, map) {
    items.forEach((item) => {
      map.set(item.key, item);
      if (item.children?.length) {
        walk(item.children, map);
      }
    });
  }

  function findLabelByKey(key) {
    if (HIDDEN_MODULE_CONFIG[key]?.label) return HIDDEN_MODULE_CONFIG[key].label;
    for (const group of MODULE_GROUPS) {
      const hit = group.children.find((item) => item.key === key);
      if (hit) return hit.label;
    }
    return '';
  }

  function isValidModule(moduleKey) {
    return Boolean(moduleKey) && allowedModules.value.has(moduleKey);
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
    const menuKey = HIDDEN_MODULE_SET.has(target) ? (hiddenConfig?.parent || target) : target;
    activeModule.value = target;
    selectedKeys.value = [menuKey];
    activeLabel.value = findLabelByKey(target);

    const parent = MODULE_GROUPS.find((group) => group.children.some((child) => child.key === menuKey));
    if (parent) {
      openKeys.value = [parent.key];
    }
  }

  function initMenus() {
    const scopeItems = normalizeMenuScopes(menuScopes?.value || []);
    const mergedAllowed = new Set(ALL_MODULES);
    HIDDEN_MODULES.forEach((moduleKey) => mergedAllowed.add(moduleKey));
    allowedModules.value = mergedAllowed;

    const filtered = MODULE_GROUPS
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => allowedModules.value.has(item.key) || scopeItems.some((scope) => expandModuleKey(scope.key).includes(item.key))),
      }))
      .filter((group) => group.children.length > 0);

    const scopeMap = new Map(scopeItems.map((item) => [item.key, item]));
    menuItems.value = filtered.map((group) => ({
      key: group.key,
      label: group.label,
      children: group.children.map((item) => ({
        key: item.key,
        label: resolveMenuLabel(scopeMap.get(item.key), item),
      })),
    }));

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

  function normalizeMenuScopes(source) {
    return (Array.isArray(source) ? source : [])
      .map((item) => ({
        key: normalizeModuleKey(item?.key),
        label: String(item?.label || '').trim(),
      }))
      .filter((item) => item.key);
  }

  function resolveMenuLabel(scope, item) {
    if (item?.label) return item.label;
    const label = String(scope?.label || '').trim();
    if (!label || hasDanglingMenuLabelSeparator(label)) {
      return item.label;
    }
    return label;
  }

  function hasDanglingMenuLabelSeparator(label) {
    return /[-－ー]\s*$/.test(String(label || ''));
  }

  function expandModuleKey(key) {
    if (key === 'stock') return ['stockSelf', 'stockHandle'];
    return [key];
  }

  return {
    menuItems,
    hasMenus,
    activeModule,
    activeLabel,
    selectedKeys,
    openKeys,
    onMenuClick,
    onNavigateModule,
  };
}
