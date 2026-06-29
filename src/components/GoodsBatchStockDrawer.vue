<template>
  <a-drawer
    :open="open"
    :title="title"
    class="batch-stock-drawer-root"
    root-class-name="batch-stock-drawer-root"
    placement="right"
    width="100%"
    :get-container="false"
    :body-style="drawerBodyStyle"
    @close="$emit('cancel')"
  >
    <div class="batch-stock-drawer">
      <div class="batch-stock-toolbar">
        <a-radio-group
          v-if="showModeSwitch"
          :value="mode"
          option-type="button"
          button-style="solid"
          @update:value="(value) => $emit('update-mode', value)"
        >
          <a-radio-button value="inbound">
            入庫
          </a-radio-button>
          <a-radio-button value="outbound">
            出庫
          </a-radio-button>
        </a-radio-group>
        <a-date-picker
          :value="settings.bizDate || null"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          class="batch-stock-date"
          placeholder="納品日"
          @update:value="(value) => $emit('update-setting', 'bizDate', value)"
        />
        <a-input
          :value="settings.remark"
          class="batch-stock-remark"
          :placeholder="mode === 'inbound' ? '入庫の全体備考' : '出庫の全体備考'"
          @update:value="(value) => $emit('update-setting', 'remark', value)"
        />
      </div>

      <div
        v-if="searchFields.length > 0"
        class="batch-stock-search"
      >
        <div class="batch-stock-search-title">
          商品検索
        </div>
        <div class="batch-stock-search-fields">
          <template
            v-for="field in searchFields"
            :key="field"
          >
            <a-select
              v-if="queryInputType(field) === 'select'"
              v-model:value="query[field]"
              :options="queryOptions(field)"
              :placeholder="queryPlaceholder(field)"
              class="batch-stock-search-control"
              allow-clear
              show-search
              option-filter-prop="label"
            />
            <a-input
              v-else-if="queryInputType(field) === 'text'"
              v-model:value="query[field]"
              :placeholder="queryPlaceholder(field)"
              class="batch-stock-search-control"
              allow-clear
              @press-enter="$emit('search')"
            />
            <a-date-picker
              v-else-if="queryInputType(field) === 'datetime'"
              v-model:value="query[field]"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :placeholder="queryPlaceholder(field)"
              class="batch-stock-search-control"
              allow-clear
            />
            <a-input-number
              v-else
              v-model:value="query[field]"
              :placeholder="queryPlaceholder(field)"
              class="batch-stock-search-control"
            />
          </template>
        </div>
        <div class="batch-stock-search-actions">
          <a-button
            type="primary"
            @click="$emit('search')"
          >
            {{ tableText.search }}
          </a-button>
          <a-button
            :disabled="!hasActiveFilters(searchFields, queryState)"
            @click="$emit('reset-search')"
          >
            {{ tableText.reset }}
          </a-button>
        </div>
      </div>

      <a-alert
        type="info"
        show-icon
        :message="mode === 'inbound'
          ? '商品を検索して選択し、入庫種別・倉庫・在庫分類・数量・納品日を入力してください。'
          : '商品を選択し、数量・納品日を入力してください。出庫数量は現在数量以下で入力してください。'"
      />

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
          <template v-else-if="column.key === 'sourceType'">
            <a-select
              :value="draftValue(record, 'sourceType')"
              :options="sourceTypeOptions"
              class="batch-stock-input"
              placeholder="入庫種別"
              @update:value="(value) => $emit('update-draft', rowKey(record), 'sourceType', value)"
            />
          </template>
          <template v-else-if="column.key === 'warehouseId'">
            <a-select
              :value="draftValue(record, 'warehouseId')"
              :options="warehouseOptions"
              class="batch-stock-input"
              placeholder="倉庫"
              show-search
              allow-clear
              option-filter-prop="label"
              @update:value="(value) => $emit('update-draft', rowKey(record), 'warehouseId', value)"
            />
          </template>
          <template v-else-if="column.key === 'stockTypeId'">
            <a-select
              :value="draftValue(record, 'stockTypeId')"
              :options="stockTypeOptions"
              class="batch-stock-input"
              placeholder="在庫分類"
              show-search
              allow-clear
              option-filter-prop="label"
              @update:value="(value) => $emit('update-draft', rowKey(record), 'stockTypeId', value)"
            />
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
        <span class="batch-stock-count">選択: {{ selectedKeys.length }} 件</span>
        <div class="batch-stock-actions">
          <a-button @click="$emit('cancel')">
            キャンセル
          </a-button>
          <a-button
            type="primary"
            :danger="mode === 'outbound'"
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
  warehouseOptions: { type: Array, default: () => [] },
  stockTypeOptions: { type: Array, default: () => [] },
  limitQuantityToCurrent: { type: Boolean, default: false },
  showModeSwitch: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  searchFields: { type: Array, default: () => [] },
  queryState: { type: Object, default: () => ({}) },
  tableText: { type: Object, required: true },
  queryInputType: { type: Function, required: true },
  queryOptions: { type: Function, required: true },
  queryPlaceholder: { type: Function, required: true },
  hasActiveFilters: { type: Function, required: true },
});

