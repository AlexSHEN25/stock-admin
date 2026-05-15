<template>
  <a-card :title="null" :bordered="false">
    <div class="search-toolbar">
        <div class="search-filters">
          <template v-for="field in queryFields" :key="field">
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
              @pressEnter="reload"
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
          <a-button type="primary" class="search-btn search-btn-main" @click="doSearch">{{ i18n.search }}</a-button>
          <a-button class="search-btn" @click="resetQuery">{{ i18n.reset }}</a-button>
          <a-popconfirm v-if="canWrite" :title="i18n.confirmBatchDelete" :ok-text="i18n.yes" :cancel-text="i18n.no" @confirm="onBatchDelete">
            <a-button danger class="search-btn" :disabled="selectedRowKeys.length === 0">{{ i18n.batchDelete }}</a-button>
          </a-popconfirm>
          <a-button v-if="canWrite" type="primary" class="search-btn search-btn-create" @click="openCreate">{{ i18n.create }}</a-button>
        </div>
      </div>

    <a-table
      class="module-table"
      :rowKey="(row) => row.id || row._id || JSON.stringify(row)"
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
          <a-select
            v-if="inlineInputType(column.key) === 'relation'"
            v-model:value="editState[inlineField(column.key)]"
            :options="relationOptions[inlineField(column.key)] || []"
            show-search
            allow-clear
            option-filter-prop="label"
          />
          <a-input-number
            v-else-if="inlineInputType(column.key) === 'number' || inlineInputType(column.key) === 'decimal'"
            v-model:value="editState[inlineField(column.key)]"
            style="width: 100%"
          />
          <a-select
            v-else-if="inlineInputType(column.key) === 'select'"
            v-model:value="editState[inlineField(column.key)]"
            :options="statusOptions"
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
          <a-input v-else v-model:value="editState[inlineField(column.key)]" />
        </template>
        <template v-if="column.key === '__actions'">
          <a-space>
            <a v-if="canWrite && !isEditing(record)" @click="startInlineEdit(record)">{{ i18n.inlineEdit }}</a>
            <a v-if="canWrite && isEditing(record)" @click="saveInlineEdit(record)">{{ i18n.save }}</a>
            <a v-if="canWrite && isEditing(record)" @click="cancelInlineEdit">{{ i18n.cancel }}</a>
            <a v-if="canWrite" @click="openEdit(record)">{{ i18n.edit }}</a>
            <a-popconfirm v-if="canWrite" :title="i18n.confirmDelete" :ok-text="i18n.yes" :cancel-text="i18n.no" @confirm="onDelete(record)">
              <a>{{ i18n.delete }}</a>
            </a-popconfirm>
            <span v-if="!canWrite">{{ i18n.readonly }}</span>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal :open="modalOpen" :title="editing ? i18n.edit : i18n.create" :ok-text="i18n.save" :cancel-text="i18n.cancel" :okButtonProps="{ disabled: !canWrite }" @ok="submit" @cancel="() => (modalOpen = false)">
      <a-form layout="vertical">
        <a-form-item v-for="field in formKeys" :key="field" :label="normalizeTitle(field, props.currentLang)">
          <a-input v-if="inputType(field) === 'text'" v-model:value="formState[field]" />
          <a-select
            v-else-if="inputType(field) === 'relation'"
            v-model:value="formState[field]"
            :options="relationOptions[field] || []"
            show-search
            allow-clear
            option-filter-prop="label"
          />
          <a-input-number
            v-else-if="inputType(field) === 'number' || inputType(field) === 'decimal'"
            v-model:value="formState[field]"
            style="width: 100%"
          />
          <a-select v-else-if="inputType(field) === 'select'" v-model:value="formState[field]" :options="statusOptions" allow-clear />
          <a-switch v-else-if="inputType(field) === 'switch'" v-model:checked="formState[field]" />
          <a-date-picker
            v-else-if="inputType(field) === 'datetime'"
            v-model:value="formState[field]"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
            style="width: 100%"
          />
          <a-textarea v-else v-model:value="formState[field]" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { createItem, fetchModuleOptions, fetchPage, removeItem, updateItem } from '../api/module';
import { STATUS_OPTIONS, buildAutoQueryFields, displayKeys, getModulePreset, guessFieldType, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentLang: { type: String, default: 'ja-JP' },
});

