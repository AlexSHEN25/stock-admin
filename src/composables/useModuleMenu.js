import { computed, ref, watch } from 'vue';
import { MODULE_GROUPS } from '../utils/module';
import { MODULE_LAYOUT_CONFIG, isAdminByPermissionCodes } from '../utils/module-ui';

const HIDDEN_MODULES = MODULE_LAYOUT_CONFIG.hiddenModules;
const HIDDEN_MODULE_CONFIG = MODULE_LAYOUT_CONFIG.hiddenModuleMap;
const MODULE_PERMISSION_ALIASES = MODULE_LAYOUT_CONFIG.permissionAliases;
const ALL_MODULES = MODULE_GROUPS.flatMap((group) => group.children.map((child) => child.key));
const DEFAULT_MODULE = MODULE_GROUPS[0]?.children?.[0]?.key || '';

export function useModuleMenu(options) {
  const {
    menuCodes,
    permissionCodes,
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
    const menuKey = hiddenConfig?.parent || target;
    activeModule.value = target;
    selectedKeys.value = [menuKey];
    activeLabel.value = findLabelByKey(target);

    const parent = MODULE_GROUPS.find((group) => group.children.some((child) => child.key === menuKey));
    if (parent) {
      openKeys.value = [parent.key];
    }
  }

  function initMenus() {
    const allowed = buildAllowedModulesByCodes();
    const mergedAllowed = allowed.size > 0 ? allowed : new Set(ALL_MODULES);
    HIDDEN_MODULES.forEach((moduleKey) => mergedAllowed.add(moduleKey));
    allowedModules.value = mergedAllowed;

    let filtered = MODULE_GROUPS
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => allowedModules.value.has(item.key)),
      }))
      .filter((group) => group.children.length > 0);

    // Safety fallback: never leave UI without visible modules after login.
    if (filtered.length === 0) {
      filtered = MODULE_GROUPS.map((group) => ({
        ...group,
        children: [...group.children],
      }));
      allowedModules.value = new Set([...ALL_MODULES, ...HIDDEN_MODULES]);
    }

    menuItems.value = filtered.map((group) => ({
      key: group.key,
      label: group.label,
      children: group.children.map((item) => ({ key: item.key, label: item.label })),
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

  function buildAllowedModulesByCodes() {
    if (!permissionReady?.value) {
      return new Set(ALL_MODULES);
    }

    const allowedMenuCodes = new Set(
      (menuCodes?.value || [])
        .map((item) => String(item || '').trim())
        .filter(Boolean),
    );
    const allowedPermissionCodes = new Set(
      (permissionCodes?.value || [])
        .map((item) => String(item || '').trim())
        .filter(Boolean),
    );
    if (isAdminByPermissionCodes([...allowedPermissionCodes])) {
      return new Set(ALL_MODULES);
    }
    const hasMenuScope = allowedMenuCodes.size > 0;
    const allowed = new Set();

    ALL_MODULES.forEach((moduleKey) => {
      const aliases = MODULE_PERMISSION_ALIASES[moduleKey] || [moduleToUpperSnake(moduleKey)];
      const hasMenu = hasMenuScope
        ? aliases.some((alias) => allowedMenuCodes.has(`MENU_${alias}`))
        : true;
      const hasData = aliases.some((alias) => (
        allowedPermissionCodes.has(`DATA_${alias}_READ`) ||
        allowedPermissionCodes.has(`DATA_${alias}_WRITE`)
      ));

      // Visibility and data access are separated:
      // - MENU_* controls whether module appears in navigation
      // - DATA_* controls operation ability inside module
      if (hasMenuScope ? hasMenu : hasData) {
        allowed.add(moduleKey);
      }
    });

    // Global fallback: never return empty set, avoid blank menu after login
    // when backend permission code format is temporarily inconsistent.
    if (allowed.size === 0 && !hasMenuScope && allowedPermissionCodes.size === 0) {
      return new Set(ALL_MODULES);
    }

    return allowed;
  }

  function moduleToUpperSnake(moduleKey) {
    return String(moduleKey || '')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
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
