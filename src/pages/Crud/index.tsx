import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import type { Key } from 'react';
import { useRef, useState } from 'react';
import { deleteOne, updateOne } from '@/services/crud';
import { getErrorMessage } from '@/services/http';
import { t } from '@/utils/i18n';
import { buildCrudColumns } from './columns';
import { CrudCreateButton } from './components/CrudCreateButton';
import { useCrudResource } from './hooks/useCrudResource';
import { queryCrudTable } from './tableRequest';
import type { CrudRecord } from './types';
import { normalizePayload } from './utils';

export default () => {
  const { resource, module } = useCrudResource();
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  if (!module) {
    return (
      <PageContainer title={t('crud.invalidResource')}>
        {t('crud.invalidResource')}：{resource}
      </PageContainer>
    );
  }

  const columns = buildCrudColumns(module, resource);
  const hasSelected = selectedRowKeys.length > 0;

  const handleBatchDelete = async () => {
    const deletableIds = selectedRowKeys.filter(
      (id): id is string | number =>
        typeof id === 'string' || typeof id === 'number',
    );
    const tasks = deletableIds.map((id) => deleteOne(resource, id));
    const results = await Promise.allSettled(tasks);
    const successCount = results.filter(
      (item) => item.status === 'fulfilled',
    ).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
      message.success(`${t('crud.batchDeleteSuccess')} (${successCount})`);
    }
    if (failCount > 0) {
      const firstRejected = results.find((item) => item.status === 'rejected');
      const reason =
        firstRejected && firstRejected.status === 'rejected'
          ? getErrorMessage(firstRejected.reason)
          : t('common.requestFailed');
      message.error(
        `${t('crud.batchDeleteFailed')} (${failCount}) - ${reason}`,
      );
    }

    setSelectedRowKeys([]);
    actionRef.current?.reload?.();
  };

  return (
    <PageContainer>
      <ProTable<CrudRecord>
        actionRef={actionRef}
        rowKey="id"
        headerTitle={module.name}
        scroll={{ x: 1600 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          showLessItems: true,
        }}
        columns={columns}
        request={(params, sorter) => queryCrudTable(resource, params, sorter)}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        editable={{
          type: 'single',
          onSave: async (_, row) => {
            try {
              const payload = normalizePayload(row, module.fields);
              await updateOne(resource, payload);
              message.success(t('crud.updateSuccess'));
            } catch (error) {
              message.error(getErrorMessage(error));
              throw error;
            }
          },
        }}
        onRow={(record) => ({
          onDoubleClick: () => {
            actionRef.current?.startEditable?.(record.id);
          },
        })}
        toolBarRender={(action) => [
          <Space key="toolbar" size={8}>
            <Popconfirm
              title={`${t('crud.batchDeleteConfirm')} (${selectedRowKeys.length})`}
              disabled={!hasSelected}
              onConfirm={handleBatchDelete}
            >
              <Button
                danger
                type="primary"
                disabled={!hasSelected}
                style={
                  hasSelected
                    ? {
                        backgroundColor: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        color: '#fff',
                      }
                    : {
                        backgroundColor: '#f5f5f5',
                        borderColor: '#d9d9d9',
                        color: 'rgba(0, 0, 0, 0.25)',
                      }
                }
              >
                {t('crud.batchDelete')}
              </Button>
            </Popconfirm>
            <CrudCreateButton
              key="create"
              module={module}
              resource={resource}
              reload={action?.reload}
            />
          </Space>,
        ]}
      />
    </PageContainer>
  );
};
