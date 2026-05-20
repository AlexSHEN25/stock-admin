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
          {{ i18n.search }}
        </a-button>
        <a-button
          class="search-btn"
          @click="resetQuery"
        >
          {{ i18n.reset }}
        </a-button>
        <a-popconfirm
          v-if="canWrite"
          :title="i18n.confirmBatchDelete"
          :ok-text="i18n.yes"
          :cancel-text="i18n.no"
          @confirm="onBatchDelete"
        >
          <a-button
            danger
            class="search-btn"
            :disabled="selectedRowKeys.length === 0"
          >
            {{ i18n.batchDelete }}
          </a-button>
        </a-popconfirm>
        <a-button
          v-if="canWrite"
          type="primary"
          class="search-btn search-btn-create"
          @click="openCreate"
        >
          {{ i18n.create }}
        </a-button>
      </div>
    </div>

    <a-table
      class="module-table"
      :row-key="(row) => getRecordId(row) || JSON.stringify(row)"
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
            :options="selectOptionsForField(inlineField(column.key))"
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
        <template v-if="!isEditing(record) && String(column.key) === 'skuId'">
          {{ record.skuId ?? '-' }}
        </template>
        <template v-else-if="!isEditing(record) && column.key === 'mainImage'">
          <img
            v-if="record.mainImage || record.imageUrl"
            :src="record.mainImage || record.imageUrl"
            class="goods-thumb"
          >
          <span v-else>-</span>
        </template>
        <template v-else-if="!isEditing(record) && column.key === 'statusDesc'">
          <a-tag :color="Number(record.status) === 1 ? 'success' : 'default'">
            {{ record.statusDesc || (Number(record.status) === 1 ? 'ON' : 'OFF') }}
          </a-tag>
        </template>
        <template v-else-if="!isEditing(record) && column.key === 'updateTime'">
          {{ formatTime(record.updateTime) }}
        </template>
        <template v-else-if="!isEditing(record) && String(column.key) === 'isHot'">
          {{ Number(record.isHot) === 1 ? i18n.hotYes : i18n.hotNo }}
        </template>
        <template v-else-if="!isEditing(record) && hasEnumOptions(column.key)">
          {{ enumLabel(column.key, record[column.key]) }}
        </template>
        <template v-if="column.key === '__actions'">
          <a-space>
            <a
              v-for="action in rowExtraActions"
              :key="action.key"
              @click="handleRowExtraAction(action.key, record)"
            >
              {{ action.label }}
            </a>
            <a
              v-if="canWrite && !isEditing(record)"
              @click="startInlineEdit(record)"
            >{{ i18n.inlineEdit }}</a>
            <a
              v-if="canWrite && isEditing(record)"
              @click="saveInlineEdit(record)"
            >{{ i18n.save }}</a>
            <a
              v-if="canWrite && isEditing(record)"
              @click="cancelInlineEdit"
            >{{ i18n.cancel }}</a>
            <a
              v-if="canWrite"
              @click="openEdit(record)"
            >{{ i18n.edit }}</a>
            <a-popconfirm
              v-if="canWrite"
              :title="i18n.confirmDelete"
              :ok-text="i18n.yes"
              :cancel-text="i18n.no"
              @confirm="onDelete(record)"
            >
              <a>{{ i18n.delete }}</a>
            </a-popconfirm>
            <span v-if="!canWrite">{{ i18n.readonly }}</span>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      :open="modalOpen"
      :title="editing ? i18n.edit : i18n.create"
      :ok-text="i18n.save"
      :cancel-text="i18n.cancel"
      :ok-button-props="{ disabled: !canWrite }"
      @ok="submit"
      @cancel="() => (modalOpen = false)"
    >
      <a-form layout="vertical">
        <a-form-item
          v-for="field in formKeys"
          :key="field"
          :required="requiredForForm(field)"
        >
          <template #label>
            {{ normalizeTitle(field) }}
          </template>
          <a-input
            v-if="inputType(field) === 'text'"
            v-model:value="formState[field]"
          />
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
          <a-select
            v-else-if="inputType(field) === 'select'"
            v-model:value="formState[field]"
            :options="selectOptionsForField(field)"
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
import { computed, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { createItem, fetchModuleOptions, fetchPage, removeItem, updateItem } from '../api/module';
import { TOKEN_KEY } from '../api/http';
import { STATUS_OPTIONS, buildAutoQueryFields, displayKeys, getModulePreset, guessFieldType, isRequiredFormField, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
});
const emit = defineEmits(['navigate-module']);

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
const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const modulePath = computed(() => props.moduleKey);
const goodsManagementQueryFields = ['keyword', 'englishName', 'skuCode', 'skuName', 'brandName', 'categoryName', 'status'];
const goodsManagementFormFields = [
  'name',
  'englishName',
  'brandId',
  'seriesId',
  'categoryId',
  'makerId',
  'description',
  'isHot',
  'skuCode',
  'skuName',
  'price',
  'status',
];
const goodsManagementPreferredFields = [
  'skuId',
  'goodsName',
  'name',
  'goodsId',
  'englishName',
  'customerCode',
  'brandName',
  'seriesName',
  'categoryName',
  'makerName',
  'stockTypeName',
  'skuCode',
  'skuName',
  'specSummary',
  'barcode',
  'weight',
  'volume',
  'price',
  'costPrice',
  'updatePrice',
  'oldPrice',
  'newPrice',
  'discount',
  'currency',
  'currentQty',
  'lockQty',
  'beforeQty',
  'changeQty',
  'afterQty',
  'statusDesc',
  'status',
  'mainImage',
  'imageUrl',
  'priceUpdateTime',
  'effectiveTime',
  'expireTime',
  'remark',
  'description',
  'sort',
  'version',
  'createdBy',
  'updatedBy',
  'createTime',
  'updateTime',
];

