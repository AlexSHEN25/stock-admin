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
    mapNameFieldToIdField,
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
    const hasId = noStatus.some((key) => String(key || '').toLowerCase() === 'id');
    const noId = noStatus.filter((key) => String(key || '').toLowerCase() !== 'id');
    const tail = noId.filter((key) => key === 'createTime' || key === 'updateTime');
    const head = noId.filter((key) => key !== 'createTime' && key !== 'updateTime');
    return hasId ? ['id', ...head, ...tail] : [...head, ...tail];
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
      className: isPermissionNamesKey(key) ? 'cell-permission-names' : undefined,
      fixed: columnFixed(key, isGoodsManagement.value),
      width: columnWidth(key, isGoodsManagement.value),
      ellipsis: String(key || '').toLowerCase() === 'id',
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

    const normalizeFormFields = (fields) => {
      const out = [];
      const seen = new Set();
      for (const field of fields || []) {
        if (isReadonlyField(field)) continue;
        const mapped = mapNameFieldToIdField(field) || field;
        if (!mapped || isReadonlyField(mapped)) continue;
        if (seen.has(mapped)) continue;
        seen.add(mapped);
        out.push(mapped);
      }
      return out;
    };

    const presetFormFields = preset.value.formFields?.length
      ? normalizeFormFields(preset.value.formFields)
      : [];
    if (isUserSelfEditMode.value) return ['password'];
    if (presetFormFields.length > 0) return presetFormFields;

    const fieldsFromRows = normalizeFormFields(keys.value);
    if (fieldsFromRows.length > 0) return fieldsFromRows;
    if (editingRaw.value) {
      return normalizeFormFields(Object.keys(editingRaw.value));
    }
    return [];
  });

  return {
    keys,
    queryFields,
    columns,
    formKeys,
    mapNameFieldToIdField,
  };
}

function isPermissionNamesKey(key) {
  const low = String(key || '').toLowerCase();
  return low === 'permissionname' || low === 'permissionnames';
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
  if (lower.endsWith('ids')) return 160;
  if (lower.endsWith('id')) return 130;
  if (lower === 'permissionname' || lower === 'permissionnames') return 360;
  if (lower === 'rolename') return 220;
  if (lower === 'id') return 100;
  if (lower === 'createtime' || lower === 'updatetime') return 160;
  return undefined;
}
