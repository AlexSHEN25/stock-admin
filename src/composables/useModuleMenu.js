import { computed, ref, watch } from 'vue';
import { fetchCurrentUserCustomerPage } from '../api/module';
import { MODULE_GROUPS } from '../utils/module';
import { MODULE_LAYOUT_CONFIG } from '../utils/module-ui';

const HIDDEN_MODULES = MODULE_LAYOUT_CONFIG.hiddenModules;
const HIDDEN_MODULE_SET = new Set(HIDDEN_MODULES);
const HIDDEN_MODULE_CONFIG = MODULE_LAYOUT_CONFIG.hiddenModuleMap;
const SUPPRESSED_MODULES = new Set(['stockCustomerGoods']);
const DEFAULT_MODULE = MODULE_GROUPS[0]?.children?.[0]?.key || '';
const MODULE_KEY_ALIASES = {
  stockCustomer: 'stockCustomerGoods',
};
const REQUEST_CUSTOMER_PAGE_SIZE = 200;
const REQUEST_CHILDREN = [
  { key: 'deliverySchedule', label: '発送予定表' },
  { key: 'requestForm', label: '請求書' },
];

export function useModuleMenu(options) {
  const {
    menuCodes,
    permissionCodes,
    menuScopes,
    permissionReady,
    allDataWrite,
    currentGroupCode,
    currentUserId,
  } = options;

  const menuItems = ref([]);
  const activeModule = ref(DEFAULT_MODULE);
  const activeModuleContext = ref({});
  const activeLabel = ref(findLabelByKey(DEFAULT_MODULE));
  const selectedKeys = ref(DEFAULT_MODULE ? [DEFAULT_MODULE] : []);
  const openKeys = ref(MODULE_GROUPS[0] ? [MODULE_GROUPS[0].key] : []);
  const nodeMap = ref(new Map());
  const allowedModules = ref(new Set([...HIDDEN_MODULES]));
  const requestCustomers = ref([]);
  let menuInitSeq = 0;

  const hasMenus = computed(() => menuItems.value.length > 0);

  watch(
    () => [
      menuCodes?.value || [],
      permissionCodes?.value || [],
      menuScopes?.value || [],
      permissionReady?.value || false,
      allDataWrite?.value || false,
      currentUserId?.value || null,
    ],
    () => initMenus(),
    { immediate: true, deep: true },
  );

  watch(
    () => currentGroupCode?.value || '',
    () => {
      if (activeModule.value === 'stockGroup') {
        const key = resolveGroupStockModuleKey(currentGroupCode?.value);
        activeModule.value = key;
        selectedKeys.value = [key];
        activeLabel.value = findLabelByKey(key) || activeLabel.value;
      }
    },
  );

  function normalizeModuleKey(key) {
    const value = String(key || '');
    const parts = value.split('/').filter(Boolean);
    if (parts.length === 0) return '';
    const normalized = parts[parts.length - 1] === 'page' && parts.length > 1
      ? parts[parts.length - 2]
      : parts[parts.length - 1];
    return MODULE_KEY_ALIASES[normalized] || normalized;
  }

  function rebuildMap(items) {
    const map = new Map();
    walk(items, map);
    nodeMap.value = map;
  }

  function walk(items, map) {
    (Array.isArray(items) ? items : []).forEach((item) => {
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
    return Boolean(moduleKey) && (
      allowedModules.value.has(moduleKey)
      || HIDDEN_MODULE_SET.has(moduleKey)
    );
  }

  function onMenuClick({ key }) {
    const node = nodeMap.value.get(key);
    if (node?.children?.length) return;

    const moduleKey = normalizeModuleKey(key);
    if (!isValidModule(moduleKey)) return;

    activeModule.value = moduleKey;
    activeModuleContext.value = node?.meta || {};
    activeLabel.value = node?.label || findLabelByKey(key);
    selectedKeys.value = [key];
  }

  function onNavigateModule(moduleKey) {
    const payload = moduleKey && typeof moduleKey === 'object' ? moduleKey : { moduleKey };
    const target = normalizeModuleKey(payload.moduleKey);
    if (!isValidModule(target)) return;

    const hiddenConfig = HIDDEN_MODULE_CONFIG[target];
    const contextualKey = resolveContextualMenuKey(target, payload);
    const menuKey = contextualKey || (HIDDEN_MODULE_SET.has(target) ? (hiddenConfig?.parent || target) : target);
    const node = nodeMap.value.get(menuKey);
    activeModule.value = target;
    activeModuleContext.value = {
      ...(node?.meta || {}),
      ...(payload.fixedQueryParams ? { fixedQueryParams: payload.fixedQueryParams } : {}),
      ...(payload.customerId ? { customerId: payload.customerId } : {}),
      ...(payload.customerName ? { customerName: payload.customerName } : {}),
    };
    selectedKeys.value = [menuKey];
    activeLabel.value = node?.label || findLabelByKey(target);

    const ancestors = findAncestorKeys(menuItems.value, menuKey);
    if (ancestors.length > 0) openKeys.value = ancestors;
  }

  async function initMenus() {
    const seq = ++menuInitSeq;
    const scopeItems = normalizeMenuScopes(menuScopes?.value || []);
    const visibleScopeItems = scopeItems.filter((item) => (
      item.visible !== false
      && !SUPPRESSED_MODULES.has(item.key)
    ));
    const scopeKeySet = new Set(visibleScopeItems.map((item) => item.key));

    HIDDEN_MODULES.forEach((moduleKey) => scopeKeySet.add(moduleKey));
    if (allDataWrite?.value || isAdminMenuScope(scopeItems)) {
      MODULE_GROUPS.forEach((group) => {
        group.children.forEach((item) => scopeKeySet.add(item.key));
      });
    }
    if (scopeKeySet.has('requestForm') || scopeKeySet.has('requestItem') || scopeKeySet.has('deliverySchedule')) {
      scopeKeySet.add('deliverySchedule');
      scopeKeySet.add('requestForm');
    }
    if (scopeKeySet.has('stockGroupA') || scopeKeySet.has('stockGroupB') || scopeKeySet.has('stockGroupC')) {
      scopeKeySet.add('stockGroup');
    }
    allowedModules.value = scopeKeySet;

    const filtered = MODULE_GROUPS
      .map((group) => ({
        ...group,
        children: group.children.filter((item) => (
          allowedModules.value.has(item.key)
          && isVisibleScope(item.key, visibleScopeItems, group.key)
        )),
      }))
      .filter((group) => group.children.length > 0);

    if (hasRequestGroup(filtered)) {
      requestCustomers.value = await loadRequestCustomers();
      if (seq !== menuInitSeq) return;
    } else {
      requestCustomers.value = [];
    }

    const menuSource = filtered.length > 0
      ? filtered
      : [{
        key: 'fallback',
        label: 'メニュー',
        children: visibleScopeItems.map((item) => ({
          key: item.key,
          label: item.label || findLabelByKey(item.key) || item.key,
        })),
      }];

    const scopeMap = new Map(scopeItems.map((item) => [item.key, item]));
    menuItems.value = menuSource.map((group) => ({
      key: group.key,
      label: group.label,
      children: group.key === 'request'
        ? buildRequestCustomerMenu(group.children, scopeMap)
        : group.children.map((item) => ({
          key: item.key,
          label: resolveMenuLabel(scopeMap.get(item.key), item),
        })),
    }));

    rebuildMap(menuItems.value);
    ensureActiveModule();
  }

  function ensureActiveModule() {
    const first = findFirstLeaf(menuItems.value);
    if (!first) return;

    if (!allowedModules.value.has(activeModule.value)) {
      activeModule.value = normalizeModuleKey(first.key);
      activeModuleContext.value = first.meta || {};
      selectedKeys.value = [first.key];
      activeLabel.value = first.label || findLabelByKey(first.key);
      openKeys.value = findAncestorKeys(menuItems.value, first.key);
      return;
    }

    const selectedKey = selectedKeys.value[0] || activeModule.value;
    const selectedNode = nodeMap.value.get(selectedKey);
    if (!selectedNode) {
      activeModule.value = normalizeModuleKey(first.key);
      activeModuleContext.value = first.meta || {};
      selectedKeys.value = [first.key];
      activeLabel.value = first.label || findLabelByKey(first.key);
      openKeys.value = findAncestorKeys(menuItems.value, first.key);
      return;
    }
    activeModuleContext.value = selectedNode?.meta || {};
    activeLabel.value = selectedNode?.label || findLabelByKey(selectedKey);
  }

  function findFirstLeaf(items) {
    for (const item of Array.isArray(items) ? items : []) {
      if (!item?.children?.length) return item;
      const child = findFirstLeaf(item.children);
      if (child) return child;
    }
    return null;
  }

  function findAncestorKeys(items, targetKey, parents = []) {
    for (const item of Array.isArray(items) ? items : []) {
      if (item?.key === targetKey) return parents;
      if (item?.children?.length) {
        const hit = findAncestorKeys(item.children, targetKey, [...parents, item.key]);
        if (hit.length > 0 || item.children.some((child) => child.key === targetKey)) return hit;
      }
    }
    return [];
  }

  function normalizeMenuScopes(source) {
    return (Array.isArray(source) ? source : [])
      .map((item) => ({
        key: normalizeModuleKey(item?.key),
        label: String(item?.label || '').trim(),
        visible: item?.visible !== false,
      }))
      .filter((item) => item.key);
  }

  function resolveGroupStockModuleKey(groupCode) {
    const code = String(groupCode || '').trim().toUpperCase();
    if (code === 'B') return 'stockGroupB';
    if (code === 'C') return 'stockGroupC';
    return 'stockGroupA';
  }

  function resolveContextualMenuKey(target, payload) {
    if (!payload?.customerId) return '';
    const key = `request/customer/${payload.customerId}/${target}`;
    return nodeMap.value.has(key) ? key : '';
  }

  function hasRequestGroup(groups) {
    return (Array.isArray(groups) ? groups : []).some((group) => group.key === 'request');
  }

  async function loadRequestCustomers() {
    try {
      const params = {
        pageNum: 1,
        pageSize: REQUEST_CUSTOMER_PAGE_SIZE,
      };
      if (currentUserId?.value && !allDataWrite?.value) {
        params.ownerUserId = Number(currentUserId.value);
      }
      const page = await fetchCurrentUserCustomerPage(params);
      const records = Array.isArray(page?.records) ? page.records : [];
      return records
        .map((item) => ({
          id: item?.id ?? item?.customerId,
          name: String(item?.name ?? item?.customerName ?? item?.customerCode ?? '').trim(),
        }))
        .filter((item) => item.id !== undefined && item.id !== null && item.name);
    } catch {
      return [];
    }
  }

  function buildRequestCustomerMenu(children, scopeMap) {
    const allowedRequestChildren = REQUEST_CHILDREN.filter((item) => (
      allowedModules.value.has(item.key)
      && children.some((child) => child.key === item.key)
    ));
    if (allowedRequestChildren.length === 0) return [];

    if (requestCustomers.value.length === 0) {
      return allowedRequestChildren.map((item) => ({
        key: item.key,
        label: resolveMenuLabel(scopeMap.get(item.key), item),
      }));
    }

    return requestCustomers.value.map((customer) => {
      const customerKey = `request/customer/${customer.id}`;
      return {
        key: customerKey,
        label: customer.name,
        children: allowedRequestChildren.map((item) => ({
          key: `${customerKey}/${item.key}`,
          label: item.label,
          meta: {
            fixedQueryParams: {
              customerId: customer.id,
            },
            customerId: customer.id,
            customerName: customer.name,
          },
        })),
      };
    });
  }

  function isVisibleScope(key, scopeItems) {
    const hit = (Array.isArray(scopeItems) ? scopeItems : []).find((item) => item.key === key);
    if (hit) return hit.visible !== false;
    return true;
  }

  function isAdminMenuScope(scopeItems) {
    return (Array.isArray(scopeItems) ? scopeItems : []).some((item) => {
      const key = String(item?.key || '').toLowerCase();
      const label = String(item?.label || '').toUpperCase();
      return key.includes('admin')
        || key.includes('super')
        || label.includes('ADMIN')
        || label.includes('SUPER');
    });
  }

  function resolveMenuLabel(scope, item) {
    const localLabel = String(item?.label || '').trim();
    if (localLabel) return localLabel;
    const label = String(scope?.label || '').trim();
    if (!label || hasDanglingMenuLabelSeparator(label)) {
      return item.label;
    }
    return label;
  }

  function hasDanglingMenuLabelSeparator(label) {
    return /[-]\s*$/.test(String(label || ''));
  }

  return {
    menuItems,
    hasMenus,
    activeModule,
    activeModuleContext,
    activeLabel,
    selectedKeys,
    openKeys,
    onMenuClick,
    onNavigateModule,
  };
}
