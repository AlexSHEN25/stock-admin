import type { ActionType } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { message, Popconfirm } from 'antd';
import type { CrudModule } from '@/config/crudModules';
import { deleteOne, updateOne } from '@/services/crud';
import { getErrorMessage } from '@/services/http';
import { t } from '@/utils/i18n';
import type { CrudRecord } from '../types';
import { normalizePayload } from '../utils';
import { CrudFormFields } from './CrudFormFields';

interface CrudActionCellProps {
  module: CrudModule;
  resource: string;
  record: CrudRecord;
  action?: ActionType;
}

export const CrudActionCell: React.FC<CrudActionCellProps> = ({
  module,
  resource,
  record,
  action,
}) => {
  return (
    <>
      <ModalForm
        title={`${t('crud.edit')}${module.name}`}
        trigger={<a>{t('crud.edit')}</a>}
        initialValues={record}
        onFinish={async (values) => {
          try {
            const payload = normalizePayload(values, module.fields);
            await updateOne(resource, payload);
            message.success(t('crud.updateSuccess'));
            action?.reload?.();
            return true;
          } catch (e) {
            message.error(getErrorMessage(e));
            return false;
          }
        }}
      >
        <CrudFormFields fields={module.fields} isEdit />
      </ModalForm>
      <Popconfirm
        title={t('crud.deleteConfirm')}
        onConfirm={async () => {
          try {
            await deleteOne(resource, record.id);
            message.success(t('crud.deleteSuccess'));
            action?.reload?.();
          } catch (e) {
            message.error(getErrorMessage(e));
          }
        }}
      >
        <a>{t('crud.delete')}</a>
      </Popconfirm>
    </>
  );
};
