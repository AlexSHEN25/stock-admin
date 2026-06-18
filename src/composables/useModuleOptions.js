import { reactive } from 'vue';

export function useModuleOptions(options) {
  const {
    moduleKey,
    isGoodsManagement,
    queryFields,
    formKeys,
    keys,
    relationOptions,
    queryRelationOptions,
    fetchEnumOptions,
    fetchGoodsFormOptions,
    fetchModuleFormOptions,
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

  async function loadGoodsFormOptions() {
    if (!isGoodsManagement.value) return;
    const data = await fetchGoodsFormOptions();
    applyGoodsOptionList('brandId', data?.brandOptions);
    applyGoodsOptionList('seriesId', data?.seriesOptions);
    applyGoodsOptionList('categoryId', data?.categoryOptions);
    applyGoodsOptionList('makerId', data?.makerOptions);
    applyGoodsOptionList('status', data?.statusOptions);
    applyGoodsOptionList('currency', data?.currencyOptions);
  }

  async function loadRelationFormOptions() {
    const optionFields = relationFormOptionFields(moduleKey.value);
    if (optionFields.length === 0 || typeof fetchModuleFormOptions !== 'function') return;
    const data = await fetchModuleFormOptions(moduleKey.value);
    optionFields.forEach(({ field, sourceKey }) => {
      applyGoodsOptionList(field, data?.[sourceKey]);
    });
  }

  function relationFormOptionFields(key) {
    if (key === 'brand') {
      return [
        { field: 'seriesIds', sourceKey: 'seriesOptions' },
        { field: 'makerIds', sourceKey: 'makerOptions' },
      ];
    }
    if (key === 'series' || key === 'maker') {
      return [{ field: 'brandIds', sourceKey: 'brandOptions' }];
    }
    return [];
  }

  function applyGoodsOptionList(field, source) {
    const mapped = (Array.isArray(source) ? source : [])
      .map((item) => {
        const value = item?.value ?? item?.id ?? item?.code;
        const label = item?.label ?? item?.name ?? item?.text;
        if (value === undefined || value === null || label === undefined || label === null) return null;
        return { value, label: String(label) };
      })
      .filter(Boolean);
    if (mapped.length === 0) return;
    if (['brandId', 'brandIds', 'seriesId', 'seriesIds', 'categoryId', 'makerId', 'makerIds'].includes(field)) {
      relationOptions[field] = mapped;
      queryRelationOptions[field] = mapped;
      return;
    }
    dynamicEnumOptions[field] = mapped;
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
    loadGoodsFormOptions,
    loadRelationFormOptions,
    loadSourceOrderOptions,
  };
}
