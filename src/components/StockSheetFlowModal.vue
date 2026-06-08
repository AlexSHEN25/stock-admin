<template>
  <a-modal
    :open="open"
    :title="title"
    width="1400px"
    :ok-text="submitText"
    :confirm-loading="submitting"
    :ok-button-props="{ disabled: totalQuantity <= 0 }"
    @ok="$emit('submit')"
    @cancel="$emit('cancel')"
  >
    <a-space
      class="sheet-flow-toolbar"
      wrap
    >
      <a-select
        :value="settings.warehouseId"
        :options="relationOptions.warehouseId || []"
        :placeholder="TEXT.warehouse"
        show-search
        allow-clear
        option-filter-prop="label"
        class="sheet-flow-control"
        @update:value="(value) => $emit('update-setting', 'warehouseId', value)"
      />
      <a-select
        :value="settings.stockTypeId"
        :options="relationOptions.stockTypeId || []"
        :placeholder="TEXT.stockType"
        show-search
        allow-clear
        option-filter-prop="label"
        class="sheet-flow-control"
        @update:value="(value) => $emit('update-setting', 'stockTypeId', value)"
      />
      <a-select
        v-if="isPureOutbound"
        :value="settings.customerId"
        :options="relationOptions.customerId || []"
        :placeholder="TEXT.customer"
        show-search
        allow-clear
        option-filter-prop="label"
        class="sheet-flow-control"
        @update:value="(value) => $emit('update-setting', 'customerId', value)"
      />
      <a-date-picker
        v-if="isInbound"
        :value="settings.saleDeadline"
        value-format="YYYY-MM-DD HH:mm:ss"
        show-time
        :placeholder="TEXT.saleDeadline"
        class="sheet-flow-control"
        @update:value="(value) => $emit('update-setting', 'saleDeadline', value)"
      />
      <a-input
        :value="settings.remark"
        :placeholder="TEXT.commonRemark"
        class="sheet-flow-remark"
        @update:value="(value) => $emit('update-setting', 'remark', value)"
      />
      <a-tag color="blue">
        {{ TEXT.total }} {{ totalQuantity }}
      </a-tag>
    </a-space>

    <a-table
      class="sheet-flow-table"
      :row-key="rowKey"
      :data-source="rows"
      :columns="columns"
      :pagination="false"
      :scroll="{ x: 'max-content', y: 560 }"
      size="small"
      bordered
    >
      <template #bodyCell="{ column, record }">
        <template v-if="quantityFields.includes(column.key)">
          <a-input-number
            :value="draftValue(record, column.key)"
            :min="0"
            :max="isPureOutbound ? maxQty(record) : undefined"
            :precision="0"
            class="sheet-flow-number"
            @update:value="(value) => $emit('update-draft', rowKey(record), column.key, value)"
          />
        </template>
        <template v-else-if="column.key === 'saleDeadline'">
          <a-date-picker
            :value="draftValue(record, 'saleDeadline')"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
            class="sheet-flow-date"
            @update:value="(value) => $emit('update-draft', rowKey(record), 'saleDeadline', value)"
          />
        </template>
        <template v-else-if="column.key === 'remainQty'">
          <a-tag :color="remainQty(record) < 0 ? 'red' : 'default'">
            {{ remainQty(record) }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'afterQty'">
          {{ maxQty(record) + rowTotal(record) }}
        </template>
        <template v-else-if="column.key === 'rowTotal'">
          {{ rowTotal(record) }}
        </template>
        <template v-else-if="column.key === 'remark'">
          <a-input
            :value="draftValue(record, 'remark')"
            :placeholder="TEXT.remark"
            @update:value="(value) => $emit('update-draft', rowKey(record), 'remark', value)"
          />
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue';

const TEXT = {
  inboundTitle: '\u8868\u5f62\u5f0f\u5165\u5eab',
  outboundTitle: '\u8868\u5f62\u5f0f\u51fa\u5eab',
  deliveryTitle: '\u7d0d\u54c1\u632f\u5206',
  inboundSubmit: '\u5165\u5eab\u767b\u9332',
  outboundSubmit: '\u51fa\u5eab\u767b\u9332',
  deliverySubmit: '\u7d0d\u54c1\u632f\u5206\u767b\u9332',
  warehouse: '\u5009\u5eab',
  stockType: '\u5728\u5eab\u5206\u985e',
  customer: '\u304a\u5ba2\u69d8',
  saleDeadline: '\u8ca9\u58f2\u671f\u9650',
  commonRemark: '\u5171\u901a\u5099\u8003',
  total: '\u5408\u8a08',
  skuCode: '\u54c1\u756a',
  goodsName: '\u54c1\u540d',
  brand: '\u30d6\u30e9\u30f3\u30c9',
  maker: '\u30e1\u30fc\u30ab\u30fc',
  currentQty: '\u73fe\u5728\u5eab',
  deliveryQty: '\u7d0d\u54c1\u6570',
  inboundQty: '\u5165\u5eab\u6570\u91cf',
  afterQty: '\u5165\u5eab\u5f8c',
  groupA: 'A\u7d44\u632f\u5206',
  groupB: 'B\u7d44\u632f\u5206',
  groupC: 'C\u7d44\u632f\u5206',
  groupTotal: '\u7d44\u632f\u5206\u5408\u8a08',
  selfInbound: '\u81ea\u793e\u5165\u5eab',
  remain: '\u6b8b',
  remark: '\u5099\u8003',
};

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: { type: String, default: 'outbound' },
  rows: { type: Array, default: () => [] },
  drafts: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) },
  relationOptions: { type: Object, default: () => ({}) },
  submitting: { type: Boolean, default: false },
  rowKey: { type: Function, required: true },
});

