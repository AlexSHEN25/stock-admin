import { reactive } from 'vue';

export function useRelationOptions(options) {
  const {
    fetchModuleOptions,
    relationLabel,
    relationModuleByField,
    inputType,
    isReadonlyField,
    inlineField,
    mapNameFieldToIdField,
  } = options;

  const queryRelationOptions = reactive({});
  const relationOptions = reactive({});
  const relationModuleOptionCache = reactive({});
  const relationModuleOptionPromise = reactive({});

  async function loadRelationOptions(formFields, tableKeys) {
    const relatedFields = [...new Set([...(formFields || []), ...((tableKeys || []).map((key) => inlineField(key)))])]
      .filter((field) => !isReadonlyField(field) && inputType(field) === 'relation');

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
    if (relationModuleOptionCache[targetModule]) {
      return relationModuleOptionCache[targetModule];
    }

    if (!relationModuleOptionPromise[targetModule]) {
      relationModuleOptionPromise[targetModule] = fetchModuleOptions(targetModule)
        .then((list) => dedupeOptions((list || []).map((item) => ({
          label: relationOptionLabel(targetModule, item),
          value: item.id,
        }))))
        .then((optionList) => {
          relationModuleOptionCache[targetModule] = optionList;
          return optionList;
        })
        .finally(() => {
          relationModuleOptionPromise[targetModule] = null;
        });
    }

    return relationModuleOptionPromise[targetModule];
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
    return relationLabel(item);
  }

  function invalidateRelationModuleOptions(targetModules) {
    const modules = Array.isArray(targetModules) ? targetModules : [targetModules];
    modules.filter(Boolean).forEach((moduleKey) => {
      delete relationModuleOptionCache[moduleKey];
      delete relationModuleOptionPromise[moduleKey];
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
