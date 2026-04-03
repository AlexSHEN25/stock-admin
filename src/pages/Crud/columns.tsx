import type { ProColumns } from '@ant-design/pro-components';
import { CRUD_COLUMN_LABELS } from '@/config/crudColumnLabels';
import type { CrudModule } from '@/config/crudModules';
import { translateSqlCommentLabel } from '@/config/sqlCommentI18n';
import { getCurrentLang, t } from '@/utils/i18n';
import { CrudActionCell } from './components/CrudActionCell';
import type { CrudRecord } from './types';
import { isLongTextField, toTitle } from './utils';

export const buildCrudColumns = (
  module: CrudModule,
  resource: string,
): ProColumns<CrudRecord>[] => {
  const labelMap = CRUD_COLUMN_LABELS[resource] || {};
  const currentLang = getCurrentLang();
  const rawTableFields = module.tableFields || module.fields;
  const normalTableFields = rawTableFields.filter(
    (field) => field.name !== 'createTime' && field.name !== 'updateTime',
  );
  const createTimeField = rawTableFields.find(
    (field) => field.name === 'createTime',
  ) || {
    name: 'createTime',
    type: 'LocalDateTime' as const,
  };
  const updateTimeField = rawTableFields.find(
    (field) => field.name === 'updateTime',
  ) || {
    name: 'updateTime',
    type: 'LocalDateTime' as const,
  };
  const tableFields = [...normalTableFields, createTimeField, updateTimeField];
  const searchFields = module.searchFields || module.fields;
  const searchFieldNames = new Set(searchFields.map((field) => field.name));
  const tableFieldNames = new Set(tableFields.map((field) => field.name));
  const columns: ProColumns<CrudRecord>[] = tableFields.map((field) => {
    const isTimeField =
      field.name === 'createTime' || field.name === 'updateTime';
    return {
      title: translateSqlCommentLabel(
        labelMap[field.name] || toTitle(field.name),
        currentLang,
      ),
      dataIndex: field.name,
      editable: field.name === 'id' || isTimeField ? false : undefined,
      ellipsis: true,
      search:
        searchFieldNames.has(field.name) &&
        field.name !== 'id' &&
        !isLongTextField(field.name) &&
        field.type !== 'LocalDateTime',
      valueType: field.type === 'LocalDateTime' ? 'dateTime' : 'text',
      sorter: isTimeField,
      defaultSortOrder:
        field.name === 'updateTime' ? ('descend' as const) : undefined,
      width: isTimeField ? 180 : undefined,
    };
  });

  searchFields.forEach((field) => {
    if (tableFieldNames.has(field.name) || field.name === 'id') {
      return;
    }
    columns.push({
      title: translateSqlCommentLabel(
        labelMap[field.name] || toTitle(field.name),
        currentLang,
      ),
      dataIndex: field.name,
      hideInTable: true,
      search: true,
      valueType: field.type === 'LocalDateTime' ? 'dateTime' : 'text',
    });
  });

  columns.push({
    title: '操作',
    valueType: 'option',
    width: 220,
    fixed: 'right',
    render: (_, record, __, action) => [
      <a
        key={`inline-edit-${record.id}`}
        onClick={() => action?.startEditable?.(record.id)}
      >
        {t('crud.inlineEdit')}
      </a>,
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
