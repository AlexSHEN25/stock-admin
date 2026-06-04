import { STATUS_OPTIONS } from '../utils/module';
import { TABLE_TEXT } from '../utils/module-ui';

const GOODS_TEXT_QUERY_FIELDS = new Set(['keyword', 'englishName', 'skuCode', 'skuName']);
const READONLY_FIELDS = new Set(['id', 'createtime', 'updatetime', 'statusdesc', 'beforeqty', 'afterqty', 'sourceid']);
const CURRENCY_OPTIONS = [
  { label: 'JPY', value: 'JPY' },
  { label: 'RMB', value: 'RMB' },
  { label: 'USD', value: 'USD' },
];

export function useModuleFieldBehavior(options) {
  const {
    moduleKey,
    canWrite,
    isGoodsManagement,
    guessFieldType,
    isRequiredFormField,
    mapNameFieldToIdField,
    normalizeTitle,
    getModuleEnumOptions,
  } = options;

  const statusOptions = STATUS_OPTIONS;

  function queryInputType(field) {
    if (isGoodsManagement.value && GOODS_TEXT_QUERY_FIELDS.has(String(field || ''))) {
      return 'text';
    }
    if (mapNameFieldToIdField(field)) return 'select';
    const type = inputType(field);
    if (type === 'relation') return 'select';
    if (type === 'select') return 'select';
    if (type === 'number' || type === 'decimal') return 'number';
    return 'text';
  }

  function queryPlaceholder(field) {
    if (isGoodsManagement.value && field === 'keyword') {
      return '商品/SKUキーワード';
    }
    if (field === 'deptName') return TABLE_TEXT.selectDept;
    return `${normalizeTitle(field)}${TABLE_TEXT.searchSuffix}`;
  }

  function inputType(field) {
    return guessFieldType(field, moduleKey.value);
  }

  function requiredForForm(field) {
    return isRequiredFormField(moduleKey.value, field);
  }

  function selectOptionsForField(field) {
    if (String(field || '').toLowerCase() === 'currency') return CURRENCY_OPTIONS;
    if (field === 'status') return statusOptions;
    return dedupeOptions(enumOptionsForField(field));
  }

  function enumOptionsForField(field) {
    return getModuleEnumOptions(moduleKey.value, String(field || ''));
  }

  function hasEnumOptions(field) {
    return enumOptionsForField(field).length > 0;
  }

  function enumLabel(field, value) {
    const hit = enumOptionsForField(field).find((item) => Number(item.value) === Number(value));
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
    return READONLY_FIELDS.has(String(field || '').toLowerCase());
  }

  function normalizePayload(payload) {
    const output = { ...payload };
    delete output.beforeQty;
    delete output.afterQty;
    if (moduleKey.value === 'dept') {
      delete output.parentId;
    }
    if (moduleKey.value === 'stockOrder') {
      delete output.sourceId;
    }
    Object.keys(output).forEach((key) => {
      if (moduleKey.value === 'goods' && key === 'skuName') return;
      if (mapNameFieldToIdField(key)) {
        delete output[key];
      }
    });
    Object.keys(output).forEach((key) => {
      const type = inputType(key);
      if (output[key] === '' || output[key] === undefined) {
        output[key] = null;
        return;
      }
      if (type === 'number' || type === 'decimal') {
        output[key] = Number(output[key]);
      }
    });

    if (moduleKey.value === 'goods') {
      const skuName = output.skuName;
      const goodsName = output.name || output.goodsName;
      if ((skuName === null || skuName === undefined || String(skuName).trim() === '') && goodsName) {
        output.skuName = goodsName;
      }
      if (output.updatePrice === null || output.updatePrice === undefined || String(output.updatePrice).trim() === '') {
        output.priceUpdateTime = null;
      }
      if (!output.currency) {
        output.currency = 'JPY';
      }
    }
    return output;
  }

  function dedupeOptions(optionList) {
    const list = Array.isArray(optionList) ? optionList : [];
    const seen = new Set();
    const output = [];
    for (const item of list) {
      if (!item) continue;
      const valueKey = item.value !== undefined && item.value !== null ? `v:${String(item.value)}` : '';
      const labelKey = item.label !== undefined && item.label !== null ? `l:${String(item.label)}` : '';
      const dedupeKey = valueKey || labelKey;
      if (!dedupeKey || seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      output.push(item);
    }
    return output;
  }

  function formatTime(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  return {
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
    dedupeOptions,
  };
}