const preset = computed(() => getModulePreset(props.moduleKey));
const backendFieldSet = computed(() => {
  const first = rows.value[0] || {};
  return new Set(Object.keys(first));
});
const queryFields = computed(() => {
  if (isGoodsManagement.value) return goodsManagementQueryFields;
  const presetFields = preset.value.queryFields || [];
  const source = presetFields.length > 0 ? presetFields : buildAutoQueryFields(keys.value);
  return [...new Set(source.map((field) => normalizeQueryField(field)))]
    .filter((field) => String(field || '').toLowerCase() !== 'id');
});
const statusOptions = STATUS_OPTIONS;
const stockSourceTypeOptions = computed(() => {
  return [
    { label: '\u81ea\u793e\u5165\u5eab\uff08\u627f\u8a8d\u5fc5\u9808\uff09', value: 1 },
    { label: '\u518d\u8ca9\u58f2\u5165\u5eab\uff08\u5373\u6642\u5165\u5eab\uff09', value: 2 },
  ];
});
const stockOrderTypeOptions = computed(() => ([
  { label: '入庫', value: 1 },
  { label: '出庫', value: 2 },
  { label: '調整', value: 3 },
  { label: '棚卸', value: 4 },
  { label: '移動', value: 5 },
  { label: '返品', value: 6 },
]));
const stockOrderSourceTypeOptions = computed(() => ([
  { label: '注文', value: 1 },
  { label: '返品', value: 2 },
  { label: '申請書', value: 3 },
  { label: '手動', value: 4 },
]));
const stockOrderStateOptions = computed(() => ([
  { label: '草稿', value: 0 },
  { label: '審査中', value: 1 },
  { label: '完了', value: 2 },
  { label: '取消', value: 3 },
]));
const MODULE_QUERY_JUMPS = {
  stockOrderItem: { storageKey: 'jump_stock_order_id', queryField: 'orderId' },
  requestItem: { storageKey: 'jump_request_form_id', queryField: 'requestId' },
};
const MODULE_DETAIL_NAVIGATIONS = {
  stockOrder: { storageKey: 'jump_stock_order_id', targetModule: 'stockOrderItem' },
  requestForm: { storageKey: 'jump_request_form_id', targetModule: 'requestItem' },
};
const MODULE_ROW_EXTRA_ACTIONS = {
  stockOrder: [{ key: 'detail', label: '明細' }],
  requestForm: [
    { key: 'detail', label: '明細' },
    { key: 'download', label: 'ダウンロード' },
  ],
};
const MODULE_SUBMIT_HANDLERS = {
  stock: submitStockFlow,
};
const MODULE_ENUM_FIELD_OPTIONS = computed(() => ({
  stock: {
    sourceType: stockSourceTypeOptions.value,
  },
  stockOrder: {
    orderType: stockOrderTypeOptions.value,
    sourceType: stockOrderSourceTypeOptions.value,
    state: stockOrderStateOptions.value,
  },
  stockRecord: {
    orderType: stockOrderTypeOptions.value,
    sourceType: stockOrderSourceTypeOptions.value,
    state: stockOrderStateOptions.value,
  },
  requestForm: {
    state: stockOrderStateOptions.value,
  },
}));
const rowExtraActions = computed(() => MODULE_ROW_EXTRA_ACTIONS[props.moduleKey] || []);
const canWrite = computed(() => {
  if (!props.permissionReady) return true;
  if (isGoodsManagement.value) {
    return (props.permissionCodes || []).includes('DATA_GOODS_MANAGEMENT_WRITE')
      || (props.permissionCodes || []).includes('DATA_GOODS_BUNDLE_WRITE');
  }
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
const i18n = computed(() => ({
  search: '\u691c\u7d22',
  reset: '\u30ea\u30bb\u30c3\u30c8',
  confirmBatchDelete: '\u9078\u629e\u884c\u3092\u524a\u9664\u3057\u307e\u3059\u304b',
  yes: '\u306f\u3044',
  no: '\u3044\u3044\u3048',
  batchDelete: '\u4e00\u62ec\u524a\u9664',
  create: '\u65b0\u898f\u4f5c\u6210',
  inlineEdit: '\u884c\u5185\u7de8\u96c6',
  save: '\u4fdd\u5b58',
  cancel: '\u30ad\u30e3\u30f3\u30bb\u30eb',
  edit: '\u7de8\u96c6',
  confirmDelete: '\u524a\u9664\u3057\u307e\u3059\u304b',
  delete: '\u524a\u9664',
  readonly: '\u95b2\u89a7\u306e\u307f',
  actions: '\u64cd\u4f5c',
  fetchFail: '\u53d6\u5f97\u5931\u6557',
  updateSuccess: '\u66f4\u65b0\u3057\u307e\u3057\u305f',
  createSuccess: '\u4f5c\u6210\u3057\u307e\u3057\u305f',
  saveFail: '\u4fdd\u5b58\u5931\u6557',
  deleteSuccess: '\u524a\u9664\u3057\u307e\u3057\u305f',
  deleteFail: '\u524a\u9664\u5931\u6557',
  batchDeleteSuccess: '\u4e00\u62ec\u524a\u9664\u3057\u307e\u3057\u305f',
  batchDeleteFail: '\u4e00\u62ec\u524a\u9664\u5931\u6557',
  updateFail: '\u66f4\u65b0\u5931\u6557',
  requiredField: '\u5fc5\u9808\u9805\u76ee\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044',
  stockFlowSuccess: '\u5728\u5eab\u696d\u52d9\u3092\u767b\u9332\u3057\u307e\u3057\u305f',
  selectDept: '\u90e8\u7f72\u540d\u3092\u9078\u629e',
  searchSuffix: '\u3067\u691c\u7d22',
  hotYes: '\u306f\u3044',
  hotNo: '\u3044\u3044\u3048',
}));

const keys = computed(() => {
  if (isGoodsManagement.value) {
    const first = rows.value[0];
    if (!first) return goodsManagementPreferredFields;
    const raw = Object.keys(first || {});
    const noStatus = raw.includes('statusDesc') ? raw.filter((k) => k !== 'status') : raw;
    const timeTail = ['createTime', 'updateTime'];
    const withoutTail = noStatus.filter((k) => {
      const low = String(k || '').toLowerCase();
      if (timeTail.includes(k)) return false;
      if (low === 'id' || low === 'imageid') return false;
      return true;
    });
    const preferred = goodsManagementPreferredFields.filter((k) => withoutTail.includes(k) && !timeTail.includes(k));
    const rest = withoutTail.filter((k) => !goodsManagementPreferredFields.includes(k));
    const tail = timeTail.filter((k) => noStatus.includes(k));
    return [...preferred, ...rest, ...tail];
  }
  const first = rows.value[0];
  if (!first) return [];
  const raw = displayKeys(first);
  const noStatus = raw.includes('statusDesc') ? raw.filter((k) => k !== 'status') : raw;
  const noId = noStatus.filter((k) => String(k || '').toLowerCase() !== 'id');
  const tail = noId.filter((k) => k === 'createTime' || k === 'updateTime');
  const head = noId.filter((k) => k !== 'createTime' && k !== 'updateTime');
  return [...head, ...tail];
});

const columns = computed(() => {
  const base = keys.value.map((key) => ({
    title: normalizeTitle(key),
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
  if (isGoodsManagement.value && low === 'skuid') return 'left';
  if (low === 'id') return 'left';
  if (low === 'createtime' || low === 'updatetime') return 'right';
  return undefined;
}

function columnWidth(key) {
  const low = String(key || '').toLowerCase();
  if (isGoodsManagement.value && low === 'skuid') return 120;
  if (low === 'id') return 90;
  if (low === 'createtime' || low === 'updatetime') return 160;
  return undefined;
}

const formKeys = computed(() => {
  if (isGoodsManagement.value) return goodsManagementFormFields;
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
    applyPendingQuery();
    await loadQueryRelationOptions();
    await loadRelationOptions();
    await reload();
  },
  { immediate: true },
);

function applyPendingQuery() {
  const jump = MODULE_QUERY_JUMPS[props.moduleKey];
  if (!jump) return;
  const raw = sessionStorage.getItem(jump.storageKey);
  if (!raw) return;
  if (Object.prototype.hasOwnProperty.call(queryState, jump.queryField)) {
    queryState[jump.queryField] = Number(raw);
  }
  sessionStorage.removeItem(jump.storageKey);
}

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
    const page = await fetchPage(modulePath.value, params);
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
  editingRaw.value = { ...record, id: getRecordId(record) };
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
  if (validateRequiredFields()) return;
  const moduleSubmitHandler = MODULE_SUBMIT_HANDLERS[props.moduleKey];
  if (moduleSubmitHandler) {
    await moduleSubmitHandler();
    return;
  }
  try {
    if (editing.value) {
      const payload = normalizePayload({ ...(editingRaw.value || {}), ...formState });
      await updateItem(modulePath.value, payload);
      message.success(i18n.value.updateSuccess);
    } else {
      await createItem(modulePath.value, normalizePayload({ ...formState }));
      message.success(i18n.value.createSuccess);
    }
    modalOpen.value = false;
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.saveFail);
  }
}

function validateRequiredFields() {
  const requiredFields = formKeys.value.filter((field) => requiredForForm(field));
  const missing = requiredFields.some((field) => {
    const val = formState[field];
    return val === undefined || val === null || String(val).trim() === '';
  });
  if (missing) {
    message.warning(i18n.value.requiredField);
    return true;
  }
  return false;
}

async function submitStockFlow() {
  const requiredFields = ['goodsId', 'sourceType', 'warehouseId', 'stockTypeId', 'quantity'];
  const missing = requiredFields.some((field) => {
    const val = formState[field];
    return val === undefined || val === null || String(val).trim() === '';
  });
  if (missing) {
    message.warning(i18n.value.requiredField);
    return;
  }

  const goodsId = Number(formState.goodsId);
  const sourceType = Number(formState.sourceType);
  const warehouseId = Number(formState.warehouseId);
  const stockTypeId = Number(formState.stockTypeId);
  const quantity = Number(formState.quantity);
  let skuId = formState.skuId ? Number(formState.skuId) : null;

  // Auto-select SKU when the form does not expose skuId.
  if (!skuId) {
    try {
      const skuList = await fetchModuleOptions('goodsSku');
      const matched = (skuList || []).find((item) => Number(item.goodsId) === goodsId);
      if (matched?.id) {
        skuId = Number(matched.id);
      }
    } catch {
      // Keep null and let backend validate.
    }
  }

  const payload = {
    goodsId,
    skuId,
    sourceType,
    warehouseId,
    stockTypeId,
    quantity,
    remark: formState.remark || null,
  };

  try {
    await createItem('stock/inbound', payload);

    modalOpen.value = false;
    message.success(i18n.value.stockFlowSuccess);
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.saveFail);
  }
}

async function onDelete(record) {
  if (!canWrite.value) return;
  try {
    await removeItem(modulePath.value, getRecordId(record));
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
      await removeItem(modulePath.value, id);
    }
    message.success(i18n.value.batchDeleteSuccess);
    selectedRowKeys.value = [];
    reload();
  } catch (error) {
    message.error(error.message || i18n.value.batchDeleteFail);
  }
}

function queryInputType(field) {
  if (isGoodsManagement.value && field === 'keyword') return 'text';
  if (isGoodsManagement.value && (field === 'englishName' || field === 'skuCode' || field === 'skuName')) return 'text';
  if (mapNameFieldToIdField(field)) return 'select';
  const t = inputType(field);
  if (t === 'select') return 'select';
  if (t === 'number' || t === 'decimal') return 'number';
  return 'text';
}

function queryOptions(field) {
  if (field === 'status') return statusOptions;
  const enumOpts = enumOptionsForField(field);
  if (enumOpts.length > 0) return enumOpts;
  return queryRelationOptions[field] || [];
}

function queryPlaceholder(field) {
  if (isGoodsManagement.value && field === 'keyword') return '\u5546\u54c1/SKU\u30ad\u30fc\u30ef\u30fc\u30c9';
  if (field === 'deptName') return i18n.value.selectDept;
  return `${normalizeTitle(field)}${i18n.value.searchSuffix}`;
}

function inputType(field) {
  return guessFieldType(field, props.moduleKey);
}

function requiredForForm(field) {
  return isRequiredFormField(props.moduleKey, field);
}

function selectOptionsForField(field) {
  if (field === 'status') return statusOptions;
  const enumOpts = enumOptionsForField(field);
  if (enumOpts.length > 0) return enumOpts;
  return [];
}

function enumOptionsForField(field) {
  const key = String(field || '');
  return MODULE_ENUM_FIELD_OPTIONS.value[props.moduleKey]?.[key] || [];
}

function hasEnumOptions(field) {
  return enumOptionsForField(field).length > 0;
}

function enumLabel(field, value) {
  const opts = enumOptionsForField(field);
  const hit = opts.find((item) => Number(item.value) === Number(value));
  return hit?.label || value || '-';
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
  return editingKey.value !== null && String(getRecordId(record)) === String(editingKey.value);
}

function startInlineEdit(record) {
  if (!canWrite.value) return;
  editingKey.value = getRecordId(record);
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
    const payload = normalizePayload({ ...record, ...editState, id: getRecordId(record) });
    await updateItem(modulePath.value, payload);
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
    const targetModule = relationModuleByField(idField || field);
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

function getRecordId(record) {
  return record?.id ?? record?.skuId ?? record?._id ?? null;
}

function goDetailModule(record) {
  const navigation = MODULE_DETAIL_NAVIGATIONS[props.moduleKey];
  if (!navigation) return;
  const id = getRecordId(record);
  if (!id) return;
  sessionStorage.setItem(navigation.storageKey, String(id));
  emit('navigate-module', navigation.targetModule);
}

function handleRowExtraAction(actionKey, record) {
  if (actionKey === 'detail') {
    goDetailModule(record);
    return;
  }
  if (actionKey === 'download') {
    downloadRequestForm(record);
  }
}

async function downloadRequestForm(record) {
  const id = getRecordId(record);
  if (!id) return;
  try {
    const token = localStorage.getItem(TOKEN_KEY) || '';
    let response = await fetch(`/api/requestForm/download/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept-Language': 'ja-JP',
        'X-Lang': 'ja-JP',
      },
    });
    if (!response.ok) {
      response = await fetch(`/api/requestForm/${id}/download`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': 'ja-JP',
          'X-Lang': 'ja-JP',
        },
      });
    }
    if (!response.ok) {
      throw new Error(`ダウンロード失敗(${response.status})`);
    }
    const blob = await response.blob();
    const fileName = resolveDownloadFileName(response, id);
    const savedByPicker = await saveByFilePicker(blob, fileName);
    if (!savedByPicker) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    message.error(error?.message || 'ダウンロード失敗');
  }
}

async function saveByFilePicker(blob, fileName) {
  if (typeof window.showSaveFilePicker !== 'function') return false;
  const ext = fileName.toLowerCase().endsWith('.xlsx') ? '.xlsx' : '';
  const options = {
    suggestedName: fileName,
    types: [
      {
        description: 'Excel',
        accept: {
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
      },
    ],
  };
  if (!ext) {
    options.types = [];
  }
  try {
    const handle = await window.showSaveFilePicker(options);
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (error) {
    if (error?.name === 'AbortError') return true;
    return false;
  }
}

function resolveDownloadFileName(response, id) {
  const fallback = `request_${id}.xlsx`;
  const cd = response.headers.get('content-disposition') || '';
  if (!cd) return fallback;

  const starMatch = cd.match(/filename\*\s*=\s*([^;]+)/i);
  if (starMatch?.[1]) {
    const raw = starMatch[1].trim().replace(/^["']|["']$/g, '');
    const encoded = raw.includes("''") ? raw.split("''").slice(1).join("''") : raw;
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded || fallback;
    }
  }

  const plainMatch = cd.match(/filename\s*=\s*([^;]+)/i);
  if (plainMatch?.[1]) {
    const raw = plainMatch[1].trim().replace(/^["']|["']$/g, '');
    return raw || fallback;
  }

  return fallback;
}

function formatTime(v) {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}
</script>


