export const STATUS_OPTIONS = [
  { label: '有効', value: 1 },
  { label: '無効', value: 0 },
];

export const RELATION_FIELD_MODULE = {
  parentId: 'permission',
  deptId: 'dept',
  managerId: 'user',
  leaderId: 'user',
  roleId: 'role',
  permissionId: 'permission',
  permissionIds: 'permission',
  seriesId: 'series',
  brandId: 'brand',
  categoryId: 'category',
  makerId: 'maker',
  goodsId: 'goods',
  skuId: 'goodsSku',
  stockTypeId: 'stockType',
  warehouseId: 'warehouse',
  orderId: 'stockOrder',
  orderItemId: 'stockOrderItem',
  stockId: 'stock',
  requestId: 'requestForm',
  stockRecordId: 'stockRecord',
  sourceId: 'stockOrder',
  sourceOrderId: 'stockOrder',
  customerId: 'customer',
  levelId: 'customerLevel',
  userId: 'user',
  requesterId: 'user',
  operatorId: 'user',
  approverId: 'user',
  ownerUserId: 'user',
  ownerDeptId: 'dept',
};

export const NAME_TO_ID_FIELD = {
  parentName: 'parentId',
  deptName: 'deptId',
  roleName: 'roleId',
  permissionName: 'permissionId',
  permissionNames: 'permissionIds',
  managerName: 'managerId',
  leaderName: 'leaderId',
  seriesName: 'seriesId',
  brandName: 'brandId',
  categoryName: 'categoryId',
  makerName: 'makerId',
  goodsName: 'goodsId',
  skuName: 'skuId',
  stockTypeName: 'stockTypeId',
  warehouseName: 'warehouseId',
  sourceOrderNo: 'sourceOrderId',
  customerName: 'customerId',
  levelName: 'levelId',
  ownerUserName: 'ownerUserId',
  ownerDeptName: 'ownerDeptId',
  userName: 'userId',
  requesterName: 'requesterId',
  operatorName: 'operatorId',
  approverName: 'approverId',
};

export const FIELD_LABELS = {
  id: 'ID',
  username: 'ユーザー名',
  password: 'パスワード',
  deptId: '部署',
  deptName: '部署名',
  roleId: 'ロール',
  roleName: 'ロール名',
  permissionId: '権限',
  permissionName: '権限名',
  permissionIds: '権限',
  permissionNames: '権限名',
  name: '名称',
  englishName: '英語名',
  code: 'コード',
  email: 'メールアドレス',
  phone: '電話番号',
  avatar: 'アバター',
  contactPerson: '担当者',
  country: '国',
  city: '都市',
  warehouseId: '倉庫',
  warehouseName: '倉庫名',
  goodsId: '商品',
  goodsName: '商品名',
  skuId: 'SKU',
  skuCode: '品番',
  skuName: '品名',
  barcode: 'バーコード',
  weight: '重量',
  volume: '体積',
  costPrice: '原価',
  updatePrice: '改定価格',
  currentQty: '現在数量',
  inventoryStatus: '在庫状態',
  outboundMaxQty: '出庫上限数',
  groupAQty: 'A組在庫',
  groupBQty: 'B組在庫',
  groupCQty: 'C組在庫',
  specSummary: '仕様摘要',
  mainImage: 'メイン画像',
  categoryId: 'カテゴリ',
  categoryName: 'カテゴリ名',
  brandId: 'ブランド',
  brandName: 'ブランド名',
  makerId: 'メーカー',
  makerName: 'メーカー名',
  seriesId: 'シリーズ',
  seriesName: 'シリーズ名',
  quantity: '数量',
  stock: '在庫数',
  price: '価格',
  amount: '金額',
  discount: '割引率',
  status: '状態',
  statusDesc: '状態',
  sort: '表示順',
  address: '住所',
  remark: '備考',
  description: '説明',
  createTime: '作成日時',
  updateTime: '更新日時',
  createdBy: '作成者',
  updatedBy: '更新者',
  parentId: '親',
  parentName: '親名称',
  leaderId: '責任者',
  leaderName: '責任者名',
  managerId: '管理者',
  managerName: '管理者名',
  userId: 'ユーザー',
  userName: 'ユーザー名',
  stockTypeId: '在庫分類',
  stockTypeName: '在庫分類',
  stockId: '在庫',
  sourceOrderId: '出庫伝票',
  sourceOrderNo: '出庫伝票番号',
  levelId: 'ランク',
  levelName: 'ランク名',
  ownerUserId: '担当者',
  ownerUserName: '担当者',
  ownerDeptId: '担当部署',
  ownerDeptName: '担当部署名',
  customerId: '顧客',
  customerName: '顧客名',
  customerCode: '顧客コード',
  orderId: '伝票',
  orderNo: '伝票番号',
  orderType: '伝票種別',
  sourceType: '元種別',
  sourceId: '元ID',
  orderItemId: '伝票明細',
  requestId: '請求書',
  requestNo: '請求書番号',
  requestType: '請求書種別',
  requestStatus: '請求書状態',
  imageUrl: '画像URL',
  image: '画像',
  icon: 'アイコン',
  component: 'コンポーネント',
  module: 'モジュール',
  operation: '操作種別',
  method: 'HTTPメソッド',
  path: 'パス',
  requestUrl: 'リクエストURL',
  requestIp: 'リクエストIP',
  requestParam: 'リクエストパラメータ',
  responseData: 'レスポンスデータ',
  errorMsg: 'エラーメッセージ',
  costTime: '処理時間(ms)',
  loginTime: 'ログイン時刻',
  loginIp: 'ログインIP',
  token: 'トークン',
  isRead: '既読',
  type: '種別',
  group: 'グループ',
  value: '値',
  tip: 'ヒント',
  requesterId: '申請者',
  requesterName: '申請者',
  operatorId: '操作者',
  operatorName: '操作者',
  stockRecordId: '在庫履歴',
  specId: '仕様',
  specName: '仕様名',
  specValue: '仕様値',
  currency: '通貨',
  exchangeRate: '為替レート',
  paymentDate: '入金日',
  hasFee: '手数料あり',
  feeAmount: '手数料',
  hasUnpaid: '未入金あり',
  unpaidAmount: '未入金額',
  beforeQty: '変更前数量',
  afterQty: '変更後数量',
  changeQty: '変更数量',
  totalQty: '総数量',
  requestQty: '請求数量',
  approveQty: '承認数量',
  outQty: '出庫数量',
  outboundMode: '出庫区分',
  stockScope: '出庫元在庫',
  saleDeadline: '販売期限',
  totalAmt: '総金額',
  state: '状態コード',
  approverId: '承認者',
  approverName: '承認者',
  approveTime: '承認日時',
  approveRemark: '承認備考',
  finishTime: '完了日時',
  effectiveTime: '有効開始',
  expireTime: '有効終了',
  oldPrice: '旧価格',
  newPrice: '新価格',
  priceUpdateTime: '価格更新日時',
  isHot: '人気商品',
  title: 'タイトル',
  content: '内容',
  message: 'メッセージ',
  deleted: '削除フラグ',
  version: 'バージョン',
  bizNo: '業務番号',
  bizDate: '納品日/出荷日',
};

