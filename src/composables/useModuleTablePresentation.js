import { computed } from 'vue';

export function useModuleTablePresentation(options) {
  const {
    moduleKey,
    pagination,
    formatTime,
    mergedEnumOptions,
  } = options;

  const rowAutoKeyMap = new WeakMap();
  let rowAutoKeySeed = 0;

  const tablePagination = computed(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
  }));

  function formatBizDate(record) {
    const raw = record?.bizDate;
    if (!raw) return '-';
    const text = formatTime(raw);
    const orderType = Number(record?.orderType);
    if (orderType === 1) return `納品日: ${text}`;
    if (orderType === 2) return `出荷日: ${text}`;
    return text;
  }

  function enumLabelMerged(field, value) {
    const hit = mergedEnumOptions(field).find((item) => Number(item.value) === Number(value));
    return normalizeDisplayLabel(hit?.label || value || '-');
  }

  function getRecordId(record) {
    if (moduleKey.value === 'goods') {
      return record?.skuId ?? record?.id ?? record?._id ?? null;
    }
    return record?.id ?? record?._id ?? record?.skuId ?? null;
  }

  function isPermissionNamesField(field) {
    const low = String(field || '').toLowerCase();
    return low === 'permissionname' || low === 'permissionnames';
  }

  function permissionNameList(record) {
    const raw = String(record?.permissionNames || record?.permissionName || '').trim();
    if (!raw) return [];
    return raw
      .split(/[\n,，、]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getRowKey(record) {
    const primaryId = getRecordId(record);
    const secondaryParts = [
      record?.stockId,
      record?.goodsId,
      record?.skuCode,
      record?.warehouseId,
      record?.orderId,
      record?.requestId,
    ].filter((value) => value !== undefined && value !== null && String(value) !== '');

    const base = (() => {
      if (primaryId !== null && primaryId !== undefined && String(primaryId) !== '') {
        if (secondaryParts.length > 0) return `${primaryId}:${secondaryParts.join(':')}`;
        return String(primaryId);
      }
      if (secondaryParts.length > 0) return secondaryParts.join(':');
      return `row:${moduleKey.value}`;
    })();

    if (!rowAutoKeyMap.has(record)) {
      rowAutoKeySeed += 1;
      rowAutoKeyMap.set(record, rowAutoKeySeed);
    }
    return `${base}#${rowAutoKeyMap.get(record)}`;
  }

  function normalizeDisplayLabel(value) {
    const text = String(value ?? '');
    if (text.toLowerCase() === 'normal') return '有効';
    return text || '-';
  }

  function numberMinByField(field) {
    const low = String(field || '').toLowerCase();
    if (low === 'sort') return 0;
    if (isRateLikeField(low)) return 0.0001;
    if (isPriceLikeField(low)) return 0.01;
    return undefined;
  }

  function numberPrecisionByField(field) {
    if (isRateLikeField(field)) return 4;
    return isPriceLikeField(field) ? 2 : undefined;
  }

  function isPriceLikeField(field) {
    const low = String(field || '').toLowerCase();
    return low.includes('price') || low.includes('amount');
  }

  function isRateLikeField(field) {
    const low = String(field || '').toLowerCase();
    return low.includes('rate');
  }

  return {
    tablePagination,
    formatBizDate,
    enumLabelMerged,
    getRecordId,
    isPermissionNamesField,
    permissionNameList,
    getRowKey,
    normalizeDisplayLabel,
    numberMinByField,
    numberPrecisionByField,
  };
}
