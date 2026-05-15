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

const MENU_I18N = {
  ja: {
    base: '基礎マスタ',
    goods: '商品管理',
    stock: '在庫管理',
    customer: '顧客管理',
    system: 'システム管理',
    user: 'ユーザー管理',
    dept: '部署管理',
    warehouse: '倉庫管理',
    role: 'ロール管理',
    permission: '権限管理',
    goodsSku: 'SKU管理',
    goodsSkuSpec: 'SKU仕様管理',
    goodsImage: '商品画像管理',
    goodsLevelPrice: '会員価格管理',
    maker: 'メーカー管理',
    brand: 'ブランド管理',
    category: 'カテゴリ管理',
    series: 'シリーズ管理',
    stockType: '在庫区分',
    stockRecord: '在庫履歴',
    stockOrder: '入出庫伝票',
    stockOrderItem: '入出庫明細',
    requestForm: '申請管理',
    requestItem: '申請明細',
    priceRecord: '価格履歴',
    customerLevel: '顧客ランク管理',
    config: 'システム設定',
    message: 'メッセージ管理',
    operateLog: '操作ログ',
  },
  zh: {
    base: '基础主数据',
    goods: '商品管理',
    stock: '库存管理',
    customer: '客户管理',
    system: '系统管理',
    user: '用户管理',
    dept: '部门管理',
    warehouse: '仓库管理',
    role: '角色管理',
    permission: '权限管理',
    goodsSku: 'SKU管理',
    goodsSkuSpec: 'SKU规格管理',
    goodsImage: '商品图片管理',
    goodsLevelPrice: '会员价格管理',
    maker: '制造商管理',
    brand: '品牌管理',
    category: '分类管理',
    series: '系列管理',
    stockType: '库存区分',
    stockRecord: '库存履历',
    stockOrder: '出入库单据',
    stockOrderItem: '出入库明细',
    requestForm: '申请管理',
    requestItem: '申请明细',
    priceRecord: '价格履历',
    customerLevel: '客户等级管理',
    config: '系统设置',
    message: '消息管理',
    operateLog: '操作日志',
  },
  en: {
    base: 'Master Data',
    goods: 'Goods',
    stock: 'Inventory',
    customer: 'Customers',
    system: 'System',
    user: 'Users',
    dept: 'Departments',
    warehouse: 'Warehouses',
    role: 'Roles',
    permission: 'Permissions',
    goodsSku: 'SKUs',
    goodsSkuSpec: 'SKU Specs',
    goodsImage: 'Goods Images',
    goodsLevelPrice: 'Member Prices',
    maker: 'Makers',
    brand: 'Brands',
    category: 'Categories',
    series: 'Series',
    stockType: 'Stock Types',
    stockRecord: 'Stock Records',
    stockOrder: 'Stock Orders',
    stockOrderItem: 'Stock Order Items',
    requestForm: 'Requests',
    requestItem: 'Request Items',
    priceRecord: 'Price Records',
    customerLevel: 'Customer Levels',
    config: 'System Config',
    message: 'Messages',
    operateLog: 'Operation Logs',
  },
};

export function getLocalizedModuleGroups(lang = 'ja-JP') {
  const low = String(lang || '').toLowerCase();
  const locale = low.startsWith('zh') ? 'zh' : low.startsWith('en') ? 'en' : 'ja';
  const dict = MENU_I18N[locale] || MENU_I18N.ja;
  return MODULE_GROUPS.map((group) => ({
    ...group,
    label: dict[group.key] || group.label,
    children: group.children.map((child) => ({
      ...child,
      label: dict[child.key] || child.label,
    })),
  }));
}

/**
 * 模块默认配置
 */
