<template>
  <a-drawer
    :open="open"
    :title="title"
    class="sheet-flow-drawer-root"
    root-class-name="sheet-flow-drawer-root"
    placement="right"
    width="100%"
    :closable="true"
    :get-container="false"
    :content-wrapper-style="drawerWrapperStyle"
    :body-style="drawerBodyStyle"
    @close="$emit('cancel')"
  >
    <div class="sheet-flow-drawer">
      <a-tabs
        v-model:active-key="activeTab"
        class="sheet-flow-tabs"
      >
        <a-tab-pane
          v-if="allowGroupOutbound"
          key="group"
          tab="グループ別在庫配分"
        >
          <div class="sheet-flow-tab-content">
            <a-table
              class="sheet-flow-table"
              :row-key="rowKey"
              :data-source="rows"
              :columns="groupColumns"
              :pagination="false"
              :scroll="largeTableScroll"
              size="small"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'skuCode'">
                  {{ record.skuCode || record.sku_code || '-' }}
                </template>
                <template v-else-if="column.key === 'name'">
                  {{ record.goodsName || record.name || record.title || '-' }}
                </template>
                <template v-else-if="column.key === 'brandName'">
                  {{ record.brandName || record.brand || '-' }}
                </template>
                <template v-else-if="column.key === 'makerName'">
                  {{ record.makerName || record.maker || '-' }}
                </template>
                <template v-else-if="column.key === 'warehouseName'">
                  {{ record.warehouseName || record.warehouse || '-' }}
                </template>
                <template v-else-if="column.key === 'currentQty'">
                  {{ maxQty(record) }}
                </template>
                <template v-if="column.key === 'aQty' || column.key === 'bQty' || column.key === 'cQty'">
                  <a-input-number
                    :value="draftValue(record, column.key)"
                    :min="1"
                    :precision="0"
                    class="sheet-flow-number"
                    @update:value="(value) => $emit('update-draft', rowKey(record), column.key, value)"
                  />
                </template>
                <template v-else-if="column.key === 'remainQty'">
                  <a-tag :color="remainQty(record) < 0 ? 'red' : 'default'">
                    {{ remainQty(record) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'saleDeadline'">
                  <a-date-picker
                    :value="draftValue(record, 'saleDeadline') || null"
                    :show-time="{ format: 'HH' }"
                    format="MM-DD HH時"
                    value-format="YYYY-MM-DD HH:00:00"
                    class="sheet-flow-date"
                    @update:value="(value) => $emit('update-draft', rowKey(record), 'saleDeadline', value)"
                  />
                </template>
                <template v-else-if="column.key === 'rowTotal'">
                  {{ rowTotal(record) }}
                </template>
                <template v-else-if="column.key === 'remark'">
                  <a-input
                    :value="draftValue(record, 'remark')"
                    placeholder="備考"
                    @update:value="(value) => $emit('update-draft', rowKey(record), 'remark', value)"
                  />
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <a-tab-pane
          key="customer"
          tab="顧客別在庫配分"
        >
          <div class="sheet-flow-tab-content sheet-flow-customer-content">
            <a-table
              class="sheet-flow-table"
              :row-key="rowKey"
              :data-source="rows"
              :columns="customerColumns"
              :pagination="false"
              :scroll="customerTableScroll"
              size="small"
              bordered
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'skuCode'">
                  {{ record.skuCode || record.sku_code || '-' }}
                </template>
                <template v-else-if="column.key === 'name'">
                  {{ record.goodsName || record.name || record.title || '-' }}
                </template>
                <template v-else-if="column.key === 'brandName'">
                  {{ record.brandName || record.brand || '-' }}
                </template>
                <template v-else-if="column.key === 'makerName'">
                  {{ record.makerName || record.maker || '-' }}
                </template>
                <template v-else-if="column.key === 'warehouseName'">
                  {{ record.warehouseName || record.warehouse || '-' }}
                </template>
                <template v-else-if="column.key === 'currentQty'">
                  {{ maxQty(record) }}
                </template>
                <template v-else-if="column.key === 'remainQty'">
                  <a-tag :color="remainQty(record) < 0 ? 'red' : 'default'">
                    {{ remainQty(record) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'saleDeadline'">
                  <a-date-picker
                    :value="draftValue(record, 'saleDeadline') || null"
                    :show-time="{ format: 'HH' }"
                    format="MM-DD HH時"
                    value-format="YYYY-MM-DD HH:00:00"
                    class="sheet-flow-date"
                    @update:value="(value) => $emit('update-draft', rowKey(record), 'saleDeadline', value)"
                  />
                </template>
                <template v-else-if="column.key === 'rowTotal'">
                  {{ rowTotal(record) }}
                </template>
                <template v-else-if="column.key === 'remark'">
                  <a-input
                    :value="draftValue(record, 'remark')"
                    placeholder="備考"
                    @update:value="(value) => $emit('update-draft', rowKey(record), 'remark', value)"
                  />
                </template>
              </template>
            </a-table>

            <div class="customer-allocation-panel">
              <div class="customer-allocation-header">
                <strong>顧客追加</strong>
              </div>
              <div class="customer-allocation-scroll">
                <div
                  v-if="customerAllocations.length === 0"
                  class="empty-state"
                >
                  顧客を追加してください
                </div>
                <div
                  v-else
                  class="customer-allocation-list"
                >
                  <div
                    v-for="allocation in customerAllocations"
                    :key="allocation.key"
                    class="customer-allocation-row"
                  >
                    <a-select
                      :value="allocation.customerId"
                      :options="relationOptions.customerId || []"
                      placeholder="顧客を選択"
                      show-search
                      allow-clear
                      option-filter-prop="label"
                      class="customer-allocation-select"
                      @update:value="(value) => $emit('update-customer-allocation', allocation.key, 'customerId', value)"
                    />
                    <a-input-number
                      :value="allocation.quantity"
                      :min="0"
                      :precision="0"
                      placeholder="数量"
                      class="customer-allocation-number"
                      @update:value="(value) => $emit('update-customer-allocation', allocation.key, 'quantity', value)"
                    />
                    <a-button
                      danger
                      @click="$emit('remove-customer-allocation', allocation.key)"
                    >
                      削除
                    </a-button>
                  </div>
                </div>
                <div class="customer-allocation-footer">
                  <a-button
                    type="dashed"
                    block
                    @click="$emit('add-customer-allocation')"
                  >
                    顧客を追加
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>

      <div class="sheet-flow-footer">
        <a-space>
          <a-button @click="$emit('cancel')">
            キャンセル
          </a-button>
          <a-button
            type="primary"
            :loading="submitting"
            :disabled="totalQuantity <= 0"
            @click="$emit('submit')"
          >
            {{ submitText }}
          </a-button>
        </a-space>
      </div>
    </div>
  </a-drawer>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'outbound' },
  allowGroupOutbound: { type: Boolean, default: false },
  rows: { type: Array, default: () => [] },
  drafts: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) },
  relationOptions: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
  rowKey: { type: Function, required: true },
});

