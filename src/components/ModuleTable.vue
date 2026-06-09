<template>
  <a-card
    :title="null"
    :bordered="false"
  >
    <module-search-toolbar
      :fields="visibleQueryFields"
      :query-state="queryState"
      :table-text="TABLE_TEXT"
      :module-key="props.moduleKey"
      :can-write="canWrite"
      :can-batch-delete="canBatchDeleteInModule()"
      :can-create="canCreateInModule()"
      :can-sheet-inbound="canOpenSheetInbound"
      :can-sheet-outbound="canOpenSheetOutbound"
      :selected-count="selectedRowKeys.length"
      :query-input-type="queryInputType"
      :query-options="queryOptions"
      :query-placeholder="queryPlaceholder"
      :has-active-filters="hasActiveFilters"
      @search="doSearch"
      @reload="reload"
      @reset="resetQuery"
      @batch-delete="onBatchDelete"
      @create="openCreate"
      @sheet-inbound="openSheetInboundModal"
      @sheet-outbound="openSheetOutboundModal"
      @read-all="onReadAllMessages"
      @update-field="updateQueryField"
    />

    <request-candidate-modal
      :open="props.moduleKey === 'requestItem' && candidateModalOpen"
      :loading="candidateLoading"
      :submit-text="candidateSubmitText"
      :rows="candidateRows"
      :selected-keys="candidateSelectedKeys"
      :qty-state="candidateQtyState"
      :inbound-loading-keys="candidateInboundLoadingKeys"
      :row-key="candidateRowKey"
      :max-request-qty="maxRequestQty"
      :format-qty="formatQty"
      :is-inbound-applied="isCandidateInboundApplied"
      @submit="submitAddCandidates"
      @inbound="submitCandidateInbound"
      @selection-change="onCandidateSelectChange"
      @qty-change="onCandidateQtyChange"
      @remove="removeCandidate"
    />

    <a-table
      class="module-table"
      :row-key="getRowKey"
      :row-class-name="rowClassName"
      :columns="columns"
      :data-source="tableRows"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :loading="loading || goodsStockLoading"
      :pagination="tablePagination"
      :scroll="{ x: 'max-content' }"
      @change="onChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="isEditing(record) && column.key !== '__actions' && !isReadonlyField(column.key)">
          <module-inline-editor
            :field="column.key"
            :edit-state="editState"
            :relation-options="relationOptions"
            :is-avatar-field="isAvatarField"
            :before-avatar-upload="beforeInlineAvatarUpload"
            :inline-field="inlineField"
            :input-type="inlineInputType"
            :is-multi-relation-field="isMultiRelationField"
            :number-min-by-field="numberMinByField"
            :number-precision-by-field="numberPrecisionByField"
            :select-options="scopedSelectOptions"
            @update-field="updateInlineField"
          />
        </template>
        <template v-else-if="String(column.key) === 'skuId'">
          {{ record.skuId ?? '-' }}
        </template>
        <template v-else-if="column.key === 'mainImage' || column.key === 'image' || column.key === 'imageUrl'">
          <a-image
            v-if="resolveGoodsImageUrl(record)"
            :src="resolveGoodsImageUrl(record)"
            :width="56"
            :height="56"
            style="object-fit: cover; border-radius: 6px;"
          />
          <span v-else>-</span>
        </template>
        <template v-else-if="isAvatarField(column.key)">
          <a-image
            v-if="resolveAvatarSrc(record)"
            :src="resolveAvatarSrc(record)"
            :width="56"
            :height="56"
            style="object-fit: cover; border-radius: 6px;"
          />
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'statusDesc'">
          <a-tag :color="Number(record.status) === 1 ? 'success' : 'default'">
            {{ normalizeDisplayLabel(record.statusDesc || (Number(record.status) === 1 ? 'ON' : 'OFF')) }}
          </a-tag>
        </template>
        <template v-else-if="String(column.key) === 'isHot'">
          {{ Number(record.isHot) === 1 ? TABLE_TEXT.hotYes : TABLE_TEXT.hotNo }}
        </template>
        <template v-else-if="String(column.key) === 'changeQty'">
          {{ formatQty(record.changeQty) }}
        </template>
        <template v-else-if="String(column.key) === 'updateTime'">
          {{ formatTime(record.updateTime) }}
        </template>
        <template v-else-if="String(column.key) === 'inventoryStatus'">
          <a-tag :color="record.inboundDone ? 'success' : 'default'">
            {{ record.inventoryStatus }}
          </a-tag>
        </template>
        <template v-else-if="isPermissionNamesField(column.key)">
          <div
            v-if="permissionNameList(record).length"
            class="permission-chip-list"
          >
            <a-tag
              v-for="item in permissionNameList(record)"
              :key="item"
              class="permission-chip"
            >
              {{ item }}
            </a-tag>
          </div>
          <span v-else>-</span>
        </template>
        <template v-else-if="hasEnumOptionsMerged(column.key)">
          {{ enumLabelMerged(column.key, record[column.key]) }}
        </template>

        <template v-else-if="column.key === '__actions'">
          <module-row-actions
            :record="record"
            :actions="rowExtraActions"
            :table-text="TABLE_TEXT"
            :can-write="canWrite"
            :can-inline-edit="canInlineEditRecord(record)"
            :can-edit="canEditRecord(record)"
            :can-delete="canDeleteRecord(record)"
            :editing="isEditing(record)"
            :show-inbound="isGoodsManagement"
            :inbound-done="isGoodsInboundDone(record)"
            :can-outbound="canGoodsOutbound(record)"
            :can-show-extra-action="canShowRowExtraAction"
            @inbound="openGoodsInboundModal"
            @outbound="openGoodsOutboundModal"
            @extra-action="handleRowExtraAction"
            @inline-edit="startInlineEdit"
            @save="saveInlineEdit"
            @cancel="cancelInlineEdit"
            @edit="openEdit"
            @delete="onDelete"
          />
        </template>
      </template>
    </a-table>

    <module-edit-modal
      v-if="!isGoodsManagement"
      :open="modalOpen"
      :can-write="canWrite"
      :fields="visibleFormKeys"
      :form-state="formState"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isFormFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="isAvatarField"
      :before-avatar-upload="beforeAvatarUpload"
      :input-type="inputType"
      :form-placeholder="formPlaceholder"
      :is-multi-relation-field="isMultiRelationField"
      :number-min-by-field="numberMinByField"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="scopedSelectOptions"
      @save="submit"
      @cancel="modalOpen = false"
      @update-field="updateFormField"
    />
    <module-edit-modal
      v-if="isGoodsManagement"
      :open="goodsInboundModalOpen"
      :can-write="true"
      :fields="GOODS_INBOUND_FIELDS"
      :form-state="goodsInboundForm"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isGoodsInboundFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="() => false"
      :before-avatar-upload="() => false"
      :input-type="goodsInboundInputType"
      :form-placeholder="() => ''"
      :is-multi-relation-field="() => false"
      :number-min-by-field="goodsInboundNumberMin"
      :number-max-by-field="() => undefined"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="goodsInboundSelectOptions"
      @save="submitGoodsInbound"
      @cancel="goodsInboundModalOpen = false"
      @update-field="updateGoodsInboundField"
    />
    <module-edit-modal
      v-if="isGoodsManagement"
      :open="goodsOutboundModalOpen"
      :can-write="true"
      :fields="visibleGoodsOutboundFields"
      :form-state="goodsOutboundForm"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isGoodsOutboundFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="() => false"
      :before-avatar-upload="() => false"
      :input-type="goodsOutboundInputType"
      :form-placeholder="goodsOutboundPlaceholder"
      :is-multi-relation-field="() => false"
      :number-min-by-field="goodsOutboundNumberMin"
      :number-max-by-field="goodsOutboundNumberMax"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="goodsOutboundSelectOptions"
      @save="submitGoodsOutbound"
      @cancel="goodsOutboundModalOpen = false"
      @update-field="updateGoodsOutboundField"
    />
    <stock-sheet-flow-modal
      :open="sheetOutboundModalOpen"
      :mode="sheetFlowMode"
      :rows="sheetOutboundRows"
      :drafts="sheetOutboundDrafts"
      :settings="sheetOutboundSettings"
      :relation-options="relationOptions"
      :submitting="sheetOutboundSubmitting"
      :row-key="goodsRowKey"
      @cancel="sheetOutboundModalOpen = false"
      @submit="submitSheetFlow"
      @update-draft="updateSheetOutboundDraft"
      @update-setting="updateSheetOutboundSetting"
    />
    <goods-drawer
      :open="goodsDrawerOpen"
      :title="goodsDrawerTitle"
      :loading="goodsDrawerLoading || goodsDetailLoading"
      :saving="goodsDetailSaving"
      :mode="goodsDrawerMode"
      :form="goodsForm"
      :relation-options="relationOptions"
      :hot-options="hotOptions"
      :table-text="TABLE_TEXT"
      :select-options="scopedSelectOptions"
      :resolve-image-url="resolveGoodsImageUrl"
      @cancel="closeGoodsDrawer"
      @save="saveGoodsDrawer"
      @upload-image="beforeGoodsImageUpload"
      @update-field="updateGoodsFormField"
    />
  </a-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  fetchEnumOptions,
  fetchPage,
  fetchItem,
  fetchOutboundStockOrderOptions,
  fetchGoodsFormOptions,
  fetchMyGroupStockAvailable,
  fetchModuleOptions,
  removeItem,
  updateItem,
  uploadFileByBizType,
} from '../api/module';
import GoodsDrawer from './GoodsDrawer.vue';
import ModuleEditModal from './ModuleEditModal.vue';
import ModuleInlineEditor from './ModuleInlineEditor.vue';
import ModuleRowActions from './ModuleRowActions.vue';
import ModuleSearchToolbar from './ModuleSearchToolbar.vue';
import RequestCandidateModal from './RequestCandidateModal.vue';
import StockSheetFlowModal from './StockSheetFlowModal.vue';
import { useGoodsDrawer } from '../composables/useGoodsDrawer';
import { useModuleActions } from '../composables/useModuleActions';
import { useModuleFieldBehavior } from '../composables/useModuleFieldBehavior';
import { useModuleMedia } from '../composables/useModuleMedia';
import { useModuleOptions } from '../composables/useModuleOptions';
import { useModuleTablePresentation } from '../composables/useModuleTablePresentation';
import { useRequestItemCandidates } from '../composables/useRequestItemCandidates';
import { useRelationOptions } from '../composables/useRelationOptions';
import { useModuleTableSchema } from '../composables/useModuleTableSchema';
import { useModuleTableState } from '../composables/useModuleTableState';
import { approveStockOrder } from '../api/module';
import { downloadRequestFormFile, downloadRequestFormPdf } from '../utils/download';
import { markAllMessageListRead, markAllMessagesRead, markMessageListRead, markMessageRead } from '../utils/message';
import { submitDeliveryAllocationFlow, submitGoodsStockOutboundFlow, submitSheetStockInboundFlow, submitSheetStockOutboundFlow, submitStockInboundFlow, submitStockOrderItemReturnFlow, submitStockQuantityAdjustment } from '../utils/stock';
import { getModulePreset, guessFieldType, isRequiredFormField, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';
import TABLE_TEXT, {
  MODULE_DETAIL_NAVIGATIONS,
  MODULE_QUERY_JUMPS,
  getModuleEnumOptions,
  getRowExtraActions,
  isAdminByPermissionCodes,
} from '../utils/module-ui';
import {
  canBatchDeleteModuleRecord,
  canCreateModuleRecord,
  canDeleteModuleRecord,
  canEditModuleRecord,
  canInlineEditModuleRecord,
  hasWritePermission,
} from '../utils/permission';
import { hasActiveFilters } from '../utils/table';

const STOCK_EDIT_PAYLOAD_FIELDS = ['id', 'goodsId', 'goodsName', 'skuId', 'skuCode', 'warehouseId', 'price', 'currency', 'stockTypeId', 'status', 'version'];
const GOODS_INBOUND_FIELDS = ['sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'saleDeadline', 'remark'];
const GOODS_OUTBOUND_FIELDS = ['outboundMode', 'stockScope', 'customerId', 'deptId', 'warehouseId', 'stockTypeId', 'quantity', 'remark'];
const GOODS_OUTBOUND_MODE_CUSTOMER = 'customer';
const GOODS_OUTBOUND_MODE_DEPT = 'dept';
const GOODS_FLOW_SESSION_KEY = 'goods_stock_flow_state';
const STOCK_ORDER_DEFAULT_SOURCE_TYPE = 4;
const STOCK_ORDER_DEFAULT_STATE = 0;
const STOCK_ORDER_USER_SOURCE_TYPES = new Set([3, 4]);
const STOCK_ORDER_USER_STATES = new Set([0, 1]);
const REQUEST_FORM_DEFAULT_STATE = 0;
const REQUEST_FORM_COMPLETED_STATE = 2;
const REQUEST_FORM_USER_STATES = new Set([0, 1]);
const NORMAL_STOCK_TYPE_KEYWORDS = ['通常', 'normal'];

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  moduleActions: { type: Object, default: null },
  allDataWrite: { type: Boolean, default: false },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
  currentDeptId: { type: Number, default: null },
  currentDeptName: { type: String, default: '' },
  currentGroupCode: { type: String, default: '' },
});

