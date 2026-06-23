<template>
  <a-drawer
    :open="open"
    :title="title"
    placement="right"
    width="min(94vw, 1680px)"
    :closable="true"
    :get-container="false"
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
          <a-table
            class="sheet-flow-table"
            :row-key="rowKey"
            :data-source="rows"
            :columns="groupColumns"
            :pagination="false"
            :scroll="{ x: 'max-content', y: 560 }"
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
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
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
        </a-tab-pane>

        <a-tab-pane
          key="customer"
          tab="顧客別在庫配分"
        >
          <a-table
            class="sheet-flow-table"
            :row-key="rowKey"
            :data-source="rows"
            :columns="customerColumns"
            :pagination="false"
            :scroll="{ x: 'max-content', y: isDelivery ? 560 : 380 }"
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
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
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
              <a-button
                type="dashed"
                size="small"
                @click="$emit('add-customer-allocation')"
              >
                顧客を追加
              </a-button>
            </div>
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
  if (isDelivery.value) {
    return ['aQty', 'bQty', 'cQty'].reduce((total, field) => total + Number(draftValue(record, field) || 0), 0);
  }
  return ['aQty', 'bQty', 'cQty'].reduce((total, field) => total + Number(draftValue(record, field) || 0), 0);
}

function remainQty(record) {
  if (isDelivery.value) {
    return maxQty(record) - rowTotal(record);
  }
  return maxQty(record) - rowTotal(record);
}

function maxQty(record) {
  const outboundMaxQty = Number(record?.outboundMaxQty);
  const currentQty = Number(record?.currentQty ?? 0);
  return Math.max(0, outboundMaxQty > 0 ? outboundMaxQty : currentQty);
}
</script>

<style scoped>
.sheet-flow-drawer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-flow-table :deep(.ant-table-tbody > tr > td) {
  vertical-align: top;
}

.sheet-flow-number {
  width: 100%;
}

.sheet-flow-date {
  width: 100%;
}

.sheet-flow-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.customer-allocation-panel {
  margin-top: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.customer-allocation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.customer-allocation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.customer-allocation-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px auto;
  gap: 12px;
  align-items: center;
}

.customer-allocation-select,
.customer-allocation-number {
  width: 100%;
}

.empty-state {
  padding: 14px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.65);
}

@media (max-width: 768px) {
  .customer-allocation-row {
    grid-template-columns: 1fr;
  }
}
</style>
