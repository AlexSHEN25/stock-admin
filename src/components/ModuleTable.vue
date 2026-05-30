<template>
  <a-card
    :title="null"
    :bordered="false"
  >
    <div class="search-toolbar">
      <div class="search-filters">
        <template
          v-for="field in visibleQueryFields"
          :key="field"
        >
          <a-select
            v-if="queryInputType(field) === 'select'"
            v-model:value="queryState[field]"
            :options="queryOptions(field)"
            :placeholder="queryPlaceholder(field)"
            class="search-control"
            allow-clear
          />
          <a-input
            v-else-if="queryInputType(field) === 'text'"
            v-model:value="queryState[field]"
            :placeholder="queryPlaceholder(field)"
            class="search-control"
            @press-enter="reload"
          />
          <a-input-number
            v-else
            v-model:value="queryState[field]"
            :placeholder="queryPlaceholder(field)"
            class="search-control"
          />
        </template>
      </div>
      <div class="search-actions">
        <a-button
          type="primary"
          class="search-btn search-btn-main"
          @click="doSearch"
        >
          {{ TABLE_TEXT.search }}
        </a-button>
        <a-button
          class="search-btn"
          :disabled="!hasActiveFilters(visibleQueryFields, queryState)"
          @click="resetQuery"
        >
          {{ TABLE_TEXT.reset }}
        </a-button>
        <a-popconfirm
          v-if="canWrite && canBatchDeleteInModule() && selectedRowKeys.length > 0"
          :title="TABLE_TEXT.confirmBatchDelete"
          :ok-text="TABLE_TEXT.yes"
          :cancel-text="TABLE_TEXT.no"
          @confirm="onBatchDelete"
        >
          <a-button
            danger
            class="search-btn"
          >
            {{ TABLE_TEXT.batchDelete }}
          </a-button>
        </a-popconfirm>
        <a-button
          v-else-if="canWrite && canBatchDeleteInModule()"
          danger
          class="search-btn"
          disabled
        >
          {{ TABLE_TEXT.batchDelete }}
        </a-button>
        <a-button
          v-if="canWrite && canCreateInModule()"
          type="primary"
          class="search-btn search-btn-create"
          @click="openCreate"
        >
          {{ TABLE_TEXT.create }}
        </a-button>
        <a-button
          v-if="props.moduleKey === 'message'"
          class="search-btn"
          @click="onReadAllMessages"
        >
          {{ TABLE_TEXT.readAll }}
        </a-button>
        <a-button
          v-if="props.moduleKey === 'requestItem'"
          type="primary"
          class="search-btn"
          @click="openCandidateModal"
        >
          明細追加
        </a-button>
      </div>
    </div>

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
          <a-upload
            v-if="isAvatarField(column.key)"
            accept="image/*"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="(file) => beforeInlineAvatarUpload(column.key, file)"
          >
            <img
              v-if="editState[inlineField(column.key)]"
              :src="editState[inlineField(column.key)]"
              class="goods-thumb"
            >
            <div v-else>
              + Upload
            </div>
          </a-upload>
          <a-select
            v-else-if="inlineInputType(column.key) === 'relation'"
            v-model:value="editState[inlineField(column.key)]"
            :options="relationOptions[inlineField(column.key)] || []"
            :mode="isMultiRelationField(inlineField(column.key)) ? 'multiple' : undefined"
            show-search
            allow-clear
            option-filter-prop="label"
            style="width: 100%"
          />
          <a-input-number
            v-else-if="inlineInputType(column.key) === 'number' || inlineInputType(column.key) === 'decimal'"
            v-model:value="editState[inlineField(column.key)]"
            :min="numberMinByField(inlineField(column.key))"
            :precision="numberPrecisionByField(inlineField(column.key))"
            style="width: 100%"
          />
          <a-select
            v-else-if="inlineInputType(column.key) === 'select'"
            v-model:value="editState[inlineField(column.key)]"
            :options="selectOptionsMerged(inlineField(column.key))"
            allow-clear
          />
          <a-switch
            v-else-if="inlineInputType(column.key) === 'switch'"
            v-model:checked="editState[inlineField(column.key)]"
          />
          <a-date-picker
            v-else-if="inlineInputType(column.key) === 'datetime'"
            v-model:value="editState[inlineField(column.key)]"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
            style="width: 100%"
          />
          <a-input
            v-else
            v-model:value="editState[inlineField(column.key)]"
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
          <a-space>
            <a
              v-for="action in rowExtraActions"
              v-show="canShowRowExtraAction(action.key, record)"
              :key="action.key"
              @click="handleRowExtraAction(action.key, record)"
            >
              {{ action.label }}
            </a>
            <a
              v-if="canWrite && canInlineEditRecord(record) && !isEditing(record)"
              @click="startInlineEdit(record)"
            >{{ TABLE_TEXT.inlineEdit }}</a>
            <a
              v-if="canWrite && canEditRecord(record) && isEditing(record)"
              @click="saveInlineEdit(record)"
            >{{ TABLE_TEXT.save }}</a>
            <a
              v-if="canWrite && canEditRecord(record) && isEditing(record)"
              @click="cancelInlineEdit"
            >{{ TABLE_TEXT.cancel }}</a>
            <a
              v-if="canWrite && canEditRecord(record)"
              @click="openEdit(record)"
            >{{ TABLE_TEXT.edit }}</a>
            <a-popconfirm
              v-if="canWrite && canDeleteRecord(record)"
              :title="TABLE_TEXT.confirmDelete"
              :ok-text="TABLE_TEXT.yes"
              :cancel-text="TABLE_TEXT.no"
              @confirm="onDelete(record)"
            >
              <a>{{ TABLE_TEXT.delete }}</a>
            </a-popconfirm>
            <span v-if="!canWrite">{{ TABLE_TEXT.readonly }}</span>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-if="!isGoodsManagement"
      :open="modalOpen"
      :title="null"
      :ok-text="TABLE_TEXT.save"
      :cancel-text="TABLE_TEXT.cancel"
      :ok-button-props="{ disabled: !canWrite }"
      wrap-class-name="module-edit-modal"
      @ok="submit"
      @cancel="() => (modalOpen = false)"
    >
      <a-form layout="vertical">
        <a-form-item
          v-for="field in visibleFormKeys"
          :key="field"
          :required="isFormFieldRequired(field)"
        >
          <template #label>
            {{ normalizeTitle(field) }}
          </template>
          <a-upload
            v-if="isAvatarField(field)"
            accept="image/*"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="(file) => beforeAvatarUpload(field, file)"
          >
            <img
              v-if="formState[field]"
              :src="formState[field]"
              class="goods-thumb"
            >
            <div v-else>
              + Upload
            </div>
          </a-upload>
          <a-input
            v-else-if="inputType(field) === 'text'"
            v-model:value="formState[field]"
            :placeholder="formPlaceholder(field)"
          />
          <a-select
            v-else-if="inputType(field) === 'relation'"
            v-model:value="formState[field]"
            :options="relationOptions[field] || []"
            :mode="isMultiRelationField(field) ? 'multiple' : undefined"
            show-search
            allow-clear
            option-filter-prop="label"
          />
          <a-input-number
            v-else-if="inputType(field) === 'number' || inputType(field) === 'decimal'"
            v-model:value="formState[field]"
            :min="numberMinByField(field)"
            :precision="numberPrecisionByField(field)"
            style="width: 100%"
          />
          <a-select
            v-else-if="inputType(field) === 'select'"
            v-model:value="formState[field]"
            :options="selectOptionsMerged(field)"
            allow-clear
          />
          <a-switch
            v-else-if="inputType(field) === 'switch'"
            v-model:checked="formState[field]"
          />
          <a-date-picker
            v-else-if="inputType(field) === 'datetime'"
            v-model:value="formState[field]"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
            style="width: 100%"
          />
          <a-textarea
            v-else
            v-model:value="formState[field]"
            :rows="3"
          />
        </a-form-item>
      </a-form>
    </a-modal>
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
    />
  </a-card>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
  fetchEnumOptions,
  fetchOutboundStockOrderOptions,
  fetchGoodsFormOptions,
  fetchModuleOptions,
  uploadFileByBizType,
} from '../api/module';
import GoodsDrawer from './GoodsDrawer.vue';
import RequestCandidateModal from './RequestCandidateModal.vue';
import { useGoodsDrawer } from '../composables/useGoodsDrawer';
import { useModuleActions } from '../composables/useModuleActions';
import { useModuleFieldBehavior } from '../composables/useModuleFieldBehavior';
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

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
});

