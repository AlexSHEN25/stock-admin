<template>
  <a-card
    :title="null"
    :bordered="false"
  >
    <div class="search-toolbar">
      <div class="search-filters">
        <template
          v-for="field in queryFields"
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
          @click="resetQuery"
        >
          {{ TABLE_TEXT.reset }}
        </a-button>
        <a-popconfirm
          v-if="canWrite && canBatchDeleteInModule()"
          :title="TABLE_TEXT.confirmBatchDelete"
          :ok-text="TABLE_TEXT.yes"
          :cancel-text="TABLE_TEXT.no"
          @confirm="onBatchDelete"
        >
          <a-button
            danger
            class="search-btn"
            :disabled="selectedRowKeys.length === 0"
          >
            {{ TABLE_TEXT.batchDelete }}
          </a-button>
        </a-popconfirm>
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
      </div>
    </div>

    <a-table
      class="module-table"
      :row-key="getRowKey"
      :columns="columns"
      :data-source="rows"
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
            :min="inlineField(column.key) === 'sort' ? 0 : undefined"
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
        <template v-else-if="column.key === 'mainImage'">
          <img
            v-if="record.mainImage || record.imageUrl"
            :src="record.mainImage || record.imageUrl"
            class="goods-thumb"
          >
          <span v-else>-</span>
        </template>
        <template v-else-if="isAvatarField(column.key)">
          <img
            v-if="resolveAvatarSrc(record)"
            :src="resolveAvatarSrc(record)"
            class="goods-thumb"
          >
          <span v-else>-</span>
        </template>
        <template v-else-if="column.key === 'statusDesc'">
          <a-tag :color="Number(record.status) === 1 ? 'success' : 'default'">
            {{ record.statusDesc || (Number(record.status) === 1 ? 'ON' : 'OFF') }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'updateTime'">
          {{ formatTime(record.updateTime) }}
        </template>
        <template v-else-if="String(column.key) === 'isHot'">
          {{ Number(record.isHot) === 1 ? TABLE_TEXT.hotYes : TABLE_TEXT.hotNo }}
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
      :open="modalOpen"
      :title="editing ? TABLE_TEXT.edit : TABLE_TEXT.create"
      :ok-text="TABLE_TEXT.save"
      :cancel-text="TABLE_TEXT.cancel"
      :ok-button-props="{ disabled: !canWrite }"
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
            :min="field === 'sort' ? 0 : undefined"
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
  </a-card>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import { fetchEnumOptions, fetchModuleOptions, uploadUserAvatar } from '../api/module';
import { useModuleActions } from '../composables/useModuleActions';
import { useModuleFieldBehavior } from '../composables/useModuleFieldBehavior';
import { useRelationOptions } from '../composables/useRelationOptions';
import { useModuleTableSchema } from '../composables/useModuleTableSchema';
import { useModuleTableState } from '../composables/useModuleTableState';
import { downloadRequestFormFile } from '../utils/download';
import { markAllMessageListRead, markAllMessagesRead, markMessageListRead, markMessageRead } from '../utils/message';
import { submitStockInboundFlow } from '../utils/stock';
import { getModulePreset, guessFieldType, isRequiredFormField, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';
import {
  MODULE_DETAIL_NAVIGATIONS,
  MODULE_QUERY_JUMPS,
  TABLE_TEXT,
  getModuleEnumOptions,
  getRowExtraActions,
} from '../utils/module-ui';
import {
  canBatchDeleteModuleRecord,
  canCreateModuleRecord,
  canDeleteModuleRecord,
  canEditModuleRecord,
  canInlineEditModuleRecord,
  hasWritePermission,
} from '../utils/permission';

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

const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const modulePath = computed(() => props.moduleKey);
const preset = computed(() => getModulePreset(props.moduleKey));
const rowExtraActions = computed(() => getRowExtraActions(props.moduleKey));
const canWrite = computed(() => hasWritePermission(props.moduleKey, props.permissionReady, props.permissionCodes || []));
const {
  statusOptions,
  queryInputType,
  queryPlaceholder,
  inputType,
  requiredForForm,
  selectOptionsForField,
  enumOptionsForField,
  hasEnumOptions,
  enumLabel,
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
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));
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
  return hit?.label || value || '-';
}

watch(
  () => props.moduleKey,
  async () => {
    if (!props.moduleKey) return;
    pagination.current = 1;
    initQuery();
    applyPendingQuery(MODULE_QUERY_JUMPS[props.moduleKey]);
    await loadDynamicEnumOptions();
    await loadQueryRelationOptions(queryFields.value);
    await loadRelationOptions(formKeys.value, keys.value);
    await reload();
  },
  { immediate: true },
);

function normalizeQueryField(field) {
  const key = String(field || '');
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
  const opened = openCreateState();
  if (opened) {
    if (Object.prototype.hasOwnProperty.call(formState, 'status')) {
      formState.status = 1;
    }
    loadRelationOptions(formKeys.value, keys.value);
  }
}

function openEdit(record) {
  const opened = openEditState(record, getRecordId);
  if (opened) {
    loadRelationOptions(formKeys.value, keys.value);
  }
}

async function submit() {
  await submitState(getRecordId, normalizePayload);
}

async function onDelete(record) {
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
  return key === 'avatar' || key === 'avatarurl';
}

function resolveAvatarSrc(record) {
  if (!record) return '';
  const raw = String(record.avatar || record.avatarUrl || '').trim();
  if (!raw) return '';
  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  return `/${raw}`;
}

function beforeAvatarUpload(field, file) {
  if (props.moduleKey === 'user' && editing.value && editingRaw.value?.id) {
    uploadAvatarToBackend(editingRaw.value.id, file, (url) => {
      formState[field] = url;
    });
    return false;
  }
  setImageFieldFromFile(formState, field, file);
  return false;
}

function beforeInlineAvatarUpload(field, file) {
  if (props.moduleKey === 'user' && editingKeyRecordId.value) {
    uploadAvatarToBackend(editingKeyRecordId.value, file, (url) => {
      editState[inlineField(field)] = url;
    });
    return false;
  }
  setImageFieldFromFile(editState, inlineField(field), file);
  return false;
}

const editingKeyRecordId = computed(() => {
  const key = String(editingKey.value ?? '');
  if (!key) return null;
  const hit = rows.value.find((item) => String(getRecordId(item)) === key);
  return hit ? getRecordId(hit) : null;
});

async function uploadAvatarToBackend(userId, file, onSuccess) {
  try {
    const avatarPath = await uploadUserAvatar(userId, file);
    onSuccess(String(avatarPath || ''));
    message.success('繧｢繝舌ち繝ｼ繧偵い繝・・繝ｭ繝ｼ繝峨＠縺ｾ縺励◆');
  } catch (error) {
    message.error(error?.message || '繧｢繝舌ち繝ｼ縺ｮ繧｢繝・・繝ｭ繝ｼ繝峨↓螟ｱ謨励＠縺ｾ縺励◆');
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
  return canBatchDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canDeleteRecord(_record) {
  return canDeleteModuleRecord(props.moduleKey, props.permissionCodes || []);
}

function canEditRecord(record) {
  return canEditModuleRecord(props.moduleKey, record, props.currentUser, props.permissionCodes || []);
}

function canInlineEditRecord(record) {
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
    return '遨ｺ谺・・蝣ｴ蜷医√ヱ繧ｹ繝ｯ繝ｼ繝峨・譖ｴ譁ｰ縺輔ｌ縺ｾ縺帙ｓ';
  }
  return '';
}
</script>