const rows = ref([]);
const loading = ref(false);
const modalOpen = ref(false);
const editing = ref(false);
const editingRaw = ref(null);
const editingKey = ref(null);
const formState = reactive({});
const editState = reactive({});
const queryState = reactive({});
const queryRelationOptions = reactive({});
const relationOptions = reactive({});
const selectedRowKeys = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const preset = computed(() => getModulePreset(props.moduleKey));
const backendFieldSet = computed(() => {
  const first = rows.value[0] || {};
  return new Set(Object.keys(first));
});
const queryFields = computed(() => {
  const presetFields = preset.value.queryFields || [];
  const source = presetFields.length > 0 ? presetFields : buildAutoQueryFields(keys.value);
  return [...new Set(source.map((field) => normalizeQueryField(field)))]
    .filter((field) => String(field || '').toLowerCase() !== 'id');
});
const statusOptions = STATUS_OPTIONS;
const canWrite = computed(() => {
  if (!props.permissionReady) return true;
  const upper = moduleToUpperSnake(props.moduleKey);
  const writeCode = `DATA_${upper}_WRITE`;
  return (props.permissionCodes || []).includes(writeCode);
});
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));
const i18n = computed(() => {
  const low = String(props.currentLang || '').toLowerCase();
  if (low.startsWith('zh')) {
    return {
      search: '查询',
      reset: '重置',
      confirmBatchDelete: '确认删除已选记录吗？',
      yes: '是',
      no: '否',
      batchDelete: '批量删除',
      create: '新建',
      inlineEdit: '行内编辑',
      save: '保存',
      cancel: '取消',
      edit: '编辑',
      confirmDelete: '确认删除吗？',
      delete: '删除',
      readonly: '仅查看',
      actions: '操作',
      fetchFail: '获取失败',
      updateSuccess: '更新成功',
      createSuccess: '创建成功',
      saveFail: '保存失败',
      deleteSuccess: '删除成功',
      deleteFail: '删除失败',
      batchDeleteSuccess: '批量删除成功',
      batchDeleteFail: '批量删除失败',
      updateFail: '更新失败',
      selectDept: '请选择部门',
      searchBy: '按',
      searchSuffix: '搜索',
    };
  }
  if (low.startsWith('en')) {
    return {
      search: 'Search',
      reset: 'Reset',
      confirmBatchDelete: 'Delete selected rows?',
      yes: 'Yes',
      no: 'No',
      batchDelete: 'Batch Delete',
      create: 'Create',
      inlineEdit: 'Inline Edit',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      confirmDelete: 'Delete this row?',
      delete: 'Delete',
      readonly: 'Read Only',
      actions: 'Actions',
      fetchFail: 'Failed to fetch',
      updateSuccess: 'Updated',
      createSuccess: 'Created',
      saveFail: 'Failed to save',
      deleteSuccess: 'Deleted',
      deleteFail: 'Failed to delete',
      batchDeleteSuccess: 'Batch deleted',
      batchDeleteFail: 'Batch delete failed',
      updateFail: 'Update failed',
      selectDept: 'Select department',
      searchBy: 'Search by',
      searchSuffix: '',
    };
  }
  return {
    search: '検索',
    reset: 'リセット',
    confirmBatchDelete: '選択行を削除しますか',
    yes: 'はい',
    no: 'いいえ',
    batchDelete: '一括削除',
    create: '新規作成',
    inlineEdit: '行内編集',
    save: '保存',
    cancel: '取消',
    edit: '編集',
    confirmDelete: '削除しますか',
    delete: '削除',
    readonly: '閲覧のみ',
    actions: '操作',
    fetchFail: '取得失敗',
    updateSuccess: '更新しました',
    createSuccess: '作成しました',
    saveFail: '保存失敗',
    deleteSuccess: '削除しました',
    deleteFail: '削除失敗',
    batchDeleteSuccess: '一括削除しました',
    batchDeleteFail: '一括削除失敗',
    updateFail: '更新失敗',
    selectDept: '部署名を選択',
    searchBy: '',
    searchSuffix: 'で検索',
  };
});

const keys = computed(() => {
  const first = rows.value[0];
  if (!first) return [];
  const raw = displayKeys(first);
  const noStatus = raw.includes('statusDesc') ? raw.filter((k) => k !== 'status') : raw;
  const tail = noStatus.filter((k) => k === 'createTime' || k === 'updateTime');
  const head = noStatus.filter((k) => k !== 'createTime' && k !== 'updateTime');
  return [...head, ...tail];
});