const emit = defineEmits(['navigate-module']);
const rowAutoKeyMap = new WeakMap();
let rowAutoKeySeed = 0;
const dynamicEnumOptions = reactive({});
const goodsFormOptions = reactive({});

function formatBizDate(record) {
  const raw = record?.bizDate;
  if (!raw) return '-';
  const text = formatTime(raw);
  const orderType = Number(record?.orderType);
  if (orderType === 1) return `納品日: ${text}`;
  if (orderType === 2) return `出荷日: ${text}`;
  return text;
}

const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const modulePath = computed(() => props.moduleKey);
const preset = computed(() => getModulePreset(props.moduleKey));
const rowExtraActions = computed(() => getRowExtraActions(props.moduleKey));
const canWrite = computed(() => hasWritePermission(props.moduleKey, props.permissionReady, props.permissionCodes || []));
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
};

const {
  rows,
  loading,
  modalOpen,
  editing,
  editingKey,
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
  getFormKeys: () => formKeys.value,
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
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));
const tableRows = computed(() => {
  return requestItemTableRows.value;
});
const visibleFormKeys = computed(() => (
  editing.value ? formKeys.value : formKeys.value.filter((field) => String(field || '').toLowerCase() !== 'status')
));

function enumKeyByField(moduleKey, field) {
  const low = String(field || '').toLowerCase();
  if (low === 'status') return 'status';
  if (moduleKey === 'permission' && low === 'type') return 'permissionType';
  return '';
}

