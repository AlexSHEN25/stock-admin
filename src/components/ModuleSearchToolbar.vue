<template>
  <div class="search-toolbar">
    <div class="search-filters">
      <template
        v-for="field in fields"
        :key="field"
      >
        <a-select
          v-if="queryInputType(field) === 'select'"
          v-model:value="query[field]"
          :options="queryOptions(field)"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
          allow-clear
        />
        <a-input
          v-else-if="queryInputType(field) === 'text'"
          v-model:value="query[field]"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
          @press-enter="$emit('reload')"
        />
        <a-date-picker
          v-else-if="queryInputType(field) === 'datetime'"
          v-model:value="query[field]"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
          allow-clear
        />
        <a-input-number
          v-else
          v-model:value="query[field]"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
        />
      </template>
    </div>

    <div class="search-actions">
      <a-button
        type="primary"
        class="search-btn search-btn-main"
        @click="$emit('search')"
      >
        {{ tableText.search }}
      </a-button>
      <a-button
        class="search-btn"
        :disabled="!hasActiveFilters(fields, queryState)"
        @click="$emit('reset')"
      >
        {{ tableText.reset }}
      </a-button>
      <a-popconfirm
        v-if="canWrite && canBatchDelete && selectedCount > 0"
        :title="tableText.confirmBatchDelete"
        :ok-text="tableText.yes"
        :cancel-text="tableText.no"
        @confirm="$emit('batch-delete')"
      >
        <a-button
          danger
          class="search-btn"
        >
          {{ tableText.batchDelete }}
        </a-button>
      </a-popconfirm>
      <a-button
        v-else-if="canWrite && canBatchDelete"
        danger
        class="search-btn"
        disabled
      >
        {{ tableText.batchDelete }}
      </a-button>
      <a-button
        v-if="showCreateButton"
        type="primary"
        class="search-btn search-btn-create"
        @click="$emit('create')"
      >
        {{ tableText.create }}
      </a-button>
      <a-button
        v-if="canExport"
        class="search-btn"
        :loading="exportLoading"
        @click="$emit('export-current')"
      >
        {{ tableText.export }}
      </a-button>
      <a-button
        v-if="canWrite && canSheetInbound"
        type="primary"
        class="search-btn"
        @click="$emit('sheet-inbound')"
      >
        一括入庫
      </a-button>
      <a-button
        v-if="canWrite && showSheetOutboundButton"
        type="primary"
        danger
        class="search-btn"
        :disabled="!canSheetOutbound"
        @click="$emit('sheet-outbound')"
      >
        一括出庫
      </a-button>
      <a-button
        v-if="canWrite && canDeliveryAllocation"
        type="primary"
        class="search-btn"
        @click="$emit('delivery-allocation')"
      >
        発送予定表振分
      </a-button>
      <a-button
        v-if="moduleKey === 'customer' && canWrite"
        class="search-btn"
        :disabled="goodsImportLoading"
        @click="$emit('download-goods-template')"
      >
        顧客テンプレート
      </a-button>
      <a-upload
        v-if="moduleKey === 'customer' && canWrite"
        accept=".xlsx,.xls"
        :show-upload-list="false"
        :before-upload="(file) => { $emit('goods-import', file); return false; }"
      >
        <a-button
          class="search-btn"
          :loading="goodsImportLoading"
        >
          顧客一括導入
        </a-button>
      </a-upload>
      <a-button
        v-if="moduleKey === 'goods' && canWrite"
        class="search-btn"
        :disabled="goodsImportLoading"
        @click="$emit('download-goods-template')"
      >
        商品テンプレート
      </a-button>
      <a-upload
        v-if="moduleKey === 'goods' && canWrite"
        accept=".xlsx,.xls"
        :show-upload-list="false"
        :before-upload="(file) => { $emit('goods-import', file); return false; }"
      >
        <a-button
          class="search-btn"
          :loading="goodsImportLoading"
        >
          商品一括導入
        </a-button>
      </a-upload>
      <a-button
        v-if="moduleKey === 'message' && canWrite"
        class="search-btn"
        @click="$emit('read-all')"
      >
        {{ tableText.readAll }}
      </a-button>
      <a-button
        v-if="canUseRequestFlowActions"
        class="search-btn"
        :disabled="selectedCount === 0"
        @click="$emit('fill-selected-qty')"
      >
        選択行を最大数量
      </a-button>
      <a-button
        v-if="canUseRequestFlowActions"
        class="search-btn"
        :disabled="selectedCount === 0"
        @click="$emit('clear-selected-qty')"
      >
        数量クリア
      </a-button>
      <a-button
        v-if="canMoveDeliveryToRequest"
        type="primary"
        class="search-btn"
        :disabled="selectedCount === 0"
        @click="$emit('move-delivery-to-request')"
      >
        請求書明細へ追加
      </a-button>
      <a-button
        v-if="canMoveRequestToDelivery"
        class="search-btn"
        :disabled="selectedCount === 0"
        @click="$emit('move-request-to-delivery')"
      >
        発送予定表へ戻す
      </a-button>
      <a-button
        v-if="canGenerateRequestForm"
        type="primary"
        class="search-btn"
        @click="$emit('generate-request-form')"
      >
        請求書生成
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  queryState: { type: Object, required: true },
  tableText: { type: Object, required: true },
  moduleKey: { type: String, required: true },
  canWrite: { type: Boolean, default: false },
  canBatchDelete: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  canSheetInbound: { type: Boolean, default: false },
  canSheetOutbound: { type: Boolean, default: false },
  canDeliveryAllocation: { type: Boolean, default: false },
  canExport: { type: Boolean, default: false },
  exportLoading: { type: Boolean, default: false },
  canGenerateRequestForm: { type: Boolean, default: false },
  canMoveDeliveryToRequest: { type: Boolean, default: false },
  canMoveRequestToDelivery: { type: Boolean, default: false },
  goodsImportLoading: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  queryInputType: { type: Function, required: true },
  queryOptions: { type: Function, required: true },
  queryPlaceholder: { type: Function, required: true },
  hasActiveFilters: { type: Function, required: true },
});

const emit = defineEmits([
  'search',
  'reload',
  'reset',
  'batch-delete',
  'create',
  'sheet-inbound',
  'sheet-outbound',
  'delivery-allocation',
  'export-current',
  'download-goods-template',
  'goods-import',
  'read-all',
  'generate-request-form',
  'fill-selected-qty',
  'clear-selected-qty',
  'move-delivery-to-request',
  'move-request-to-delivery',
  'update-field',
]);

const showCreateButton = computed(() => (
  props.canWrite
  && props.canCreate
  && String(props.moduleKey || '') !== 'requestItem'
));

const showSheetOutboundButton = computed(() => (
  props.moduleKey === 'stock'
  || props.moduleKey === 'stockSelf'
  || props.moduleKey === 'stockGroup'
  || /^stockGroup[ABC]$/.test(String(props.moduleKey || ''))
));

const canUseRequestFlowActions = computed(() => (
  props.canMoveDeliveryToRequest || props.canMoveRequestToDelivery
));

const query = computed(() => new Proxy(props.queryState, {
  set(_target, field, value) {
    emit('update-field', field, value);
    return true;
  },
}));
</script>
