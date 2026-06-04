export const HEADER_UI = {
  appTitle: '\u5728\u5eab\u7ba1\u7406',
  messageTitle: '\u30e1\u30c3\u30bb\u30fc\u30b8',
  messageEmpty: '\u672a\u8aad\u30e1\u30c3\u30bb\u30fc\u30b8\u306f\u3042\u308a\u307e\u305b\u3093',
  messageSourceMissing: '\u53c2\u7167\u5148ID\u304c\u3042\u308a\u307e\u305b\u3093',
  read: '\u65e2\u8aad',
  readAll: '\u5168\u90e8\u65e2\u8aad',
  detail: '\u8a73\u7d30',
  darkModeOn: '\u591c',
  darkModeOff: '\u663c',
  changePassword: '\u30d1\u30b9\u30ef\u30fc\u30c9\u5909\u66f4',
  logout: '\u30ed\u30b0\u30a2\u30a6\u30c8',
  save: '\u4fdd\u5b58',
  cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb',
  newPassword: '\u65b0\u3057\u3044\u30d1\u30b9\u30ef\u30fc\u30c9',
  confirmPassword: '\u65b0\u3057\u3044\u30d1\u30b9\u30ef\u30fc\u30c9\uff08\u78ba\u8a8d\uff09',
  noMenuTitle: '\u8868\u793a\u3067\u304d\u308b\u30e1\u30cb\u30e5\u30fc\u304c\u3042\u308a\u307e\u305b\u3093',
  noMenuHint: '\u6a29\u9650\u8a2d\u5b9a\u3092\u78ba\u8a8d\u3059\u308b\u304b\u3001\u518d\u30ed\u30b0\u30a4\u30f3\u3057\u3066\u304f\u3060\u3055\u3044',
};

export const MODULE_LAYOUT_CONFIG = {
  hiddenModules: [],
  hiddenModuleMap: {
    stockOrderItem: {
      parent: 'stockOrder',
      label: '\u5165\u51fa\u5eab\u660e\u7d30',
    },
  },
  headerMessageSourceNavigations: {
    1: {
      storageKey: 'jump_stock_order_id',
      targetModule: 'stockOrderItem',
    },
    default: {
      storageKey: 'jump_stock_id',
      targetModule: 'stockRecord',
    },
  },
};

export const TABLE_TEXT = {
  search: '\u691c\u7d22',
  reset: '\u30ea\u30bb\u30c3\u30c8',
  confirmBatchDelete: '\u9078\u629e\u884c\u3092\u524a\u9664\u3057\u307e\u3059\u304b',
  yes: '\u306f\u3044',
  no: '\u3044\u3044\u3048',
  batchDelete: '\u4e00\u62ec\u524a\u9664',
  create: '\u65b0\u898f\u4f5c\u6210',
  inlineEdit: '\u884c\u5185\u7de8\u96c6',
  save: '\u4fdd\u5b58',
  cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb',
  edit: '\u7de8\u96c6',
  confirmDelete: '\u524a\u9664\u3057\u307e\u3059\u304b',
  delete: '\u524a\u9664',
  read: '\u65e2\u8aad',
  readAll: '\u5168\u90e8\u65e2\u8aad',
  readonly: '\u95b2\u89a7\u306e\u307f',
  actions: '\u64cd\u4f5c',
  fetchFail: '\u53d6\u5f97\u5931\u6557',
  updateSuccess: '\u66f4\u65b0\u3057\u307e\u3057\u305f',
  createSuccess: '\u4f5c\u6210\u3057\u307e\u3057\u305f',
  saveFail: '\u4fdd\u5b58\u5931\u6557',
  deleteSuccess: '\u524a\u9664\u3057\u307e\u3057\u305f',
  deleteFail: '\u524a\u9664\u5931\u6557',
  batchDeleteSuccess: '\u4e00\u62ec\u524a\u9664\u3057\u307e\u3057\u305f',
  batchDeleteFail: '\u4e00\u62ec\u524a\u9664\u5931\u6557',
  updateFail: '\u66f4\u65b0\u5931\u6557',
  requiredField: '\u5fc5\u9808\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044',
  stockFlowSuccess: '\u5728\u5eab\u696d\u52d9\u3092\u767b\u9332\u3057\u307e\u3057\u305f',
  selectDept: '\u90e8\u7f72\u540d\u3092\u9078\u629e',
  searchSuffix: '\u3067\u691c\u7d22',
  hotYes: '\u306f\u3044',
  hotNo: '\u3044\u3044\u3048',
  readUpdateFail: '\u65e2\u8aad\u66f4\u65b0\u306b\u5931\u6557\u3057\u307e\u3057\u305f',
  download: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9',
  pdf: 'PDF',
  downloadFail: '\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u5931\u6557',
  detail: '\u660e\u7d30',
};

export const PASSWORD_MESSAGES = {
  empty: '\u65b0\u3057\u3044\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044',
  mismatch: '\u78ba\u8a8d\u7528\u30d1\u30b9\u30ef\u30fc\u30c9\u304c\u4e00\u81f4\u3057\u307e\u305b\u3093',
  success: '\u30d1\u30b9\u30ef\u30fc\u30c9\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f',
  fail: '\u30d1\u30b9\u30ef\u30fc\u30c9\u66f4\u65b0\u306b\u5931\u6557\u3057\u307e\u3057\u305f',
};