const emit = defineEmits([
  'cancel',
  'submit',
  'update-draft',
  'update-setting',
  'add-customer-allocation',
  'update-customer-allocation',
  'remove-customer-allocation',
]);

const activeTab = ref('customer');

watch(
  () => props.open,
  (open) => {
    if (open) {
      const preferredMode = String(props.settings?.allocationMode || '');
      activeTab.value = preferredMode === 'customer'
        ? 'customer'
        : (props.allowGroupOutbound ? 'group' : 'customer');
      syncAllocationMode(activeTab.value);
    }
  },
);

watch(
  activeTab,
  syncAllocationMode,
);

function syncAllocationMode(tab) {
  emit('update-setting', 'allocationMode', tab);
  emit('update-setting', 'outboundMode', tab === 'group'
    ? 'GROUP_ALLOCATE'
    : (props.settings?.customerOutboundMode || 'CUSTOMER'));
  if (tab === 'group') {
    emit('update-setting', 'customerAllocations', []);
  }
}

const title = computed(() => '発送予定表振分処理');
const isInbound = computed(() => props.mode === 'inbound');
const isDelivery = computed(() => props.mode === 'delivery');
const isCustomerMode = computed(() => String(activeTab.value) === 'customer');
const drawerWrapperStyle = {
  height: 'auto',
  maxHeight: 'calc(100dvh - 16px)',
  top: '8px',
  bottom: 'auto',
};
const drawerBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: 'auto',
  maxHeight: 'calc(100dvh - 72px)',
  overflow: 'hidden',
  padding: '16px',
};
const largeTableScroll = computed(() => ({
  x: 'max-content',
  y: 'min(520px, calc(100dvh - 220px))',
}));
const customerTableScroll = computed(() => ({
  x: 'max-content',
  y: isDelivery.value
    ? 'min(360px, calc(100dvh - 460px))'
    : 'min(420px, calc(100dvh - 420px))',
}));
const customerAllocations = computed(() => (Array.isArray(props.settings?.customerAllocations) ? props.settings.customerAllocations : []));

