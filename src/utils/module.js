export const MODULE_GROUPS = [
  {
    key: 'base',
    label: '基礎マスタ',
    children: [
      { key: 'user', label: 'ユーザー管理' },
      { key: 'dept', label: '部署管理' },
      { key: 'warehouse', label: '倉庫管理' },
      { key: 'role', label: 'ロール管理' },
      { key: 'permission', label: '権限管理' }
    ]
  },
  {
    key: 'goods',
    label: '商品管理',
    children: [
      { key: 'goods', label: '商品管理' },
      { key: 'goodsSku', label: 'SKU管理' },
      { key: 'goodsType', label: '商品種別' },
      { key: 'goodsSkuSpec', label: 'SKU仕様管理' },
      { key: 'goodsImage', label: '商品画像管理' },
      { key: 'goodsLevelPrice', label: '会員価格管理' },
      { key: 'maker', label: 'メーカー管理' },
      { key: 'brand', label: 'ブランド管理' },
      { key: 'category', label: 'カテゴリ管理' },
      { key: 'series', label: 'シリーズ管理' }
    ]
  },
  {
    key: 'stock',
    label: '在庫管理',
    children: [
      { key: 'stock', label: '在庫一覧' },
      { key: 'stockType', label: '在庫区分' },
      { key: 'stockRecord', label: '在庫履歴' },
      { key: 'stockOrder', label: '入出庫伝票' },
      { key: 'stockOrderItem', label: '入出庫明細' },
      { key: 'requestForm', label: '申請管理' },
      { key: 'requestItem', label: '申請明細' },
      { key: 'priceRecord', label: '価格履歴' }
    ]
  },
  {
    key: 'customer',
    label: '顧客管理',
    children: [
      { key: 'customer', label: '顧客管理' },
      { key: 'customerLevel', label: '顧客ランク管理' }
    ]
  },
  {
    key: 'system',
    label: 'システム管理',
    children: [
      { key: 'config', label: 'システム設定' },
      { key: 'message', label: 'メッセージ管理' },
      { key: 'operateLog', label: '操作ログ' }
    ]
  }
];

/**
 * 模块默认配置
 */
