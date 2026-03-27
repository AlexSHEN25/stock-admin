import { ModalForm } from '@ant-design/pro-components';
import { Button, message, Space } from 'antd';
import type { CrudModule } from '@/config/crudModules';
import { createOne } from '@/services/crud';
import { getErrorMessage } from '@/services/http';
import { normalizePayload } from '../utils';
import { CrudFormFields } from './CrudFormFields';

interface CrudCreateButtonProps {
  module: CrudModule;
  resource: string;
  reload?: () => void;
}

export const CrudCreateButton: React.FC<CrudCreateButtonProps> = ({
  module,
  resource,
  reload,
}) => {
  return (
    <ModalForm
      title={`新增${module.name}`}
      trigger={<Button type="primary">新增</Button>}
      onFinish={async (values) => {
        try {
          const payload = normalizePayload(values, module.fields);
          await createOne(resource, payload);
          message.success('新增成功');
          reload?.();
          return true;
        } catch (e) {
          message.error(getErrorMessage(e));
          return false;
        }
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={0}>
        <CrudFormFields fields={module.fields} isEdit={false} />
      </Space>
    </ModalForm>
  );
};
