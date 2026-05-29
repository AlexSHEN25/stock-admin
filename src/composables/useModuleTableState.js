import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { createItem, fetchPage, removeItem, removeItems, updateItem } from '../api/module';
import { TABLE_TEXT } from '../utils/module-ui';

export function useModuleTableState(options) {
  const {
    modulePath,
    moduleKey,
    canWrite,
    canCreateRecord,
    canEditRecord,
    canDeleteRecord,
    canBatchDeleteRecord,
    getQueryFields,
    queryInputType,
    getFormKeys,
    inputType,
    inlineField,
    isReadonlyField,
    requiredForForm,
    mapNameFieldToIdField,
    moduleSubmitHandlers,
    buildQueryFieldAlias,
    buildExtraQueryParams,
  } = options;

  const rows = ref([]);
  const loading = ref(false);
  const modalOpen = ref(false);
  const editing = ref(false);
  const editingRaw = ref(null);
  const editingKey = ref(null);
  const formState = reactive({});
  const editState = reactive({});
  const queryState = reactive({});
  const selectedRowKeys = ref([]);
  const pagination = reactive({ current: 1, pageSize: 10, total: 0 });

  function initQuery() {
    Object.keys(queryState).forEach((key) => delete queryState[key]);
    getQueryFields().forEach((field) => {
      queryState[field] = queryInputType(field) === 'select' ? undefined : '';
    });
  }

  function applyPendingQuery(jump) {
    if (!jump) return;
    const raw = sessionStorage.getItem(jump.storageKey);
    if (!raw) return;
    if (Object.prototype.hasOwnProperty.call(queryState, jump.queryField)) {
      queryState[jump.queryField] = Number(raw);
    }
    sessionStorage.removeItem(jump.storageKey);
  }

  async function reload() {
    loading.value = true;
    try {
      const page = await fetchPage(modulePath.value, {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        sortBy: 'updateTime',
        sortOrder: 'desc',
        ...buildQueryParams(),
      });
      rows.value = page.records;
      pagination.total = page.total;
    } catch (error) {
      message.error(error.message || TABLE_TEXT.fetchFail);
    } finally {
      loading.value = false;
    }
  }

  function buildQueryParams() {
    const params = {};
    getQueryFields().forEach((field) => {
      if (moduleKey.value === 'message' && String(field || '').toLowerCase() === 'isread') return;
      const value = queryState[field];
      if (value === undefined || value === null || String(value).trim() === '') return;
      const aliasedField = buildQueryFieldAlias ? buildQueryFieldAlias(field) : field;
      const idField = mapNameFieldToIdField(aliasedField);
      params[idField || aliasedField] = value;
    });
    const extraParams = typeof buildExtraQueryParams === 'function'
      ? (buildExtraQueryParams() || {})
      : {};
    return { ...params, ...extraParams };
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

  function resetForm(record) {
    Object.keys(formState).forEach((key) => delete formState[key]);
    getFormKeys().forEach((key) => {
      if (inputType(key) === 'switch') {
        formState[key] = Boolean(record[key]);
        return;
      }
      if (moduleKey.value === 'role' && key === 'permissionIds') {
        formState[key] = normalizePermissionIds(record);
        return;
      }
      formState[key] = record[key] ?? null;
    });
  }

  function normalizePermissionIds(record) {
    const raw = record?.permissionIds ?? record?.permissionId;
    if (Array.isArray(raw)) return raw.map((x) => Number(x)).filter((x) => !Number.isNaN(x));
    if (raw === undefined || raw === null || String(raw).trim() === '') return [];
    return String(raw)
      .split(/[,\s]+/)
      .map((x) => Number(x))
      .filter((x) => !Number.isNaN(x));
  }

  function openCreate() {
    if (!canWrite.value || !canCreateRecord()) return false;
    editing.value = false;
    editingRaw.value = null;
    resetForm({});
    modalOpen.value = true;
    return true;
  }

  function openEdit(record, getRecordId) {
    if (!canWrite.value || !canEditRecord(record)) return false;
    editing.value = true;
    editingRaw.value = { ...record, id: getRecordId(record) };
    resetForm(record);
    modalOpen.value = true;
    return true;
  }

  function buildEditPayload(getRecordId) {
    if (moduleKey.value === 'user' && editing.value && !canCreateRecord()) {
      const payload = {
        id: getRecordId(editingRaw.value),
        password: formState.password,
      };
      if (payload.password === undefined || payload.password === null || String(payload.password).trim() === '') {
        delete payload.password;
      }
      return payload;
    }
    const payload = { ...(editingRaw.value || {}), ...formState };
    if (moduleKey.value === 'user') {
      const pwd = payload.password;
      if (pwd === undefined || pwd === null || String(pwd).trim() === '') {
        delete payload.password;
      }
    }
    return payload;
  }

  function validateRequiredFields() {
    if (hasConditionalRequiredViolation()) {
      message.warning('改定価格を入力した場合は価格更新日時を入力してください');
      return true;
    }
    const missing = getFormKeys()
      .filter((field) => isFieldRequired(field))
      .some((field) => {
        const value = formState[field];
        return value === undefined || value === null || String(value).trim() === '';
      });
    if (!missing) return false;
    message.warning(TABLE_TEXT.requiredField);
    return true;
  }

  function isFieldRequired(field) {
    if (moduleKey.value === 'user' && editing.value && String(field || '').toLowerCase() === 'password') {
      return false;
    }
    return requiredForForm(field);
  }

  function hasConditionalRequiredViolation() {
    if (moduleKey.value !== 'goods') return false;
    const updatePrice = formState.updatePrice;
    const hasUpdatePrice = updatePrice !== undefined && updatePrice !== null && String(updatePrice).trim() !== '';
    if (!hasUpdatePrice) return false;
    const priceUpdateTime = formState.priceUpdateTime;
    return priceUpdateTime === undefined || priceUpdateTime === null || String(priceUpdateTime).trim() === '';
  }

  async function submit(getRecordId, normalizePayload) {
    if (!canWrite.value) return;
    if (editing.value && editingRaw.value && !canEditRecord(editingRaw.value)) return;
    if (validateRequiredFields()) return;

    const submitHandler = moduleSubmitHandlers[moduleKey.value];
    if (submitHandler) {
      await submitHandler({ formState, closeModal: () => { modalOpen.value = false; }, reload });
      return;
    }

    try {
      if (editing.value) {
        await updateItem(modulePath.value, normalizePayload(buildEditPayload(getRecordId)));
        message.success(TABLE_TEXT.updateSuccess);
      } else {
        await createItem(modulePath.value, normalizePayload({ ...formState }));
        message.success(TABLE_TEXT.createSuccess);
      }
      modalOpen.value = false;
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.saveFail);
    }
  }

  async function onDelete(record, getRecordId) {
    if (!canWrite.value || !canDeleteRecord(record)) return;
    try {
      await removeItem(modulePath.value, getRecordId(record));
      message.success(TABLE_TEXT.deleteSuccess);
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.deleteFail);
    }
  }

  async function onBatchDelete() {
    if (!canWrite.value || !canBatchDeleteRecord()) return;
    if (selectedRowKeys.value.length === 0) return;
    try {
      await removeItems(modulePath.value, selectedRowKeys.value);
      selectedRowKeys.value = [];
      message.success(TABLE_TEXT.batchDeleteSuccess);
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.batchDeleteFail);
    }
  }

  function isEditing(record, getRecordId) {
    return editingKey.value !== null && String(getRecordId(record)) === String(editingKey.value);
  }

  function startInlineEdit(record, getRecordId) {
    if (!canWrite.value || !canEditRecord(record)) return false;
    editingKey.value = getRecordId(record);
    Object.keys(editState).forEach((key) => delete editState[key]);
    getFormKeys().forEach((key) => {
      if (isReadonlyField(key)) return;
      const targetKey = inlineField(key);
      if (moduleKey.value === 'role' && targetKey === 'permissionIds') {
        editState[targetKey] = normalizePermissionIds(record);
        return;
      }
      if (inputType(targetKey) === 'switch') {
        editState[targetKey] = Boolean(record[targetKey]);
        return;
      }
      editState[targetKey] = record[targetKey] ?? null;
    });
    return true;
  }

  function cancelInlineEdit() {
    editingKey.value = null;
    Object.keys(editState).forEach((key) => delete editState[key]);
  }

  async function saveInlineEdit(record, getRecordId, normalizePayload) {
    if (!canWrite.value || !canEditRecord(record)) return;
    try {
      await updateItem(modulePath.value, normalizePayload({ ...record, ...editState, id: getRecordId(record) }));
      message.success(TABLE_TEXT.updateSuccess);
      cancelInlineEdit();
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.updateFail);
    }
  }

  return {
    rows,
    loading,
    modalOpen,
    editing,
    editingRaw,
    editingKey,
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
    openCreate,
    openEdit,
    resetForm,
    submit,
    validateRequiredFields,
    onDelete,
    onBatchDelete,
    isEditing,
    startInlineEdit,
    cancelInlineEdit,
    saveInlineEdit,
  };
}
