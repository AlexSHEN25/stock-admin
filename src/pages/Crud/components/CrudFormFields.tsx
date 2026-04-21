import {
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { CRUD_COLUMN_LABELS } from '@/config/crudColumnLabels';
import type { CrudField } from '@/config/crudModules';
import { t } from '@/utils/i18n';
import { NUMBER_TYPES } from '../constants';
import { isLongTextField, toTitle } from '../utils';

interface CrudFormFieldsProps {
  fields: CrudField[];
  isEdit: boolean;
  resource: string; // ✅ 必须传
}

const renderFormItem = (
  field: CrudField,
  isEdit: boolean,
  resource: string,
) => {
  // ID 处理
  if (field.name === 'id') {
    if (!isEdit) return null;
    return <ProFormText key={field.name} name={field.name} hidden />;
  }

  // 外键暂时隐藏
  if (field.name.endsWith('Id')) {
    return null;
  }

  // ✅ label 获取逻辑（核心）
  const label =
    CRUD_COLUMN_LABELS?.[resource]?.[field.name] || // 优先配置
    field.label || // 其次字段自带
    toTitle(field.name); // 最后兜底英文

  // 时间类型
  if (field.type === 'LocalDateTime') {
    return (
      <ProFormDateTimePicker key={field.name} name={field.name} label={label} />
    );
  }

  // 状态
  if (field.name === 'status') {
    return (
      <ProFormSelect
        key={field.name}
        name={field.name}
        label={label}
        options={[
          { label: t('status.normal'), value: 1 },
          { label: t('status.forbidden'), value: 0 },
        ]}
      />
    );
  }

  // 数字
  if (NUMBER_TYPES.has(field.type)) {
    return (
      <ProFormDigit
        key={field.name}
        name={field.name}
        label={label}
        fieldProps={{ precision: 2 }}
      />
    );
  }

  // 长文本
  if (isLongTextField(field.name)) {
    return <ProFormTextArea key={field.name} name={field.name} label={label} />;
  }

  // 默认
  return <ProFormText key={field.name} name={field.name} label={label} />;
};

export const CrudFormFields: React.FC<CrudFormFieldsProps> = ({
  fields,
  isEdit,
  resource,
}) => {
  return <>{fields.map((field) => renderFormItem(field, isEdit, resource))}</>;
};
