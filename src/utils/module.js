export const MODULE_GROUPS = [
  {
    key: 'base',
    label: '基礎データ',
    children: [
      { key: 'user', label: 'ユーザー管理' },
      { key: 'dept', label: '部門管理' },
      { key: 'warehouse', label: '倉庫管理' },
      { key: 'role', label: 'ロール管理' },
      { key: 'permission', label: '権限管理' },
      { key: 'maker', label: 'メーカー管理' },
      { key: 'brand', label: 'ブランド管理' },
      { key: 'category', label: 'カテゴリ管理' },
      { key: 'series', label: 'シリーズ管理' },
      { key: 'config', label: '設定管理' }
    ]
  },
  {
    key: 'goods',
    label: '商品管理',
    children: [
      { key: 'goods', label: '商品' },
      { key: 'goodsType', label: '商品タイプ' },
      { key: 'goodsSku', label: 'SKU' },
      { key: 'goodsSkuSpec', label: 'SKU仕様' },
      { key: 'goodsImage', label: '商品画像' },
      { key: 'goodsLevelPrice', label: '会員価格' },
      { key: 'brandMakerRelation', label: 'ブランド-メーカー関連' }
    ]
  },
  {
    key: 'stock',
    label: '在庫管理',
    children: [
      { key: 'stock', label: '在庫' },
      { key: 'stockType', label: '在庫種別' },
      { key: 'stockRecord', label: '在庫履歴' },
      { key: 'stockOrder', label: '在庫注文' },
      { key: 'stockOrderItem', label: '在庫注文明細' },
      { key: 'requestForm', label: '申請フォーム' },
      { key: 'requestItem', label: '申請明細' },
      { key: 'priceRecord', label: '価格履歴' }
    ]
  },
  {
    key: 'customer',
    label: '顧客管理',
    children: [
      { key: 'customer', label: '顧客' },
      { key: 'customerLevel', label: '顧客ランク' }
    ]
  },
  {
    key: 'system',
    label: 'システム',
    children: [
      { key: 'message', label: 'メッセージ' },
      { key: 'operateLog', label: '操作ログ' },
      { key: 'userRole', label: 'ユーザーロール関連' },
      { key: 'rolePermission', label: 'ロール権限関連' },
      { key: 'userToken', label: 'ユーザートークン' }
    ]
  }
];

export const MODULE_PRESETS = {
  user: {
    queryFields: ['username', 'email', 'phone', 'status'],
    formFields: ['username', 'password', 'nickname', 'deptId', 'email', 'phone', 'status'],
    fieldTypes: { deptId: 'number', status: 'select' }
  },
  dept: {
    queryFields: ['name', 'code', 'status'],
    formFields: ['parentId', 'name', 'code', 'leaderId', 'sort', 'status'],
    fieldTypes: { parentId: 'number', leaderId: 'number', sort: 'number', status: 'select' }
  },
  goods: {
    queryFields: ['name', 'englishName', 'skuCode', 'status'],
    formFields: ['name', 'englishName', 'skuCode', 'seriesId', 'brandId', 'categoryId', 'makerId', 'price', 'discount', 'newPrice', 'status', 'isHot', 'description'],
    fieldTypes: {
      seriesId: 'number', brandId: 'number', categoryId: 'number', makerId: 'number',
      price: 'decimal', discount: 'decimal', newPrice: 'decimal', status: 'select', isHot: 'switch', description: 'textarea'
    }
  },
  stock: {
    queryFields: ['goodsName', 'skuCode', 'warehouseId', 'status'],
    formFields: ['goodsId', 'skuId', 'warehouseId', 'typeId', 'currency', 'quantity', 'status'],
    fieldTypes: { goodsId: 'number', skuId: 'number', warehouseId: 'number', typeId: 'number', quantity: 'number', status: 'select' }
  },
  warehouse: {
    queryFields: ['name', 'code', 'address', 'status'],
    formFields: ['name', 'code', 'address', 'managerId', 'status'],
    fieldTypes: { managerId: 'number', status: 'select' }
  }
};

export const STATUS_OPTIONS = [
  { label: '有効', value: 'ENABLE' },
  { label: '無効', value: 'DISABLE' },
];

export const RELATION_FIELD_MODULE = {
  deptId: 'dept',
  managerId: 'user',
  leaderId: 'user',
  seriesId: 'series',
  brandId: 'brand',
  categoryId: 'category',
  makerId: 'maker',
  goodsId: 'goods',
  skuId: 'goodsSku',
  warehouseId: 'warehouse',
  typeId: 'stockType',
};

export function toMenuItems() {
  return MODULE_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    children: group.children.map((item) => ({ key: item.key, label: item.label })),
  }));
}

export function moduleTitle(moduleKey) {
  for (const group of MODULE_GROUPS) {
    const found = group.children.find((item) => item.key === moduleKey);
    if (found) return found.label;
  }
  return moduleKey;
}

export function getModulePreset(moduleKey) {
  return MODULE_PRESETS[moduleKey] || { queryFields: [], formFields: [], fieldTypes: {} };
}

export function normalizeTitle(key) {
  if (!key) return '';
  const low = String(key).toLowerCase();
  if (low === 'deptname' || key === 'Dept Name') return '部門名称';
  if (low === 'statusdesc') return '状態';
  if (low === 'status') return '状態';
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export function displayKeys(record) {
  if (!record) return [];
  return Object.keys(record).filter((key) => {
    const low = key.toLowerCase();
    if (low === 'id') return true;
    if (low.endsWith('id') || low.endsWith('_id')) return false;
    return true;
  });
}

export function guessFieldType(field, moduleKey) {
  const preset = MODULE_PRESETS[moduleKey];
  const byPreset = preset?.fieldTypes?.[field];
  if (byPreset) return byPreset;
  const low = String(field || '').toLowerCase();
  if (low.includes('time') || low.includes('date')) return 'datetime';
  if (low === 'status') return 'select';
  if (low.startsWith('is') || low.startsWith('has')) return 'switch';
  if (RELATION_FIELD_MODULE[field]) return 'relation';
  if (low.endsWith('id') || low.endsWith('_id')) return 'number';
  if (low.includes('price') || low.includes('amount') || low.includes('discount')) return 'decimal';
  if (low.includes('count') || low.includes('num') || low.includes('sort') || low.includes('quantity')) return 'number';
  if (low.includes('description') || low.includes('remark') || low.includes('content')) return 'textarea';
  return 'text';
}

export function relationModuleByField(field) {
  return RELATION_FIELD_MODULE[field];
}

export function relationLabel(record) {
  if (!record) return '';
  const text = record.name || record.username || record.code || record.title || record.englishName;
  return text ? `${text}` : `ID:${record.id}`;
}