const columns = computed(() => {
  const base = keys.value.map((key) => ({
    title: normalizeTitle(key, props.currentLang),
    dataIndex: key,
    key,
    fixed: columnFixed(key),
    width: columnWidth(key),
    onCell: (record) => {
      if (isReadonlyField(key)) return {};
      return {
        ondblclick: () => {
          if (canWrite.value && !isEditing(record)) startInlineEdit(record);
        },
      };
    },
  }));
  const actionTitle = i18n.value.actions;
  return [...base, { title: actionTitle, key: '__actions', width: 140, fixed: 'right' }];
});

function columnFixed(key) {
  const low = String(key || '').toLowerCase();
  if (low === 'id') return 'left';
  if (low === 'createtime' || low === 'updatetime') return 'right';
  return undefined;
}

function columnWidth(key) {
  const low = String(key || '').toLowerCase();
  if (low === 'id') return 90;
  if (low === 'createtime' || low === 'updatetime') return 160;
  return undefined;
}

const formKeys = computed(() => {
  if (preset.value.formFields?.length) return preset.value.formFields.filter((k) => !isReadonlyField(k));
  const byRows = keys.value.filter((k) => !isReadonlyField(k));
  if (byRows.length > 0) return byRows;
  if (editingRaw.value) return Object.keys(editingRaw.value).filter((k) => !isReadonlyField(k));
  return [];
});

watch(
  () => props.moduleKey,
  async () => {
    if (!props.moduleKey) return;
    pagination.current = 1;
    initQuery();
    await loadQueryRelationOptions();
    await loadRelationOptions();
    await reload();
  },
  { immediate: true },
);

function initQuery() {
  Object.keys(queryState).forEach((k) => delete queryState[k]);
  queryFields.value.forEach((field) => {
    queryState[field] = queryInputType(field) === 'select' ? undefined : '';
  });
}

function normalizeQueryField(field) {
  const key = String(field || '');
  if (!key.endsWith('Id')) return key;
  if (relationModuleByField(key)) return `${key.slice(0, -2)}Name`;
  const nameField = `${key.slice(0, -2)}Name`;
  if (backendFieldSet.value.has(nameField)) return nameField;
  return key;
}

async function reload() {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      sortBy: 'updateTime',
      sortOrder: 'desc',
      ...buildQueryParams(),
    };
    const page = await fetchPage(props.moduleKey, params);
    rows.value = page.records;
    pagination.total = page.total;
  } catch (error) {
    message.error(error.message || i18n.value.fetchFail);
  } finally {
    loading.value = false;
  }
}

function buildQueryParams() {
  const out = {};
  queryFields.value.forEach((field) => {
    const val = queryState[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const idField = mapNameFieldToIdField(field);
      out[idField || field] = val;
    }
  });
  return out;
}

function resetQuery() {
  initQuery();
  pagination.current = 1;
  reload();
}

function doSearch() {
  pagination.current = 1;
  reload();
}

function onChange(pager) {
  pagination.current = pager.current;
  pagination.pageSize = pager.pageSize;
  reload();
}

function onSelectChange(keys) {
  selectedRowKeys.value = keys;
}

function openCreate() {
  if (!canWrite.value) return;
  editing.value = false;
  editingRaw.value = null;
  resetForm({});
  loadRelationOptions();
  modalOpen.value = true;
}

function openEdit(record) {
  if (!canWrite.value) return;
  editing.value = true;
  editingRaw.value = { ...record };
  resetForm(record);
  loadRelationOptions();
  modalOpen.value = true;
}

function resetForm(record) {
  Object.keys(formState).forEach((key) => delete formState[key]);
  formKeys.value.forEach((key) => {
    if (inputType(key) === 'switch') {
      formState[key] = Boolean(record[key]);
      return;
    }
    formState[key] = record[key] ?? null;
  });
}

async function submit() {
  if (!canWrite.value) return;
  try {
    if (editing.value) {
      const payload = normalizePayload({ ...(editingRaw.value || {}), ...formState });
      await updateItem(props.moduleKey, payload);
      message.success(i18n.value.updateSuccess);
    } else {
      await createItem(props.moduleKey, normalizePayload({ ...formState }));
      message.success(i18n.value.createSuccess);
    }
    modalOpen.value = false;
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.saveFail);
  }
}

async function onDelete(record) {
  if (!canWrite.value) return;
  try {
    await removeItem(props.moduleKey, record.id);
    message.success(i18n.value.deleteSuccess);
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.deleteFail);
  }
}

