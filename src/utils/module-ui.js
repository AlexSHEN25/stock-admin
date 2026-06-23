import {
  MESSAGE_READ_STATE,
  REQUEST_FORM_STATE,
  STOCK_ORDER_SOURCE_TYPE,
  STOCK_ORDER_STATE,
  STOCK_ORDER_TYPE,
  STOCK_SOURCE_TYPE,
} from './constants';

export const HEADER_UI = {
  appTitle: '在庫管理',
  messageTitle: 'メッセージ',
  messageEmpty: '未読メッセージはありません',
  messageSourceMissing: '遷移先IDがありません',
  read: '既読',
  readAll: '全件既読',
  detail: '詳細',
  darkModeOn: 'ON',
  darkModeOff: 'OFF',
  changePassword: 'パスワード変更',
  logout: 'ログアウト',
  logoutConfirm: 'ログアウトしますか？',
  save: '保存',
  cancel: 'キャンセル',
  yes: 'はい',
  no: 'いいえ',
  newPassword: '新しいパスワード',
  confirmPassword: '新しいパスワード（確認）',
  noMenuTitle: '表示できるメニューがありません',
  noMenuHint: '権限を確認するか、再ログインしてください',
};

export const MODULE_LAYOUT_CONFIG = {
  hiddenModules: ['stockOrderItem'],
  hiddenModuleMap: {
    stockOrderItem: {
      parent: 'stockOrder',
      label: '入出庫明細',
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
  confirmBatchDelete: '選択した項目を削除しますか？',
  yes: 'はい',
  no: 'いいえ',
  batchDelete: '一括削除',
  create: '新規作成',
  inlineEdit: '行編集',
  save: '保存',
  cancel: 'キャンセル',
  edit: '編集',
  confirmDelete: '削除しますか？',
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
  selectDept: '部署を選択してください',
  searchSuffix: 'で検索',
  hotYes: 'はい',
  hotNo: 'いいえ',
  upload: 'アップロード',
  readUpdateFail: '既読更新に失敗しました',
  download: 'ダウンロード',
  export: 'エクスポート',
  pdf: 'PDF',
  downloadFail: 'ダウンロードに失敗しました',
  exportFail: 'エクスポートに失敗しました',
  detail: '詳細',
  inbound: '入庫',
  inboundDone: '入庫完了',
  outbound: '出庫',
  addOutboundDetail: '出庫明細追加',
  returnInbound: '戻り入庫',
  returnToSchedule: '発送予定表へ戻す',
  reapplyInbound: '入庫申請を作成',
  reapplyInboundSuccess: '入庫申請を作成しました',
  reapplyInboundFail: '入庫申請の作成に失敗しました',
  stockOutboundSuccess: '出庫を登録しました',
  outboundQuantityInvalid: '出庫数量は1以上で入力してください',
  maxOutboundQuantity: (maxQuantity) => `出庫数量は${maxQuantity}以下で入力してください`,
  inboundFirst: '先に入庫を完了してください',
  goodsTemplateDownloadFail: 'テンプレートのダウンロードに失敗しました',
  goodsImportSuccess: '商品を一括導入しました',
  goodsImportFail: '商品一括導入に失敗しました',
  goodsImportSummary: {
    total: '合計',
    success: '成功',
    created: '新規',
    updated: '更新',
    failed: '失敗',
  },
  selectDeliveryGoods: '発送予定表へ振分する商品を選択してください',
  selectInboundGoods: '入庫する商品を選択してください',
  selectOutboundGoods: '出庫する商品を選択してください',
  outboundBelowCurrentQty: '出庫数量は現在庫以下で入力してください',
  abcTotalBelowCurrentQty: 'A/B/C組振分合計は現在数量以下で入力してください',
  selectRequestForm: '請求書を選択してください',
  selectRequestItems: '生成する請求書明細を選択してください',
  requestFormGenerated: '請求書を生成しました',
  requestFormCompleted: '生成済み',
  completedRequestReadonly: '完了済みの請求書は明細を変更できません',
  passwordEmptyNoChange: '空欄の場合、パスワードは更新されません',
  approveSuccess: '承認しました',
  rejectSuccess: '拒否しました',
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
    { label: '自社入庫', value: STOCK_SOURCE_TYPE.SELF_INBOUND },
  ],
  stockOrderType: [
    { label: '入庫', value: STOCK_ORDER_TYPE.INBOUND },
    { label: '出庫', value: STOCK_ORDER_TYPE.OUTBOUND },
    { label: '移動', value: STOCK_ORDER_TYPE.TRANSFER },
    { label: '調整', value: STOCK_ORDER_TYPE.ADJUSTMENT },
    { label: '返品', value: STOCK_ORDER_TYPE.RETURN },
    { label: '仕入', value: STOCK_ORDER_TYPE.PURCHASE },
  ],
  stockOrderSourceType: [
    { label: '手入力', value: STOCK_ORDER_SOURCE_TYPE.MANUAL },
    { label: '返品', value: STOCK_ORDER_SOURCE_TYPE.RETURN },
    { label: '入庫申請', value: STOCK_ORDER_SOURCE_TYPE.INBOUND_REQUEST },
    { label: 'システム', value: STOCK_ORDER_SOURCE_TYPE.SYSTEM },
  ],
  stockOrderState: [
    { label: '未処理', value: STOCK_ORDER_STATE.PENDING },
    { label: '処理中', value: STOCK_ORDER_STATE.PROCESSING },
    { label: '完了', value: STOCK_ORDER_STATE.COMPLETED },
    { label: '却下', value: STOCK_ORDER_STATE.REJECTED },
  ],
  requestFormState: [
    { label: '未処理', value: REQUEST_FORM_STATE.PENDING },
    { label: '申請中', value: REQUEST_FORM_STATE.APPLYING },
    { label: '承認済み・完了', value: REQUEST_FORM_STATE.COMPLETED },
    { label: '申請保留', value: REQUEST_FORM_STATE.HOLD },
    { label: '申請却下', value: REQUEST_FORM_STATE.REJECTED },
    { label: '申請取消', value: REQUEST_FORM_STATE.CANCELED },
  ],
  messageRead: [
    { label: '未読', value: MESSAGE_READ_STATE.UNREAD },
    { label: '既読', value: MESSAGE_READ_STATE.READ },
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
  deliverySchedule: [{ key: 'addToRequestItem', label: '請求書明細へ追加' }],
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
