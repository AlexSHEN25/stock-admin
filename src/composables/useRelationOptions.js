import { reactive } from 'vue';

export function useRelationOptions(options) {
  const {
    fetchModuleOptions,
    fetchCurrentUserCustomerPage,
    relationLabel,
    relationModuleByField,
    inputType,
    isReadonlyField,
    inlineField,
    mapNameFieldToIdField,
    currentUserId,
    isAdminUser,
  } = options;

  const queryRelationOptions = reactive({});
  const relationOptions = reactive({});
  const relationModuleOptionCache = reactive({});
  const relationModuleOptionPromise = reactive({});

  async function loadRelationOptions(formFields, tableKeys) {
    const explicitFields = (formFields || [])
      .filter((field) => inputType(field) === 'relation');
    const inlineFields = (tableKeys || [])
      .map((key) => inlineField(key))
      .filter((field) => !isReadonlyField(field) && inputType(field) === 'relation');
    const relatedFields = [...new Set([...explicitFields, ...inlineFields])];

    relatedFields.forEach((field) => {
      relationOptions[field] = [];
    });

    for (const field of relatedFields) {
      const targetModule = relationModuleByField(field);
      if (!targetModule) continue;
      try {
        relationOptions[field] = await getRelationModuleOptions(targetModule);
      } catch {
        relationOptions[field] = [];
      }
    }
  }

  async function loadQueryRelationOptions(queryFields) {
    (queryFields || []).forEach((field) => {
      queryRelationOptions[field] = [];
    });

    for (const field of queryFields || []) {
      const idField = mapNameFieldToIdField(field);
      const targetModule = relationModuleByField(idField || field);
      if (!targetModule) continue;
      try {
        queryRelationOptions[field] = await getRelationModuleOptions(targetModule);
      } catch {
        queryRelationOptions[field] = [];
      }
    }
  }

  async function getRelationModuleOptions(targetModule) {
    const cacheKey = relationOptionCacheKey(targetModule);
    if (relationModuleOptionCache[cacheKey]) {
      return relationModuleOptionCache[cacheKey];
    }

    if (!relationModuleOptionPromise[cacheKey]) {
      const loader = targetModule === 'customer' && typeof fetchCurrentUserCustomerPage === 'function'
        ? () => fetchCurrentUserCustomerPage(buildCustomerQueryParams())
        : () => fetchModuleOptions(targetModule);

      relationModuleOptionPromise[cacheKey] = loader()
        .then((list) => {
          const rows = Array.isArray(list)
            ? list
            : Array.isArray(list?.records)
              ? list.records
              : Array.isArray(list?.list)
                ? list.list
                : Array.isArray(list?.rows)
                  ? list.rows
                  : [];
          return dedupeOptions(rows.map((item) => ({
            label: relationOptionLabel(targetModule, item),
            value: item.id,
            raw: item,
          })));
        })
        .then((optionList) => {
          relationModuleOptionCache[cacheKey] = optionList;
          return optionList;
        })
        .finally(() => {
          relationModuleOptionPromise[cacheKey] = null;
        });
    }

    return relationModuleOptionPromise[cacheKey];
  }

  function relationOptionCacheKey(targetModule) {
    if (targetModule !== 'customer') return targetModule;
    if (isAdminUser?.value) return 'customer:all';
    return `customer:owner:${Number(currentUserId?.value) || 0}`;
  }

  function buildCustomerQueryParams() {
    if (!isAdminUser?.value && currentUserId?.value) {
      return {
        ownerUserId: Number(currentUserId.value),
      };
    }
    return {};
  }

  function dedupeOptions(optionList) {
    const list = Array.isArray(optionList) ? optionList : [];
    const seen = new Set();
    const output = [];
    for (const item of list) {
      if (!item) continue;
      const valueKey = item.value !== undefined && item.value !== null ? `v:${String(item.value)}` : '';
      const labelKey = item.label !== undefined && item.label !== null ? `l:${String(item.label)}` : '';
      const dedupeKey = valueKey || labelKey;
      if (!dedupeKey || seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      output.push(item);
    }
    return output;
  }

  function relationOptionLabel(targetModule, item) {
    if (targetModule === 'user') {
      const username = String(item?.username ?? item?.userName ?? '').trim();
      if (username) return username;
    }
    if (targetModule === 'customer') {
      return String(item?.name ?? '').trim();
    }
    return relationLabel(item);
  }

  function invalidateRelationModuleOptions(targetModules) {
    const modules = Array.isArray(targetModules) ? targetModules : [targetModules];
    modules.filter(Boolean).forEach((moduleKey) => {
      Object.keys(relationModuleOptionCache)
        .filter((key) => key === moduleKey || key.startsWith(`${moduleKey}:`))
        .forEach((key) => delete relationModuleOptionCache[key]);
      Object.keys(relationModuleOptionPromise)
        .filter((key) => key === moduleKey || key.startsWith(`${moduleKey}:`))
        .forEach((key) => delete relationModuleOptionPromise[key]);
    });
  }

  return {
    queryRelationOptions,
    relationOptions,
    loadRelationOptions,
    loadQueryRelationOptions,
    dedupeOptions,
    invalidateRelationModuleOptions,
  };
}
