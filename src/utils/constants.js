export const STOCK_SOURCE_TYPE = {
  SELF_INBOUND: 1,
  PURCHASE_INBOUND: 2,
};

export const STOCK_ORDER_TYPE = {
  INBOUND: 1,
  OUTBOUND: 2,
  TRANSFER: 3,
  ADJUSTMENT: 4,
  RETURN: 5,
  PURCHASE: 6,
};

export const STOCK_ORDER_SOURCE_TYPE = {
  MANUAL: 1,
  RETURN: 2,
  INBOUND_REQUEST: 3,
  SYSTEM: 4,
};

export const STOCK_ORDER_STATE = {
  PENDING: 0,
  PROCESSING: 1,
  COMPLETED: 2,
  REJECTED: 3,
};

export const REQUEST_FORM_STATE = {
  PENDING: 0,
  APPLYING: 1,
  COMPLETED: 2,
  HOLD: 3,
  REJECTED: 4,
  CANCELED: 5,
};

export const MESSAGE_READ_STATE = {
  UNREAD: 0,
  READ: 1,
};

export const GOODS_OUTBOUND_MODE = {
  CUSTOMER: 'customer',
  DEPT: 'dept',
};

export const STOCK_SCOPE = {
  SELF: 'self',
  GROUP: 'group',
};

export const SHEET_FLOW_MODE = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
  DELIVERY: 'delivery',
};

export const CUSTOMER_OUTBOUND_MODE = {
  CUSTOMER: 'CUSTOMER',
  GROUP_CUSTOMER: 'GROUP_CUSTOMER',
};

export const STOCK_OUTBOUND_MODE = {
  GROUP_ALLOCATE: 'GROUP_ALLOCATE',
};
