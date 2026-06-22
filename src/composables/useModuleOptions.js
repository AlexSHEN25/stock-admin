import { reactive } from 'vue';

export function useModuleOptions(options) {
  const {
    moduleKey,
    queryFields,
    formKeys,
    keys,
    relationOptions,
    fetchEnumOptions,
    fetchOutboundStockOrderOptions,
    enumOptionsForField,
    selectOptionsForField,
    dedupeOptions,
    relationLabel,
  } = options;

  const dynamicEnumOptions = reactive({});

  function enumKeyByField(field) {
    const low = String(field || '').toLowerCase();
    if (low === 'status') return 'status';
    if (moduleKey.value === 'permission' && low === 'type') return 'permissionType';
    return '';
  }

  async function loadDynamicEnumOptions() {
    clearObject(dynamicEnumOptions);
    const fields = [...new Set([...(queryFields.value || []), ...(formKeys.value || []), ...(keys.value || [])])];
    const targets = fields
      .map((field) => ({ field, enumKey: enumKeyByField(field) }))
      .filter((item) => item.enumKey);
    await Promise.all(targets.map(async ({ field, enumKey }) => {
      try {
        dynamicEnumOptions[field] = await fetchEnumOptions(enumKey);
      } catch (_e) {
        dynamicEnumOptions[field] = [];
      }
    }));
  }

  function mergedEnumOptions(field) {
    const dynamic = dedupeOptions(dynamicEnumOptions[field] || []);
    if (dynamic.length > 0) return dynamic;
    return dedupeOptions(enumOptionsForField(field));
  }

  function selectOptionsMerged(field) {
    const dynamic = dedupeOptions(dynamicEnumOptions[field] || []);
    if (dynamic.length > 0) return dynamic;
    return selectOptionsForField(field);
  }

  function hasEnumOptionsMerged(field) {
    return mergedEnumOptions(field).length > 0;
  }

  async function loadSourceOrderOptions() {
    if (moduleKey.value !== 'requestForm') return;
    try {
      const list = await fetchOutboundStockOrderOptions();
      relationOptions.sourceOrderId = dedupeOptions((list || []).map((item) => ({
        label: relationLabel(item),
        value: item.id,
      })));
    } catch {
      relationOptions.sourceOrderId = [];
    }
  }

  function clearObject(target) {
    Object.keys(target).forEach((key) => delete target[key]);
  }

  return {
    dynamicEnumOptions,
    loadDynamicEnumOptions,
    mergedEnumOptions,
    selectOptionsMerged,
    hasEnumOptionsMerged,
    loadSourceOrderOptions,
  };
}
