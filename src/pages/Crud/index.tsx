import { PageContainer, ProTable } from '@ant-design/pro-components';
import { t } from '@/utils/i18n';
import { buildCrudColumns } from './columns';
import { CrudCreateButton } from './components/CrudCreateButton';
import { useCrudResource } from './hooks/useCrudResource';
import { queryCrudTable } from './tableRequest';
import type { CrudRecord } from './types';

export default () => {
  const { resource, module } = useCrudResource();

  if (!module) {
    return (
      <PageContainer title={t('crud.invalidResource')}>
        {t('crud.invalidResource')}：{resource}
      </PageContainer>
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
