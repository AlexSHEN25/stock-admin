import { computed } from 'vue';
import TABLE_TEXT, { GOODS_TABLE_CONFIG } from '../utils/module-ui';
import { buildAutoQueryFields, displayKeys } from '../utils/module';

export function useModuleTableSchema(options) {
  const {
    rows,
    preset,
    moduleKey,
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
    onExcelCellClick,
    onExcelCellEdit,
    isExcelCellSelected,
  } = options;

  const keys = computed(() => {
    if (isGoodsManagement.value) {
      const first = rows.value[0];
      if (!first) return GOODS_TABLE_CONFIG.preferredFields;
      const raw = [...new Set([...Object.keys(first), 'inventoryStatus', 'currentQty'])];
      const noStatus = raw.includes('statusDesc') ? raw.filter((key) => key !== 'status') : raw;
      const withoutTail = noStatus.filter((key) => {
        const lower = String(key || '').toLowerCase();
        if (lower === 'id' || lower === 'imageid') return false;
        if (isTimeLikeField(key) && !isLastUpdateField(key)) return false;
        return true;
      });
      const preferred = GOODS_TABLE_CONFIG.preferredFields.filter((key) => withoutTail.includes(key) && (!isTimeLikeField(key) || isLastUpdateField(key)));
      const rest = withoutTail.filter((key) => !GOODS_TABLE_CONFIG.preferredFields.includes(key));
      return orderGoodsKeys([...preferred, ...rest], noStatus);
    }

    const presetTableFields = preset.value.tableFields || [];
    if (presetTableFields.length > 0) {
      return [...presetTableFields];
    }

    const first = rows.value[0];
    if (!first) return [];
    const raw = displayKeys(first).filter(isSafeColumnKey);
    const noStatus = raw.includes('statusDesc') ? raw.filter((key) => key !== 'status') : raw;
    const hasId = noStatus.some((key) => String(key || '').toLowerCase() === 'id');
    const noId = noStatus.filter((key) => String(key || '').toLowerCase() !== 'id');
    const filtered = noId.filter((key) => !isTimeLikeField(key) || isLastUpdateField(key));
    const head = filtered;
    return hasId ? ['id', ...head] : [...head];
  });

  const queryFields = computed(() => {
    if (isGoodsManagement.value) return GOODS_TABLE_CONFIG.queryFields;
    const presetFields = preset.value.queryFields || [];
    const source = presetFields.length > 0 ? presetFields : buildAutoQueryFields(keys.value);
    return [...new Set(source.map((field) => normalizeQueryField(field)))]
      .filter((field) => String(field || '').toLowerCase() !== 'id' && (
        presetFields.length > 0
        || !isTimeLikeField(field)
        || isLastUpdateField(field)
      ));
  });

  const columns = computed(() => {
    const base = keys.value
      .filter((key) => String(key || '').toLowerCase() !== 'updatetime')
      .map((key) => ({
      title: isGoodsSkuIdAsId(key, isGoodsManagement.value) ? 'ID' : normalizeTitle(key),
      dataIndex: key,
      key,
      className: columnClassName(key, moduleKey?.value),
      fixed: columnFixed(key, isGoodsManagement.value),
      width: columnWidth(key, isGoodsManagement.value, moduleKey?.value),
      ellipsis: false,
      align: columnAlign(key, moduleKey?.value),
      customCell: (record) => {
        if (isRequestManagementModule(moduleKey?.value)) {
          if (!isEditableExcelCell(key, moduleKey?.value)) return {};
          const selectedClass = typeof isExcelCellSelected === 'function' && isExcelCellSelected(record, key)
            ? 'excel-grid-cell-selected'
            : '';
          return {
            tabindex: 0,
            class: selectedClass,
            onClick: () => {
              if (canWrite.value && typeof onExcelCellClick === 'function') {
                onExcelCellClick(record, key);
              }
            },
            onDblclick: () => {
              if (canWrite.value && !isEditing(record)) {
                startInlineEdit(record);
              }
              if (canWrite.value && typeof onExcelCellEdit === 'function') {
                onExcelCellEdit(record, key);
              }
            },
            onKeydown: (event) => {
              if (event?.key !== 'Enter') return;
              event.preventDefault?.();
              if (canWrite.value && !isEditing(record)) {
                startInlineEdit(record);
              }
              if (canWrite.value && typeof onExcelCellEdit === 'function') {
                onExcelCellEdit(record, key);
              }
            },
          };
        }
        if (preset.value.hideActions || isReadonlyField(key)) return {};
        return {
          onDblclick: () => {
            if (canWrite.value && !isEditing(record)) {
              startInlineEdit(record);
            }
          },
        };
      },
    }));

    const updateTimeColumn = keys.value.some((key) => String(key || '').toLowerCase() === 'updatetime')
      ? [{
        title: normalizeTitle('updateTime'),
        dataIndex: 'updateTime',
        key: 'updateTime',
        fixed: 'right',
        width: 160,
        ellipsis: false,
      }]
      : [];

    const result = [
      ...base,
      ...updateTimeColumn,
    ];
    if (!preset.value.hideActions) {
      result.push({
        title: TABLE_TEXT.actions,
        key: '__actions',
        width: isGoodsManagement.value ? 220 : 140,
        fixed: 'right',
      });
    }
    return result;
  });

  const formKeys = computed(() => {
    if (isGoodsManagement.value) {
      const orderedFromTable = keys.value
        .map((field) => mapNameFieldToIdField(field) || field)
        .filter((field) => !isReadonlyField(field) && String(field || '').toLowerCase() !== 'skuid');
      const presetGoodsFields = GOODS_TABLE_CONFIG.formFields || [];
      const merged = [...orderedFromTable, ...presetGoodsFields];
      const normalized = [...new Set(merged)].filter((field) => !isReadonlyField(field) && String(field || '').toLowerCase() !== 'skuid');
      moveAfter(normalized, 'skuCode', ['skuName']);
      return normalized;
    }

    const normalizeFormFields = (fields) => {
      const out = [];
      const seen = new Set();
      for (const field of fields || []) {
        if (isReadonlyField(field)) continue;
        const mapped = mapNameFieldToIdField(field) || field;
        if (!mapped || isReadonlyField(mapped)) continue;
        if (isTimeLikeField(mapped)) continue;
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

function isSafeColumnKey(key) {
  const value = String(key || '').trim();
  const low = value.toLowerCase();
  return Boolean(value)
    && !value.startsWith('$')
    && !value.startsWith('__')
    && low !== 'nodetype';
}

function columnFixed(key, isGoodsManagement) {
  const lower = String(key || '').toLowerCase();
  if (isGoodsManagement && lower === 'skuid') return 'left';
  if (lower === 'id') return 'left';
  if (lower === 'createtime' || lower === 'updatetime') return 'right';
  return undefined;
}

function columnClassName(key, moduleKey) {
  const classes = [];
  if (isPermissionNamesKey(key)) classes.push('cell-permission-names');
  if (isRequestManagementModule(moduleKey)) {
    classes.push('excel-grid-cell');
    if (isEditableExcelCell(key, moduleKey)) classes.push('excel-grid-cell-editable');
  }
  return classes.length > 0 ? classes.join(' ') : undefined;
}

function columnWidth(key, isGoodsManagement, moduleKey) {
  const lower = String(key || '').toLowerCase();
  if (isRequestManagementModule(moduleKey)) {
    const requestFlowWidths = {
      id: 80,
      bizno: 150,
      sourceorderid: 130,
      sourceorderno: 160,
      username: 130,
      deptname: 140,
      country: 110,
      customername: 180,
      warehouseid: 130,
      groupcode: 100,
      outbounddate: 150,
      goodsname: 220,
      skucode: 150,
      brandname: 150,
      seriesname: 150,
      categoryname: 150,
      makername: 150,
      stocktypename: 130,
      sourceqty: 110,
      moveqty: 150,
      price: 120,
      totalqty: 110,
      requestqty: 110,
      totalamt: 130,
      exchangerate: 120,
      paymentdate: 150,
      hasfee: 100,
      feeamount: 120,
      hasunpaid: 110,
      unpaidamount: 130,
      state: 120,
      approvername: 130,
      approvetime: 150,
      approveremark: 220,
      currency: 90,
      operatorname: 130,
    };
    return requestFlowWidths[lower] || 140;
  }
  if (isGoodsManagement && lower === 'skuid') return 120;
  if (lower === 'id') return 72;
  if (lower.endsWith('ids')) return 160;
  if (lower.endsWith('id')) return 130;
  if (lower === 'permissionname' || lower === 'permissionnames') return 360;
  if (lower === 'rolename') return 220;
  if (lower === 'createtime' || lower === 'updatetime') return 160;
  return undefined;
}

function columnAlign(key, moduleKey) {
  if (!isRequestManagementModule(moduleKey)) return undefined;
  const lower = String(key || '').toLowerCase();
  if (lower.includes('qty') || lower.includes('amount') || lower.includes('amt') || lower === 'price' || lower === 'exchangerate') return 'right';
  return undefined;
}

function isRequestManagementModule(moduleKey) {
  return moduleKey === 'requestForm' || moduleKey === 'deliverySchedule' || moduleKey === 'requestItem';
}

function isEditableExcelCell(key, moduleKey) {
  if (!isRequestManagementModule(moduleKey)) return false;
  const lower = String(key || '').toLowerCase();
  return lower !== '__actions';
}

function isGoodsSkuIdAsId(key, isGoodsManagement) {
  return isGoodsManagement && String(key || '').toLowerCase() === 'skuid';
}

function isTimeLikeField(field) {
  const low = String(field || '').toLowerCase();
  return low.includes('time') || low.includes('date');
}

function isLastUpdateField(field) {
  return String(field || '').toLowerCase() === 'updatetime';
}

function orderGoodsKeys(sourceKeys, availableKeys) {
  const keySet = new Set(availableKeys);
  const seen = new Set();
  const result = [];
  const hiddenIdFields = new Set(['brandid', 'seriesid', 'categoryid', 'makerid']);
  const hiddenGoodsFields = new Set([
    'sort',
    'ishot',
    'imagesort',
    'skustatus',
    'skustatusdesc',
    'statusdesc',
    'status',
  ]);
  const detailOnlyFields = new Set(['costprice', 'updateprice', 'priceupdatetime', 'barcode', 'weight', 'volume', 'imageurl']);

  const push = (key) => {
    if (!keySet.has(key)) return;
    const lower = String(key || '').toLowerCase();
    if (hiddenIdFields.has(lower)) return;
    if (hiddenGoodsFields.has(lower)) return;
    if (detailOnlyFields.has(lower)) return;
    if (seen.has(key)) return;
    seen.add(key);
    result.push(key);
  };

  const working = sourceKeys.filter((key) => {
    const lower = String(key || '').toLowerCase();
    return !isTimeLikeField(key) && !hiddenGoodsFields.has(lower);
  });
  const head = ['skuId', 'goodsName', 'name', 'goodsId'];
  head.forEach(push);

  for (const key of working) {
    if (key !== 'skuId' && key !== 'goodsName' && key !== 'name' && key !== 'goodsId') {
      push(key);
    }
  }

  moveAfter(result, 'englishName', ['skuCode', 'skuName']);

  return result;
}

function moveAfter(list, anchor, moveKeys) {
  if (!list.includes(anchor)) return;
  const keep = list.filter((k) => !moveKeys.includes(k));
  const anchorIndex = keep.indexOf(anchor);
  const moved = moveKeys.filter((k) => list.includes(k));
  keep.splice(anchorIndex + 1, 0, ...moved);
  list.splice(0, list.length, ...keep);
}
