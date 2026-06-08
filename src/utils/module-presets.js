import { RELATION_FIELD_MODULE } from './module-fields';

const NAME_STATUS_QUERY_FIELDS = ['id', 'name', 'status'];
const NAME_STATUS_FORM_FIELDS = ['name', 'status'];
const STOCK_ORDER_ITEM_FIELDS = ['id', 'orderId', 'orderType', 'state', 'bizDate', 'warehouseId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'changeQty', 'price', 'currency', 'remark'];
const REQUEST_FINANCE_FIELDS = ['exchangeRate', 'currency', 'paymentDate', 'hasFee', 'feeAmount', 'hasUnpaid', 'unpaidAmount'];
const REQUEST_FORM_FIELDS = ['id', 'bizNo', 'sourceOrderId', 'sourceOrderNo', 'userId', 'username', 'deptId', 'deptName', 'customerId', 'customerName', 'warehouseId', 'totalQty', 'requestQty', 'totalAmt', ...REQUEST_FINANCE_FIELDS, 'state', 'approverId', 'approverName', 'approveTime', 'approveRemark'];
const REQUEST_ITEM_QUERY_FIELDS = ['requestId', 'goodsName', 'skuCode', 'brandName', 'seriesName', 'categoryName', 'makerName', 'stockTypeName', 'warehouseId', 'requestQty', 'approveQty', 'outQty', 'remark'];
const STOCK_PRESET = {
  queryFields: ['id', 'goodsId', 'goodsName', 'skuCode', 'skuId', 'stockTypeId', 'currentQty', 'groupAQty', 'groupBQty', 'groupCQty', 'price', 'priceUpdateTime', 'currency', 'warehouseId', 'status'],
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
};

export const MODULE_GROUPS = [
  {
    key: 'base',
    label: '基礎情報管理',
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
      { key: 'stockSelf', label: '自社在庫管理' },
      { key: 'stockSummary', label: 'まとめ納品書明細' },
      { key: 'stockGroupA', label: 'A組在庫管理', groupCode: 'A' },
      { key: 'stockGroupB', label: 'B組在庫管理', groupCode: 'B' },
      { key: 'stockGroupC', label: 'C組在庫管理', groupCode: 'C' },
      { key: 'stockOrder', label: '入出庫伝票' },
      { key: 'stockOrderItem', label: '入出庫明細' },
      { key: 'stockType', label: '在庫分類' },
      { key: 'stockRecord', label: '在庫履歴' },
      { key: 'priceRecord', label: '価格履歴' },
    ],
  },
  {
    key: 'request',
    label: '請求書管理',
    children: [
      { key: 'requestItem', label: '請求書明細' },
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
    queryFields: ['username', 'deptId', 'deptName', 'roleId', 'roleName', 'email', 'phone', 'status'],
    formFields: ['username', 'password', 'deptId', 'roleId', 'email', 'phone', 'avatar', 'status'],
    fieldTypes: { deptId: 'relation', roleId: 'relation', status: 'select' },
  },
  dept: {
    queryFields: ['id', 'name', 'code', 'leaderId', 'sort', 'status'],
    formFields: ['name', 'code', 'leaderId', 'sort', 'status'],
    fieldTypes: { leaderId: 'relation', sort: 'number', status: 'select' },
  },
  goods: {
    queryFields: ['id', 'name', 'englishName', 'seriesId', 'brandId', 'categoryId', 'makerId', 'currentQty', 'sort', 'status', 'isHot'],
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
  stock: STOCK_PRESET,
  stockSelf: STOCK_PRESET,
  stockSummary: STOCK_PRESET,
  stockGroupA: STOCK_PRESET,
  stockGroupB: STOCK_PRESET,
  stockGroupC: STOCK_PRESET,
  stockOrder: {
    queryFields: ['id', 'orderNo', 'orderType', 'bizDate', 'stockTypeId', 'warehouseId', 'sourceType', 'sourceId', 'totalQty', 'state', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'approverId', 'approverName', 'approveTime', 'finishTime', 'remark'],
    formFields: ['orderType', 'bizDate', 'warehouseId', 'sourceType', 'stockTypeId', 'state', 'remark'],
    fieldTypes: {
      warehouseId: 'relation',
      stockTypeId: 'relation',
      requesterId: 'relation',
      operatorId: 'relation',
      approverId: 'relation',
      orderType: 'select',
      sourceType: 'select',
      sourceId: 'relation',
      totalQty: 'number',
      state: 'select',
      bizDate: 'datetime',
      approveTime: 'datetime',
      finishTime: 'datetime',
      remark: 'textarea',
    },
  },
  stockOrderItem: {
    queryFields: STOCK_ORDER_ITEM_FIELDS,
    formFields: STOCK_ORDER_ITEM_FIELDS.filter((field) => !['id', 'orderType', 'state', 'bizDate', 'warehouseId', 'beforeQty', 'afterQty'].includes(field)),
    fieldTypes: {
      orderId: 'relation',
      orderType: 'select',
      state: 'select',
      bizDate: 'datetime',
      warehouseId: 'relation',
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
    queryFields: ['id', 'bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'warehouseId', 'changeQty', 'sourceType', 'orderType', 'bizDate', 'price', 'currency', 'priceUpdateTime', 'customerId', 'customerName', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark'],
    formFields: ['bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'skuCode', 'goodsName', 'englishName', 'brandId', 'brandName', 'seriesId', 'seriesName', 'categoryId', 'categoryName', 'stockTypeId', 'stockTypeName', 'makerId', 'makerName', 'warehouseId', 'changeQty', 'sourceType', 'orderType', 'bizDate', 'price', 'currency', 'priceUpdateTime', 'customerId', 'customerName', 'requesterId', 'requesterName', 'operatorId', 'operatorName', 'remark'],
    fieldTypes: {
      orderId: 'relation',
      orderItemId: 'relation',
      stockId: 'relation',
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
      bizDate: 'datetime',
      price: 'decimal',
      priceUpdateTime: 'datetime',
      remark: 'textarea',
    },
  },
  requestForm: {
    queryFields: REQUEST_FORM_FIELDS,
    formFields: ['sourceOrderId', 'customerId', ...REQUEST_FINANCE_FIELDS, 'state', 'approveRemark'],
    fieldTypes: {
      sourceOrderId: 'relation',
      userId: 'relation',
      deptId: 'relation',
      customerId: 'relation',
      warehouseId: 'relation',
      approverId: 'relation',
      totalQty: 'number',
      requestQty: 'number',
      totalAmt: 'decimal',
      exchangeRate: 'decimal',
      currency: 'select',
      paymentDate: 'datetime',
      hasFee: 'switch',
      feeAmount: 'decimal',
      hasUnpaid: 'switch',
      unpaidAmount: 'decimal',
      state: 'select',
      approveTime: 'datetime',
      approveRemark: 'textarea',
    },
  },
  requestItem: {
    queryFields: REQUEST_ITEM_QUERY_FIELDS,
    formFields: REQUEST_FINANCE_FIELDS,
    fieldTypes: {
      requestId: 'relation',
      goodsId: 'relation',
      skuId: 'relation',
      brandId: 'relation',
      seriesId: 'relation',
      categoryId: 'relation',
      makerId: 'relation',
      stockTypeId: 'relation',
      warehouseId: 'relation',
      stockRecordId: 'relation',
      price: 'decimal',
      exchangeRate: 'decimal',
      currency: 'select',
      paymentDate: 'datetime',
      hasFee: 'switch',
      feeAmount: 'decimal',
      hasUnpaid: 'switch',
      unpaidAmount: 'decimal',
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
    queryFields: ['id', 'name', 'code', 'permissionNames', 'remark', 'status'],
    formFields: ['name', 'code', 'permissionIds', 'remark', 'status'],
    fieldTypes: { permissionIds: 'relation', status: 'select' },
  },
  permission: {
    queryFields: ['id', 'name', 'code', 'module', 'type', 'parentId', 'path', 'sort', 'icon', 'component', 'status'],
    formFields: ['name', 'code', 'module', 'type', 'parentId', 'path', 'sort', 'icon', 'component', 'status'],
    fieldTypes: { parentId: 'relation', sort: 'number', status: 'select' },
  },
  maker: {
    queryFields: NAME_STATUS_QUERY_FIELDS,
    formFields: NAME_STATUS_FORM_FIELDS,
    fieldTypes: { status: 'select' },
  },
  brand: {
    queryFields: ['id', 'name', 'englishName', 'image', 'content', 'status'],
    formFields: ['name', 'englishName', 'image', 'content', 'status'],
    fieldTypes: { status: 'select' },
  },
  category: {
    queryFields: NAME_STATUS_QUERY_FIELDS,
    formFields: NAME_STATUS_FORM_FIELDS,
    fieldTypes: { status: 'select' },
  },
  series: {
    queryFields: ['id', 'name', 'englishName', 'brandId', 'content', 'status'],
    formFields: ['name', 'englishName', 'brandId', 'content', 'status'],
    fieldTypes: { brandId: 'relation', status: 'select' },
  },
  config: {
    queryFields: ['id', 'name', 'group', 'title', 'tip', 'type', 'value', 'content'],
    formFields: ['name', 'group', 'title', 'tip', 'type', 'value', 'content'],
  },
  goodsSku: {
    queryFields: ['id', 'goodsId', 'skuCode', 'skuName', 'price', 'currency', 'costPrice', 'updatePrice', 'priceUpdateTime', 'barcode', 'weight', 'volume', 'status'],
    fieldTypes: { goodsId: 'relation', status: 'select' },
  },
  stockType: {
    queryFields: NAME_STATUS_QUERY_FIELDS,
    formFields: NAME_STATUS_FORM_FIELDS,
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
    formFields: ['name', 'discount', 'remark', 'status'],
    fieldTypes: { status: 'select' },
  },
  message: {
    queryFields: ['id', 'type', 'userId', 'message', 'sourceId', 'isRead', 'state'],
    formFields: ['type', 'userId', 'message', 'sourceId', 'isRead', 'state'],
    fieldTypes: { userId: 'relation', type: 'number', sourceId: 'relation', isRead: 'select', state: 'select' },
  },
  operateLog: {
    queryFields: ['id', 'userId', 'username', 'module', 'operation', 'method', 'requestUrl', 'requestIp', 'requestParam', 'responseData', 'status', 'errorMsg', 'costTime'],
    fieldTypes: { userId: 'relation', status: 'select' },
  },
};

export const REQUIRED_FORM_FIELDS = {
  user: ['username', 'password', 'deptId', 'status'],
  dept: ['name', 'code', 'status'],
  goods: ['name', 'englishName', 'brandId', 'seriesId', 'categoryId', 'makerId', 'skuCode'],
  stock: ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'],
  stockOrder: ['orderType', 'bizDate', 'warehouseId', 'sourceType', 'stockTypeId', 'state'],
  stockOrderItem: ['orderId', 'goodsId', 'skuId', 'goodsName', 'changeQty'],
  stockRecord: ['bizNo', 'orderId', 'orderItemId', 'stockId', 'goodsId', 'skuId', 'goodsName', 'changeQty', 'orderType', 'sourceType'],
  requestForm: ['sourceOrderId', 'customerId'],
  requestItem: [],
  warehouse: ['name', 'code', 'status'],
  role: ['name', 'code', 'status'],
  maker: ['name', 'status'],
  brand: ['name', 'status'],
  category: ['name', 'status'],
  series: ['name', 'brandId', 'status'],
};

export function getModulePreset(moduleKey) {
  return MODULE_PRESETS[moduleKey] || { queryFields: [], formFields: [], fieldTypes: {} };
}

export function isRequiredFormField(moduleKey, field) {
  const list = REQUIRED_FORM_FIELDS[moduleKey] || [];
  return list.includes(field);
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

export function buildAutoQueryFields(fields) {
  if (!Array.isArray(fields) || fields.length === 0) return [];
  return fields.filter((field) => {
    const low = String(field || '').toLowerCase();
    if (!low) return false;
    if (low.endsWith('desc')) return false;
    return true;
  });
}