export function normalizeTitle(key) {
  if (!key) return '';
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return autoLabelFromField(String(key));
}

export function relationModuleByField(field) {
  return RELATION_FIELD_MODULE[field];
}

export function mapNameFieldToIdField(field) {
  return NAME_TO_ID_FIELD[field] || '';
}

export function relationLabel(record) {
  if (!record) return '';
  return record.orderNo
    || record.bizNo
    || record.requestNo
    || record.name
    || record.deptName
    || record.roleName
    || record.permissionName
    || record.goodsName
    || record.skuName
    || record.warehouseName
    || record.customerName
    || record.username
    || record.userName
    || record.code
    || record.skuCode
    || `ID:${record.id}`;
}

export function displayKeys(record) {
  if (!record) return [];
  const keyList = Object.keys(record);
  const lowerKeySet = new Set(keyList.map((key) => String(key || '').toLowerCase()));
  const relationIdSet = new Set(Object.keys(RELATION_FIELD_MODULE).map((key) => String(key || '').toLowerCase()));
  const alwaysDisplayIdFields = new Set(['sourceid']);
  const mappedIdToName = Object.entries(NAME_TO_ID_FIELD).reduce((acc, [nameField, idField]) => {
    acc[String(idField).toLowerCase()] = nameField;
    return acc;
  }, {});

  return keyList.filter((key) => {
    const low = key.toLowerCase();
  if (String(key).startsWith('__')) return false;
    if (low === 'beforeqty' || low === 'afterqty' || low === 'lockqty' || low === 'inbounddone') return false;
    if (!low.endsWith('id') && !low.endsWith('ids')) return true;
    if (low === 'id') return true;
    if (alwaysDisplayIdFields.has(low)) return true;

    const base = String(key).replace(/ids?$/i, '');
    const nameKey = `${base}Name`;
    const namesKey = `${base}Names`;
    if (Object.prototype.hasOwnProperty.call(record, nameKey) || lowerKeySet.has(nameKey.toLowerCase())) return false;
    if (Object.prototype.hasOwnProperty.call(record, namesKey) || lowerKeySet.has(namesKey.toLowerCase())) return false;

    const mappedName = mappedIdToName[low];
    if (mappedName && lowerKeySet.has(String(mappedName).toLowerCase())) return false;
    if (relationIdSet.has(low)) return false;
    return true;
  });
}

function autoLabelFromField(field) {
  const low = field.toLowerCase();
  if (low === 'id') return 'ID';
  if (low === 'createtime') return '作成日時';
  if (low === 'updatetime') return '更新日時';
  if (low === 'statusdesc' || low === 'status') return '状態';
  if (field.endsWith('Names')) return `${toReadable(field.slice(0, -5))}名`;
  if (field.endsWith('Name')) return `${toReadable(field.slice(0, -4))}名`;
  if (field.endsWith('Ids')) return toReadable(field.slice(0, -3));
  if (field.endsWith('Id')) return toReadable(field.slice(0, -2));
  if (field.endsWith('Code')) return `${toReadable(field.slice(0, -4))}コード`;
  if (field.endsWith('Time') || field.endsWith('Date')) return `${toReadable(field.replace(/(Time|Date)$/, ''))}日時`;
  return toReadable(field);
}

function toReadable(value) {
  const text = String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
  if (!text) return '項目';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
