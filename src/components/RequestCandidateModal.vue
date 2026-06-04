<template>
  <a-modal
    :open="open"
    title="&#20986;&#24235;&#26126;&#32048;&#36861;&#21152;"
    width="1280px"
    :ok-text="submitText"
    :ok-button-props="{ disabled: selectedKeys.length === 0 }"
    @cancel="$emit('cancel')"
    @ok="$emit('submit')"
  >
    <a-spin :spinning="loading">
      <div class="request-candidate-summary">
        &#23436;&#20102;&#28168;&#12415;&#12398;&#20986;&#24235;&#22312;&#24235;&#12363;&#12425;&#35531;&#27714;&#26360;&#12408;&#36861;&#21152;&#12377;&#12427;&#26126;&#32048;&#12434;&#36984;&#25246;&#12375;&#12390;&#12367;&#12384;&#12373;&#12356;&#12290;&#36984;&#25246;&#28168;&#12415;: {{ selectedKeys.length }}&#20214;
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
  submitText: { type: String, default: '\u8ffd\u52a0' },
  rows: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] },
  qtyState: { type: Object, default: () => ({}) },
  rowKey: { type: Function, required: true },
  maxRequestQty: { type: Function, required: true },
  formatQty: { type: Function, required: true },
});

defineEmits(['cancel', 'submit', 'selection-change', 'qty-change']);

const columns = [
  { title: '\u4f1d\u7968\u756a\u53f7', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
  { title: '\u5546\u54c1\u540d', dataIndex: 'goodsName', key: 'goodsName', width: 180 },
  { title: '\u54c1\u756a', dataIndex: 'skuCode', key: 'skuCode', width: 120 },
  { title: '\u30d6\u30e9\u30f3\u30c9', dataIndex: 'brandName', key: 'brandName', width: 120 },
  { title: '\u30b7\u30ea\u30fc\u30ba', dataIndex: 'seriesName', key: 'seriesName', width: 120 },
  { title: '\u30ab\u30c6\u30b4\u30ea', dataIndex: 'categoryName', key: 'categoryName', width: 120 },
  { title: '\u51fa\u5eab\u6570\u91cf', dataIndex: 'changeQty', key: 'changeQty', width: 90 },
  { title: '\u8acb\u6c42\u6570\u91cf', dataIndex: 'requestQty', key: 'requestQty', width: 120 },
  { title: '\u4fa1\u683c', dataIndex: 'price', key: 'price', width: 100 },
  { title: '\u901a\u8ca8', dataIndex: 'currency', key: 'currency', width: 80 },
  { title: '\u5200/\u30cf\u30f3\u30c9\u30eb', dataIndex: 'matchStatus', key: 'matchStatus', width: 130 },
];

function resolveKnifeHandleMatch(row) {
  const orderKey = resolveOrderKey(row);
  if (!orderKey) return { ok: true, text: '\u5224\u5b9a\u4e0d\u8981' };

  const siblings = (props.rows || []).filter((item) => resolveOrderKey(item) === orderKey);
  const hasKnife = siblings.some(isKnifeItem);
  const hasHandle = siblings.some(isHandleItem);
  if (isKnifeItem(row) || isHandleItem(row)) {
    if (hasKnife && hasHandle) return { ok: true, text: '\u30de\u30c3\u30c1\u53ef' };
    return { ok: false, text: '\u7247\u65b9\u4e0d\u8db3' };
  }
  return { ok: true, text: '\u5bfe\u8c61\u5916' };
}

function resolveOrderKey(row) {
  const raw = row?.stockOrderId ?? row?.stock_order_id ?? row?.orderId ?? row?.order_id ?? row?.orderNo;
  return raw === undefined || raw === null || String(raw).trim() === '' ? '' : String(raw);
}

function isKnifeItem(row) {
  const text = rowText(row);
  return text.includes('\u5200') || text.toLowerCase().includes('knife');
}

function isHandleItem(row) {
  const text = rowText(row).toLowerCase();
  return text.includes('\u30cf\u30f3\u30c9') || text.includes('handle') || text.includes('\u67c4');
}

function rowText(row) {
  return [
    row?.goodsName,
    row?.skuName,
    row?.categoryName,
    row?.seriesName,
    row?.remark,
  ].map((value) => String(value || '')).join(' ');
}
</script>

<style scoped>
.request-candidate-summary {
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 12px;
}
</style>
