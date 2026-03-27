import type { ProColumns } from '@ant-design/pro-components';
import type { CrudModule } from '@/config/crudModules';
import { CrudActionCell } from './components/CrudActionCell';
import type { CrudRecord } from './types';
import { isLongTextField, toTitle } from './utils';

export const buildCrudColumns = (
  module: CrudModule,
  resource: string,
): ProColumns<CrudRecord>[] => {
  const columns: ProColumns<CrudRecord>[] = module.fields.map((field) => ({
    title: toTitle(field.name),
    dataIndex: field.name,
    ellipsis: true,
    search:
      field.type === 'String' &&
      field.name !== 'id' &&
      !isLongTextField(field.name),
    valueType: field.type === 'LocalDateTime' ? 'dateTime' : 'text',
  }));

  columns.push({
    title: '操作',
    valueType: 'option',
    width: 220,
    fixed: 'right',
    render: (_, record, __, action) => [
      <CrudActionCell
        key={`actions-${record.id}`}
        module={module}
        resource={resource}
        record={record}
        action={action}
      />,
    ],
  });

  return columns;
};