async function onBatchDelete() {
  if (!canWrite.value) return;
  if (selectedRowKeys.value.length === 0) return;
  try {
    for (const id of selectedRowKeys.value) {
      await removeItem(props.moduleKey, id);
    }
    message.success(i18n.value.batchDeleteSuccess);
    selectedRowKeys.value = [];
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.batchDeleteFail);
  }
}

function queryInputType(field) {
  if (mapNameFieldToIdField(field)) return 'select';
  const t = inputType(field);
  if (t === 'select') return 'select';
  if (t === 'number' || t === 'decimal') return 'number';
  return 'text';
}

function queryOptions(field) {
  if (field === 'status') return statusOptions;
  return queryRelationOptions[field] || [];
}

function queryPlaceholder(field) {
  if (field === 'deptName') return i18n.value.selectDept;
  if (String(props.currentLang || '').toLowerCase().startsWith('en')) {
    return `${i18n.value.searchBy} ${normalizeTitle(field, props.currentLang)}`.trim();
  }
  return `${normalizeTitle(field, props.currentLang)}${i18n.value.searchSuffix}`;
}

function inputType(field) {
  return guessFieldType(field, props.moduleKey);
}

function inlineField(field) {
  return mapNameFieldToIdField(field) || field;
}

function inlineInputType(field) {
  return inputType(inlineField(field));
}

function isReadonlyField(field) {
  if (!canWrite.value) return true;
  const low = String(field || '').toLowerCase();
  return low === 'id' || low === 'createtime' || low === 'updatetime' || low === 'statusdesc';
}

function normalizePayload(payload) {
  const out = { ...payload };
  Object.keys(out).forEach((key) => {
    if (mapNameFieldToIdField(key)) {
      delete out[key];
    }
  });
  Object.keys(out).forEach((key) => {
    const type = inputType(key);
    if (out[key] === '' || out[key] === undefined) {
      out[key] = null;
      return;
    }
    if (type === 'number') out[key] = Number(out[key]);
    if (type === 'decimal') out[key] = Number(out[key]);
  });
  return out;
}

function isEditing(record) {
  return editingKey.value !== null && String(record.id) === String(editingKey.value);
}

function startInlineEdit(record) {
  if (!canWrite.value) return;
  editingKey.value = record.id;
  Object.keys(editState).forEach((k) => delete editState[k]);
  formKeys.value.forEach((key) => {
    if (isReadonlyField(key)) return;
    const targetKey = inlineField(key);
    if (inputType(targetKey) === 'switch') {
      editState[targetKey] = Boolean(record[targetKey]);
      return;
    }
    editState[targetKey] = record[targetKey] ?? null;
  });
  loadRelationOptions();
}

function cancelInlineEdit() {
  editingKey.value = null;
  Object.keys(editState).forEach((k) => delete editState[k]);
}

async function saveInlineEdit(record) {
  if (!canWrite.value) return;
  try {
    const payload = normalizePayload({ ...record, ...editState, id: record.id });
    await updateItem(props.moduleKey, payload);
    message.success(i18n.value.updateSuccess);
    cancelInlineEdit();
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.updateFail);
  }
}

async function loadRelationOptions() {
  const relatedFields = [...new Set([...formKeys.value, ...keys.value.map((k) => inlineField(k))])]
    .filter((field) => !isReadonlyField(field) && inputType(field) === 'relation');
  relatedFields.forEach((field) => {
    relationOptions[field] = [];
  });
  for (const field of relatedFields) {
    const targetModule = relationModuleByField(field);
    if (!targetModule) continue;
    try {
      const list = await fetchModuleOptions(targetModule);
      relationOptions[field] = (list || []).map((item) => ({
        label: relationLabel(item),
        value: item.id,
      }));
    } catch {
      relationOptions[field] = [];
    }
  }
}

async function loadQueryRelationOptions() {
  queryFields.value.forEach((field) => {
    queryRelationOptions[field] = [];
  });

  for (const field of queryFields.value) {
    const idField = mapNameFieldToIdField(field);
    if (!idField) continue;
    const targetModule = relationModuleByField(idField);
    if (!targetModule) continue;
    try {
      const list = await fetchModuleOptions(targetModule);
      queryRelationOptions[field] = (list || []).map((item) => ({
        label: relationLabel(item),
        value: item.id,
      }));
    } catch {
      queryRelationOptions[field] = [];
    }
  }
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}
</script>