export const MODULE_PRESETS = {
  user: {
    queryFields: ['username', 'deptName', 'email', 'phone', 'status'],
    formFields: ['username', 'password', 'deptId', 'email', 'phone', 'status'],
    fieldTypes: {
      deptId: 'relation',
      status: 'select'
    }
  },

  dept: {
    queryFields: ['id', 'name', 'code', 'leaderId', 'sort', 'status'],
    formFields: ['parentId', 'name', 'code', 'leaderId', 'sort', 'status'],
    fieldTypes: {
      parentId: 'relation',
      leaderId: 'relation',
      sort: 'number',
      status: 'select'
    }
  },

  goods: {
    queryFields: ['id', 'name', 'englishName', 'skuCode', 'seriesId', 'brandId', 'categoryId', 'makerId', 'price', 'discount', 'status', 'newPrice', 'priceUpdateTime', 'description', 'isHot', 'version'],
    formFields: [
      'name',
      'skuCode',
      'seriesId',
      'brandId',
      'categoryId',
      'makerId',
      'price',
      'status',
      'description'
    ],
    fieldTypes: {
      seriesId: 'relation',
      brandId: 'relation',
      categoryId: 'relation',
      makerId: 'relation',
      price: 'decimal',
      status: 'select',
      description: 'textarea'
    }
  },

  stock: {
    queryFields: ['goodsName', 'skuCode', 'skuId', 'typeId', 'currency', 'warehouseId', 'status'],
    formFields: [
      'goodsId',
      'skuId',
      'warehouseId',
      'quantity',
      'status'
    ],
    fieldTypes: {
      goodsId: 'relation',
      skuId: 'relation',
      warehouseId: 'relation',
      quantity: 'number',
      status: 'select'
    }
  },

  warehouse: {
    queryFields: ['id', 'name', 'code', 'address', 'managerId', 'status'],
    formFields: ['name', 'code', 'address', 'managerId', 'status'],
    fieldTypes: {
      managerId: 'relation',
      status: 'select'
    }
  },

  role: {
    queryFields: ['id', 'name', 'code', 'remark', 'status'],
    formFields: ['name', 'code', 'remark', 'status'],
    fieldTypes: { status: 'select' }
  },
  permission: {
    queryFields: ['id', 'name', 'code', 'module', 'type', 'parentId', 'path', 'sort', 'icon', 'status'],
    fieldTypes: { parentId: 'relation', sort: 'number', status: 'select' }
  },
  maker: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' }
  },
  brand: {
    queryFields: ['id', 'name', 'englishName', 'content', 'status'],
    formFields: ['name', 'englishName', 'content', 'status'],
    fieldTypes: { status: 'select' }
  },
  category: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' }
  },
  series: {
    queryFields: ['id', 'name', 'englishName', 'content', 'status'],
    formFields: ['name', 'englishName', 'content', 'status'],
    fieldTypes: { status: 'select' }
  },
  config: {
    queryFields: ['id', 'name', 'group', 'title', 'tip', 'type', 'value', 'content']
  },
  goodsSku: {
    queryFields: ['id', 'goodsId', 'skuCode', 'skuName', 'price', 'currency', 'costPrice', 'updatePrice', 'priceUpdateTime', 'barcode', 'weight', 'volume', 'status'],
    fieldTypes: { goodsId: 'relation', status: 'select' }
  },
  goodsType: {
    queryFields: ['id', 'name', 'status'],
    fieldTypes: { status: 'select' }
  },
  goodsSkuSpec: {
    queryFields: ['id', 'skuId', 'skuCode', 'specId', 'specName', 'specValue', 'sort'],
    fieldTypes: { skuId: 'relation', specId: 'number', sort: 'number' }
  },
  goodsImage: {
    queryFields: ['id', 'goodsId', 'skuId', 'skuCode', 'imageUrl', 'sort'],
    fieldTypes: { goodsId: 'relation', skuId: 'relation', sort: 'number' }
  },
  goodsLevelPrice: {
    queryFields: ['id', 'goodsId', 'skuId', 'skuCode', 'levelId', 'price', 'currency', 'discount', 'effectiveTime', 'expireTime', 'status'],
    fieldTypes: { goodsId: 'relation', skuId: 'relation', levelId: 'number', status: 'select' }
  },
  stockType: {
    queryFields: ['id', 'name', 'status'],
    fieldTypes: { status: 'select' }
  },
  stockRecord: {
    queryFields: ['id', 'bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsName', 'skuCode', 'brandName', 'seriesName', 'categoryName', 'stockTypeName', 'makerName', 'warehouseId', 'beforeQty', 'changeQty', 'afterQty', 'price', 'currency', 'priceUpdateTime', 'customerName', 'requesterName', 'operatorName', 'remark'],
    fieldTypes: { warehouseId: 'relation' }
  },
  stockOrder: {
    queryFields: ['id', 'orderNo', 'orderType', 'stockTypeId', 'warehouseId', 'sourceType', 'sourceId', 'totalQty', 'state', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark', 'approverId', 'approverName', 'approveTime', 'version', 'finishTime'],
    fieldTypes: { warehouseId: 'relation', requesterId: 'relation', operatorId: 'relation', approverId: 'relation' }
  },
  stockOrderItem: {
    queryFields: ['id', 'orderId', 'goodsName', 'skuCode', 'brandName', 'seriesName', 'categoryName', 'stockTypeName', 'makerName', 'beforeQty', 'changeQty', 'afterQty', 'price', 'currency', 'remark']
  },
  requestForm: {
    queryFields: ['id', 'bizNo', 'username', 'deptName', 'customerName', 'warehouseId', 'totalQty', 'requestQty', 'totalAmt', 'state', 'approverName', 'approveTime', 'approveRemark'],
    fieldTypes: { deptId: 'relation', customerId: 'number', warehouseId: 'relation', approverId: 'relation' }
  },
  requestItem: {
    queryFields: ['id', 'requestId', 'goodsName', 'skuCode', 'englishName', 'brandName', 'seriesName', 'typeName', 'categoryName', 'makerName', 'warehouseId', 'price', 'currency', 'discount', 'requestQty', 'approveQty', 'outQty', 'remark'],
    fieldTypes: { requestId: 'number', warehouseId: 'relation' }
  },
  priceRecord: {
    queryFields: ['id', 'goodsName', 'englishName', 'skuCode', 'oldPrice', 'newPrice', 'currency', 'discount', 'priceUpdateTime', 'operatorName']
  },
  customer: {
    queryFields: ['id', 'customerCode', 'name', 'englishName', 'contactPerson', 'phone', 'email', 'country', 'city', 'address', 'levelId', 'ownerUserId', 'ownerDeptId', 'remark', 'status'],
    fieldTypes: { levelId: 'number', ownerUserId: 'relation', ownerDeptId: 'relation', status: 'select' }
  },
  customerLevel: {
    queryFields: ['id', 'name', 'discount', 'remark', 'status'],
    fieldTypes: { status: 'select' }
  },
  message: {
    queryFields: ['id', 'type', 'userId', 'message', 'sourceId', 'isRead', 'state'],
    fieldTypes: { userId: 'relation' }
  },
  operateLog: {
    queryFields: ['id', 'userId', 'username', 'module', 'operation', 'method', 'requestUrl', 'requestIp', 'status', 'errorMsg', 'costTime'],
    fieldTypes: { userId: 'relation', status: 'select' }
  },
  userRole: {
    queryFields: ['id', 'userId', 'roleId'],
    fieldTypes: { userId: 'relation', roleId: 'relation' }
  },
  rolePermission: {
    queryFields: ['id', 'roleId', 'permissionId'],
    fieldTypes: { roleId: 'relation', permissionId: 'relation' }
  },
  userToken: {
    queryFields: ['id', 'token', 'userId', 'loginTime', 'expireTime', 'loginIp', 'status'],
    fieldTypes: { userId: 'relation', status: 'select' }
  }
};

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '有効', value: 1 },
  { label: '無効', value: 0 }
];