async function loadDynamicEnumOptions() {
  Object.keys(dynamicEnumOptions).forEach((key) => delete dynamicEnumOptions[key]);
  const fields = [...new Set([...(queryFields.value || []), ...(formKeys.value || []), ...(keys.value || [])])];
  const targets = fields
    .map((field) => ({ field, enumKey: enumKeyByField(props.moduleKey, field) }))
    .filter((item) => item.enumKey);
  await Promise.all(targets.map(async ({ field, enumKey }) => {
    try {
      dynamicEnumOptions[field] = await fetchEnumOptions(enumKey);
    } catch (_e) {
      dynamicEnumOptions[field] = [];
    }
  }));
}

function mergedEnumOptions(field) {
  const dynamic = dedupeOptions(dynamicEnumOptions[field] || []);
  if (dynamic.length > 0) return dynamic;
  return dedupeOptions(enumOptionsForField(field));
}

function selectOptionsMerged(field) {
  if (field === 'status') {
    const dynamic = dedupeOptions(dynamicEnumOptions[field] || []);
    if (dynamic.length > 0) return dynamic;
  }
  if (field !== 'status') {
    const dynamic = dedupeOptions(dynamicEnumOptions[field] || []);
    if (dynamic.length > 0) return dynamic;
  }
  return selectOptionsForField(field);
}

function hasEnumOptionsMerged(field) {
  return mergedEnumOptions(field).length > 0;
}

function enumLabelMerged(field, value) {
  const hit = mergedEnumOptions(field).find((item) => Number(item.value) === Number(value));
  return normalizeDisplayLabel(hit?.label || value || '-');
}

async function loadGoodsFormOptions() {
  if (!isGoodsManagement.value) return;
  const data = await fetchGoodsFormOptions();
  Object.keys(goodsFormOptions).forEach((k) => delete goodsFormOptions[k]);
  Object.assign(goodsFormOptions, data || {});
  applyGoodsOptionList('brandId', data?.brandOptions);
  applyGoodsOptionList('seriesId', data?.seriesOptions);
  applyGoodsOptionList('categoryId', data?.categoryOptions);
  applyGoodsOptionList('makerId', data?.makerOptions);
  applyGoodsOptionList('status', data?.statusOptions);
  applyGoodsOptionList('currency', data?.currencyOptions);
}

