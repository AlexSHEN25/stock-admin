export const HEADER_UI = {
  appTitle: '在庫管理',
  messageTitle: 'メッセージ',
  messageEmpty: '未読メッセージはありません',
  messageSourceMissing: '遷移元IDがありません',
  read: '既読',
  readAll: '全件既読',
  detail: '詳細',
  darkModeOn: 'ON',
  darkModeOff: 'OFF',
  changePassword: 'パスワード変更',
  logout: 'ログアウト',
  save: '保存',
  cancel: 'キャンセル',
  newPassword: '新しいパスワード',
  confirmPassword: '新しいパスワード（確認）',
  noMenuTitle: '表示できるメニューがありません',
  noMenuHint: '権限を確認するか、ログインし直してください',
};

export const MODULE_LAYOUT_CONFIG = {
  hiddenModules: [],
  hiddenModuleMap: {
    stockOrderItem: {
      parent: 'stockOrder',
      label: '出庫明細',
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

const TABLE_TEXT = {
  search: '検索',
  reset: 'リセット',
  confirmBatchDelete: '選択した項目を削除しますか',
  yes: 'はい',
  no: 'いいえ',
  batchDelete: '一括削除',
  create: '新規作成',
  inlineEdit: '直接編集',
  save: '保存',
  cancel: 'キャンセル',
  edit: '編集',
  confirmDelete: '削除しますか',
  delete: '削除',
  read: '既読',
  readAll: '全件既読',
  readonly: '閲覧のみ',
  actions: '操作',
  fetchFail: '取得に失敗しました',
  updateSuccess: '更新しました',
  createSuccess: '作成しました',
  saveFail: '保存に失敗しました',
  deleteSuccess: '削除しました',
  deleteFail: '削除に失敗しました',
  batchDeleteSuccess: '一括削除しました',
  batchDeleteFail: '一括削除に失敗しました',
  updateFail: '更新に失敗しました',
  requiredField: '必須項目を入力してください',
  stockFlowSuccess: '在庫処理を完了しました',
  selectDept: '部署を選択',
  searchSuffix: 'で検索',
  hotYes: 'はい',
  hotNo: 'いいえ',
  readUpdateFail: '既読更新に失敗しました',
  download: 'ダウンロード',
  pdf: 'PDF',
  downloadFail: 'ダウンロードに失敗しました',
  detail: '詳細',
  inbound: '入庫',
  inboundDone: '入庫完了',
  outbound: '出庫',
  addOutboundDetail: '出庫明細追加',
  returnInbound: '戻り入庫',
  reapplyInbound: '入庫申請再作成',
  reapplyInboundSuccess: '入庫申請を作成しました',
  reapplyInboundFail: '入庫申請の作成に失敗しました',
  stockOutboundSuccess: '出庫を登録しました',
  outboundQuantityInvalid: '出庫数量は1以上で入力してください',
};
export default TABLE_TEXT;

export const PASSWORD_MESSAGES = {
  empty: '新しいパスワードを入力してください',
  mismatch: '確認用パスワードが一致しません',
  success: 'パスワードを更新しました',
  fail: 'パスワード更新に失敗しました',
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
    'inventoryStatus',
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
    { label: '自社入庫', value: 1 },
    { label: '仕入入庫', value: 2 },
  ],
  stockOrderType: [
    { label: '入庫', value: 1 },
    { label: '出庫', value: 2 },
    { label: '移動', value: 3 },
    { label: '調整', value: 4 },
    { label: '返品', value: 5 },
    { label: '仕入', value: 6 },
  ],
  stockOrderSourceType: [
    { label: '手入力', value: 1 },
    { label: '返品', value: 2 },
    { label: '入庫申請', value: 3 },
    { label: '案件', value: 4 },
  ],
  stockOrderState: [
    { label: '未処理', value: 0 },
    { label: '処理中', value: 1 },
    { label: '完了', value: 2 },
    { label: '取消', value: 3 },
  ],
  requestFormState: [
    { label: '未処理', value: 0 },
    { label: '申請中', value: 1 },
    { label: '承認済・完了', value: 2 },
    { label: '申請保留', value: 3 },
    { label: '申請却下', value: 4 },
    { label: '申請取消', value: 5 },
  ],
  messageRead: [
    { label: '未読', value: 0 },
    { label: '既読', value: 1 },
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
  stockOrder: [
    { key: 'approve', label: '承認' },
    { key: 'reject', label: '却下' },
    { key: 'detail', label: TABLE_TEXT.detail },
  ],
  stockOrderItem: [{ key: 'returnInbound', label: TABLE_TEXT.returnInbound }],
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
  stockOrder: {
    orderType: ENUM_OPTIONS.stockOrderType,
    sourceType: ENUM_OPTIONS.stockOrderSourceType,
    state: ENUM_OPTIONS.stockOrderState,
  },
  stockOrderItem: {
    orderType: ENUM_OPTIONS.stockOrderType,
    state: ENUM_OPTIONS.stockOrderState,
  },
  stockRecord: {
    orderType: ENUM_OPTIONS.stockOrderType,
    sourceType: ENUM_OPTIONS.stockOrderSourceType,
    state: ENUM_OPTIONS.stockOrderState,
  },
  requestForm: {
    state: ENUM_OPTIONS.requestFormState,
  },
};

export const ADMIN_PERMISSION_MARKERS = [
  'ROLE_SUPER_ADMIN',
  'ROLE_ADMIN',
  'SUPER_ADMIN',
  'ADMIN',
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
  return ADMIN_PERMISSION_MARKERS.some((code) => codeSet.has(code));
}

export function autoLabelFromField(field) {
  return String(field || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
}
