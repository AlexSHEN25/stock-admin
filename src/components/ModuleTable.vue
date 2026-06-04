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
      @read-all="onReadAllMessages"
      @open-candidates="openCandidateModal"
      @update-field="updateQueryField"
    />

    <a-table
      class="module-table"
      :row-key="getRowKey"
      :row-class-name="rowClassName"
      :columns="columns"
      :data-source="tableRows"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :loading="loading"
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
            :select-options="selectOptionsMerged"
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
        <template v-else-if="column.key === 'updateTime'">
          {{ formatTime(record.updateTime) }}
        </template>
        <template v-else-if="String(column.key) === 'bizDate'">
          {{ formatBizDate(record) }}
        </template>
        <template v-else-if="String(column.key) === 'isHot'">
          {{ Number(record.isHot) === 1 ? TABLE_TEXT.hotYes : TABLE_TEXT.hotNo }}
        </template>
        <template v-else-if="String(column.key) === 'changeQty'">
          {{ formatQty(record.changeQty) }}
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
            :can-show-extra-action="canShowRowExtraAction"
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
      :select-options="selectOptionsMerged"
      @save="submit"
      @cancel="modalOpen = false"
      @update-field="updateFormField"
    />
    <request-candidate-modal
      :open="candidateModalOpen"
      :loading="candidateLoading"
      :submit-text="candidateSubmitText"
      :rows="candidateRows"
      :selected-keys="candidateSelectedKeys"
      :qty-state="candidateQtyState"
      :row-key="candidateRowKey"
      :max-request-qty="maxRequestQty"
      :format-qty="formatQty"
      @cancel="closeCandidateModal"
      @submit="submitAddCandidates"
      @selection-change="onCandidateSelectChange"
      @qty-change="onCandidateQtyChange"
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
      :select-options="selectOptionsMerged"
      :resolve-image-url="resolveGoodsImageUrl"
      @cancel="closeGoodsDrawer"
      @save="saveGoodsDrawer"
      @upload-image="beforeGoodsImageUpload"
      @update-field="updateGoodsFormField"
    />
  </a-card>
</template>

<script setup>
import { computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  fetchEnumOptions,
  fetchItem,
  fetchOutboundStockOrderOptions,
  fetchGoodsFormOptions,
  fetchModuleOptions,
  updateItem,
  uploadFileByBizType,
} from '../api/module';
import GoodsDrawer from './GoodsDrawer.vue';
import ModuleEditModal from './ModuleEditModal.vue';
import ModuleInlineEditor from './ModuleInlineEditor.vue';
import ModuleRowActions from './ModuleRowActions.vue';
import ModuleSearchToolbar from './ModuleSearchToolbar.vue';
import RequestCandidateModal from './RequestCandidateModal.vue';
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
import { downloadRequestFormFile, downloadRequestFormPdf } from '../utils/download';
import { markAllMessageListRead, markAllMessagesRead, markMessageListRead, markMessageRead } from '../utils/message';
import { submitStockInboundFlow } from '../utils/stock';
import { getModulePreset, guessFieldType, isRequiredFormField, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';
import {
  MODULE_DETAIL_NAVIGATIONS,
  MODULE_QUERY_JUMPS,
  TABLE_TEXT,
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

const STOCK_EDIT_PAYLOAD_FIELDS = ['id', 'goodsId', 'goodsName', 'skuId', 'skuCode', 'warehouseId', 'currentQty', 'lockQty', 'price', 'currency', 'stockTypeId', 'status', 'version'];

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  moduleActions: { type: Object, default: null },
  allDataWrite: { type: Boolean, default: false },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
});

const emit = defineEmits(['navigate-module']);
const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const isSplitStockManagement = computed(() => props.moduleKey === 'stockSelf' || props.moduleKey === 'stockHandle');
const modulePath = computed(() => props.moduleKey);
const preset = computed(() => getModulePreset(props.moduleKey));
const rowExtraActions = computed(() => getRowExtraActions(props.moduleKey));
const canWrite = computed(() => {
  if (props.allDataWrite) return true;
  if (props.moduleActions) return Boolean(props.moduleActions.create || props.moduleActions.edit || props.moduleActions.delete);
  return hasWritePermission(props.moduleKey, props.permissionReady, props.permissionCodes || []);
});
const isAdminUser = computed(() => isAdminByPermissionCodes(props.permissionCodes || []));
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
  stockSelf: submitStockFlow,
  stockHandle: submitStockFlow,
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
      : {}
  ),
});

