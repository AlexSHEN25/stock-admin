import type { ActionType } from '@ant-design/pro-components';
import { ModalForm } from '@ant-design/pro-components';
import { message, Popconfirm } from 'antd';
import type { CrudModule } from '@/config/crudModules';
import { deleteOne, updateOne } from '@/services/crud';
import { getErrorMessage } from '@/services/http';
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
        title={`编辑${module.name}`}
        trigger={<a>编辑</a>}
        initialValues={record}
        onFinish={async (values) => {
          try {
            const payload = normalizePayload(values, module.fields);
            await updateOne(resource, payload);
            message.success('更新成功');
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
        title="确认删除该记录吗？"
        onConfirm={async () => {
          try {
            await deleteOne(resource, record.id);
            message.success('删除成功');
            action?.reload?.();
          } catch (e) {
            message.error(getErrorMessage(e));
          }
        }}
      >
        <a>删除</a>
      </Popconfirm>
    </>
  );
};