const emit = defineEmits(['navigate-module']);
const goodsInboundModalOpen = ref(false);
const goodsOutboundModalOpen = ref(false);
const goodsStockLoading = ref(false);
const goodsInboundForm = reactive({});
const goodsOutboundForm = reactive({});
const sheetOutboundModalOpen = ref(false);
const sheetOutboundSubmitting = ref(false);
const sheetFlowMode = ref('outbound');
const sheetOutboundRows = ref([]);
const sheetOutboundDrafts = reactive({});
const sheetOutboundSettings = reactive({
  warehouseId: null,
  stockTypeId: null,
  customerId: null,
  saleDeadline: null,
  remark: '',
});
const goodsFlowByRowKey = reactive({});
const goodsStockRows = ref([]);
const activeGoodsRowKey = ref('');
restoreGoodsFlowState();
const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const isSplitStockManagement = computed(() => (
  props.moduleKey === 'stock'
  || props.moduleKey === 'stockSelf'
  || props.moduleKey === 'stockSummary'
  || /^stockGroup[ABC]$/.test(props.moduleKey)
));
const modulePath = computed(() => {
  if (isSplitStockManagement.value) return 'stock';
  return props.moduleKey;
});
const preset = computed(() => getModulePreset(props.moduleKey));
const rowExtraActions = computed(() => getRowExtraActions(props.moduleKey));
const canWrite = computed(() => {
  if (props.allDataWrite) return true;
  if (props.moduleActions) return Boolean(props.moduleActions.create || props.moduleActions.edit || props.moduleActions.delete);
  return hasWritePermission(props.moduleKey, props.permissionReady, props.permissionCodes || []);
});
const isAdminUser = computed(() => props.allDataWrite || isAdminByPermissionCodes(props.permissionCodes || []));
const {
  statusOptions,
  queryInputType,
  queryPlaceholder,
  inputType,
  requiredForForm,
  selectOptionsForField,
  enumOptionsForField,
  inlineField,
  inlineInputType,
  isReadonlyField,
  normalizePayload,
  formatTime,
} = useModuleFieldBehavior({
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  isGoodsManagement,
  guessFieldType,
  isRequiredFormField,
  mapNameFieldToIdField,
  normalizeTitle,
  getModuleEnumOptions,
});