function applyGoodsOptionList(field, source) {
  const list = Array.isArray(source) ? source : [];
  const mapped = list
    .map((item) => {
      const value = item?.value ?? item?.id ?? item?.code;
      const label = item?.label ?? item?.name ?? item?.text;
      if (value === undefined || value === null || label === undefined || label === null) return null;
      return { value, label: String(label) };
    })
    .filter(Boolean);
  if (mapped.length === 0) return;
  if (field === 'brandId' || field === 'seriesId' || field === 'categoryId' || field === 'makerId') {
    relationOptions[field] = mapped;
    queryRelationOptions[field] = mapped;
    return;
  }
  dynamicEnumOptions[field] = mapped;
}

async function loadSourceOrderOptions() {
  if (props.moduleKey !== 'requestForm') return;
  try {
    const list = await fetchOutboundStockOrderOptions();
    relationOptions.sourceOrderId = dedupeOptions((list || []).map((item) => ({
      label: relationLabel(item),
      value: item.id,
    })));
  } catch {
    relationOptions.sourceOrderId = [];
  }
}

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
      await loadRelationOptions(formKeys.value, keys.value);
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

async function submitStockFlow() {
  await submitStockInboundFlow({
    formState,
    closeModal: () => {
      modalOpen.value = false;
    },
    reload,
    notify: message,
  });
}

function openCreate() {
  if (isGoodsManagement.value) {
    openGoodsDrawerCreate();
    return;
  }
  const opened = openCreateState();
  if (opened) {
    if (Object.prototype.hasOwnProperty.call(formState, 'status')) {
      formState.status = 1;
    }
    loadRelationOptions(formKeys.value, keys.value);
    loadSourceOrderOptions();
  }
}

function openEdit(record) {
  if (isGoodsManagement.value) {
    openGoodsDrawerEdit(record);
    return;
  }
  const opened = openEditState(record, getRecordId);
  if (opened) {
    loadRelationOptions(formKeys.value, keys.value);
    loadSourceOrderOptions();
  }
}

async function submit() {
  if (isGoodsManagement.value) return;
  await submitState(getRecordId, normalizePayload);
}

async function onDelete(record) {
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
  const started = startInlineEditState(record, getRecordId);
  if (started) {
    loadRelationOptions(formKeys.value, keys.value);
  }
}

async function saveInlineEdit(record) {
  await saveInlineEditState(record, getRecordId, normalizePayload);
}

function queryOptions(field) {
  const enumOptions = mergedEnumOptions(field);
  if (enumOptions.length > 0) return enumOptions;
  if (field === 'status') return statusOptions;
  return dedupeOptions(queryRelationOptions[field] || []);
}

function getRecordId(record) {
  return record?.skuId ?? record?.id ?? record?._id ?? null;
}

function isAvatarField(field) {
  const key = String(field || '').toLowerCase();
  if (key === 'avatar' || key === 'avatarurl') return true;
  if (props.moduleKey === 'brand' && (key === 'image' || key === 'imageurl')) return true;
  return false;
}

