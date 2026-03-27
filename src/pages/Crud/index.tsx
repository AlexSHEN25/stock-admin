import { PageContainer, ProTable } from '@ant-design/pro-components';
import { buildCrudColumns } from './columns';
import { CrudCreateButton } from './components/CrudCreateButton';
import { useCrudResource } from './hooks/useCrudResource';
import { queryCrudTable } from './tableRequest';
import type { CrudRecord } from './types';

export default () => {
  const { resource, module } = useCrudResource();

  if (!module) {
    return (
      <PageContainer title="未找到资源">无效资源：{resource}</PageContainer>
    );
  }

  const columns = buildCrudColumns(module, resource);

  return (
    <PageContainer>
      <ProTable<CrudRecord>
        rowKey="id"
        headerTitle={module.name}
        scroll={{ x: 1600 }}
        columns={columns}
        request={(params) => queryCrudTable(resource, params)}
        toolBarRender={(action) => [
          <CrudCreateButton
            key="create"
            module={module}
            resource={resource}
            reload={action?.reload}
          />,
        ]}
      />
    </PageContainer>
  );
};