/**
 * 关联模块
 */
export const RELATION_FIELD_MODULE = {
  deptId: 'dept',
  managerId: 'user',
  leaderId: 'user',
  roleId: 'role',
  permissionId: 'permission',
  seriesId: 'series',
  brandId: 'brand',
  categoryId: 'category',
  makerId: 'maker',
  goodsId: 'goods',
  skuId: 'goodsSku',
  warehouseId: 'warehouse',
  requesterId: 'user',
  operatorId: 'user',
  approverId: 'user',
  ownerUserId: 'user',
  ownerDeptId: 'dept'
};

const NAME_TO_ID_FIELD = {
  deptName: 'deptId',
  roleName: 'roleId',
  permissionName: 'permissionId',
  managerName: 'managerId',
  leaderName: 'leaderId',
  seriesName: 'seriesId',
  brandName: 'brandId',
  categoryName: 'categoryId',
  makerName: 'makerId',
  goodsName: 'goodsId',
  skuName: 'skuId',
  warehouseName: 'warehouseId',
  userName: 'userId'
  ,
  requesterName: 'requesterId',
  operatorName: 'operatorId',
  approverName: 'approverId'
};

/**
 * 字段日语标题
 */
export const FIELD_LABELS = {
  id: 'ID',

  username: 'ユーザー名',
  password: 'パスワード',
  deptId: '部署',
  deptName: '部署名',
  roleId: 'ロール',
  roleName: 'ロール名',

  name: '名称',
  englishName: '英語名',
  code: 'コード',

  email: 'メールアドレス',
  phone: '電話番号',
  avatar: 'アバター',

  warehouseId: '倉庫',
  warehouseName: '倉庫名',

  goodsId: '商品',
  goodsName: '商品名',

  skuId: 'SKU',
  skuCode: 'SKUコード',

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
  parentId: '親ID',
  leaderId: '責任者ID',
  leaderName: '責任者名',
  managerId: '管理者ID',
  managerName: '管理者名',
  userId: 'ユーザーID',
  userName: 'ユーザー名',
  typeId: '種別ID',
  typeName: '種別名',
  stockTypeId: '在庫区分ID',
  stockTypeName: '在庫区分',
  stockId: '在庫ID',
  levelId: 'ランクID',
  levelName: 'ランク名',
  customerId: '顧客ID',
  customerName: '顧客名',
  customerCode: '顧客コード',
  orderId: '伝票ID',
  orderNo: '伝票番号',
  orderType: '伝票種別',
  orderItemId: '伝票明細ID',
  requestId: '申請ID',
  requestNo: '申請番号',
  requestType: '申請種別',
  requestStatus: '申請状態',
  itemId: '明細ID',
  itemName: '明細名',
  imageUrl: '画像URL',
  avatarUrl: 'アバターURL',
  icon: 'アイコン',
  path: 'パス',
  method: 'メソッド',
  url: 'URL',
  ip: 'IPアドレス',
  loginIp: 'ログインIP',
  token: 'トークン',
  currency: '通貨',
  beforeQty: '変更前数量',
  afterQty: '変更後数量',
  currentQty: '現在数量',
  lockQty: 'ロック数量',
  newPrice: '新価格',
  oldPrice: '旧価格',
  priceUpdateTime: '価格更新日時',
  isHot: '人気商品',
  title: 'タイトル',
  content: '内容',
  message: 'メッセージ',
  deleted: '削除フラグ',
  version: 'バージョン'
};

