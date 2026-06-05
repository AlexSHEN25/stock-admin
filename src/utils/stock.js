import { createItem, fetchItem, fetchModuleOptions } from '../api/module';
import TABLE_TEXT from './module-ui';

const STOCK_REQUIRED_FIELDS = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];
const RETURN_INBOUND_SOURCE_TYPE = 1;
const STOCK_OUTBOUND_REQUIRED_FIELDS = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];


export async function submitStockInboundFlow({ formState, closeModal, reload, notify }) {
  const missing = STOCK_REQUIRED_FIELDS.some((field) => {
    const value = formState[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missing) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  const goodsId = Number(formState.goodsId);
  const sourceType = Number(formState.sourceType);
  const warehouseId = Number(formState.warehouseId);
  const stockTypeId = Number(formState.stockTypeId);
  const quantity = Number(formState.quantity);
  const skuId = await resolveSkuId(formState.skuId, goodsId);

  try {
    await createItem('stock/inbound', {
      goodsId,
      skuId,
      sourceType,
      warehouseId,
      stockTypeId,
      quantity,
      remark: formState.remark || null,
    });
    closeModal();
    notify.success(TABLE_TEXT.stockFlowSuccess);
    await reload();
    return true;
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
    return false;
  }
}

export async function triggerStockOutboundFromRecord({ record, quantity, remark, reload, notify }) {
  const goodsId = Number(record?.goodsId);
  const skuId = await resolveSkuId(record?.skuId, goodsId);
  const sourceType = Number(record?.sourceType || 2);
  const warehouseId = Number(record?.warehouseId);
  const stockTypeId = Number(record?.stockTypeId);
  const outboundQty = Number(quantity);

  if (!goodsId || !warehouseId || !stockTypeId || !outboundQty) {
    notify.warning(TABLE_TEXT.requiredField);
    return;
  }

  if (outboundQty <= 0) {
    notify.warning(TABLE_TEXT.outboundQuantityInvalid);
    return;
  }

  try {
    await createItem('stock/outbound', {
      goodsId,
      skuId,
      sourceType,
      warehouseId,
      stockTypeId,
      quantity: outboundQty,
      remark: remark,
    });

    notify.success(TABLE_TEXT.stockOutboundSuccess);
    await reload();
    return true;
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
    return false;
  }
}




export async function submitStockOutboundFlow({ formState, closeModal, reload, notify }) {
  const missing = STOCK_OUTBOUND_REQUIRED_FIELDS.some((field) => {
    const value = formState[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  const goodsId = Number(formState.goodsId);
  const sourceType = Number(formState.sourceType);
  const warehouseId = Number(formState.warehouseId);
  const stockTypeId = Number(formState.stockTypeId);
  const quantity = Number(formState.quantity);
  const skuId = await resolveSkuId(formState.skuId, goodsId);

  if (!goodsId || !warehouseId || !stockTypeId || !quantity) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  if (quantity <= 0) {
    notify.warning(TABLE_TEXT.outboundQuantityInvalid);
    return false;
  }

  try {
    await createItem('stock/outbound', {
      goodsId,
      skuId,
      sourceType,
      warehouseId,
      stockTypeId,
      quantity,
      remark: formState.remark || null,
    });

    closeModal();
    notify.success(TABLE_TEXT.stockOutboundSuccess);
    await reload();
    return true;
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
    return false;
  }
}

export async function submitGoodsStockOutboundFlow({ formState, maxQuantity, closeModal, reload, notify }) {
  const mode = String(formState.outboundMode || '');
  const requiredTargetMissing = mode === 'customer'
    ? !formState.customerId
    : !formState.deptId;
  const missing = STOCK_OUTBOUND_REQUIRED_FIELDS.some((field) => {
    const value = formState[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (!mode || missing || requiredTargetMissing) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  const quantity = Number(formState.quantity);
  if (!quantity || quantity <= 0) {
    notify.warning(TABLE_TEXT.outboundQuantityInvalid);
    return false;
  }
  if (Number(maxQuantity) > 0 && quantity > Number(maxQuantity)) {
    notify.warning(`出庫数量は${maxQuantity}以下で入力してください`);
    return false;
  }

  const goodsId = Number(formState.goodsId);
  const skuId = await resolveSkuId(formState.skuId, goodsId);
  const payload = {
    goodsId,
    skuId,
    sourceType: Number(formState.sourceType),
    warehouseId: Number(formState.warehouseId),
    stockTypeId: Number(formState.stockTypeId),
    quantity,
    outboundMode: mode,
    customerId: mode === 'customer' ? Number(formState.customerId) : null,
    deptId: mode === 'dept' ? Number(formState.deptId) : null,
    remark: buildGoodsOutboundRemark(formState),
  };

  try {
    await createItem('stock/outbound', payload);
    closeModal();
    notify.success(TABLE_TEXT.stockOutboundSuccess);
    await reload();
    return true;
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
    return false;
  }
}

function buildGoodsOutboundRemark(formState) {
  const parts = [];
  const mode = String(formState.outboundMode || '');
  if (mode === 'customer') {
    parts.push('出庫区分:顧客出庫');
    parts.push(`顧客ID:${formState.customerId}`);
  } else if (mode === 'dept') {
    parts.push('出庫区分:組別分貨');
    parts.push(`部署ID:${formState.deptId}`);
  }
  if (formState.remark) {
    parts.push(formState.remark);
  }
  return parts.length ? parts.join(' / ') : null;
}


export async function submitStockQuantityAdjustment({ beforeQty, afterQty, record }) {
  const previous = Number(beforeQty);
  const next = Number(afterQty);
  if (Number.isNaN(previous) || Number.isNaN(next) || previous === next) return false;
  if (next < 0) {
    throw new Error('\u73fe\u5728\u6570\u91cf\u306f0\u4ee5\u4e0a\u3067\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044');
  }

  const changeQty = next - previous;
  const goodsId = Number(record?.goodsId);
  const skuId = await resolveSkuId(record?.skuId, goodsId);
  const warehouseId = Number(record?.warehouseId);
  const stockTypeId = Number(record?.stockTypeId);
  const sourceType = Number(record?.sourceType || 2);

  if (!goodsId || !warehouseId || !stockTypeId) {
    throw new Error('\u6570\u91cf\u5909\u66f4\u306b\u5fc5\u8981\u306a\u5546\u54c1\u30fb\u5009\u5eab\u30fb\u5728\u5eab\u5206\u985e\u304c\u4e0d\u8db3\u3057\u3066\u3044\u307e\u3059');
  }

  await createItem(changeQty > 0 ? 'stock/inbound' : 'stock/outbound', {
    goodsId,
    skuId,
    sourceType,
    warehouseId,
    stockTypeId,
    quantity: Math.abs(changeQty),
    remark: '\u5728\u5eab\u7ba1\u7406\u753b\u9762\u304b\u3089\u306e\u6570\u91cf\u8abf\u6574',
  });
  return true;
}

export async function submitStockOrderItemReturnFlow({ record, reload, notify }) {
  const order = await resolveStockOrder(record);
  const goodsId = Number(record?.goodsId);
  const skuId = await resolveSkuId(record?.skuId, goodsId);
  const warehouseId = Number(record?.warehouseId ?? order?.warehouseId);
  const stockTypeId = Number(record?.stockTypeId ?? order?.stockTypeId);
  const quantity = Math.abs(Number(record?.changeQty ?? record?.outQty ?? record?.requestQty ?? 0));

  if (!goodsId || !warehouseId || !stockTypeId || !quantity) {
    notify.warning('\u8fd4\u5374\u5165\u5eab\u306b\u5fc5\u8981\u306a\u5546\u54c1\u30fb\u5009\u5eab\u30fb\u5728\u5eab\u5206\u985e\u30fb\u6570\u91cf\u304c\u4e0d\u8db3\u3057\u3066\u3044\u307e\u3059');
    return;
  }

  try {
    await createItem('stock/inbound', {
      goodsId,
      skuId,
      sourceType: RETURN_INBOUND_SOURCE_TYPE,
      warehouseId,
      stockTypeId,
      quantity,
      remark: buildReturnRemark(record),
    });
    notify.success('\u8fd4\u5374\u5165\u5eab\u3092\u7533\u8acb\u3057\u307e\u3057\u305f');
    await reload();
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
  }
}

async function resolveSkuId(rawSkuId, goodsId) {
  if (rawSkuId) {
    return Number(rawSkuId);
  }

  try {
    const skuList = await fetchModuleOptions('goodsSku');
    const matched = (skuList || []).find((item) => Number(item.goodsId) === Number(goodsId));
    return matched?.id ? Number(matched.id) : null;
  } catch {
    return null;
  }
}

async function resolveStockOrder(record) {
  const orderId = Number(record?.orderId ?? record?.stockOrderId);
  if (!orderId) return null;
  try {
    const order = await fetchItem('stockOrder', orderId);
    return order && typeof order === 'object' ? order : null;
  } catch {
    return null;
  }
}

function buildReturnRemark(record) {
  const orderNo = record?.orderNo || record?.bizNo || record?.orderId || '';
  const itemId = record?.id || record?.orderItemId || '';
  const parts = ['\u8acb\u6c42\u66f8\u660e\u7d30\u8fd4\u5374'];
  if (orderNo) parts.push(`\u51fa\u5eab\u4f1d\u7968:${orderNo}`);
  if (itemId) parts.push(`\u660e\u7d30ID:${itemId}`);
  return parts.join(' / ');
}
