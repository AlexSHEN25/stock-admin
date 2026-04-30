<template>
  <a-card :title="moduleTitle(moduleKey)" :bordered="false">
    <template #extra>
      <a-space>
        <template v-for="field in queryFields" :key="field">
          <a-select
            v-if="queryInputType(field) === 'select'"
            v-model:value="queryState[field]"
            :options="statusOptions"
            :placeholder="`${normalizeTitle(field)}で検索`"
            style="width: 180px"
            allow-clear
          />
          <a-input
            v-else-if="queryInputType(field) === 'text'"
            v-model:value="queryState[field]"
            :placeholder="`${normalizeTitle(field)}で検索`"
            style="width: 180px"
            @pressEnter="reload"
          />
          <a-input-number
            v-else
            v-model:value="queryState[field]"
            :placeholder="`${normalizeTitle(field)}で検索`"
            style="width: 180px"
          />
        </template>
        <a-button @click="resetQuery">リセット</a-button>
        <a-popconfirm title="選択行を削除しますか" ok-text="はい" cancel-text="いいえ" @confirm="onBatchDelete">
          <a-button danger :disabled="selectedRowKeys.length === 0">一括削除</a-button>
        </a-popconfirm>
        <a-button type="primary" @click="openCreate">新規作成</a-button>
      </a-space>
    </template>

    <a-table
      :rowKey="(row) => row.id || row._id || JSON.stringify(row)"
      :columns="columns"
      :data-source="rows"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      :loading="loading"
      :pagination="tablePagination"
      @change="onChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="isEditing(record) && column.key !== '__actions' && !isReadonlyField(column.key)">
          <a-select
            v-if="inputType(column.key) === 'relation'"
            v-model:value="editState[column.key]"
            :options="relationOptions[column.key] || []"
            show-search
            allow-clear
            option-filter-prop="label"
          />
          <a-input-number
            v-else-if="inputType(column.key) === 'number' || inputType(column.key) === 'decimal'"
            v-model:value="editState[column.key]"
            style="width: 100%"
          />
          <a-select
            v-else-if="inputType(column.key) === 'select'"
            v-model:value="editState[column.key]"
            :options="statusOptions"
            allow-clear
          />
          <a-switch
            v-else-if="inputType(column.key) === 'switch'"
            v-model:checked="editState[column.key]"
          />
          <a-date-picker
            v-else-if="inputType(column.key) === 'datetime'"
            v-model:value="editState[column.key]"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
            style="width: 100%"
          />
          <a-input v-else v-model:value="editState[column.key]" />
        </template>
        <template v-if="column.key === '__actions'">
          <a-space>
            <a v-if="!isEditing(record)" @click="startInlineEdit(record)">行内編集</a>
            <a v-if="isEditing(record)" @click="saveInlineEdit(record)">保存</a>
            <a v-if="isEditing(record)" @click="cancelInlineEdit">取消</a>
            <a @click="openEdit(record)">編集</a>
            <a-popconfirm title="削除しますか" ok-text="はい" cancel-text="いいえ" @confirm="onDelete(record)">
              <a>削除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal :open="modalOpen" :title="editing ? '編集' : '新規作成'" ok-text="保存" cancel-text="キャンセル" @ok="submit" @cancel="() => (modalOpen = false)">
      <a-form layout="vertical">
        <a-form-item v-for="field in formKeys" :key="field" :label="normalizeTitle(field)">
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
import { STATUS_OPTIONS, displayKeys, getModulePreset, guessFieldType, moduleTitle, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';

const props = defineProps({ moduleKey: { type: String, required: true } });

const rows = ref([]);
const loading = ref(false);
const modalOpen = ref(false);
const editing = ref(false);
const editingRaw = ref(null);
const editingKey = ref(null);
const formState = reactive({});
const editState = reactive({});
const queryState = reactive({});
const relationOptions = reactive({});
const selectedRowKeys = ref([]);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

const preset = computed(() => getModulePreset(props.moduleKey));
const queryFields = computed(() => preset.value.queryFields || []);
const statusOptions = STATUS_OPTIONS;
const tablePagination = computed(() => ({
  current: pagination.current,
  pageSize: pagination.pageSize,
  total: pagination.total,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
}));

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
    title: normalizeTitle(key),
    dataIndex: key,
    key,
    onCell: (record) => {
      if (isReadonlyField(key)) return {};
      return {
        ondblclick: () => {
          if (!isEditing(record)) startInlineEdit(record);
        },
      };
    },
  }));
  return [...base, { title: '操作', key: '__actions', width: 180 }];
});

