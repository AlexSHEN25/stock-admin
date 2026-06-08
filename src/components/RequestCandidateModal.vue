<template>
  <a-card
    v-if="open"
    title="納品予定"
    class="request-candidate-card"
  >
    <a-spin :spinning="loading">
      <div class="request-candidate-toolbar">
        <div class="request-candidate-summary">
          出庫商品を納品予定へ追加できます。追加済み: {{ addedCount }}件
        </div>
        <a-button
          type="primary"
          :disabled="pendingAddCount === 0"
          @click="$emit('submit')"
        >
          {{ submitText }}
        </a-button>
      </div>
      <a-table
        :row-key="rowKey"
        :data-source="rows"
        :columns="columns"
        :pagination="{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }"
        :row-selection="rowSelection"
        :scroll="{ x: 'max-content', y: 520 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'matchStatus'">
            <a-tag :color="resolveKnifeHandleMatch(record).ok ? 'success' : 'warning'">
              {{ resolveKnifeHandleMatch(record).text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'cartStatus'">
            <a-tag :color="record.selected ? 'processing' : 'default'">
              {{ record.selected ? '追加済み' : '未追加' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'state'">
            <a-tag :color="isCompletedState(record) ? 'success' : 'default'">
              {{ stateText(record) }}
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
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button
                v-if="record.selected"
                type="link"
                danger
                size="small"
                @click="$emit('remove', record)"
              >
                削除
              </a-button>
              <a-popconfirm
                title="この納品予定から入庫申請を作成しますか"
                ok-text="はい"
                cancel-text="いいえ"
                :disabled="isInboundApplied(record)"
                @confirm="$emit('inbound', record)"
              >
                <a-button
                  type="primary"
                  size="small"
                  :loading="isInboundLoading(record)"
                  :disabled="isInboundApplied(record)"
                >
                  {{ isInboundApplied(record) ? '申請済み' : '入庫申請' }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  submitText: { type: String, default: '\u8ffd\u52a0' },
  rows: { type: Array, default: () => [] },
  selectedKeys: { type: Array, default: () => [] },
  qtyState: { type: Object, default: () => ({}) },
  inboundLoadingKeys: { type: Array, default: () => [] },
  rowKey: { type: Function, required: true },
  maxRequestQty: { type: Function, required: true },
  formatQty: { type: Function, required: true },
  isInboundApplied: { type: Function, required: true },
});

const emit = defineEmits(['submit', 'selection-change', 'qty-change', 'inbound', 'remove']);

const addedCount = computed(() => (props.rows || []).filter((row) => row?.selected).length);
const pendingAddCount = computed(() => {
  const selected = new Set((props.selectedKeys || []).map((key) => String(key)));
  return (props.rows || []).filter((row) => selected.has(String(props.rowKey(row))) && !row?.selected).length;
});
const rowSelection = computed(() => ({
  selectedRowKeys: props.selectedKeys,
  onChange: (keys) => emit('selection-change', keys),
  getCheckboxProps: (record) => ({
    disabled: !record?.selected && props.maxRequestQty(record) <= 0,
  }),
}));

const columns = [
  { title: '\u4f1d\u7968\u756a\u53f7', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
  { title: '\u5546\u54c1\u540d', dataIndex: 'goodsName', key: 'goodsName', width: 180 },
  { title: '\u54c1\u756a', dataIndex: 'skuCode', key: 'skuCode', width: 120 },
  { title: '\u30d6\u30e9\u30f3\u30c9', dataIndex: 'brandName', key: 'brandName', width: 120 },
  { title: '\u30b7\u30ea\u30fc\u30ba', dataIndex: 'seriesName', key: 'seriesName', width: 120 },
  { title: '\u30ab\u30c6\u30b4\u30ea', dataIndex: 'categoryName', key: 'categoryName', width: 120 },
  { title: '\u51fa\u5eab\u6570\u91cf', dataIndex: 'changeQty', key: 'changeQty', width: 90 },
  { title: '\u8acb\u6c42\u6570\u91cf', dataIndex: 'requestQty', key: 'requestQty', width: 120 },
  { title: '納品予定', dataIndex: 'selected', key: 'cartStatus', width: 100 },
  { title: '\u4fa1\u683c', dataIndex: 'price', key: 'price', width: 100 },
  { title: '\u901a\u8ca8', dataIndex: 'currency', key: 'currency', width: 80 },
  { title: '操作人', dataIndex: 'operatorName', key: 'operatorName', width: 110 },
  { title: '状態', dataIndex: 'state', key: 'state', width: 80 },
  { title: '\u5200/\u30cf\u30f3\u30c9\u30eb', dataIndex: 'matchStatus', key: 'matchStatus', width: 130 },
  { title: '\u64cd\u4f5c', key: 'actions', width: 170, fixed: 'right' },
];

function isInboundLoading(record) {
  const key = props.rowKey(record);
  return props.inboundLoadingKeys.some((item) => String(item) === String(key));
}

function stateText(record) {
  const raw = record?.state ?? record?.orderState ?? record?.stockOrderState ?? record?.stateCode;
  if (raw === undefined || raw === null || String(raw).trim() === '') return '-';
  const text = String(raw);
  if (text === '0') return '草稿';
  if (text === '1') return '審査中';
  if (text === '2') return '完了';
  if (text === '3') return '取消';
  return text;
}

function isCompletedState(record) {
  const text = stateText(record).toLowerCase();
  return ['2', '完了', '完成', 'completed', 'complete', 'done'].some((keyword) => text.includes(keyword));
}

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
}

.request-candidate-card {
  margin-bottom: 16px;
}

.request-candidate-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}
</style>
