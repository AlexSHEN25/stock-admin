export const MODULE_GROUPS = [
  {
    key: 'base',
    label: '基礎マスタ',
    children: [
      { key: 'user', label: 'ユーザー管理' },
      { key: 'dept', label: '部署管理' },
      { key: 'warehouse', label: '倉庫管理' },
      { key: 'role', label: 'ロール管理' },
      { key: 'permission', label: '権限管理' },
    ],
  },
  {
    key: 'goods',
    label: '商品管理',
    children: [
      { key: 'goods', label: '商品管理' },
      { key: 'goodsLevelPrice', label: '会員価格管理' },
      { key: 'maker', label: 'メーカー管理' },
      { key: 'brand', label: 'ブランド管理' },
      { key: 'category', label: 'カテゴリ管理' },
      { key: 'series', label: 'シリーズ管理' },
    ],
  },
  {
    key: 'stock',
    label: '在庫管理',
    children: [
      { key: 'stock', label: '在庫一覧' },
      { key: 'stockType', label: '在庫区分' },
      { key: 'stockRecord', label: '在庫履歴' },
      { key: 'stockOrder', label: '入出庫伝票' },
      { key: 'priceRecord', label: '価格履歴' },
    ],
  },
  {
    key: 'request',
    label: '請求書管理',
    children: [
      { key: 'requestForm', label: '申請管理' },
      { key: 'requestItem', label: '申請明細' },
    ],
  },
  {
    key: 'customer',
    label: '顧客管理',
    children: [
      { key: 'customer', label: '顧客管理' },
      { key: 'customerLevel', label: '顧客ランク管理' },
    ],
  },
  {
    key: 'system',
    label: 'システム管理',
    children: [
      { key: 'config', label: 'システム設定' },
      { key: 'message', label: 'メッセージ管理' },
      { key: 'operateLog', label: '操作ログ' },
    ],
  },
];