const baseColumns = [
  { title: '品番', dataIndex: 'skuCode', key: 'skuCode', width: 120, fixed: 'left' },
  { title: '商品名', dataIndex: 'name', key: 'name', width: 180, fixed: 'left' },
  { title: 'ブランド', dataIndex: 'brandName', key: 'brandName', width: 120 },
  { title: 'メーカー', dataIndex: 'makerName', key: 'makerName', width: 120 },
  { title: '倉庫', dataIndex: 'warehouseName', key: 'warehouseName', width: 140 },
  { title: '現在数量', dataIndex: 'currentQty', key: 'currentQty', width: 96 },
];

const groupColumns = computed(() => {
  if (isInbound.value) {
    return [
      ...baseColumns,
      { title: '入庫数量', dataIndex: 'quantity', key: 'quantity', width: 120 },
      { title: '入庫後数量', dataIndex: 'afterQty', key: 'afterQty', width: 100 },
      { title: '販売期限', dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
      { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
    ];
  }
  if (isDelivery.value) {
    return [
      ...baseColumns,
      { title: 'A組', dataIndex: 'aQty', key: 'aQty', width: 110 },
      { title: 'B組', dataIndex: 'bQty', key: 'bQty', width: 110 },
      { title: 'C組', dataIndex: 'cQty', key: 'cQty', width: 110 },
      { title: '合計', dataIndex: 'rowTotal', key: 'rowTotal', width: 110 },
      { title: '残数', dataIndex: 'remainQty', key: 'remainQty', width: 110 },
      { title: '販売期限', dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
      { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
    ];
  }
  return [
    ...baseColumns,
    { title: 'A組', dataIndex: 'aQty', key: 'aQty', width: 110 },
    { title: 'B組', dataIndex: 'bQty', key: 'bQty', width: 110 },
    { title: 'C組', dataIndex: 'cQty', key: 'cQty', width: 110 },
    { title: '合計', dataIndex: 'rowTotal', key: 'rowTotal', width: 110 },
    { title: '残数', dataIndex: 'remainQty', key: 'remainQty', width: 110 },
    { title: '販売期限', dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
    { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
  ];
});

const customerColumns = computed(() => {
  if (isDelivery.value) {
    return [
      ...baseColumns,
      { title: '合計', dataIndex: 'rowTotal', key: 'rowTotal', width: 110 },
      { title: '残数', dataIndex: 'remainQty', key: 'remainQty', width: 110 },
      { title: '販売期限', dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
      { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
    ];
  }
  return [
    ...baseColumns,
    { title: '備考', dataIndex: 'remark', key: 'remark', width: 240 },
  ];
});

const totalQuantity = computed(() => props.rows.reduce((total, record) => total + rowTotal(record), 0));
const submitText = computed(() => '発送予定表振分登録');

function draft(record) {
  return props.drafts[props.rowKey(record)] || {};
}

function draftValue(record, field) {
  return draft(record)[field] ?? (field === 'remark' || field === 'saleDeadline' ? '' : 0);
}

function rowTotal(record) {
  if (isCustomerMode.value) {
    return customerAllocations.value.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }
  return ['aQty', 'bQty', 'cQty'].reduce((total, field) => total + Number(draftValue(record, field) || 0), 0);
}

function remainQty(record) {
  return maxQty(record) - rowTotal(record);
}

function maxQty(record) {
  const outboundMaxQty = Number(record?.outboundMaxQty);
  const currentQty = Number(record?.currentQty ?? 0);
  return Math.max(0, outboundMaxQty > 0 ? outboundMaxQty : currentQty);
}
</script>

<style scoped>
:deep(.ant-drawer-content-wrapper) {
  height: auto !important;
  max-height: calc(100dvh - 16px);
}

:deep(.ant-drawer-content) {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: inherit;
}

:deep(.ant-drawer-body) {
  flex: 0 1 auto;
}

.sheet-flow-drawer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: auto;
  max-height: 100%;
  min-height: 0;
}

.sheet-flow-tabs {
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.sheet-flow-tabs :deep(.ant-tabs-nav) {
  flex: 0 0 auto;
  margin-bottom: 12px;
}

.sheet-flow-tabs :deep(.ant-tabs-content-holder) {
  flex: 0 1 auto;
  overflow: hidden;
}

.sheet-flow-tabs :deep(.ant-tabs-content-holder),
.sheet-flow-tabs :deep(.ant-tabs-content),
.sheet-flow-tabs :deep(.ant-tabs-tabpane) {
  height: auto;
  max-height: 100%;
  min-height: 0;
}

.sheet-flow-tabs :deep(.ant-tabs-tabpane-active) {
  display: flex;
  flex-direction: column;
}

.sheet-flow-tab-content {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 100%;
  min-height: 0;
  overflow: hidden;
}

.sheet-flow-customer-content {
  gap: 12px;
}

.sheet-flow-table {
  flex: 0 1 auto;
  width: 100%;
  min-height: 0;
}

.sheet-flow-table :deep(.ant-table-wrapper),
.sheet-flow-table :deep(.ant-spin-nested-loading),
.sheet-flow-table :deep(.ant-spin-container) {
  min-height: 0;
}

.sheet-flow-number,
.sheet-flow-date {
  width: 100%;
}

.sheet-flow-footer {
  flex: 0 0 auto;
  display: flex;
  justify-content: flex-end;
  padding: 12px 0 0;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  background: inherit;
}

.customer-allocation-panel {
  display: flex;
  flex: 0 1 auto;
  flex-direction: column;
  min-height: 124px;
  max-height: clamp(220px, 34dvh, 360px);
  border: 1px solid #d8dee8;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.customer-allocation-header {
  flex: 0 0 auto;
  padding: 12px 14px;
  border-bottom: 1px solid #e5eaf1;
  background: #f8fafc;
  color: #1f2937;
}

.customer-allocation-scroll {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}

.customer-allocation-list {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.customer-allocation-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 140px auto;
  gap: 8px;
  align-items: center;
}

.customer-allocation-select,
.customer-allocation-number {
  width: 100%;
}

.customer-allocation-footer {
  position: sticky;
  bottom: 0;
  flex: 0 0 auto;
  margin-top: 10px;
  padding-top: 10px;
  background: inherit;
}

.empty-state {
  color: #64748b;
  text-align: center;
  padding: 26px 16px;
  background: #ffffff;
}

:global(html[data-theme-mode='dark']) :deep(.ant-drawer-content),
:global(html[data-theme-mode='dark']) :deep(.ant-drawer-header),
:global(html[data-theme-mode='dark']) :deep(.ant-drawer-body) {
  background: #181818 !important;
  color: #f4f4f5 !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-drawer-title),
:global(html[data-theme-mode='dark']) :deep(.ant-drawer-close) {
  color: #f4f4f5 !important;
}

:global(html[data-theme-mode='dark']) .sheet-flow-drawer,
:global(html[data-theme-mode='dark']) .sheet-flow-footer {
  background: #181818;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.ant-tabs-tab) {
  color: #a1a1aa;
}

:global(html[data-theme-mode='dark']) :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-table-wrapper),
:global(html[data-theme-mode='dark']) :deep(.ant-table),
:global(html[data-theme-mode='dark']) :deep(.ant-table-container),
:global(html[data-theme-mode='dark']) :deep(.ant-table-content) {
  background: #151515 !important;
  color: #f4f4f5 !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-table-thead > tr > th) {
  background: #242424 !important;
  border-color: #343434 !important;
  color: #f4f4f5 !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-table-tbody > tr > td) {
  background: #181818 !important;
  border-color: #303030 !important;
  color: #f4f4f5 !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-table-tbody > tr:hover > td) {
  background: #222222 !important;
}

:global(html[data-theme-mode='dark']) .customer-allocation-panel {
  border-color: #343434;
  background: #151515;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

:global(html[data-theme-mode='dark']) .customer-allocation-header,
:global(html[data-theme-mode='dark']) .customer-allocation-footer {
  border-color: #343434;
  background: #1f1f1f;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) .customer-allocation-scroll,
:global(html[data-theme-mode='dark']) .empty-state {
  background: #151515;
  color: #a1a1aa;
}

:global(html[data-theme-mode='dark']) :deep(.ant-input),
:global(html[data-theme-mode='dark']) :deep(.ant-input-number),
:global(html[data-theme-mode='dark']) :deep(.ant-select-selector),
:global(html[data-theme-mode='dark']) :deep(.ant-picker) {
  background: #111111 !important;
  border-color: #3f3f46 !important;
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-input-number-input),
:global(html[data-theme-mode='dark']) :deep(.ant-select-selection-item),
:global(html[data-theme-mode='dark']) :deep(.ant-picker-input > input) {
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-input::placeholder),
:global(html[data-theme-mode='dark']) :deep(.ant-select-selection-placeholder),
:global(html[data-theme-mode='dark']) :deep(.ant-input-number-input::placeholder) {
  color: #71717a !important;
}

:global(html[data-theme-mode='dark']) :deep(.ant-btn-default),
:global(html[data-theme-mode='dark']) :deep(.ant-btn-dashed) {
  background: #181818;
  border-color: #3f3f46;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.ant-btn-default:hover),
:global(html[data-theme-mode='dark']) :deep(.ant-btn-dashed:hover) {
  background: #242424;
  border-color: #60a5fa;
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) .sheet-flow-footer {
  border-color: #343434;
}

@media (max-width: 768px) {
  .customer-allocation-row {
    grid-template-columns: 1fr;
  }

  .customer-allocation-panel {
    max-height: clamp(220px, 42dvh, 360px);
  }
}
</style>