const formKeys = computed(() => {
  const byRows = keys.value.filter((k) => !isReadonlyField(k));
  if (byRows.length > 0) return byRows;
  if (editingRaw.value) return Object.keys(editingRaw.value).filter((k) => !isReadonlyField(k));
  if (preset.value.formFields?.length) return preset.value.formFields.filter((k) => !isReadonlyField(k));
  return [];
});

watch(
  () => props.moduleKey,
  async () => {
    if (!props.moduleKey) return;
    pagination.current = 1;
    initQuery();
    await loadRelationOptions();
    await reload();
  },
  { immediate: true },
);

function initQuery() {
  Object.keys(queryState).forEach((k) => delete queryState[k]);
  queryFields.value.forEach((field) => {
    queryState[field] = '';
  });
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
    message.error(error.message || '取得失敗');
  } finally {
    loading.value = false;
  }
}

function buildQueryParams() {
  const out = {};
  queryFields.value.forEach((field) => {
    const val = queryState[field];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      out[field] = val;
    }
  });
  return out;
}

function resetQuery() {
  initQuery();
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
  editing.value = false;
  editingRaw.value = null;
  resetForm({});
  loadRelationOptions();
  modalOpen.value = true;
}

function openEdit(record) {
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
  try {
    if (editing.value) {
      const payload = normalizePayload({ ...(editingRaw.value || {}), ...formState });
      await updateItem(props.moduleKey, payload);
      message.success('更新しました');
    } else {
      await createItem(props.moduleKey, normalizePayload({ ...formState }));
      message.success('作成しました');
    }
    modalOpen.value = false;
    reload();
  } catch (error) {
    message.error(error.message || '保存失敗');
  }
}

async function onDelete(record) {
  try {
    await removeItem(props.moduleKey, record.id);
    message.success('削除しました');
    reload();
  } catch (error) {
    message.error(error.message || '削除失敗');
  }
}

async function onBatchDelete() {
  if (selectedRowKeys.value.length === 0) return;
  try {
    for (const id of selectedRowKeys.value) {
      await removeItem(props.moduleKey, id);
    }
    message.success('一括削除しました');
    selectedRowKeys.value = [];
    reload();
  } catch (error) {
    message.error(error.message || '一括削除失敗');
  }
}

function queryInputType(field) {
  const t = inputType(field);
  if (t === 'select') return 'select';
  if (t === 'number' || t === 'decimal') return 'number';
  return 'text';
}

function inputType(field) {
  return guessFieldType(field, props.moduleKey);
}

function isReadonlyField(field) {
  const low = String(field || '').toLowerCase();
  return low === 'id' || low === 'createtime' || low === 'updatetime' || low === 'statusdesc';
}

function normalizePayload(payload) {
  const out = { ...payload };
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
  editingKey.value = record.id;
  Object.keys(editState).forEach((k) => delete editState[k]);
  keys.value.forEach((key) => {
    if (isReadonlyField(key)) return;
    if (inputType(key) === 'switch') {
      editState[key] = Boolean(record[key]);
      return;
    }
    editState[key] = record[key] ?? null;
  });
  loadRelationOptions();
}

function cancelInlineEdit() {
  editingKey.value = null;
  Object.keys(editState).forEach((k) => delete editState[k]);
}

async function saveInlineEdit(record) {
  try {
    const payload = normalizePayload({ ...record, ...editState, id: record.id });
    await updateItem(props.moduleKey, payload);
    message.success('更新しました');
    cancelInlineEdit();
    reload();
  } catch (error) {
    message.error(error.message || '更新失敗');
  }
}

async function loadRelationOptions() {
  const relatedFields = [...new Set([...formKeys.value, ...keys.value])]
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
</script>