defineEmits(['cancel', 'submit', 'update-draft', 'update-setting']);

const isInbound = computed(() => props.mode === 'inbound');
const isDelivery = computed(() => props.mode === 'delivery');
const isPureOutbound = computed(() => props.mode === 'outbound');
const title = computed(() => {
  if (isInbound.value) return TEXT.inboundTitle;
  if (isDelivery.value) return TEXT.deliveryTitle;
  return TEXT.outboundTitle;
});
const quantityFields = computed(() => {
  if (isInbound.value) return ['quantity'];
  if (isDelivery.value) return ['deliveryQty', 'aQty', 'bQty', 'cQty'];
  return ['aQty', 'bQty', 'cQty'];
});
const columns = computed(() => {
  const base = [
    { title: TEXT.skuCode, dataIndex: 'skuCode', key: 'skuCode', width: 120, fixed: 'left' },
    { title: TEXT.goodsName, dataIndex: 'name', key: 'name', width: 180, fixed: 'left' },
    { title: TEXT.brand, dataIndex: 'brandName', key: 'brandName', width: 110 },
    { title: TEXT.maker, dataIndex: 'makerName', key: 'makerName', width: 110 },
    { title: TEXT.currentQty, dataIndex: 'currentQty', key: 'currentQty', width: 90 },
  ];
  if (isInbound.value) {
    return [
      ...base,
      { title: TEXT.inboundQty, dataIndex: 'quantity', key: 'quantity', width: 120 },
      { title: TEXT.afterQty, dataIndex: 'afterQty', key: 'afterQty', width: 90 },
      { title: TEXT.saleDeadline, dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
      { title: TEXT.remark, dataIndex: 'remark', key: 'remark', width: 220 },
    ];
  }
  if (isDelivery.value) {
    return [
      ...base,
      { title: TEXT.deliveryQty, dataIndex: 'deliveryQty', key: 'deliveryQty', width: 110 },
      { title: TEXT.groupA, dataIndex: 'aQty', key: 'aQty', width: 110 },
      { title: TEXT.groupB, dataIndex: 'bQty', key: 'bQty', width: 110 },
      { title: TEXT.groupC, dataIndex: 'cQty', key: 'cQty', width: 110 },
      { title: TEXT.groupTotal, dataIndex: 'rowTotal', key: 'rowTotal', width: 110 },
      { title: TEXT.selfInbound, dataIndex: 'remainQty', key: 'remainQty', width: 110 },
      { title: TEXT.saleDeadline, dataIndex: 'saleDeadline', key: 'saleDeadline', width: 190 },
      { title: TEXT.remark, dataIndex: 'remark', key: 'remark', width: 220 },
    ];
  }
  return [
    ...base,
    { title: TEXT.groupA, dataIndex: 'aQty', key: 'aQty', width: 110 },
    { title: TEXT.groupB, dataIndex: 'bQty', key: 'bQty', width: 110 },
    { title: TEXT.groupC, dataIndex: 'cQty', key: 'cQty', width: 110 },
    { title: TEXT.total, dataIndex: 'rowTotal', key: 'rowTotal', width: 80 },
    { title: TEXT.remain, dataIndex: 'remainQty', key: 'remainQty', width: 80 },
    { title: TEXT.remark, dataIndex: 'remark', key: 'remark', width: 220 },
  ];
});

const totalQuantity = computed(() => props.rows.reduce((total, record) => {
  if (isDelivery.value) return total + Number(draftValue(record, 'deliveryQty') || 0);
  return total + rowTotal(record);
}, 0));
const submitText = computed(() => {
  const label = isInbound.value ? TEXT.inboundSubmit : (isDelivery.value ? TEXT.deliverySubmit : TEXT.outboundSubmit);
  return totalQuantity.value > 0 ? `${label}\uff08${totalQuantity.value}\uff09` : label;
});

function draft(record) {
  return props.drafts[props.rowKey(record)] || {};
}

function draftValue(record, field) {
  return draft(record)[field] ?? (field === 'remark' || field === 'saleDeadline' ? '' : 0);
}

function rowTotal(record) {
  if (isDelivery.value) {
    return ['aQty', 'bQty', 'cQty'].reduce((total, field) => total + Number(draftValue(record, field) || 0), 0);
  }
  return quantityFields.value.reduce((total, field) => total + Number(draftValue(record, field) || 0), 0);
}

function remainQty(record) {
  if (isDelivery.value) {
    return Number(draftValue(record, 'deliveryQty') || 0) - rowTotal(record);
  }
  return maxQty(record) - rowTotal(record);
}

function maxQty(record) {
  return Math.max(0, Number(record?.outboundMaxQty ?? record?.currentQty ?? 0));
}
</script>

<style scoped>
.sheet-flow-toolbar {
  margin-bottom: 12px;
}

.sheet-flow-control {
  width: 180px;
}

.sheet-flow-remark {
  width: 260px;
}

.sheet-flow-number,
.sheet-flow-date {
  width: 100%;
}
</style>