export const MODULE_PRESETS = {
  user: {
    queryFields: ['username', 'deptId', 'deptName', 'email', 'phone', 'status'],
    formFields: ['username', 'password', 'deptId', 'email', 'phone', 'status'],
    fieldTypes: { deptId: 'relation', status: 'select' },
  },
  dept: {
    queryFields: ['id', 'name', 'code', 'leaderId', 'sort', 'status'],
    formFields: ['parentId', 'name', 'code', 'leaderId', 'sort', 'status'],
    fieldTypes: { parentId: 'relation', leaderId: 'relation', sort: 'number', status: 'select' },
  },
  goods: {
    queryFields: ['id', 'name', 'englishName', 'seriesId', 'brandId', 'categoryId', 'makerId', 'sort', 'status', 'isHot'],
    formFields: ['name', 'englishName', 'brandId', 'seriesId', 'categoryId', 'makerId', 'description', 'isHot', 'skuCode', 'skuName', 'price', 'status'],
    fieldTypes: {
      brandId: 'relation',
      seriesId: 'relation',
      categoryId: 'relation',
      makerId: 'relation',
      isHot: 'switch',
      price: 'decimal',
      status: 'select',
      description: 'textarea',
    },
  },
  stock: {
    queryFields: ['id', 'goodsId', 'goodsName', 'skuCode', 'skuId', 'stockTypeId', 'currentQty', 'lockQty', 'price', 'priceUpdateTime', 'currency', 'warehouseId', 'status'],
    formFields: ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'remark', 'status'],
    fieldTypes: {
      goodsId: 'relation',
      sourceType: 'select',
      warehouseId: 'relation',
      stockTypeId: 'relation',
      quantity: 'number',
      remark: 'textarea',
      status: 'select',
    },
  },
  stockOrder: {
    queryFields: ['id', 'orderNo', 'orderType', 'stockTypeId', 'warehouseId', 'sourceType', 'sourceId', 'totalQty', 'state', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'approverId', 'approverName', 'approveTime', 'finishTime', 'remark'],
    formFields: ['orderNo', 'orderType', 'warehouseId', 'sourceType', 'sourceId', 'totalQty', 'stockTypeId', 'state', 'requesterId', 'operatorId', 'approverId', 'approveTime', 'finishTime', 'remark'],
    fieldTypes: {
      warehouseId: 'relation',
      stockTypeId: 'relation',
      requesterId: 'relation',
      operatorId: 'relation',
      approverId: 'relation',
      orderType: 'select',
      sourceType: 'select',
      sourceId: 'number',
      totalQty: 'number',
      state: 'select',
      approveTime: 'datetime',
      finishTime: 'datetime',
      remark: 'textarea',
    },
  },
  stockOrderItem: {
    queryFields: ['id', 'orderId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'beforeQty', 'changeQty', 'afterQty', 'price', 'currency', 'remark'],
    formFields: ['orderId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'beforeQty', 'changeQty', 'afterQty', 'price', 'currency', 'remark'],
    fieldTypes: {
      orderId: 'number',
      goodsId: 'relation',
      skuId: 'relation',
      brandId: 'relation',
      seriesId: 'relation',
      categoryId: 'relation',
      stockTypeId: 'relation',
      makerId: 'relation',
      beforeQty: 'number',
      changeQty: 'number',
      afterQty: 'number',
      price: 'decimal',
      remark: 'textarea',
    },
  },
  stockRecord: {
    queryFields: ['id', 'bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'warehouseId', 'beforeQty', 'changeQty', 'afterQty', 'sourceType', 'orderType', 'price', 'currency', 'priceUpdateTime', 'customerId', 'customerName', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark'],
    formFields: ['bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'warehouseId', 'beforeQty', 'changeQty', 'afterQty', 'sourceType', 'orderType', 'price', 'currency', 'priceUpdateTime', 'customerId', 'customerName', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark'],
    fieldTypes: {
      orderId: 'number',
      orderItemId: 'number',
      stockId: 'number',
      goodsId: 'relation',
      skuId: 'relation',
      brandId: 'relation',
      seriesId: 'relation',
      categoryId: 'relation',
      stockTypeId: 'relation',
      makerId: 'relation',
      warehouseId: 'relation',
      customerId: 'relation',
      requesterId: 'relation',
      operatorId: 'relation',
      beforeQty: 'number',
      changeQty: 'number',
      afterQty: 'number',
      sourceType: 'number',
      orderType: 'number',
      price: 'decimal',
      priceUpdateTime: 'datetime',
      remark: 'textarea',
    },
  },
  requestForm: {
    queryFields: ['id', 'bizNo', 'userId', 'username', 'deptId', 'deptName', 'customerId', 'customerName', 'warehouseId', 'totalQty', 'requestQty', 'totalAmt', 'state', 'approverId', 'approverName', 'approveTime', 'approveRemark'],
    formFields: ['bizNo', 'userId', 'username', 'deptId', 'deptName', 'customerId', 'customerName', 'warehouseId', 'totalQty', 'requestQty', 'totalAmt', 'state', 'approverId', 'approverName', 'approveTime', 'approveRemark'],
    fieldTypes: {
      userId: 'relation',
      deptId: 'relation',
      customerId: 'relation',
      warehouseId: 'relation',
      approverId: 'relation',
      totalQty: 'number',
      requestQty: 'number',
      totalAmt: 'decimal',
      state: 'number',
      approveTime: 'datetime',
      approveRemark: 'textarea',
    },
  },
  requestItem: {
    queryFields: ['id', 'requestId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'makerId', 'makerName', 'stockTypeId', 'stockTypeName', 'warehouseId', 'price', 'currency', 'discount', 'requestQty', 'approveQty', 'outQty', 'stockRecordId', 'remark'],
    formFields: ['requestId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'makerId', 'makerName', 'stockTypeId', 'stockTypeName', 'warehouseId', 'price', 'currency', 'discount', 'requestQty', 'approveQty', 'outQty', 'stockRecordId', 'remark'],
    fieldTypes: {
      requestId: 'number',
      goodsId: 'relation',
      skuId: 'relation',
      brandId: 'relation',
      seriesId: 'relation',
      categoryId: 'relation',
      makerId: 'relation',
      stockTypeId: 'relation',
      warehouseId: 'relation',
      stockRecordId: 'number',
      price: 'decimal',
      discount: 'decimal',
      requestQty: 'number',
      approveQty: 'number',
      outQty: 'number',
      remark: 'textarea',
    },
  },
  warehouse: {
    queryFields: ['id', 'name', 'code', 'address', 'managerId', 'status'],
    formFields: ['name', 'code', 'address', 'managerId', 'status'],
    fieldTypes: { managerId: 'relation', status: 'select' },
  },
  role: {
    queryFields: ['id', 'name', 'code', 'remark', 'status'],
    formFields: ['name', 'code', 'remark', 'status'],
    fieldTypes: { status: 'select' },
  },
  permission: {
    queryFields: ['id', 'name', 'code', 'module', 'type', 'parentId', 'path', 'sort', 'icon', 'component', 'status'],
    fieldTypes: { parentId: 'relation', sort: 'number', status: 'select' },
  },
  maker: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' },
  },
  brand: {
    queryFields: ['id', 'name', 'englishName', 'image', 'content', 'status'],
    formFields: ['name', 'englishName', 'content', 'status'],
    fieldTypes: { status: 'select' },
  },
  category: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' },
  },
  series: {
    queryFields: ['id', 'name', 'englishName', 'brandId', 'content', 'status'],
    formFields: ['name', 'englishName', 'brandId', 'content', 'status'],
    fieldTypes: { brandId: 'relation', status: 'select' },
  },
  config: {
    queryFields: ['id', 'name', 'group', 'title', 'tip', 'type', 'value', 'content'],
  },
  goodsSku: {
    queryFields: ['id', 'goodsId', 'skuCode', 'skuName', 'price', 'currency', 'costPrice', 'updatePrice', 'priceUpdateTime', 'barcode', 'weight', 'volume', 'status'],
    fieldTypes: { goodsId: 'relation', status: 'select' },
  },
  goodsSkuSpec: {
    queryFields: ['id', 'skuId', 'skuCode', 'specId', 'specName', 'specValue', 'sort'],
    fieldTypes: { skuId: 'relation', specId: 'number', sort: 'number' },
  },
  goodsImage: {
    queryFields: ['id', 'goodsId', 'skuId', 'skuCode', 'imageUrl', 'sort'],
    fieldTypes: { goodsId: 'relation', skuId: 'relation', sort: 'number' },
  },
  goodsLevelPrice: {
    queryFields: ['id', 'goodsId', 'skuId', 'skuCode', 'levelId', 'price', 'currency', 'discount', 'effectiveTime', 'expireTime', 'status'],
    fieldTypes: { goodsId: 'relation', skuId: 'relation', levelId: 'number', status: 'select' },
  },
  stockType: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' },
  },
  priceRecord: {
    queryFields: ['id', 'goodsId', 'goodsName', 'englishName', 'skuId', 'skuCode', 'oldPrice', 'newPrice', 'currency', 'discount', 'priceUpdateTime', 'operatorId', 'operatorName'],
  },
  customer: {
    queryFields: ['id', 'customerCode', 'name', 'englishName', 'contactPerson', 'phone', 'email', 'country', 'city', 'address', 'levelName', 'ownerUserName', 'ownerDeptName', 'remark', 'status'],
    formFields: ['customerCode', 'name', 'englishName', 'contactPerson', 'phone', 'email', 'country', 'city', 'address', 'levelId', 'ownerUserId', 'ownerDeptId', 'remark', 'status'],
    fieldTypes: { levelId: 'relation', ownerUserId: 'relation', ownerDeptId: 'relation', status: 'select' },
  },
  customerLevel: {
    queryFields: ['id', 'name', 'discount', 'remark', 'status'],
    fieldTypes: { status: 'select' },
  },
  message: {
    queryFields: ['id', 'type', 'userId', 'message', 'sourceId', 'isRead', 'state'],
    fieldTypes: { userId: 'relation' },
  },
  operateLog: {
    queryFields: ['id', 'userId', 'username', 'module', 'operation', 'method', 'requestUrl', 'requestIp', 'requestParam', 'responseData', 'status', 'errorMsg', 'costTime'],
    fieldTypes: { userId: 'relation', status: 'select' },
  },
  userRole: {
    queryFields: ['id', 'userId', 'roleId'],
    fieldTypes: { userId: 'relation', roleId: 'relation' },
  },
  rolePermission: {
    queryFields: ['id', 'roleId', 'permissionId'],
    fieldTypes: { roleId: 'relation', permissionId: 'relation' },
  },
  userToken: {
    queryFields: ['id', 'token', 'userId', 'loginTime', 'expireTime', 'loginIp', 'status'],
    fieldTypes: { userId: 'relation', status: 'select' },
  },
};

