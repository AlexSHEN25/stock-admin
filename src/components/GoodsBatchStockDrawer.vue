<template>
  <a-drawer
    :open="open"
    :title="title"
    placement="right"
    width="100%"
    :get-container="false"
    :body-style="drawerBodyStyle"
    @close="$emit('cancel')"
  >
    <div class="batch-stock-drawer">
      <div class="batch-stock-toolbar">
        <a-select
          v-if="mode === 'inbound'"
          :value="settings.sourceType"
          :options="sourceTypeOptions"
          class="batch-stock-source"
          placeholder="入庫区分を選択"
          @update:value="(value) => $emit('update-setting', 'sourceType', value)"
        />
        <a-input
          :value="settings.remark"
          class="batch-stock-remark"
          :placeholder="mode === 'inbound' ? '一括入庫の備考' : '一括出庫の備考'"
          @update:value="(value) => $emit('update-setting', 'remark', value)"
        />
      </div>

      <a-table
        :row-key="rowKey"
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="pagination"
        :scroll="tableScroll"
        :row-selection="rowSelection"
        size="small"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'goodsName'">
            {{ record.goodsName || record.name || '-' }}
          </template>
          <template v-else-if="column.key === 'skuCode'">
            {{ record.skuCode || '-' }}
          </template>
          <template v-else-if="column.key === 'brandName'">
            {{ record.brandName || '-' }}
          </template>
          <template v-else-if="column.key === 'seriesName'">
            {{ record.seriesName || '-' }}
          </template>
          <template v-else-if="column.key === 'warehouseName'">
            {{ record.warehouseName || '-' }}
          </template>
          <template v-else-if="column.key === 'stockTypeName'">
            {{ record.stockTypeName || '-' }}
          </template>
          <template v-else-if="column.key === 'currentQty'">
            {{ currentQty(record) }}
          </template>
          <template v-else-if="column.key === 'quantity'">
            <a-input-number
              :value="draftValue(record, 'quantity')"
              :min="1"
              :max="shouldLimitQuantity ? currentQty(record) : undefined"
              :precision="0"
              class="batch-stock-number"
              @update:value="(value) => $emit('update-draft', rowKey(record), 'quantity', value)"
            />
          </template>
          <template v-else-if="column.key === 'remark'">
            <a-input
              :value="draftValue(record, 'remark')"
              placeholder="明細備考"
              @update:value="(value) => $emit('update-draft', rowKey(record), 'remark', value)"
            />
          </template>
        </template>
      </a-table>

      <div class="batch-stock-footer">
        <span class="batch-stock-count">選択 {{ selectedKeys.length }} 件</span>
        <div class="batch-stock-actions">
          <a-button @click="$emit('cancel')">
            キャンセル
          </a-button>
          <a-button
            type="primary"
            :loading="submitting"
            :disabled="selectedKeys.length === 0"
            @click="$emit('submit')"
          >
            {{ mode === 'inbound' ? '一括入庫' : '一括出庫' }}
          </a-button>
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'inbound' },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: [Boolean, Object], default: false },
  selectedKeys: { type: Array, default: () => [] },
  drafts: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) },
  rowKey: { type: Function, required: true },
  sourceTypeOptions: { type: Array, default: () => [] },
  limitQuantityToCurrent: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits([
  'cancel',
  'submit',
  'page-change',
  'update-draft',
  'update-setting',
  'update-selected-keys',
]);

const title = computed(() => (props.mode === 'inbound' ? '一括入庫' : '一括出庫'));
const shouldLimitQuantity = computed(() => props.mode === 'outbound' || props.limitQuantityToCurrent);
const drawerBodyStyle = {
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
};
const tableScroll = computed(() => ({
  x: 'max-content',
  y: props.pagination ? 'calc(100vh - 260px)' : 'calc(100vh - 220px)',
}));

const columns = computed(() => ([
  { title: '商品名', dataIndex: 'goodsName', key: 'goodsName', width: 220, fixed: 'left' },
  { title: '品番', dataIndex: 'skuCode', key: 'skuCode', width: 140 },
  { title: 'ブランド', dataIndex: 'brandName', key: 'brandName', width: 150 },
  { title: 'シリーズ', dataIndex: 'seriesName', key: 'seriesName', width: 150 },
  { title: '倉庫名', dataIndex: 'warehouseName', key: 'warehouseName', width: 150 },
  { title: '在庫分類', dataIndex: 'stockTypeName', key: 'stockTypeName', width: 140 },
  { title: '現在数量', dataIndex: 'currentQty', key: 'currentQty', width: 110, align: 'right' },
  { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 130 },
  { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
]));

const rowSelection = computed(() => ({
  selectedRowKeys: (props.selectedKeys || []).map((key) => String(key)),
  getCheckboxProps: (record) => ({
    disabled: shouldLimitQuantity.value && currentQty(record) <= 0,
  }),
  onChange: (keys) => {
    const normalized = (Array.isArray(keys) ? keys : []).map((key) => String(key));
    emit('update-selected-keys', normalized);
  },
}));

function draftValue(record, field) {
  const row = props.drafts?.[props.rowKey(record)] || {};
  if (field === 'quantity') return row.quantity ?? 1;
  return row[field] ?? '';
}

function currentQty(record) {
  const value = record?.currentQty ?? record?.availableQty ?? record?.stockQty ?? record?.quantity ?? 0;
  const quantity = Number(value);
  return Number.isNaN(quantity) ? 0 : Math.max(0, quantity);
}

function onTableChange(page) {
  emit('page-change', {
    pageNum: Number(page?.current || 1),
    pageSize: Number(page?.pageSize || 10),
  });
}
</script>

<style scoped>
.batch-stock-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  height: 100%;
}

.batch-stock-toolbar {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
}

.batch-stock-source,
.batch-stock-remark,
.batch-stock-number {
  width: 100%;
}

.batch-stock-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}

.batch-stock-count {
  color: rgba(0, 0, 0, 0.65);
}

.batch-stock-actions {
  display: flex;
  gap: 8px;
}

:deep(.ant-table-wrapper) {
  min-height: 0;
}

@media (max-width: 768px) {
  .batch-stock-toolbar {
    grid-template-columns: 1fr;
  }

  .batch-stock-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-stock-actions {
    justify-content: flex-end;
  }
}
</style>
