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
  name: '名称',
  code: 'コード',
  module: 'モジュール',
  type: '種別',
  parentId: '親',
  parentName: '親名称',
  path: 'パス',
  sort: '表示順',
  icon: 'アイコン',
  component: 'コンポーネント',
  status: '状態',
  statusDesc: '状態',
  createTime: '作成日時',
  updateTime: '更新日時',
  deptId: '部署',
  deptName: '部署名',
  roleId: 'ロール',
  roleName: 'ロール名',
  permissionId: '権限',
  permissionName: '権限名称',
  permissionIds: '権限',
  permissionNames: '権限名称',
  ownerUserId: '担当者',
  ownerUserName: '担当者名',
  ownerDeptId: '担当部署',
  ownerDeptName: '担当部署名',
  contactPerson: '担当者',
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
  return record.name || record.goodsName || record.skuName || record.username || record.code || `ID:${record.id}`;
}

export function displayKeys(record) {
  if (!record) return [];
  return Object.keys(record).filter((key) => {
    const low = String(key || '').toLowerCase();
    return low !== 'id' && !low.endsWith('id') && !low.endsWith('ids');
  });
}

function autoLabelFromField(field) {
  const low = field.toLowerCase();
  if (low === 'id') return 'ID';
  if (low === 'createtime') return '作成日時';
  if (low === 'updatetime') return '更新日時';
  if (low === 'statusdesc' || low === 'status') return '状態';
  if (field.endsWith('Names')) return `${toReadable(field.slice(0, -5))}名称`;
  if (field.endsWith('Name')) return `${toReadable(field.slice(0, -4))}名`;
  if (field.endsWith('Ids')) return `${toReadable(field.slice(0, -3))}ID一覧`;
  if (field.endsWith('Id')) return `${toReadable(field.slice(0, -2))}ID`;
  if (field.endsWith('Code')) return `${toReadable(field.slice(0, -4))}コード`;
  if (field.endsWith('Time')) return `${toReadable(field.slice(0, -4))}日時`;
  return toReadable(field);
}

function toReadable(value) {
  const text = String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
  if (!text) return '項目';
  const parts = text.split(/\s+/);
  const mappedParts = parts.map((token) => mapTokenToJa(token)).filter(Boolean);
  const changed = mappedParts.some((x, i) => x !== parts[i]);
  if (changed) return mappedParts.join('');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function mapTokenToJa(token) {
  const low = String(token || '').toLowerCase();
  const dict = {
    user: 'ユーザー',
    users: 'ユーザー',
    role: 'ロール',
    roles: 'ロール',
    permission: '権限',
    permissions: '権限',
    dept: '部署',
    department: '部署',
    warehouse: '倉庫',
    goods: '商品',
    sku: 'SKU',
    stock: '在庫',
    type: '種別',
    category: 'カテゴリ',
    brand: 'ブランド',
    maker: 'メーカー',
    series: 'シリーズ',
    customer: '顧客',
    level: 'ランク',
    request: '申請',
    order: '注文',
    item: '明細',
    message: 'メッセージ',
    config: '設定',
    price: '価格',
    status: '状態',
    name: '名称',
    code: 'コード',
    time: '日時',
    amount: '金額',
    qty: '数量',
    quantity: '数量',
    operator: '操作者',
    requester: '申請者',
    approver: '承認者',
    owner: '担当',
    parent: '親',
    contact: '連絡先',
    person: '担当者',
  };
  return dict[low] || token;
}