const MODULE_SUBMIT_HANDLERS = {
  stock: submitStockFlow,
};

const {
  rows,
  loading,
  modalOpen,
  editing,
  editingRaw,
  formState,
  editState,
  queryState,
  selectedRowKeys,
  pagination,
  initQuery,
  applyPendingQuery,
  reload,
  resetQuery,
  doSearch,
  onChange,
  onSelectChange,
  openCreate: openCreateState,
  openEdit: openEditState,
  submit: submitState,
  onDelete: onDeleteState,
  onBatchDelete,
  isEditing: isEditingState,
  startInlineEdit: startInlineEditState,
  cancelInlineEdit,
  saveInlineEdit: saveInlineEditState,
} = useModuleTableState({
  modulePath,
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  canCreateRecord: () => canCreateInModule(),
  canEditRecord: (record) => canEditRecord(record),
  canDeleteRecord: (record) => canDeleteRecord(record),
  canBatchDeleteRecord: () => canBatchDeleteInModule(),
  getQueryFields: () => queryFields.value,
  queryInputType,
  getFormKeys: () => activeFormKeys(),
  inputType,
  inlineField,
  isReadonlyField,
  requiredForForm,
  mapNameFieldToIdField,
  moduleSubmitHandlers: MODULE_SUBMIT_HANDLERS,
  buildQueryFieldAlias: (field) => field,
  buildExtraQueryParams: () => (
    props.moduleKey === 'message' && isAdminUser.value
      ? { all: true, scope: 'all' }
      : stockViewQueryParams()
  ),
});

const {
  tableRows: requestItemTableRows,
  candidateModalOpen,
  candidateLoading,
  candidateRows,
  candidateSelectedKeys,
  candidateInboundLoadingKeys,
  candidateQtyState,
  candidateSubmitText,
  candidateRowKey,
  maxRequestQty,
  formatQty,
  openCandidateModal,
  onCandidateSelectChange,
  onCandidateQtyChange,
  submitAddCandidates,
  submitCandidateInbound,
  isCandidateInboundApplied,
  removeRequestItem,
  removeCandidate,
} = useRequestItemCandidates({
  moduleKey: computed(() => props.moduleKey),
  queryState,
  rows,
  reload,
  notify: message,
});

const isUserSelfEditMode = computed(() => props.moduleKey === 'user' && editing.value && !canCreateModuleRecord(props.moduleKey, props.permissionCodes || []));
const backendFieldSet = computed(() => new Set(Object.keys(rows.value[0] || {})));
const {
  keys,
  queryFields,
  columns,
  formKeys,
} = useModuleTableSchema({
  rows,
  preset,
  moduleKey: computed(() => props.moduleKey),
  isGoodsManagement,
  normalizeTitle,
  isReadonlyField,
  canWrite,
  isEditing: (record) => isEditing(record),
  startInlineEdit: (record) => startInlineEdit(record),
  normalizeQueryField,
  editingRaw,
  isUserSelfEditMode,
  mapNameFieldToIdField,
});
const {
  queryRelationOptions,
  relationOptions,
  loadRelationOptions,
  loadQueryRelationOptions,
  dedupeOptions,
  invalidateRelationModuleOptions,
} = useRelationOptions({
  fetchModuleOptions,
  relationLabel,
  relationModuleByField,
  inputType,
  isReadonlyField,
  inlineField,
  mapNameFieldToIdField,
  currentDeptId: props.currentDeptId,
  currentDeptName: props.currentDeptName,
});
const {
  loadDynamicEnumOptions,
  mergedEnumOptions,
  selectOptionsMerged,
  hasEnumOptionsMerged,
  loadGoodsFormOptions,
  loadSourceOrderOptions,
} = useModuleOptions({
  moduleKey: computed(() => props.moduleKey),
  isGoodsManagement,
  queryFields,
  formKeys,
  keys,
  relationOptions,
  queryRelationOptions,
  fetchEnumOptions,
  fetchGoodsFormOptions,
  fetchOutboundStockOrderOptions,
  enumOptionsForField,
  selectOptionsForField,
  dedupeOptions,
  relationLabel,
});
const {
  tablePagination,
  enumLabelMerged,
  getRecordId,
  isPermissionNamesField,
  permissionNameList,
  getRowKey,
  normalizeDisplayLabel,
  numberMinByField,
  numberPrecisionByField,
} = useModuleTablePresentation({
  moduleKey: computed(() => props.moduleKey),
  pagination,
  formatTime,
  mergedEnumOptions,
});

const {
  goodsDrawerOpen,
  goodsDrawerMode,
  goodsDrawerLoading,
  goodsDetailLoading,
  goodsDetailSaving,
  goodsForm,
  goodsDrawerTitle,
  hotOptions,
  openGoodsDrawerCreate,
  openGoodsDrawerEdit,
  closeGoodsDrawer,
  beforeGoodsImageUpload,
  resolveGoodsImageUrl,
  saveGoodsDrawer,
  updateGoodsFormField,
  rowClassName,
} = useGoodsDrawer({
  normalizePayload,
  loadRelationOptions,
  keys,
  pagination,
  rows,
  reload,
  notify: message,
});

const visibleQueryFields = computed(() => {
  const list = queryFields.value || [];
  if (props.moduleKey === 'requestItem') {
    return list.filter((field) => String(field || '').toLowerCase() !== 'requestid');
  }
  if (props.moduleKey !== 'stockOrderItem') return list;
  return list.filter((field) => String(field || '').toLowerCase() !== 'orderid');
});
const tableRows = computed(() => {
  if (isGoodsManagement.value) {
    return mergeGoodsWithStock(requestItemTableRows.value, goodsStockRows.value);
  }
  if (isSplitStockManagement.value) {
    return requestItemTableRows.value;
  }
  return requestItemTableRows.value;
});