export const REQUIRED_FORM_FIELDS = {
  user: ['username', 'password', 'deptId', 'status'],
  dept: ['name', 'code', 'status'],
  goods: ['name', 'englishName', 'brandId', 'seriesId', 'categoryId', 'makerId', 'skuCode', 'skuName'],
  stock: ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'],
  stockOrder: ['orderNo', 'orderType', 'warehouseId', 'sourceType'],
  stockOrderItem: ['orderId', 'goodsId', 'skuId', 'goodsName', 'beforeQty', 'changeQty', 'afterQty'],
  stockRecord: ['bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'goodsName', 'beforeQty', 'changeQty', 'afterQty', 'orderType', 'sourceType'],
  requestForm: ['bizNo', 'userId', 'username', 'customerId', 'customerName'],
  requestItem: ['requestId', 'goodsId', 'skuId'],
  warehouse: ['name', 'code', 'status'],
  role: ['name', 'code', 'status'],
  maker: ['name', 'status'],
  brand: ['name', 'status'],
  category: ['name', 'status'],
  series: ['name', 'brandId', 'status'],
};

export const STATUS_OPTIONS = [
  { label: '有効', value: 1 },
  { label: '無効', value: 0 },
];

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
  skuName: 'SKU名',
  barcode: 'バーコード',
  weight: '重量',
  volume: '体積',
  costPrice: '原価',
  updatePrice: '改定価格',
  currentQty: '現在数量',
  lockQty: 'ロック数量',
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
  parentId: '親ID',
  leaderId: '責任者ID',
  leaderName: '責任者名',
  managerId: '管理者ID',
  managerName: '管理者名',
  userId: 'ユーザーID',
  userName: 'ユーザー名',
  stockTypeId: '在庫区分',
  stockTypeName: '在庫区分',
  stockId: '在庫ID',
  levelId: 'ランクID',
  levelName: 'ランク名',
  ownerUserId: 'Owner UserID',
  ownerUserName: 'Owner User名',
  ownerDeptId: 'Owner DeptID',
  ownerDeptName: 'Owner Dept名',
  customerId: '顧客ID',
  customerName: '顧客名',
  customerCode: '顧客コード',
  orderId: '伝票ID',
  orderNo: '伝票番号',
  orderType: '伝票種別',
  sourceType: '入庫区分',
  sourceId: '元データID',
  orderItemId: '伝票明細ID',
  requestId: '申請ID',
  requestNo: '申請番号',
  requestType: '申請種別',
  requestStatus: '申請状態',
  imageUrl: '画像URL',
  currency: '通貨',
  beforeQty: '変更前数量',
  afterQty: '変更後数量',
  changeQty: '変更数量',
  totalQty: '合計数量',
  requestQty: '申請数量',
  approveQty: '承認数量',
  outQty: '出庫数量',
  totalAmt: '合計金額',
  state: '状態コード',
  approverId: '承認者ID',
  approverName: '承認者名',
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
};

