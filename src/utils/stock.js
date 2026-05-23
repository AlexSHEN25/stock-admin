import { createItem, fetchModuleOptions } from '../api/module';
import { TABLE_TEXT } from './module-ui';

const STOCK_REQUIRED_FIELDS = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];

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
