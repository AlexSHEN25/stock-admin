import { computed } from 'vue';
import { GOODS_TABLE_CONFIG, TABLE_TEXT } from '../utils/module-ui';
import { buildAutoQueryFields, displayKeys } from '../utils/module';

export function useModuleTableSchema(options) {
  const {
    rows,
    preset,
    isGoodsManagement,
    normalizeTitle,
    isReadonlyField,
    canWrite,
    isEditing,
    startInlineEdit,
    normalizeQueryField,
    editingRaw,
    isUserSelfEditMode,
  } = options;

  const keys = computed(() => {
    if (isGoodsManagement.value) {
      const first = rows.value[0];
      if (!first) return GOODS_TABLE_CONFIG.preferredFields;
      const raw = Object.keys(first);
      const noStatus = raw.includes('statusDesc') ? raw.filter((key) => key !== 'status') : raw;
      const timeTail = ['createTime', 'updateTime'];
      const withoutTail = noStatus.filter((key) => {
        const lower = String(key || '').toLowerCase();
        if (timeTail.includes(key)) return false;
        if (lower === 'id' || lower === 'imageid') return false;
        return true;
      });
      const preferred = GOODS_TABLE_CONFIG.preferredFields.filter((key) => withoutTail.includes(key) && !timeTail.includes(key));
      const rest = withoutTail.filter((key) => !GOODS_TABLE_CONFIG.preferredFields.includes(key));
      const tail = timeTail.filter((key) => noStatus.includes(key));
      return [...preferred, ...rest, ...tail];
    }

    const first = rows.value[0];
    if (!first) return [];
    const raw = displayKeys(first);
    const noStatus = raw.includes('statusDesc') ? raw.filter((key) => key !== 'status') : raw;
    const noId = noStatus.filter((key) => String(key || '').toLowerCase() !== 'id');
    const tail = noId.filter((key) => key === 'createTime' || key === 'updateTime');
    const head = noId.filter((key) => key !== 'createTime' && key !== 'updateTime');
    return [...head, ...tail];
  });

  const queryFields = computed(() => {
    if (isGoodsManagement.value) return GOODS_TABLE_CONFIG.queryFields;
    const presetFields = preset.value.queryFields || [];
    const source = presetFields.length > 0 ? presetFields : buildAutoQueryFields(keys.value);
    return [...new Set(source.map((field) => normalizeQueryField(field)))]
      .filter((field) => String(field || '').toLowerCase() !== 'id');
  });

  const columns = computed(() => {
    const base = keys.value.map((key) => ({
      title: normalizeTitle(key),
      dataIndex: key,
      key,
      fixed: columnFixed(key, isGoodsManagement.value),
      width: columnWidth(key, isGoodsManagement.value),
      onCell: (record) => {
        if (isReadonlyField(key)) return {};
        return {
          ondblclick: () => {
            if (canWrite.value && !isEditing(record)) {
              startInlineEdit(record);
            }
          },
        };
      },
    }));

    return [
      ...base,
      {
        title: TABLE_TEXT.actions,
        key: '__actions',
        width: 140,
        fixed: 'right',
      },
    ];
  });

  const formKeys = computed(() => {
    if (isGoodsManagement.value) return GOODS_TABLE_CONFIG.formFields;

    const presetFormFields = preset.value.formFields?.length
      ? preset.value.formFields.filter((field) => !isReadonlyField(field))
      : [];
    if (isUserSelfEditMode.value) return ['password'];
    if (presetFormFields.length > 0) return presetFormFields;

    const fieldsFromRows = keys.value.filter((field) => !isReadonlyField(field));
    if (fieldsFromRows.length > 0) return fieldsFromRows;
    if (editingRaw.value) {
      return Object.keys(editingRaw.value).filter((field) => !isReadonlyField(field));
    }
    return [];
  });

  return {
    keys,
    queryFields,
    columns,
    formKeys,
  };
}

function columnFixed(key, isGoodsManagement) {
  const lower = String(key || '').toLowerCase();
  if (isGoodsManagement && lower === 'skuid') return 'left';
  if (lower === 'id') return 'left';
  if (lower === 'createtime' || lower === 'updatetime') return 'right';
  return undefined;
}

function columnWidth(key, isGoodsManagement) {
  const lower = String(key || '').toLowerCase();
  if (isGoodsManagement && lower === 'skuid') return 120;
  if (lower === 'id') return 90;
  if (lower === 'createtime' || lower === 'updatetime') return 160;
  return undefined;
}
