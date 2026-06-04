import { createItem, fetchItem, fetchModuleOptions } from '../api/module';
import { TABLE_TEXT } from './module-ui';

const STOCK_REQUIRED_FIELDS = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];
const RETURN_INBOUND_SOURCE_TYPE = 1;

export async function submitStockInboundFlow({ formState, closeModal, reload, notify }) {
  const missing = STOCK_REQUIRED_FIELDS.some((field) => {
    const value = formState[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  if (missing) {
    notify.warning(TABLE_TEXT.requiredField);
    return;
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
  } catch (error) {
    notify.error(error.message || TABLE_TEXT.saveFail);
  }
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