function stockViewQueryParams() {
  if (props.moduleKey === 'stockSelf' || props.moduleKey === 'stockSummary' || props.moduleKey === 'stock') {
    return { stockScope: 'self' };
  }
  const match = String(props.moduleKey || '').match(/^stockGroup([ABC])$/);
  if (!match) return {};
  return {
    stockScope: 'group',
    groupCode: match[1],
  };
}
const visibleFormKeys = computed(() => {
  const list = editing.value ? activeFormKeys() : formKeys.value.filter((field) => String(field || '').toLowerCase() !== 'status');
  return filterFinanceFormKeys(list, formState);
});
const visibleGoodsOutboundFields = computed(() => GOODS_OUTBOUND_FIELDS.filter((field) => {
  if (field === 'customerId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE_CUSTOMER;
  if (field === 'deptId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE_DEPT;
  if (field === 'stockScope') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE_CUSTOMER;
  return true;
}));
const canOpenSheetOutbound = computed(() => (
  isGoodsManagement.value
  && canWrite.value
  && selectedGoodsRows().length > 0
));
const canOpenSheetInbound = computed(() => (
  isGoodsManagement.value
  && canWrite.value
  && selectedGoodsRows().length > 0
));

watch(
  () => props.moduleKey,
  async () => {
    if (!props.moduleKey) return;
    pagination.current = 1;
    initQuery();
    applyPendingQuery(MODULE_QUERY_JUMPS[props.moduleKey]);
    if (isGoodsManagement.value) {
      await loadGoodsFormOptions();
    }
    await loadDynamicEnumOptions();
    if (!isGoodsManagement.value) {
      await loadQueryRelationOptions(queryFields.value);
      await loadScopedRelationOptions(formKeys.value, keys.value);
      await loadSourceOrderOptions();
    }
    await reload();
    if (isGoodsManagement.value) {
      await loadGoodsStockRows();
    }
    if (props.moduleKey === 'requestItem' && !isCurrentRequestCompleted()) {
      openCandidateModal();
    }
  },
  { immediate: true },
);

function normalizeQueryField(field) {
  const key = String(field || '');
  if (key === 'sourceOrderId') return key;
  if (!key.endsWith('Id')) return key;
  if (relationModuleByField(key)) return `${key.slice(0, -2)}Name`;
  const nameField = `${key.slice(0, -2)}Name`;
  if (backendFieldSet.value.has(nameField)) return nameField;
  return key;
}

async function submitStockFlow({ buildEditPayload, getRecordId, normalizePayload: normalizeSubmitPayload }) {
  if (editing.value && isSplitStockManagement.value) {
    try {
      const rawPayload = buildEditPayload(getRecordId);
      const normalizedPayload = normalizeSubmitPayload(rawPayload);
      const beforeQty = Number(editingRaw.value?.currentQty ?? 0);
      const afterQty = Number(rawPayload.currentQty ?? beforeQty);
      const payload = Object.fromEntries(
        STOCK_EDIT_PAYLOAD_FIELDS
          .filter((field) => Object.prototype.hasOwnProperty.call(rawPayload, field))
          .map((field) => [
            field,
            Object.prototype.hasOwnProperty.call(normalizedPayload, field) ? normalizedPayload[field] : rawPayload[field],
          ]),
      );
      await updateItem(modulePath.value, payload);
      await submitStockQuantityAdjustment({
        beforeQty,
        afterQty,
        record: rawPayload,
      });
      modalOpen.value = false;
      message.success(TABLE_TEXT.updateSuccess);
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.saveFail);
    }
    return;
  }

  await submitStockInboundFlow({
    formState,
    closeModal: () => {
      modalOpen.value = false;
    },
    reload,
    notify: message,
  });
}

function updateFormField(field, value) {
  formState[field] = value;
  applyFinanceToggleState(formState, field, value);
}

function updateQueryField(field, value) {
  queryState[field] = value;
}

function updateInlineField(field, value) {
  editState[field] = value;
  applyFinanceToggleState(editState, field, value);
}

async function openGoodsInboundModal(record) {
  const rowKey = goodsRowKey(record);
  Object.keys(goodsInboundForm).forEach((key) => delete goodsInboundForm[key]);
  activeGoodsRowKey.value = rowKey;
  goodsInboundForm.goodsId = record?.goodsId ?? record?.id;
  goodsInboundForm.skuId = record?.skuId ?? null;
  goodsInboundForm.sourceType = 2;
  goodsInboundForm.warehouseId = null;
  goodsInboundForm.stockTypeId = null;
  goodsInboundForm.quantity = null;
  goodsInboundForm.saleDeadline = null;
  goodsInboundForm.remark = null;
  await loadRelationOptions(['warehouseId', 'stockTypeId'], keys.value);
  goodsInboundModalOpen.value = true;
}

function updateGoodsInboundField(field, value) {
  goodsInboundForm[field] = value;
}

function goodsInboundInputType(field) {
  if (field === 'sourceType') return 'select';
  if (field === 'warehouseId' || field === 'stockTypeId') return 'relation';
  if (field === 'quantity') return 'number';
  if (field === 'saleDeadline') return 'datetime';
  return 'textarea';
}

function goodsInboundSelectOptions(field) {
  if (field === 'sourceType') return getModuleEnumOptions('stock', 'sourceType');
  return scopedSelectOptions(field);
}

function isGoodsInboundFieldRequired(field) {
  return ['sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'saleDeadline'].includes(field);
}

function goodsInboundNumberMin(field) {
  if (field === 'quantity') return 1;
  return numberMinByField(field);
}

async function submitGoodsInbound() {
  const rowKey = activeGoodsRowKey.value;
  const success = await submitStockInboundFlow({
    formState: goodsInboundForm,
    closeModal: () => {
      goodsInboundModalOpen.value = false;
    },
    reload,
    notify: message,
  });
  if (success && rowKey) {
    goodsFlowByRowKey[rowKey] = {
      goodsId: Number(goodsInboundForm.goodsId),
      skuId: goodsInboundForm.skuId ? Number(goodsInboundForm.skuId) : null,
      sourceType: Number(goodsInboundForm.sourceType),
      warehouseId: Number(goodsInboundForm.warehouseId),
      stockTypeId: Number(goodsInboundForm.stockTypeId),
      inboundQty: Number(goodsInboundForm.quantity),
      outboundQty: Number(goodsFlowByRowKey[rowKey]?.outboundQty || 0),
    };
    persistGoodsFlowState();
    await loadGoodsStockRows();
  }
}

async function openGoodsOutboundModal(record) {
  const rowKey = goodsRowKey(record);
  const inboundState = goodsFlowByRowKey[rowKey];
  if (!isGoodsInboundDone(record)) {
    message.warning('先に入庫を完了してください');
    return;
  }
  Object.keys(goodsOutboundForm).forEach((key) => delete goodsOutboundForm[key]);
  activeGoodsRowKey.value = rowKey;
  goodsOutboundForm.goodsId = inboundState?.goodsId || Number(record?.goodsId ?? record?.id);
  goodsOutboundForm.skuId = inboundState?.skuId ?? record?.skuId ?? null;
  goodsOutboundForm.sourceType = inboundState?.sourceType || 2;
  goodsOutboundForm.warehouseId = inboundState?.warehouseId ?? null;
  goodsOutboundForm.stockTypeId = inboundState?.stockTypeId ?? null;
  goodsOutboundForm.outboundMode = GOODS_OUTBOUND_MODE_CUSTOMER;
  goodsOutboundForm.stockScope = 'self';
  goodsOutboundForm.groupCode = props.currentGroupCode || null;
  goodsOutboundForm.currentDeptId = props.currentDeptId || null;
  goodsOutboundForm.customerId = null;
  goodsOutboundForm.deptId = null;
  goodsOutboundForm.quantity = Math.max(1, availableGoodsOutboundQty(rowKey));
  goodsOutboundForm.remark = null;
  await loadRelationOptions(['customerId', 'deptId', 'warehouseId', 'stockTypeId'], keys.value);
  goodsOutboundModalOpen.value = true;
}

function updateGoodsOutboundField(field, value) {
  goodsOutboundForm[field] = value;
  if (field === 'outboundMode') {
    goodsOutboundForm.customerId = null;
    goodsOutboundForm.deptId = null;
  }
  if (['stockScope', 'warehouseId', 'stockTypeId'].includes(field)) {
    refreshGroupAvailableQty();
  }
}

async function refreshGroupAvailableQty() {
  if (goodsOutboundForm.stockScope !== 'group') return;
  const { goodsId, skuId, warehouseId, stockTypeId } = goodsOutboundForm;
  if (!goodsId || !skuId || !warehouseId || !stockTypeId) return;
  try {
    goodsOutboundForm.groupAvailableQty = await fetchMyGroupStockAvailable({
      goodsId,
      skuId,
      warehouseId,
      stockTypeId,
      deptId: props.currentDeptId || undefined,
      groupCode: props.currentGroupCode || undefined,
    });
    if (Number(goodsOutboundForm.quantity) > goodsOutboundForm.groupAvailableQty) {
      goodsOutboundForm.quantity = goodsOutboundForm.groupAvailableQty;
    }
  } catch (error) {
    message.error(error.message || TABLE_TEXT.fetchFail);
  }
}

function goodsOutboundInputType(field) {
  if (field === 'outboundMode' || field === 'stockScope') return 'select';
  if (['customerId', 'deptId', 'warehouseId', 'stockTypeId'].includes(field)) return 'relation';
  if (field === 'quantity') return 'number';
  return 'textarea';
}

function goodsOutboundSelectOptions(field) {
  if (field === 'outboundMode') {
    return [
      { label: '顧客出庫', value: GOODS_OUTBOUND_MODE_CUSTOMER },
      { label: '組別分貨', value: GOODS_OUTBOUND_MODE_DEPT },
    ];
  }
  if (field === 'stockScope') {
    const options = [{ label: '自社在庫から出庫申請', value: 'self' }];
    if (props.currentGroupCode) {
      options.push({
        label: `${props.currentGroupCode}組在庫から出庫`,
        value: 'group',
      });
    }
    return options;
  }
  return scopedSelectOptions(field);
}

function isGoodsOutboundFieldRequired(field) {
  if (field === 'customerId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE_CUSTOMER;
  if (field === 'deptId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE_DEPT;
  return ['outboundMode', 'stockScope', 'warehouseId', 'stockTypeId', 'quantity'].includes(field);
}

function goodsOutboundPlaceholder(field) {
  if (field === 'quantity') return `最大 ${availableGoodsOutboundQty(activeGoodsRowKey.value)}`;
  return '';
}

function goodsOutboundNumberMin(field) {
  if (field === 'quantity') return 1;
  return numberMinByField(field);
}

function goodsOutboundNumberMax(field) {
  if (field === 'quantity') return availableGoodsOutboundQty(activeGoodsRowKey.value);
  return undefined;
}

async function submitGoodsOutbound() {
  const rowKey = activeGoodsRowKey.value;
  const maxQty = availableGoodsOutboundQty(rowKey);
  const quantity = Number(goodsOutboundForm.quantity);
  if (!maxQty || quantity > maxQty) {
    message.warning(`出庫数量は${maxQty}以下で入力してください`);
    return;
  }
  const success = await submitGoodsStockOutboundFlow({
    formState: goodsOutboundForm,
    maxQuantity: maxQty,
    closeModal: () => {
      goodsOutboundModalOpen.value = false;
    },
    reload,
    notify: message,
  });
  if (success && rowKey) {
    goodsFlowByRowKey[rowKey].outboundQty = Number(goodsFlowByRowKey[rowKey]?.outboundQty || 0) + quantity;
    persistGoodsFlowState();
    await loadGoodsStockRows();
  }
}

async function openSheetOutboundModal() {
  const selected = selectedGoodsRows();
  if (selected.length === 0) {
    message.warning('納品振分する商品を選択してください');
    return;
  }
  sheetFlowMode.value = 'delivery';
  sheetOutboundRows.value = selected;
  Object.keys(sheetOutboundDrafts).forEach((key) => delete sheetOutboundDrafts[key]);
  selected.forEach((record) => {
    sheetOutboundDrafts[goodsRowKey(record)] = {
      deliveryQty: 0,
      aQty: 0,
      bQty: 0,
      cQty: 0,
      saleDeadline: null,
      remark: '',
    };
  });
  sheetOutboundSettings.warehouseId = firstNonEmptyValue(selected, 'warehouseId');
  sheetOutboundSettings.stockTypeId = firstNonEmptyValue(selected, 'stockTypeId');
  sheetOutboundSettings.customerId = null;
  sheetOutboundSettings.saleDeadline = null;
  sheetOutboundSettings.remark = '';
  await loadRelationOptions(['warehouseId', 'stockTypeId'], keys.value);
  sheetOutboundModalOpen.value = true;
}

async function openSheetInboundModal() {
  const selected = selectedGoodsRows();
  if (selected.length === 0) {
    message.warning('入庫する商品を選択してください');
    return;
  }
  sheetFlowMode.value = 'inbound';
  sheetOutboundRows.value = selected;
  Object.keys(sheetOutboundDrafts).forEach((key) => delete sheetOutboundDrafts[key]);
  selected.forEach((record) => {
    sheetOutboundDrafts[goodsRowKey(record)] = {
      quantity: 0,
      saleDeadline: null,
      remark: '',
    };
  });
  sheetOutboundSettings.warehouseId = firstNonEmptyValue(selected, 'warehouseId');
  sheetOutboundSettings.stockTypeId = firstNonEmptyValue(selected, 'stockTypeId');
  sheetOutboundSettings.customerId = null;
  sheetOutboundSettings.saleDeadline = null;
  sheetOutboundSettings.remark = '';
  await loadRelationOptions(['warehouseId', 'stockTypeId'], keys.value);
  sheetOutboundModalOpen.value = true;
}

function selectedGoodsRows() {
  if (!isGoodsManagement.value || selectedRowKeys.value.length === 0) return [];
  const selected = new Set(selectedRowKeys.value.map((key) => String(key)));
  return (tableRows.value || []).filter((record) => selected.has(String(getRowKey(record))));
}

function firstNonEmptyValue(records, field) {
  const hit = (records || []).find((record) => record?.[field] !== undefined && record?.[field] !== null && String(record[field]).trim() !== '');
  return hit?.[field] ?? null;
}

function updateSheetOutboundDraft(rowKey, field, value) {
  if (!sheetOutboundDrafts[rowKey]) {
    sheetOutboundDrafts[rowKey] = {};
  }
  sheetOutboundDrafts[rowKey][field] = value;
}

function updateSheetOutboundSetting(field, value) {
  sheetOutboundSettings[field] = value;
}

async function submitSheetFlow() {
  if (!sheetOutboundSettings.warehouseId || !sheetOutboundSettings.stockTypeId) {
    message.warning(TABLE_TEXT.requiredField);
    return;
  }
  if (sheetFlowMode.value === 'outbound') {
    const invalid = sheetOutboundRows.value.some((record) => {
      const draft = sheetOutboundDrafts[goodsRowKey(record)] || {};
      const total = Number(draft.aQty || 0) + Number(draft.bQty || 0) + Number(draft.cQty || 0);
      return total > availableGoodsOutboundQty(goodsRowKey(record));
    });
    if (invalid) {
      message.warning('出庫数量は現在庫以下で入力してください');
      return;
    }
  }
  if (sheetFlowMode.value === 'delivery') {
    const invalid = sheetOutboundRows.value.some((record) => {
      const draft = sheetOutboundDrafts[goodsRowKey(record)] || {};
      const deliveryQty = Number(draft.deliveryQty || 0);
      const groupTotal = Number(draft.aQty || 0) + Number(draft.bQty || 0) + Number(draft.cQty || 0);
      return deliveryQty < 0 || groupTotal > deliveryQty;
    });
    if (invalid) {
      message.warning('A/B/C組振分合計は納品数以下で入力してください');
      return;
    }
  }

  sheetOutboundSubmitting.value = true;
  try {
    const submitFlow = sheetFlowMode.value === 'inbound'
      ? submitSheetStockInboundFlow
      : (sheetFlowMode.value === 'delivery' ? submitDeliveryAllocationFlow : submitSheetStockOutboundFlow);
    const success = await submitFlow({
      items: sheetOutboundRows.value.map((record) => ({
        record,
        draft: sheetOutboundDrafts[goodsRowKey(record)] || {},
      })),
      settings: sheetOutboundSettings,
      notify: message,
    });
    if (success) {
      sheetOutboundModalOpen.value = false;
      selectedRowKeys.value = [];
      await reload();
      await loadGoodsStockRows();
    }
  } catch (error) {
    message.error(error.message || TABLE_TEXT.saveFail);
  } finally {
    sheetOutboundSubmitting.value = false;
  }
}

function isGoodsInboundDone(record) {
  const state = goodsFlowByRowKey[goodsRowKey(record)];
  return Boolean(
    (state && Number(state.inboundQty) > 0)
      || record?.inboundDone,
  );
}

function canGoodsOutbound(record) {
  return isGoodsInboundDone(record) && availableGoodsOutboundQty(goodsRowKey(record)) > 0;
}

function availableGoodsOutboundQty(rowKey) {
  if (goodsOutboundForm.stockScope === 'group' && rowKey === activeGoodsRowKey.value) {
    return Math.max(0, Number(goodsOutboundForm.groupAvailableQty || 0));
  }
  const state = goodsFlowByRowKey[rowKey] || {};
  const inboundQty = Number(state.inboundQty || 0);
  const outboundQty = Number(state.outboundQty || 0);
  if (inboundQty > 0) {
    return Math.max(0, inboundQty - outboundQty);
  }
  const record = tableRows.value.find((item) => goodsRowKey(item) === rowKey);
  return Math.max(0, Number(record?.outboundMaxQty ?? record?.currentQty ?? 0));
}

function goodsRowKey(record) {
  const key = getRecordId(record) ?? record?.goodsId ?? record?.id;
  return key === undefined || key === null ? '' : String(key);
}

async function loadGoodsStockRows() {
  goodsStockLoading.value = true;
  try {
    const firstPage = await fetchPage('stock', {
      pageNum: 1,
      pageSize: 50,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
    const pageCount = Math.ceil(Number(firstPage.total || 0) / 50);
    const remainingPages = pageCount > 1
      ? await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => fetchPage('stock', {
        pageNum: index + 2,
        pageSize: 50,
        sortBy: 'updateTime',
        sortOrder: 'desc',
      })))
      : [];
    goodsStockRows.value = [
      ...(Array.isArray(firstPage.records) ? firstPage.records : []),
      ...remainingPages.flatMap((page) => (Array.isArray(page.records) ? page.records : [])),
    ];
  } catch (error) {
    goodsStockRows.value = [];
    message.error(error.message || TABLE_TEXT.fetchFail);
  } finally {
    goodsStockLoading.value = false;
  }
}

function mergeGoodsWithStock(goodsRows, stockRows) {
  const stocks = Array.isArray(stockRows) ? stockRows : [];
  return (Array.isArray(goodsRows) ? goodsRows : []).map((goods) => {
    const matched = stocks.filter((stock) => isSameGoodsStock(goods, stock));
    const currentQty = matched.reduce((total, stock) => total + stockCurrentQty(stock), 0);
    const hasStock = matched.some((stock) => stockCurrentQty(stock) > 0);
    return {
      ...goods,
      currentQty,
      outboundMaxQty: currentQty,
      inboundDone: hasStock,
      inventoryStatus: hasStock ? '入庫済み' : '未入庫',
      stockId: matched.length === 1 ? matched[0]?.id : null,
    };
  });
}

function isSameGoodsStock(goods, stock) {
  const goodsSkuId = Number(goods?.skuId);
  const stockSkuId = Number(stock?.skuId);
  if (goodsSkuId && stockSkuId) return goodsSkuId === stockSkuId;
  const goodsId = Number(goods?.goodsId ?? goods?.id);
  const stockGoodsId = Number(stock?.goodsId);
  return Boolean(goodsId && stockGoodsId && goodsId === stockGoodsId);
}

function stockCurrentQty(stock) {
  const value = stock?.currentQty ?? stock?.availableQty ?? stock?.stockQty ?? stock?.quantity ?? 0;
  const quantity = Number(value);
  return Number.isNaN(quantity) ? 0 : quantity;
}

function restoreGoodsFlowState() {
  try {
    const stored = sessionStorage.getItem(GOODS_FLOW_SESSION_KEY);
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      Object.assign(goodsFlowByRowKey, parsed);
    }
  } catch (_error) {
    sessionStorage.removeItem(GOODS_FLOW_SESSION_KEY);
  }
}

function persistGoodsFlowState() {
  sessionStorage.setItem(GOODS_FLOW_SESSION_KEY, JSON.stringify(goodsFlowByRowKey));
}

function openRequestItemCandidateModal() {
  if (props.moduleKey === 'requestItem' && isCurrentRequestCompleted()) {
    message.warning('完了済みの請求書は明細を変更できません');
    return;
  }
  openCandidateModal();
}

function openCreate() {
  if (!canWrite.value || !canCreateInModule()) return;
  if (props.moduleKey === 'requestItem') {
    openRequestItemCandidateModal();
    return;
  }
  if (isGoodsManagement.value) {
    openGoodsDrawerCreate();
    return;
  }
  const opened = openCreateState();
  if (opened) {
    if (Object.prototype.hasOwnProperty.call(formState, 'status')) {
      formState.status = 1;
    }
    applyStockOrderCreateDefaults();
    applyRequestFormCreateDefaults();
    loadScopedRelationOptions(formKeys.value, keys.value).then(() => {
      applyStockOrderRelationDefaults();
    });
    loadSourceOrderOptions();
  }
}

async function openEdit(record) {
  if (!canWrite.value || !canEditRecord(record)) return;
  if (isGoodsManagement.value) {
    openGoodsDrawerEdit(record);
    return;
  }
  const editRecord = await loadStockDetail(record);
  const opened = openEditState(editRecord, getRecordId);
  if (opened) {
    loadScopedRelationOptions(activeFormKeys(), keys.value);
    loadSourceOrderOptions();
  }
}

async function loadStockDetail(record) {
  if (!isSplitStockManagement.value) return record;
  try {
    const detail = await fetchItem(modulePath.value, getRecordId(record));
    return detail && typeof detail === 'object' ? { ...record, ...detail } : record;
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.fetchFail);
    return record;
  }
}

async function loadScopedRelationOptions(formFields, tableKeys) {
  await loadRelationOptions(formFields, tableKeys);
  ensureCurrentDeptRelationOption();
  if (!isSplitStockManagement.value) return;
  if (!editing.value) {
    applyDefaultSplitStockWarehouse();
    return;
  }

  try {
    const scopedRows = await fetchModuleOptions(props.moduleKey);
    applySplitStockRelationScope(scopedRows);
  } catch (_error) {
    applySplitStockRelationScope(rows.value);
  }
}

function applySplitStockRelationScope(scopedRows) {
  const list = Array.isArray(scopedRows) ? scopedRows : [];
  scopeRelationOptionsByRecords('goodsId', list, 'goodsId', ['goodsName', 'name', 'skuCode']);
  scopeRelationOptionsByRecords('warehouseId', list, 'warehouseId', ['warehouseName', 'name', 'code']);
  ensureCurrentDeptRelationOption();
  scopeWarehouseOptionsByModuleLabel();
  applyDefaultSplitStockWarehouse();
}

function scopeRelationOptionsByRecords(field, records, idField, labelFields) {
  const idSet = new Set(records
    .map((item) => item?.[idField])
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .map((value) => String(value)));
  if (idSet.size === 0 || !Array.isArray(relationOptions[field])) return;

  const existingOptions = relationOptions[field] || [];
  const existingByValue = new Map(existingOptions.map((option) => [String(option.value), option]));
  const scopedOptions = [];
  const seen = new Set();

  records.forEach((record) => {
    const rawValue = record?.[idField];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') return;
    const valueKey = String(rawValue);
    if (seen.has(valueKey)) return;
    seen.add(valueKey);
    const existing = existingByValue.get(valueKey);
    scopedOptions.push(existing || {
      value: rawValue,
      label: firstNonEmpty(record, labelFields) || `ID:${rawValue}`,
    });
  });

  relationOptions[field] = dedupeOptions(scopedOptions);
}

function scopeWarehouseOptionsByModuleLabel() {
  const options = relationOptions.warehouseId || [];
  if (!Array.isArray(options) || options.length === 0) return;
  const keywords = splitStockWarehouseKeywords();
  const matched = options.filter((option) => {
    const label = String(option?.label || '').toLowerCase();
    return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
  });
  if (matched.length > 0) {
    relationOptions.warehouseId = dedupeOptions(matched);
  }
}

function applyDefaultSplitStockWarehouse() {
  const options = relationOptions.warehouseId || [];
  if (!Array.isArray(options) || options.length === 0) return;
  const current = formState.warehouseId;
  const hasCurrent = current !== undefined
    && current !== null
    && options.some((option) => String(option.value) === String(current));
  if (hasCurrent) return;
  if (options.length === 1 || (!editing.value && props.moduleKey !== 'stock')) {
    const preferred = findSplitStockWarehouseOption(options);
    formState.warehouseId = (preferred || options[0]).value;
  }
}

function findSplitStockWarehouseOption(options) {
  const keywords = splitStockWarehouseKeywords();
  return (options || []).find((option) => {
    const label = String(option?.label || '').toLowerCase();
    return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
  });
}

function splitStockWarehouseKeywords() {
  return [];
}

function firstNonEmpty(record, fields) {
  for (const field of fields || []) {
    const value = record?.[field];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
}

function ensureCurrentDeptRelationOption() {
  if (!props.currentDeptId) return;
  const currentOption = {
    value: props.currentDeptId,
    label: props.currentDeptName || `ID:${props.currentDeptId}`,
  };
  const list = Array.isArray(relationOptions.deptId) ? relationOptions.deptId : [];
  if (list.length === 0) {
    relationOptions.deptId = [currentOption];
    return;
  }
  if (!list.some((option) => String(option?.value) === String(currentOption.value))) {
    relationOptions.deptId = dedupeOptions([...list, currentOption]);
  }
}

function activeFormKeys() {
  if (editing.value && isSplitStockManagement.value) {
    return ['goodsId', 'skuId', 'skuCode', 'warehouseId', 'currentQty', 'price', 'currency', 'stockTypeId'];
  }
  if (editing.value && props.moduleKey === 'requestForm' && isAdminUser.value) {
    return [...new Set([...formKeys.value, 'state'])];
  }
  return formKeys.value;
}

function filterFinanceFormKeys(fields, state) {
  if (props.moduleKey !== 'requestForm' && props.moduleKey !== 'requestItem') return fields;
  return (fields || []).filter((field) => {
    if (field === 'feeAmount') return Boolean(state.hasFee);
    if (field === 'unpaidAmount') return Boolean(state.hasUnpaid);
    return true;
  });
}

function applyFinanceToggleState(target, field, value) {
  if (props.moduleKey !== 'requestForm' && props.moduleKey !== 'requestItem') return;
  if (field === 'hasFee' && !value) {
    target.feeAmount = null;
  }
  if (field === 'hasUnpaid' && !value) {
    target.unpaidAmount = null;
  }
}

async function submit() {
  if (!canWrite.value) return;
  if (isGoodsManagement.value) return;
  await submitState(getRecordId, normalizeModulePayload);
  refreshRelationOptionCache();
}

async function onDelete(record) {
  if (!canWrite.value || !canDeleteRecord(record)) return;
  if (props.moduleKey === 'requestItem') {
    await removeRequestItem(record, getRecordId);
    return;
  }
  if (isSplitStockManagement.value) {
    try {
      await removeItem(modulePath.value, getRecordId(record));
      message.success(TABLE_TEXT.deleteSuccess);
      await reload();
      refreshRelationOptionCache();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.deleteFail);
    }
    return;
  }
  await onDeleteState(record, getRecordId);
  refreshRelationOptionCache();
}

function isEditing(record) {
  return isEditingState(record, getRecordId);
}

function startInlineEdit(record) {
  if (!canWrite.value || !canInlineEditRecord(record)) return;
  const started = startInlineEditState(record, getRecordId);
  if (started) {
    loadScopedRelationOptions(formKeys.value, keys.value);
  }
}

async function saveInlineEdit(record) {
  if (!canWrite.value || !canInlineEditRecord(record)) return;
  await saveInlineEditState(record, getRecordId, normalizeModulePayload);
  refreshRelationOptionCache();
}

function refreshRelationOptionCache() {
  invalidateRelationModuleOptions([
    'dept',
    'role',
    'permission',
    'warehouse',
    'stockType',
    'goods',
    'goodsSku',
    'customer',
    'customerLevel',
    'series',
    'brand',
    'category',
    'maker',
  ]);
  loadScopedRelationOptions(activeFormKeys(), keys.value);
  loadQueryRelationOptions(queryFields.value);
}

function queryOptions(field) {
  const enumOptions = mergedEnumOptions(field);
  if (enumOptions.length > 0) return enumOptions;
  if (field === 'status') return statusOptions;
  return dedupeOptions(queryRelationOptions[field] || []);
}

function scopedSelectOptions(field) {
  const options = selectOptionsMerged(field);
  const low = String(field || '').toLowerCase();

  if (props.moduleKey === 'requestForm' && low === 'state' && !isAdminUser.value) {
    return options.filter((option) => REQUEST_FORM_USER_STATES.has(Number(option.value)));
  }

  if (props.moduleKey !== 'stockOrder' || isAdminUser.value) return options;

  if (low === 'sourcetype') {
    return options.filter((option) => STOCK_ORDER_USER_SOURCE_TYPES.has(Number(option.value)));
  }
  if (low === 'state') {
    return options.filter((option) => STOCK_ORDER_USER_STATES.has(Number(option.value)));
  }
  return options;
}

function normalizeModulePayload(payload) {
  const output = normalizePayload(payload);
  if (props.moduleKey === 'requestForm' && !isAdminUser.value) {
    if (Object.prototype.hasOwnProperty.call(output, 'state') && !REQUEST_FORM_USER_STATES.has(Number(output.state))) {
      output.state = REQUEST_FORM_DEFAULT_STATE;
    }
    return output;
  }

  if (props.moduleKey !== 'stockOrder' || isAdminUser.value) return output;

  if (Object.prototype.hasOwnProperty.call(output, 'sourceType') && !STOCK_ORDER_USER_SOURCE_TYPES.has(Number(output.sourceType))) {
    output.sourceType = STOCK_ORDER_DEFAULT_SOURCE_TYPE;
  }
  if (Object.prototype.hasOwnProperty.call(output, 'state') && !STOCK_ORDER_USER_STATES.has(Number(output.state))) {
    output.state = STOCK_ORDER_DEFAULT_STATE;
  }
  return output;
}

function applyStockOrderCreateDefaults() {
  if (props.moduleKey !== 'stockOrder' || editing.value) return;
  formState.bizDate = formatDateTime(new Date());
  formState.sourceType = STOCK_ORDER_DEFAULT_SOURCE_TYPE;
  formState.state = STOCK_ORDER_DEFAULT_STATE;
}

function applyRequestFormCreateDefaults() {
  if (props.moduleKey !== 'requestForm' || editing.value) return;
  formState.state = REQUEST_FORM_DEFAULT_STATE;
}

function applyStockOrderRelationDefaults() {
  if (props.moduleKey !== 'stockOrder' || editing.value) return;
  if (formState.stockTypeId !== undefined && formState.stockTypeId !== null && String(formState.stockTypeId).trim() !== '') return;
  const normalStockType = findOptionByKeywords(relationOptions.stockTypeId || [], NORMAL_STOCK_TYPE_KEYWORDS);
  if (normalStockType) {
    formState.stockTypeId = normalStockType.value;
  }
}

function findOptionByKeywords(options, keywords) {
  return (Array.isArray(options) ? options : []).find((option) => {
    const label = String(option?.label || '').toLowerCase();
    return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
  });
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00`;
}

const {
  isAvatarField,
  resolveAvatarSrc,
  beforeAvatarUpload,
  beforeInlineAvatarUpload,
} = useModuleMedia({
  moduleKey: computed(() => props.moduleKey),
  formState,
  editState,
  inlineField,
  uploadFileByBizType,
  notify: message,
});

const {
  handleRowExtraAction: handleDefaultRowExtraAction,
  canShowRowExtraAction: canShowDefaultRowExtraAction,
  onReadAllMessages,
} = useModuleActions({
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  rows,
  emit,
  detailNavigations: MODULE_DETAIL_NAVIGATIONS,
  downloadRequestFormFile,
  downloadRequestFormPdf,
  markMessageRead,
  markAllMessagesRead,
  markMessageListRead,
  markAllMessageListRead,
  getRecordId,
  reload,
});

async function handleRowExtraAction(actionKey, record) {
  if (props.moduleKey === 'stockOrder' && (actionKey === 'approve' || actionKey === 'reject')) {
    await submitStockOrderApproval(record, actionKey === 'approve');
    return;
  }
  if (actionKey === 'inbound') {
    await openGoodsInboundModal(record);
    return;
  }
  if (actionKey === 'returnInbound') {
    await submitStockOrderItemReturnFlow({
      record,
      reload,
      notify: message,
    });
    return;
  }
  if (actionKey === 'detail' && props.moduleKey === 'requestForm') {
    rememberRequestFormState(record);
  }
  await handleDefaultRowExtraAction(actionKey, record);
}

function canShowRowExtraAction(actionKey, record) {
  if (props.moduleKey === 'stockOrder' && (actionKey === 'approve' || actionKey === 'reject')) {
    return Boolean(props.allDataWrite) && Number(record?.state ?? record?.orderState) !== 2;
  }
  if (actionKey === 'inbound') {
    return props.moduleKey === 'goods' && Boolean(record);
  }
  if (actionKey === 'returnInbound') {
    return props.moduleKey === 'stockOrderItem' && isCompletedOutboundRecord(record);
  }
  return canShowDefaultRowExtraAction(actionKey, record);
}

function canCreateInModule() {
  if (isSplitStockManagement.value) return false;
  if (props.moduleKey === 'requestItem' && isCurrentRequestCompleted()) return false;
  if (props.allDataWrite) return isGoodsManagement.value || formKeys.value.length > 0;
  if (props.moduleActions && !props.moduleActions.create) return false;
  if (!canCreateModuleRecord(props.moduleKey, props.permissionCodes || [])) return false;
  return isGoodsManagement.value || formKeys.value.length > 0;
}

function isCompletedOutboundRecord(record) {
  const orderType = Number(record?.orderType ?? record?.stockOrderType);
  const state = Number(record?.state ?? record?.orderState);
  const changeQty = Number(record?.changeQty ?? 0);
  const isOutbound = orderType === 2 || changeQty < 0;
  return isOutbound && state === 2;
}

function rememberRequestFormState(record) {
  const state = resolveRequestFormState(record);
  if (state === null) {
    sessionStorage.removeItem('jump_request_form_state');
    return;
  }
  sessionStorage.setItem('jump_request_form_state', String(state));
}

function resolveRequestFormState(record) {
  const raw = record?.state
    ?? record?.requestState
    ?? record?.requestFormState
    ?? record?.requestStatus
    ?? record?.requestFormStatus;
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const state = Number(raw);
  return Number.isNaN(state) ? null : state;
}

function isCompletedRequestRecord(record) {
  const state = resolveRequestFormState(record);
  return state === REQUEST_FORM_COMPLETED_STATE;
}

function isCurrentRequestCompleted() {
  if (props.moduleKey !== 'requestItem') return false;
  const rowCompleted = (rows.value || []).some((row) => isCompletedRequestRecord(row));
  if (rowCompleted) return true;
  const raw = sessionStorage.getItem('jump_request_form_state');
  const state = Number(raw);
  return !Number.isNaN(state) && state === REQUEST_FORM_COMPLETED_STATE;
}

function canBatchDeleteInModule() {
  if (isSplitStockManagement.value) return false;
  if (props.allDataWrite) return props.moduleKey !== 'requestItem';
  if (props.moduleActions && !props.moduleActions.batchDelete) return false;
  if (props.moduleKey === 'requestItem') return false;
  return canBatchDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canDeleteRecord(_record) {
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(_record)) return false;
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(_record) || isCurrentRequestCompleted())) return false;
  if (props.allDataWrite) return true;
  if (props.moduleActions && !props.moduleActions.delete) return false;
  return canDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canEditRecord(record) {
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(record)) return false;
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(record) || isCurrentRequestCompleted())) return false;
  if (props.moduleKey === 'stockOrder' && Number(record?.state ?? record?.orderState) === 2) return false;
  if (props.allDataWrite) return true;
  if (props.moduleActions && !props.moduleActions.edit) return false;
  return canEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
}

function canInlineEditRecord(record) {
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(record)) return false;
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(record) || isCurrentRequestCompleted())) return false;
  if (props.moduleKey === 'requestItem') return false;
  if (props.moduleKey === 'stockOrder' && Number(record?.state ?? record?.orderState) === 2) return false;
  if (props.allDataWrite) return props.moduleKey !== 'goods';
  if (props.moduleActions && !props.moduleActions.inlineEdit) return false;
  if (props.moduleKey === 'goods') return false;
  return canInlineEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
}

async function submitStockOrderApproval(record, approved) {
  const orderId = getRecordId(record);
  if (!orderId) return;
  try {
    await approveStockOrder(orderId, approved);
    message.success(approved ? '承認しました' : '拒否しました');
    await reload();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  }
}

function isMultiRelationField(field) {
  return props.moduleKey === 'role' && String(field || '').toLowerCase() === 'permissionids';
}

function isFormFieldRequired(field) {
  if (props.moduleKey === 'user' && editing.value && String(field || '').toLowerCase() === 'password') {
    return false;
  }
  return requiredForForm(field);
}

function formPlaceholder(field) {
  const low = String(field || '').toLowerCase();
  if (props.moduleKey === 'user' && editing.value && low === 'password') {
    return '空欄の場合、パスワードは更新されません';
  }
  return '';
}

</script>

<style scoped>
:deep(.row-highlight-new > td) {
  background: #fff7e6 !important;
  transition: background-color 0.3s ease;
}

</style>