export const GOODS_TABLE_CONFIG = {
  queryFields: ['name', 'skuCode', 'brandId', 'seriesId', 'categoryId', 'makerId', 'status'],
  formFields: ['name', 'englishName', 'brandId', 'seriesId', 'categoryId', 'makerId', 'description', 'isHot', 'skuCode', 'skuName', 'price', 'status'],
  preferredFields: [
    'skuId',
    'goodsName',
    'name',
    'goodsId',
    'englishName',
    'customerCode',
    'brandName',
    'seriesName',
    'categoryName',
    'makerName',
    'stockTypeName',
    'skuCode',
    'skuName',
    'specSummary',
    'barcode',
    'weight',
    'volume',
    'price',
    'costPrice',
    'updatePrice',
    'oldPrice',
    'newPrice',
    'discount',
    'currency',
    'currentQty',
    'beforeQty',
    'changeQty',
    'afterQty',
    'statusDesc',
    'status',
    'mainImage',
    'imageUrl',
    'priceUpdateTime',
    'effectiveTime',
    'expireTime',
    'remark',
    'description',
    'sort',
    'version',
    'createdBy',
    'updatedBy',
    'createTime',
    'updateTime',
  ],
};

export const ENUM_OPTIONS = {
  stockSourceType: [
    { label: '\u81ea\u793e\u5165\u5eab\uff08\u627f\u8a8d\u5fc5\u9808\uff09', value: 1 },
    { label: '\u518d\u8ca9\u58f2\u5165\u5eab\uff08\u5373\u6642\u5165\u5eab\uff09', value: 2 },
  ],
  stockOrderType: [
    { label: '\u5165\u5eab', value: 1 },
    { label: '\u51fa\u5eab', value: 2 },
    { label: '\u8abf\u6574', value: 3 },
    { label: '\u68da\u5378', value: 4 },
    { label: '\u79fb\u52d5', value: 5 },
    { label: '\u8fd4\u54c1', value: 6 },
  ],
  stockOrderSourceType: [
    { label: '\u6ce8\u6587', value: 1 },
    { label: '\u8fd4\u54c1', value: 2 },
    { label: '\u7533\u8acb\u66f8', value: 3 },
    { label: '\u624b\u52d5', value: 4 },
  ],
  stockOrderState: [
    { label: '\u8349\u7a3f', value: 0 },
    { label: '\u5be9\u67fb\u4e2d', value: 1 },
    { label: '\u5b8c\u4e86', value: 2 },
    { label: '\u53d6\u6d88', value: 3 },
  ],
  messageRead: [
    { label: '\u672a\u8aad', value: 0 },
    { label: '\u65e2\u8aad', value: 1 },
  ],
};

export const MODULE_QUERY_JUMPS = {
  stockOrderItem: { storageKey: 'jump_stock_order_id', queryField: 'orderId' },
  requestItem: { storageKey: 'jump_request_form_id', queryField: 'requestId' },
  stockRecord: { storageKey: 'jump_stock_id', queryField: 'stockId' },
};

export const MODULE_DETAIL_NAVIGATIONS = {
  stockOrder: { storageKey: 'jump_stock_order_id', targetModule: 'stockOrderItem' },
  requestForm: { storageKey: 'jump_request_form_id', targetModule: 'requestItem' },
};

export const MODULE_ROW_EXTRA_ACTIONS = {
  stockOrder: [{ key: 'detail', label: TABLE_TEXT.detail }],
  requestForm: [
    { key: 'detail', label: TABLE_TEXT.detail },
    { key: 'download', label: TABLE_TEXT.download },
    { key: 'pdf', label: TABLE_TEXT.pdf },
  ],
  message: [{ key: 'read', label: TABLE_TEXT.read }],
};

export const MODULE_ENUM_FIELD_OPTIONS = {
  message: {
    isRead: ENUM_OPTIONS.messageRead,
  },
  stock: {
    sourceType: ENUM_OPTIONS.stockSourceType,
  },
  stockSelf: {
    sourceType: ENUM_OPTIONS.stockSourceType,
  },
  stockHandle: {
    sourceType: ENUM_OPTIONS.stockSourceType,
  },
  stockOrder: {
    orderType: ENUM_OPTIONS.stockOrderType,
    sourceType: ENUM_OPTIONS.stockOrderSourceType,
    state: ENUM_OPTIONS.stockOrderState,
  },
  stockRecord: {
    orderType: ENUM_OPTIONS.stockOrderType,
    sourceType: ENUM_OPTIONS.stockOrderSourceType,
    state: ENUM_OPTIONS.stockOrderState,
  },
  requestForm: {
    state: ENUM_OPTIONS.stockOrderState,
  },
};

export const ADMIN_PERMISSION_MARKERS = [
  'ROLE_SUPER_ADMIN',
  'DATA_ALL_WRITE',
];

export function getModuleEnumOptions(moduleKey, field) {
  return MODULE_ENUM_FIELD_OPTIONS[moduleKey]?.[String(field || '')] || [];
}

export function getRowExtraActions(moduleKey) {
  return MODULE_ROW_EXTRA_ACTIONS[moduleKey] || [];
}

export function isAdminByPermissionCodes(codes) {
  const list = Array.isArray(codes) ? codes.map((item) => String(item || '').trim()).filter(Boolean) : [];
  if (list.length === 0) return false;
  const codeSet = new Set(list);
  return ADMIN_PERMISSION_MARKERS.some((marker) => codeSet.has(marker));
}
