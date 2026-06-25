const MENU_KEY_ALIASES = {
  MENU_BASIC: 'base',
  MENU_SYSTEM: 'system',
  MENU_GOODS_INFO: 'goods',
  MENU_GOODS: 'goods',
  MENU_MAKER: 'maker',
  MENU_BRAND: 'brand',
  MENU_CATEGORY: 'category',
  MENU_SERIES: 'series',
  MENU_STOCK: 'stock',
  MENU_SELF_STOCK: 'stockSelf',
  MENU_STOCK_SELF: 'stockSelf',
  MENU_STOCK_A: 'stockGroupA',
  MENU_STOCK_B: 'stockGroupB',
  MENU_STOCK_C: 'stockGroupC',
  MENU_STOCK_GROUP: 'stockGroup',
  MENU_STOCK_CUSTOMER: 'stockCustomerGoods',
  MENU_STOCK_CUSTOMER_GOODS: 'stockCustomerGoods',
  MENU_CUSTOMER_GOODS: 'stockCustomerGoods',
  MENU_CUSTOMER_GOODS_DETAIL: 'stockCustomerGoods',
  MENU_STOCK_ORDER: 'stockOrder',
  MENU_STOCK_ORDER_ITEM: 'stockOrderItem',
  MENU_STOCK_TYPE: 'stockType',
  MENU_STOCK_RECORD: 'stockRecord',
  MENU_PRICE_RECORD: 'priceRecord',
  MENU_REQUEST: 'requestForm',
  MENU_REQUEST_FORM: 'requestForm',
  MENU_REQUEST_ITEM: 'requestItem',
  MENU_DELIVERY_SCHEDULE: 'deliverySchedule',
  MENU_STOCK_CUSTOMER_DELIVERY_SCHEDULE: 'deliverySchedule',
  MENU_CUSTOMER: 'customer',
  MENU_CUSTOMER_INFO: 'customer',
  MENU_CUSTOMER_LEVEL: 'customerLevel',
  MENU_USER: 'user',
  MENU_DEPT: 'dept',
  MENU_WAREHOUSE: 'warehouse',
  MENU_ROLE: 'role',
  MENU_PERMISSION: 'permission',
  MENU_CONFIG: 'config',
  MENU_MESSAGE: 'message',
  MENU_OPERATE_LOG: 'operateLog',
};

const PATH_KEY_ALIASES = {
  basic: 'base',
  goodsInfo: 'goods',
  self: 'stockSelf',
  stockSelf: 'stockSelf',
  customerGoods: 'stockCustomerGoods',
  request: 'requestForm',
  requestForm: 'requestForm',
  requestItem: 'requestItem',
  deliverySchedule: 'deliverySchedule',
  'delivery-schedule': 'deliverySchedule',
};

const DIRECT_KEY_ALIASES = {
  stockCustomer: 'stockCustomerGoods',
  customerGoods: 'stockCustomerGoods',
  stock_customer_goods: 'stockCustomerGoods',
  deliverySchedule: 'deliverySchedule',
  'delivery-schedule': 'deliverySchedule',
};

export function normalizePermissionMenuKey(rawKey, rawPath = '') {
  const key = String(rawKey || '').trim();
  const upperKey = key.toUpperCase();
  if (MENU_KEY_ALIASES[upperKey]) return MENU_KEY_ALIASES[upperKey];
  if (DIRECT_KEY_ALIASES[key]) return DIRECT_KEY_ALIASES[key];

  const pathKey = normalizePermissionPathKey(rawPath);
  if (pathKey) return pathKey;

  const parts = key.split('/').filter(Boolean);
  const last = parts[parts.length - 1] === 'page' && parts.length > 1
    ? parts[parts.length - 2]
    : parts[parts.length - 1];
  return DIRECT_KEY_ALIASES[last] || PATH_KEY_ALIASES[last] || last || '';
}

export function normalizePermissionPathKey(rawPath) {
  const path = String(rawPath || '').trim();
  if (!path) return '';

  const clean = path
    .replace(/^\/?api\/?/, '/')
    .replace(/\/\*\*$/, '')
    .replace(/\/page$/, '');
  const parts = clean.split('/').filter(Boolean);
  if (parts.length === 0) return '';

  if (parts[0] === 'stock' && parts[1] === 'self') return 'stockSelf';
  if (parts[0] === 'stock' && parts[1] === 'group') {
    const groupCode = String(parts[2] || '').toUpperCase();
    if (groupCode === 'A') return 'stockGroupA';
    if (groupCode === 'B') return 'stockGroupB';
    if (groupCode === 'C') return 'stockGroupC';
    return 'stockGroup';
  }
  if (parts[0] === 'stock' && parts[1] === 'customer' && parts[2] === 'goods') {
    return 'stockCustomerGoods';
  }
  if (parts[0] === 'stock' && parts[1] === 'customer' && parts[2] === 'delivery-schedule') {
    return 'deliverySchedule';
  }
  if (parts[0] === 'brand') return 'brand';

  const last = parts[parts.length - 1];
  return PATH_KEY_ALIASES[last] || DIRECT_KEY_ALIASES[last] || last;
}

export function flattenPermissionMenus(source, output = []) {
  (Array.isArray(source) ? source : []).forEach((item) => {
    if (!item || typeof item !== 'object') return;
    output.push(item);
    if (Array.isArray(item.children) && item.children.length > 0) {
      flattenPermissionMenus(item.children, output);
    }
  });
  return output;
}
