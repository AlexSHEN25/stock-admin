import {
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { CrudField } from '@/config/crudModules';
import { t } from '@/utils/i18n';
import { NUMBER_TYPES } from '../constants';
import { isLongTextField, toTitle } from '../utils';

interface CrudFormFieldsProps {
  fields: CrudField[];
  isEdit: boolean;
}

const renderFormItem = (field: CrudField, isEdit: boolean) => {
  if (field.name === 'id') {
    if (!isEdit) {
      return null;
    }
    return <ProFormText key={field.name} name={field.name} hidden />;
  }

  const label = toTitle(field.name);

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
}) => {
  return <>{fields.map((field) => renderFormItem(field, isEdit))}</>;
};