const {
  tableRows: requestItemTableRows,
  candidateModalOpen,
  candidateLoading,
  candidateRows,
  candidateSelectedKeys,
  candidateQtyState,
  candidateSubmitText,
  candidateRowKey,
  maxRequestQty,
  formatQty,
  openCandidateModal,
  closeCandidateModal,
  onCandidateSelectChange,
  onCandidateQtyChange,
  submitAddCandidates,
  removeRequestItem,
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
} = useRelationOptions({
  fetchModuleOptions,
  relationLabel,
  relationModuleByField,
  inputType,
  isReadonlyField,
  inlineField,
  mapNameFieldToIdField,
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
  formatBizDate,
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
  if (props.moduleKey !== 'stockOrderItem') return list;
  return list.filter((field) => String(field || '').toLowerCase() !== 'orderid');
});
const tableRows = computed(() => {
  return requestItemTableRows.value;
});
const visibleFormKeys = computed(() => (
  editing.value ? activeFormKeys() : formKeys.value.filter((field) => String(field || '').toLowerCase() !== 'status')
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
      const payload = Object.fromEntries(
        STOCK_EDIT_PAYLOAD_FIELDS
          .filter((field) => Object.prototype.hasOwnProperty.call(rawPayload, field))
          .map((field) => [
            field,
            Object.prototype.hasOwnProperty.call(normalizedPayload, field) ? normalizedPayload[field] : rawPayload[field],
          ]),
      );
      await updateItem(modulePath.value, payload);
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
}

function updateQueryField(field, value) {
  queryState[field] = value;
}

function updateInlineField(field, value) {
  editState[field] = value;
}

function openCreate() {
  if (!canWrite.value || !canCreateInModule()) return;
  if (isGoodsManagement.value) {
    openGoodsDrawerCreate();
    return;
  }
  const opened = openCreateState();
  if (opened) {
    if (Object.prototype.hasOwnProperty.call(formState, 'status')) {
      formState.status = 1;
    }
    loadScopedRelationOptions(formKeys.value, keys.value);
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
    const detail = await fetchItem(props.moduleKey, getRecordId(record));
    return detail && typeof detail === 'object' ? { ...record, ...detail } : record;
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.fetchFail);
    return record;
  }
}

async function loadScopedRelationOptions(formFields, tableKeys) {
  await loadRelationOptions(formFields, tableKeys);
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
  const keywords = props.moduleKey === 'stockHandle'
    ? ['ハンドル', 'handle', '柄']
    : ['自社', 'self'];
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
  if (options.length === 1 || !editing.value) {
    formState.warehouseId = options[0].value;
  }
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

function activeFormKeys() {
  if (editing.value && isSplitStockManagement.value) {
    return ['goodsId', 'skuId', 'skuCode', 'warehouseId', 'currentQty', 'lockQty', 'price', 'currency', 'stockTypeId'];
  }
  return formKeys.value;
}

async function submit() {
  if (!canWrite.value) return;
  if (isGoodsManagement.value) return;
  await submitState(getRecordId, normalizePayload);
}

async function onDelete(record) {
  if (!canWrite.value || !canDeleteRecord(record)) return;
  if (props.moduleKey === 'requestItem') {
    await removeRequestItem(record, getRecordId);
    return;
  }
  await onDeleteState(record, getRecordId);
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
  await saveInlineEditState(record, getRecordId, normalizePayload);
}

function queryOptions(field) {
  const enumOptions = mergedEnumOptions(field);
  if (enumOptions.length > 0) return enumOptions;
  if (field === 'status') return statusOptions;
  return dedupeOptions(queryRelationOptions[field] || []);
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
  handleRowExtraAction,
  canShowRowExtraAction,
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
});

function canCreateInModule() {
  if (props.allDataWrite) return isGoodsManagement.value || formKeys.value.length > 0;
  if (props.moduleActions && !props.moduleActions.create) return false;
  if (!canCreateModuleRecord(props.moduleKey, props.permissionCodes || [])) return false;
  return isGoodsManagement.value || formKeys.value.length > 0;
}

function canBatchDeleteInModule() {
  if (props.allDataWrite) return props.moduleKey !== 'requestItem';
  if (props.moduleActions && !props.moduleActions.batchDelete) return false;
  if (props.moduleKey === 'requestItem') return false;
  return canBatchDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canDeleteRecord(_record) {
  if (props.allDataWrite) return true;
  if (props.moduleActions && !props.moduleActions.delete) return false;
  return canDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canEditRecord(record) {
  if (props.allDataWrite) return true;
  if (props.moduleActions && !props.moduleActions.edit) return false;
  return canEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
}

function canInlineEditRecord(record) {
  if (props.allDataWrite) return props.moduleKey !== 'goods';
  if (props.moduleActions && !props.moduleActions.inlineEdit) return false;
  if (props.moduleKey === 'goods') return false;
  return canInlineEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
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