const emit = defineEmits([
  'cancel',
  'submit',
  'page-change',
  'search',
  'reset-search',
  'update-draft',
  'update-setting',
  'update-mode',
  'update-query-field',
  'update-selected-keys',
]);

const title = computed(() => {
  if (props.showModeSwitch) return '一括出入庫';
  return props.mode === 'outbound' ? '一括出庫' : '一括入庫';
});
const shouldLimitQuantity = computed(() => props.mode === 'outbound' || props.limitQuantityToCurrent);
const drawerBodyStyle = {
  height: '100%',
  overflow: 'hidden',
  padding: '16px',
};
const tableScroll = computed(() => ({
  x: 'max-content',
  y: props.pagination ? 'calc(100vh - 430px)' : 'calc(100vh - 360px)',
}));

const query = computed(() => new Proxy(props.queryState, {
  set(_target, field, value) {
    emit('update-query-field', field, value);
    return true;
  },
}));

const columns = computed(() => {
  const base = [
    { title: '商品名', dataIndex: 'goodsName', key: 'goodsName', width: 260, fixed: 'left' },
    { title: '品番', dataIndex: 'skuCode', key: 'skuCode', width: 140 },
    { title: 'ブランド', dataIndex: 'brandName', key: 'brandName', width: 150 },
    { title: 'シリーズ', dataIndex: 'seriesName', key: 'seriesName', width: 150 },
  ];
  if (props.mode === 'inbound') {
    base.push(
      { title: '入庫種別', dataIndex: 'sourceType', key: 'sourceType', width: 170 },
      { title: '倉庫', dataIndex: 'warehouseId', key: 'warehouseId', width: 190 },
      { title: '在庫分類', dataIndex: 'stockTypeId', key: 'stockTypeId', width: 190 },
    );
  } else {
    base.push(
      { title: '倉庫名', dataIndex: 'warehouseName', key: 'warehouseName', width: 150 },
      { title: '在庫分類', dataIndex: 'stockTypeName', key: 'stockTypeName', width: 140 },
      { title: '現在数量', dataIndex: 'currentQty', key: 'currentQty', width: 110, align: 'right' },
    );
  }
  return [
    ...base,
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 130 },
    { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
  ];
});

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
  if (field === 'quantity') return row.quantity ?? props.settings?.quantity ?? 1;
  if (field === 'sourceType') return row.sourceType ?? props.settings?.sourceType ?? null;
  if (field === 'warehouseId') return row.warehouseId ?? record?.warehouseId ?? props.settings?.warehouseId ?? null;
  if (field === 'stockTypeId') return row.stockTypeId ?? record?.stockTypeId ?? props.settings?.stockTypeId ?? null;
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
  gap: 14px;
  min-height: 0;
  height: 100%;
}

.batch-stock-toolbar {
  display: grid;
  grid-template-columns: auto 180px minmax(260px, 1fr);
  gap: 12px;
  align-items: center;
}

.batch-stock-search {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f8fafc;
}

.batch-stock-search-title {
  padding-top: 5px;
  color: #1f2937;
  font-weight: 700;
  white-space: nowrap;
}

.batch-stock-search-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.batch-stock-search-control,
.batch-stock-date,
.batch-stock-input,
.batch-stock-number {
  width: 100%;
}

.batch-stock-search-actions {
  display: flex;
  gap: 8px;
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
  .batch-stock-toolbar,
  .batch-stock-search {
    grid-template-columns: 1fr;
  }

  .batch-stock-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-stock-actions,
  .batch-stock-search-actions {
    justify-content: flex-end;
  }
}
</style>
