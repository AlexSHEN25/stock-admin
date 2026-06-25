import { createItem, createItemByUrl, fetchItem, fetchModuleOptions } from '../api/module';
import TABLE_TEXT from './module-ui';
import { STOCK_SOURCE_TYPE } from './constants';

const STOCK_REQUIRED_FIELDS = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];
const RETURN_INBOUND_SOURCE_TYPE = 1;
const DELIVERY_SCHEDULE_INBOUND_SOURCE_TYPE = 1;
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
      saleDeadline: formState.saleDeadline || null,
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
  const sourceType = Number(record?.sourceType || STOCK_SOURCE_TYPE.SELF_INBOUND);
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
  const stockScope = String(formState.stockScope || 'self').toLowerCase();
  const outboundMode = stockScope === 'group' ? 'GROUP_CUSTOMER' : 'CUSTOMER';
  const requiredFields = ['warehouseId', 'stockTypeId', 'quantity', 'customerId'];
  const missing = requiredFields.some((field) => {
    const value = formState[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  const quantity = Number(formState.quantity);
  if (!quantity || quantity <= 0) {
    notify.warning(TABLE_TEXT.outboundQuantityInvalid);
    return false;
  }
  if (Number(maxQuantity) > 0 && quantity > Number(maxQuantity)) {
    notify.warning('\u51fa\u5eab\u6570\u91cf\u306f\u5728\u5eab\u6570\u91cf\u4ee5\u4e0b\u3067\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044');
    return false;
  }

  const goodsId = Number(formState.goodsId);
  const skuId = await resolveSkuId(formState.skuId, goodsId);
  const payload = removeEmptyPayloadFields({
    stockId: Number(formState.stockId) || null,
    goodsId: goodsId || null,
    skuId,
    warehouseId: Number(formState.warehouseId),
    stockTypeId: Number(formState.stockTypeId),
    quantity,
    customerId: Number(formState.customerId),
    outboundMode,
    groupCode: outboundMode === 'GROUP_CUSTOMER' ? String(formState.groupCode || '').trim().toUpperCase() : null,
    remark: buildGoodsOutboundRemark(formState),
  });

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

export async function submitSheetStockOutboundFlow({ items, settings, notify }) {
  const payloads = buildSheetOutboundPayloads(items, settings);
  if (payloads.length === 0) {
    notify.warning(TABLE_TEXT.outboundQuantityInvalid);
    return false;
  }

  for (const payload of payloads) {
    // eslint-disable-next-line no-await-in-loop
    await createItem('stock/outbound', payload);
  }
  notify.success(TABLE_TEXT.stockOutboundSuccess);
  return true;
}

export async function submitSheetStockInboundFlow({ items, settings, notify }) {
  const payloads = buildSheetInboundPayloads(items, settings);
  if (payloads.length === 0) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  await createItemByUrl('/api/stock/inbound/batch', {
    sourceType: Number(settings?.sourceType || STOCK_SOURCE_TYPE.SELF_INBOUND),
    remark: settings?.remark || '\u4e00\u62ec\u5165\u5eab',
    items: payloads,
  });
  notify.success(TABLE_TEXT.stockFlowSuccess);
  return true;
}

export async function submitDeliveryAllocationFlow({ items, settings, notify }) {
  const payloads = buildDeliveryAllocationPayloads(items, settings);
  if (payloads.length === 0) {
    notify.warning(TABLE_TEXT.requiredField);
    return false;
  }

  for (const payload of payloads) {
    // eslint-disable-next-line no-await-in-loop
    await createItemByUrl('/api/stock/group/allocate', payload);
  }
  notify.success('\u7d0d\u54c1\u632f\u5206\u3092\u767b\u9332\u3057\u307e\u3057\u305f');
  return true;
}
function buildDeliveryAllocationPayloads(items, settings) {
  const groupFields = [
    ['aQty', 'A'],
    ['bQty', 'B'],
    ['cQty', 'C'],
  ];
  const payloads = [];
  (items || []).forEach(({ record, draft }) => {
    const allocations = groupFields.map(([field, groupCode]) => {
      const quantity = Number(draft?.[field] || 0);
      return quantity > 0 ? { groupCode, quantity } : null;
    }).filter(Boolean);
    if (allocations.length === 0) return;
    payloads.push({
      stockId: Number(record?.stockId ?? record?.id ?? 0) || null,
      goodsId: Number(record?.goodsId ?? record?.id ?? 0) || null,
      skuId: record?.skuId ? Number(record.skuId) : null,
      warehouseId: Number(record?.warehouseId ?? settings?.warehouseId ?? 0) || null,
      stockTypeId: Number(record?.stockTypeId ?? settings?.stockTypeId ?? 0) || null,
      allocations,
      saleDeadline: settings?.saleDeadline || draft?.saleDeadline || null,
      remark: [settings?.remark, draft?.remark].filter(Boolean).join(' / ') || '\u7d0d\u54c1\u632f\u5206',
    });
  });
  return payloads.filter((payload) => hasStockTarget(payload) && payload.allocations.length > 0);
}

function buildSheetOutboundPayloads(items, settings) {
  const payloads = [];
  (items || []).forEach(({ record, draft }) => {
    const customerAllocations = Array.isArray(settings?.customerAllocations) ? settings.customerAllocations : [];
    const outboundMode = String(settings?.outboundMode || settings?.customerOutboundMode || 'CUSTOMER').toUpperCase();
    const groupCode = outboundMode === 'GROUP_CUSTOMER'
      ? String(settings?.groupCode || record?.groupCode || '').trim().toUpperCase()
      : null;
    const deptId = Number(settings?.deptId ?? record?.deptId) || null;

    customerAllocations.forEach((allocation) => {
      const quantity = Number(allocation?.quantity || 0);
      const customerId = normalizeRelationId(allocation?.customerId);
      if (!quantity || quantity <= 0 || !customerId) return;
      payloads.push(removeEmptyPayloadFields({
        stockId: Number(record?.stockId ?? record?.id ?? 0) || null,
        goodsId: Number(record?.goodsId ?? record?.id) || null,
        skuId: record?.skuId ? Number(record.skuId) : null,
        warehouseId: Number(record?.warehouseId ?? settings?.warehouseId),
        stockTypeId: Number(record?.stockTypeId ?? settings?.stockTypeId),
        quantity,
        customerId,
        deptId,
        sourceDeptId: outboundMode === 'GROUP_CUSTOMER' ? deptId : null,
        outboundMode,
        groupCode,
        sourceGroupCode: outboundMode === 'GROUP_CUSTOMER' ? groupCode : null,
        remark: [settings?.remark, draft?.remark, allocation?.remark].filter(Boolean).join(' / ') || null,
      }));
    });
  });
  return payloads.filter((payload) => (
    hasStockTarget(payload)
    && payload.quantity > 0
    && payload.customerId
  ));
}

function hasStockTarget(payload) {
  return Boolean(
    payload?.stockId
      || (payload?.goodsId && payload?.skuId && payload?.warehouseId && payload?.stockTypeId),
  );
}

function normalizeRelationId(value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const numeric = Number(value);
  return Number.isNaN(numeric) ? String(value).trim() : numeric;
}

function buildSheetInboundPayloads(items, settings) {
  return (items || []).map(({ record, draft }) => removeEmptyPayloadFields({
    stockId: Number(record?.stockId ?? 0) || null,
    goodsId: Number(record?.goodsId ?? record?.id ?? 0) || null,
    skuId: record?.skuId ? Number(record.skuId) : null,
    warehouseId: Number(record?.warehouseId ?? settings?.warehouseId ?? 0) || null,
    stockTypeId: Number(record?.stockTypeId ?? settings?.stockTypeId ?? 0) || null,
    quantity: Number(draft?.quantity || 0),
    saleDeadline: settings?.saleDeadline || draft?.saleDeadline || null,
    remark: [settings?.remark, draft?.remark].filter(Boolean).join(' / ') || null,
  })).filter((payload) => (
    payload.quantity > 0
    && (payload.stockId || (payload.goodsId && payload.skuId && payload.warehouseId && payload.stockTypeId))
  ));
}

function removeEmptyPayloadFields(payload) {
  return Object.fromEntries(Object.entries(payload || {}).filter(([, value]) => (
    value !== undefined && value !== null && String(value).trim() !== ''
  )));
}

function buildGoodsOutboundRemark(formState) {
  const parts = [];
  const stockScope = String(formState.stockScope || 'self').toLowerCase();
  parts.push(stockScope === 'group' ? '\u7d44\u5728\u5eab\u304b\u3089\u9867\u5ba2\u51fa\u5eab' : '\u81ea\u793e\u5728\u5eab\u304b\u3089\u9867\u5ba2\u51fa\u5eab');
  if (formState.customerId) parts.push(`\u9867\u5ba2ID:${formState.customerId}`);
  if (formState.groupCode) parts.push(`\u7d44\u30b3\u30fc\u30c9:${formState.groupCode}`);
  if (formState.remark) parts.push(formState.remark);
  return parts.filter(Boolean).join(' / ');
}


export async function submitStockQuantityAdjustment({ beforeQty, afterQty, record }) {
  const previous = Number(beforeQty);
  const next = Number(afterQty);
  if (Number.isNaN(previous) || Number.isNaN(next) || previous === next) return false;
  if (next < 0) {
    throw new Error('現在数量は0以上で入力してください');
  }

  const changeQty = next - previous;
  const goodsId = Number(record?.goodsId);
  const skuId = await resolveSkuId(record?.skuId, goodsId);
  const warehouseId = Number(record?.warehouseId);
  const stockTypeId = Number(record?.stockTypeId);
  const sourceType = Number(record?.sourceType || STOCK_SOURCE_TYPE.SELF_INBOUND);

  if (!goodsId || !warehouseId || !stockTypeId) {
    throw new Error('数量変更に必要な商品・倉庫・在庫分類が不足しています');
  }

  await createItem(changeQty > 0 ? 'stock/inbound' : 'stock/outbound', {
    goodsId,
    skuId,
    sourceType,
    warehouseId,
    stockTypeId,
    quantity: Math.abs(changeQty),
    remark: '在庫管理画面からの数量調整',
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
    notify.warning('返却入庫に必要な商品・倉庫・在庫分類・数量が不足しています');
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
    notify.success('返却入庫を申請しました');
    await reload();
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
  }
}

export async function submitDeliveryScheduleInboundFlow({
  record,
  quantity,
  reload,
  notify,
}) {
  const order = await resolveStockOrder(record);
  const goodsId = Number(record?.goodsId);
  const skuId = await resolveSkuId(record?.skuId, goodsId);
  const warehouseId = Number(record?.warehouseId ?? order?.warehouseId);
  const stockTypeId = Number(record?.stockTypeId ?? order?.stockTypeId);
  const inboundQty = Math.abs(Number(
    quantity
    ?? record?.requestQty
    ?? record?.changeQty
    ?? record?.outQty
    ?? 0,
  ));

  if (!goodsId || !warehouseId || !stockTypeId || !inboundQty) {
    notify.warning('入庫申請に必要な商品・倉庫・在庫分類・数量が不足しています');
    return false;
  }

  try {
    await createItem('stock/inbound', {
      goodsId,
      skuId,
      sourceType: DELIVERY_SCHEDULE_INBOUND_SOURCE_TYPE,
      warehouseId,
      stockTypeId,
      quantity: inboundQty,
      saleDeadline: record?.saleDeadline ?? record?.deliveryDate ?? record?.bizDate ?? null,
      remark: buildDeliveryScheduleInboundRemark(record),
    });
    notify.success('発送予定表から入庫申請を作成しました');
    if (typeof reload === 'function') {
      await reload();
    }
    return true;
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
    return false;
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
  const parts = ['請求書明細返却'];
  if (orderNo) parts.push(`出庫伝票:${orderNo}`);
  if (itemId) parts.push(`明細ID:${itemId}`);
  return parts.join(' / ');
}

function buildDeliveryScheduleInboundRemark(record) {
  const orderNo = record?.orderNo || record?.bizNo || record?.orderId || '';
  const itemId = record?.stockOrderItemId || record?.orderItemId || record?.id || '';
  const parts = ['発送予定表からの入庫申請'];
  if (orderNo) parts.push(`伝票:${orderNo}`);
  if (itemId) parts.push(`明細ID:${itemId}`);
  return parts.join(' / ');
}
