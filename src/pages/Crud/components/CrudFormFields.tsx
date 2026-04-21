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
  resource: string;
}

const renderFormItem = (
  field: CrudField,
  isEdit: boolean,
  resource: string,
) => {
  if (field.name === 'id') {
    if (!isEdit) {
      return null;
    }
    return <ProFormText key={field.name} name={field.name} hidden />;
  }

  const label =
    field.label ||
    CRUD_COLUMN_LABELS?.[resource]?.[field.name] ||
    toTitle(field.name);

  if (field.type === 'LocalDateTime') {
    return (
      <ProFormDateTimePicker key={field.name} name={field.name} label={label} />
    );
  }

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

  if (isLongTextField(field.name)) {
    return <ProFormTextArea key={field.name} name={field.name} label={label} />;
  }

  return <ProFormText key={field.name} name={field.name} label={label} />;
};

export const CrudFormFields: React.FC<CrudFormFieldsProps> = ({
  fields,
  isEdit,
  resource,
}) => {
  return <>{fields.map((field) => renderFormItem(field, isEdit, resource))}</>;
};