/**
 * 左侧菜单
 */
export function toMenuItems() {
  return MODULE_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    children: group.children.map((item) => ({
      key: item.key,
      label: item.label
    }))
  }));
}

/**
 * 模块标题
 */
export function moduleTitle(moduleKey) {
  for (const group of MODULE_GROUPS) {
    const found = group.children.find((item) => item.key === moduleKey);
    if (found) {
      return found.label;
    }
  }
  return moduleKey;
}

/**
 * 模块配置
 */
export function getModulePreset(moduleKey) {
  return MODULE_PRESETS[moduleKey] || {
    queryFields: [],
    formFields: [],
    fieldTypes: {}
  };
}

/**
 * 字段标题（日语）
 */
export function normalizeTitle(key) {
  if (!key) return '';

  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key];
  }

  return autoLabelFromField(String(key));
}

/**
 * 表格显示字段
 */
export function displayKeys(record) {
  if (!record) return [];

  return Object.keys(record).filter((key) => {
    const low = key.toLowerCase();

    if (low.endsWith('id')) {
      const nameKey = key.slice(0, -2) + 'Name';
      if (Object.prototype.hasOwnProperty.call(record, nameKey)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * 自动推断字段类型
 */
export function guessFieldType(field, moduleKey) {
  const preset = MODULE_PRESETS[moduleKey];

  const byPreset = preset?.fieldTypes?.[field];
  if (byPreset) {
    return byPreset;
  }

  const low = String(field || '').toLowerCase();

  if (low.includes('time') || low.includes('date')) {
    return 'datetime';
  }

  if (low === 'status') {
    return 'select';
  }

  if (low.startsWith('is') || low.startsWith('has')) {
    return 'switch';
  }

  if (RELATION_FIELD_MODULE[field]) {
    return 'relation';
  }

  if (low.endsWith('id')) {
    return 'number';
  }

  if (
    low.includes('price') ||
    low.includes('amount') ||
    low.includes('discount')
  ) {
    return 'decimal';
  }

  if (
    low.includes('count') ||
    low.includes('num') ||
    low.includes('sort') ||
    low.includes('quantity')
  ) {
    return 'number';
  }

  if (
    low.includes('description') ||
    low.includes('remark') ||
    low.includes('content')
  ) {
    return 'textarea';
  }

  return 'text';
}

/**
 * 获取关联模块
 */
export function relationModuleByField(field) {
  return RELATION_FIELD_MODULE[field];
}

export function mapNameFieldToIdField(field) {
  return NAME_TO_ID_FIELD[field] || '';
}

export function buildAutoQueryFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return [];
  return fields.filter((f) => {
    const low = String(f || '').toLowerCase();
    if (!low) return false;
    if (low.endsWith('desc')) return false;
    return true;
  });
}

/**
 * 关联显示文本
 */
export function relationLabel(record) {
  if (!record) return '';

  return (
    record.name ||
    record.leaderName ||
    record.username ||
    record.code ||
    record.title ||
    `ID:${record.id}`
  );
}

function autoLabelFromField(field) {
  const low = field.toLowerCase();
  if (low === 'id') return 'ID';
  if (low === 'createtime') return '作成日時';
  if (low === 'updatetime') return '更新日時';
  if (low === 'statusdesc' || low === 'status') return '状態';

  if (field.endsWith('Name')) {
    const base = field.slice(0, -4);
    return `${toReadable(base)}名`;
  }
  if (field.endsWith('Id')) {
    const base = field.slice(0, -2);
    return `${toReadable(base)}ID`;
  }
  if (field.endsWith('Code')) {
    const base = field.slice(0, -4);
    return `${toReadable(base)}コード`;
  }
  if (field.endsWith('Time')) {
    const base = field.slice(0, -4);
    return `${toReadable(base)}日時`;
  }

  return toReadable(field);
}

function toReadable(value) {
  const s = String(value || '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim();
  if (!s) return '項目';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