export const MODULE_PRESETS = {
  user: {
    queryFields: ['username', 'deptId', 'deptName', 'email', 'phone', 'status'],
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
    queryFields: ['id', 'name', 'englishName', 'seriesId', 'brandId', 'categoryId', 'makerId', 'sort', 'status', 'isHot'],
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
    queryFields: ['id', 'goodsId', 'goodsName', 'skuCode', 'skuId', 'stockTypeId', 'currentQty', 'lockQty', 'price', 'priceUpdateTime', 'currency', 'warehouseId', 'status'],
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
    queryFields: ['id', 'name', 'code', 'module', 'type', 'parentId', 'path', 'sort', 'icon', 'component', 'status'],
    fieldTypes: { parentId: 'relation', sort: 'number', status: 'select' }
  },
  maker: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' }
  },
  brand: {
    queryFields: ['id', 'name', 'englishName', 'image', 'content', 'status'],
    formFields: ['name', 'englishName', 'content', 'status'],
    fieldTypes: { status: 'select' }
  },
  category: {
    queryFields: ['id', 'name', 'status'],
    formFields: ['name', 'status'],
    fieldTypes: { status: 'select' }
  },
  series: {
    queryFields: ['id', 'name', 'englishName', 'brandId', 'content', 'status'],
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
    queryFields: ['id', 'bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'warehouseId', 'beforeQty', 'changeQty', 'afterQty', 'sourceType', 'orderType', 'price', 'currency', 'priceUpdateTime', 'customerId', 'customerName', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark'],
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
    queryFields: ['id', 'bizNo', 'userId', 'username', 'deptId', 'deptName', 'customerId', 'customerName', 'warehouseId', 'totalQty', 'requestQty', 'totalAmt', 'state', 'approverId', 'approverName', 'approveTime', 'approveRemark'],
    fieldTypes: { deptId: 'relation', customerId: 'number', warehouseId: 'relation', approverId: 'relation' }
  },
  requestItem: {
    queryFields: ['id', 'requestId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'makerId', 'makerName', 'stockTypeId', 'stockTypeName', 'warehouseId', 'price', 'currency', 'discount', 'requestQty', 'approveQty', 'outQty', 'stockRecordId', 'remark'],
    fieldTypes: { requestId: 'number', warehouseId: 'relation' }
  },
  priceRecord: {
    queryFields: ['id', 'goodsId', 'goodsName', 'englishName', 'skuId', 'skuCode', 'oldPrice', 'newPrice', 'currency', 'discount', 'priceUpdateTime', 'operatorId', 'operatorName']
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
    queryFields: ['id', 'userId', 'username', 'module', 'operation', 'method', 'requestUrl', 'requestIp', 'requestParam', 'responseData', 'status', 'errorMsg', 'costTime'],
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
  typeId: '在庫区分ID',
  typeName: '在庫区分',
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

const FIELD_LABELS_ZH = {
  id: 'ID',
  createTime: '创建时间',
  updateTime: '更新时间',
  createdBy: '创建人',
  updatedBy: '更新人',
  status: '状态',
  statusDesc: '状态',
  name: '名称',
  englishName: '英文名',
  code: '编码',
  username: '用户名',
  password: '密码',
  email: '邮箱',
  phone: '电话',
  avatar: '头像',
  avatarUrl: '头像URL',
  address: '地址',
  remark: '备注',
  description: '描述',
  title: '标题',
  content: '内容',
  message: '消息',
  sort: '排序',
  icon: '图标',
  path: '路径',
  method: '方法',
  currency: '币种',
  token: '令牌',
  loginIp: '登录IP',
  deptName: '部门名称',
  deptId: '部门',
  roleName: '角色名称',
  roleId: '角色',
  permissionId: '权限',
  permissionName: '权限名称',
  userId: '用户ID',
  userName: '用户名',
  warehouseId: '仓库',
  warehouseName: '仓库名称',
  goodsId: '商品',
  brandName: '品牌名称',
  seriesName: '系列名称',
  categoryName: '分类名称',
  makerName: '制造商名称',
  goodsName: '商品名称',
  skuId: 'SKU',
  skuCode: 'SKU编码',
  skuName: 'SKU名称',
  imageUrl: '图片URL',
  stockTypeId: '库存分类ID',
  stockTypeName: '库存分类',
  quantity: '数量',
  currentQty: '当前数量',
  lockQty: '锁定数量',
  beforeQty: '变更前数量',
  afterQty: '变更后数量',
  oldPrice: '原价',
  newPrice: '新价格',
  priceUpdateTime: '价格更新时间',
  customerId: '客户ID',
  customerName: '客户名称',
  customerCode: '客户编码',
  orderId: '单据ID',
  orderNo: '单据编号',
  orderType: '单据类型',
  requestId: '申请ID',
  requestType: '申请类型',
  requestStatus: '申请状态',
  operatorId: '操作人ID',
  operatorName: '操作人名称',
  requesterId: '申请人ID',
  requesterName: '申请人名称',
  approverId: '审批人ID',
  approverName: '审批人名称',
  approveTime: '审批时间',
  version: '版本',
  price: '价格',
  discount: '折扣',
};

const FIELD_LABELS_EN = {
  id: 'ID',
  createTime: 'Created At',
  updateTime: 'Updated At',
  createdBy: 'Created By',
  updatedBy: 'Updated By',
  status: 'Status',
  statusDesc: 'Status',
  name: 'Name',
  englishName: 'English Name',
  code: 'Code',
  username: 'Username',
  password: 'Password',
  email: 'Email',
  phone: 'Phone',
  avatar: 'Avatar',
  avatarUrl: 'Avatar URL',
  address: 'Address',
  remark: 'Remark',
  description: 'Description',
  title: 'Title',
  content: 'Content',
  message: 'Message',
  sort: 'Sort',
  icon: 'Icon',
  path: 'Path',
  method: 'Method',
  currency: 'Currency',
  token: 'Token',
  loginIp: 'Login IP',
  deptName: 'Department',
  deptId: 'Department',
  roleName: 'Role Name',
  roleId: 'Role',
  permissionId: 'Permission',
  permissionName: 'Permission Name',
  userId: 'User ID',
  userName: 'User Name',
  warehouseId: 'Warehouse',
  warehouseName: 'Warehouse Name',
  goodsId: 'Goods',
  brandName: 'Brand',
  seriesName: 'Series',
  categoryName: 'Category',
  makerName: 'Maker',
  goodsName: 'Goods Name',
  skuId: 'SKU',
  skuCode: 'SKU Code',
  skuName: 'SKU Name',
  imageUrl: 'Image URL',
  stockTypeId: 'Stock Type ID',
  stockTypeName: 'Stock Type',
  quantity: 'Quantity',
  currentQty: 'Current Qty',
  lockQty: 'Locked Qty',
  beforeQty: 'Before Qty',
  afterQty: 'After Qty',
  oldPrice: 'Old Price',
  newPrice: 'New Price',
  priceUpdateTime: 'Price Updated At',
  customerId: 'Customer ID',
  customerName: 'Customer Name',
  customerCode: 'Customer Code',
  orderId: 'Order ID',
  orderNo: 'Order No',
  orderType: 'Order Type',
  requestId: 'Request ID',
  requestType: 'Request Type',
  requestStatus: 'Request Status',
  operatorId: 'Operator ID',
  operatorName: 'Operator Name',
  requesterId: 'Requester ID',
  requesterName: 'Requester Name',
  approverId: 'Approver ID',
  approverName: 'Approver Name',
  approveTime: 'Approved At',
  version: 'Version',
  price: 'Price',
  discount: 'Discount',
};

function resolveLocale(lang = 'ja-JP') {
  const low = String(lang || '').toLowerCase();
  if (low.startsWith('zh')) return 'zh';
  if (low.startsWith('en')) return 'en';
  return 'ja';
}

function fieldLabelDict(lang = 'ja-JP') {
  const locale = resolveLocale(lang);
  if (locale === 'zh') return FIELD_LABELS_ZH;
  if (locale === 'en') return FIELD_LABELS_EN;
  return FIELD_LABELS;
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
export function normalizeTitle(key, lang = 'ja-JP') {
  if (!key) return '';
  const dict = fieldLabelDict(lang);

  if (dict[key]) {
    return dict[key];
  }

  return autoLabelFromField(String(key), resolveLocale(lang));
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

function autoLabelFromField(field, locale = 'ja') {
  const low = field.toLowerCase();
  if (low === 'id') return 'ID';
  if (low === 'createtime') return locale === 'en' ? 'Created At' : locale === 'zh' ? '创建时间' : '作成日時';
  if (low === 'updatetime') return locale === 'en' ? 'Updated At' : locale === 'zh' ? '更新时间' : '更新日時';
  if (low === 'statusdesc' || low === 'status') return locale === 'en' ? 'Status' : locale === 'zh' ? '状态' : '状態';

  if (field.endsWith('Name')) {
    const base = field.slice(0, -4);
    if (locale === 'en') return `${toReadable(base)} Name`;
    if (locale === 'zh') return `${toReadable(base)}名称`;
    return `${toReadable(base)}名`;
  }
  if (field.endsWith('Id')) {
    const base = field.slice(0, -2);
    return locale === 'en' ? `${toReadable(base)} ID` : `${toReadable(base)}ID`;
  }
  if (field.endsWith('Code')) {
    const base = field.slice(0, -4);
    if (locale === 'en') return `${toReadable(base)} Code`;
    if (locale === 'zh') return `${toReadable(base)}编码`;
    return `${toReadable(base)}コード`;
  }
  if (field.endsWith('Time')) {
    const base = field.slice(0, -4);
    if (locale === 'en') return `${toReadable(base)} Time`;
    if (locale === 'zh') return `${toReadable(base)}时间`;
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
