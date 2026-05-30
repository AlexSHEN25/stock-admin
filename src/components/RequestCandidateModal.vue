<template>
  <a-modal
    :open="open"
    title="明細追加"
    width="1280px"
    :ok-text="submitText"
    :ok-button-props="{ disabled: selectedKeys.length === 0 }"
    @cancel="$emit('cancel')"
    @ok="$emit('submit')"
  >
    <a-spin :spinning="loading">
      <div class="request-candidate-summary">
        追加する明細を選択してください。選択済み: {{ selectedKeys.length }}件
      </div>
      <a-table
        :row-key="rowKey"
        :data-source="rows"
        :columns="columns"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        :row-selection="{ selectedRowKeys: selectedKeys, onChange: (keys) => $emit('selection-change', keys) }"
        :scroll="{ x: 'max-content', y: 520 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'matchStatus'">
            <a-tag :color="resolveKnifeHandleMatch(record).ok ? 'success' : 'warning'">
              {{ resolveKnifeHandleMatch(record).text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'changeQty'">
            {{ formatQty(record.changeQty) }}
          </template>
          <template v-else-if="column.key === 'requestQty'">
            <a-input-number
              :value="qtyState[rowKey(record)]"
              :min="1"
              :max="maxRequestQty(record)"
              :precision="0"
              style="width: 100%"
              @update:value="(val) => $emit('qty-change', rowKey(record), val)"
            />
          </template>
        </template>
      </a-table>
    </a-spin>
  </a-modal>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: '追加' },
  rows: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] },
  qtyState: { type: Object, default: () => ({}) },
  rowKey: { type: Function, required: true },
  maxRequestQty: { type: Function, required: true },
  formatQty: { type: Function, required: true },
});

defineEmits(['cancel', 'submit', 'selection-change', 'qty-change']);

const columns = [
  { title: '伝票番号', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
  { title: '商品名', dataIndex: 'goodsName', key: 'goodsName', width: 180 },
  { title: '品番', dataIndex: 'skuCode', key: 'skuCode', width: 120 },
  { title: 'ブランド', dataIndex: 'brandName', key: 'brandName', width: 120 },
  { title: 'シリーズ', dataIndex: 'seriesName', key: 'seriesName', width: 120 },
  { title: 'カテゴリ', dataIndex: 'categoryName', key: 'categoryName', width: 120 },
  { title: '出庫数量', dataIndex: 'changeQty', key: 'changeQty', width: 90 },
  { title: '請求数量', dataIndex: 'requestQty', key: 'requestQty', width: 120 },
  { title: '価格', dataIndex: 'price', key: 'price', width: 100 },
  { title: '通貨', dataIndex: 'currency', key: 'currency', width: 80 },
  { title: '刀柄マッチ', dataIndex: 'matchStatus', key: 'matchStatus', width: 120 },
];

function resolveKnifeHandleMatch(row) {
  const name = String(row?.goodsName || '');
  const orderId = Number(row?.stockOrderId || 0);
  if (!orderId) return { ok: true, text: '判定不要' };
  const siblings = (props.rows || []).filter((item) => Number(item?.stockOrderId) === orderId);
  const hasKnife = siblings.some((item) => String(item?.goodsName || '').includes('刀'));
  const hasHandle = siblings.some((item) => String(item?.goodsName || '').includes('柄'));
  if (name.includes('刀') || name.includes('柄')) {
    if (hasKnife && hasHandle) return { ok: true, text: 'マッチ可' };
    return { ok: false, text: '片側不足' };
  }
  return { ok: true, text: '対象外' };
}
</script>

<style scoped>
.request-candidate-summary {
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