function resolveAvatarSrc(record) {
  if (!record) return '';
  const raw = String(record.avatar || record.avatarUrl || record.image || record.imageUrl || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  return `/${raw}`;
}

function beforeAvatarUpload(field, file) {
  if (props.moduleKey === 'brand' && isAvatarField(field)) {
    uploadBrandImageToBackend(file, formState[field], (url) => {
      formState[field] = url;
    });
    return false;
  }
  if (props.moduleKey === 'user' && isAvatarField(field)) {
    uploadAvatarToBackend(file, formState[field], (url) => {
      formState[field] = url;
    });
    return false;
  }
  setImageFieldFromFile(formState, field, file);
  return false;
}

function beforeInlineAvatarUpload(field, file) {
  if (props.moduleKey === 'brand' && isAvatarField(field)) {
    uploadBrandImageToBackend(file, editState[inlineField(field)], (url) => {
      editState[inlineField(field)] = url;
    });
    return false;
  }
  if (props.moduleKey === 'user' && isAvatarField(field)) {
    uploadAvatarToBackend(file, editState[inlineField(field)], (url) => {
      editState[inlineField(field)] = url;
    });
    return false;
  }
  setImageFieldFromFile(editState, inlineField(field), file);
  return false;
}

async function uploadAvatarToBackend(file, oldPath, onSuccess) {
  try {
    const avatarPath = await uploadFileByBizType('AVATAR', file, oldPath);
    onSuccess(String(avatarPath || ''));
    message.success('アバターをアップロードしました');
  } catch (error) {
    message.error(error?.message || 'アバターのアップロードに失敗しました');
  }
}

async function uploadBrandImageToBackend(file, oldPath, onSuccess) {
  try {
    const imagePath = await uploadFileByBizType('BRAND', file, oldPath);
    if (!imagePath) {
      message.error('画像アップロードに失敗しました');
      return;
    }
    onSuccess(String(imagePath || ''));
    message.success('画像をアップロードしました');
  } catch (error) {
    message.error(error?.message || '画像アップロードに失敗しました');
  }
}
function setImageFieldFromFile(target, field, file) {
  const reader = new FileReader();
  reader.onload = () => {
    target[field] = String(reader.result || '');
  };
  reader.readAsDataURL(file);
}

function isPermissionNamesField(field) {
  const low = String(field || '').toLowerCase();
  return low === 'permissionname' || low === 'permissionnames';
}

function permissionNameList(record) {
  const raw = String(record?.permissionNames || record?.permissionName || '').trim();
  if (!raw) return [];
  return raw
    .split(/[\n,，、]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
function getRowKey(record) {
  const primaryId = getRecordId(record);
  const secondaryParts = [
    record?.stockId,
    record?.goodsId,
    record?.skuCode,
    record?.warehouseId,
    record?.orderId,
    record?.requestId,
  ].filter((value) => value !== undefined && value !== null && String(value) !== '');

  const base = (() => {
    if (primaryId !== null && primaryId !== undefined && String(primaryId) !== '') {
      if (secondaryParts.length > 0) return `${primaryId}:${secondaryParts.join(':')}`;
      return String(primaryId);
    }
    if (secondaryParts.length > 0) return secondaryParts.join(':');
    return `row:${props.moduleKey}`;
  })();

  if (!rowAutoKeyMap.has(record)) {
    rowAutoKeySeed += 1;
    rowAutoKeyMap.set(record, rowAutoKeySeed);
  }
  return `${base}#${rowAutoKeyMap.get(record)}`;
}

const {
  handleRowExtraAction,
  canShowRowExtraAction,
  onReadAllMessages,
} = useModuleActions({
  moduleKey: computed(() => props.moduleKey),
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
  return canCreateModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canBatchDeleteInModule() {
  if (props.moduleKey === 'requestItem') return false;
  return canBatchDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canDeleteRecord(_record) {
  return canDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canEditRecord(record) {
  return canEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
}

function canInlineEditRecord(record) {
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

function normalizeDisplayLabel(value) {
  const text = String(value ?? '');
  if (text.toLowerCase() === 'normal') return '有効';
  return text || '-';
}

function numberMinByField(field) {
  const low = String(field || '').toLowerCase();
  if (low === 'sort') return 0;
  if (isPriceLikeField(low)) return 0.01;
  return undefined;
}

function numberPrecisionByField(field) {
  const low = String(field || '').toLowerCase();
  if (isPriceLikeField(low)) return 2;
  return undefined;
}

function isPriceLikeField(lowField) {
  const low = String(lowField || '');
  return low.includes('price') || low.includes('amount');
}
</script>

<style scoped>
:deep(.row-highlight-new > td) {
  background: #fff7e6 !important;
  transition: background-color 0.3s ease;
}

</style>