export function getModulePreset(moduleKey) {
  return MODULE_PRESETS[moduleKey] || { queryFields: [], formFields: [], fieldTypes: {} };
}

export function isRequiredFormField(moduleKey, field) {
  const list = REQUIRED_FORM_FIELDS[moduleKey] || [];
  return list.includes(field);
}

export function normalizeTitle(key) {
  if (!key) return '';
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return autoLabelFromField(String(key));
}

export function displayKeys(record) {
  if (!record) return [];
  return Object.keys(record).filter((key) => {
    const low = key.toLowerCase();
    if (low.endsWith('id')) {
      const nameKey = key.slice(0, -2) + 'Name';
      if (Object.prototype.hasOwnProperty.call(record, nameKey)) return false;
    }
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
  if (low.endsWith('id')) return 'number';
  if (low.includes('price') || low.includes('amount') || low.includes('discount')) return 'decimal';
  if (low.includes('count') || low.includes('num') || low.includes('sort') || low.includes('quantity') || low.includes('qty')) return 'number';
  if (low.includes('description') || low.includes('remark') || low.includes('content')) return 'textarea';
  return 'text';
}

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

export function relationLabel(record) {
  if (!record) return '';
  return record.name || record.goodsName || record.skuName || record.username || record.code || `ID:${record.id}`;
}

function autoLabelFromField(field) {
  const low = field.toLowerCase();
  if (low === 'id') return 'ID';
  if (low === 'createtime') return '作成日時';
  if (low === 'updatetime') return '更新日時';
  if (low === 'statusdesc' || low === 'status') return '状態';

  if (field.endsWith('Name')) return `${toReadable(field.slice(0, -4))}名`;
  if (field.endsWith('Id')) return `${toReadable(field.slice(0, -2))}ID`;
  if (field.endsWith('Code')) return `${toReadable(field.slice(0, -4))}コード`;
  if (field.endsWith('Time')) return `${toReadable(field.slice(0, -4))}日時`;
  return toReadable(field);
}

function toReadable(value) {
  const s = String(value || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ').trim();
  if (!s) return '項目';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
