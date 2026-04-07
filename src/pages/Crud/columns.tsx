import type { ProColumns } from '@ant-design/pro-components';
import { Select } from 'antd';
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
  const isNonPrimaryIdField = (fieldName: string) =>
    fieldName !== 'id' && fieldName.endsWith('Id');
  const labelMap = CRUD_COLUMN_LABELS[resource] || {};
  const currentLang = getCurrentLang();
  const rawTableFields = module.tableFields || module.fields;
  const normalTableFields = rawTableFields.filter(
    (field) =>
      field.name !== 'createTime' &&
      field.name !== 'updateTime' &&
      !isNonPrimaryIdField(field.name),
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
  const statusOptions = [
    { label: t('status.normal'), value: 1 },
    { label: t('status.forbidden'), value: 0 },
  ];
  const columns: ProColumns<CrudRecord>[] = tableFields.map((field) => {
    const isTimeField =
      field.name === 'createTime' || field.name === 'updateTime';
    const isStatusField = field.name === 'status';
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
      valueType: isStatusField
        ? 'select'
        : field.type === 'LocalDateTime'
          ? 'dateTime'
          : 'text',
      valueEnum: isStatusField
        ? {
            '1': { text: t('status.normal') },
            '0': { text: t('status.forbidden') },
          }
        : undefined,
      fieldProps: isStatusField ? { options: statusOptions } : undefined,
      renderFormItem: isStatusField
        ? () => (
            <Select
              options={statusOptions}
              placeholder={t('status.normal')}
              allowClear={false}
            />
          )
        : undefined,
      render: isStatusField
        ? (_, record) => {
            const raw = record?.[field.name];
            const isNormal = String(raw) === '1';
            return (
              <span
                className="status-chip"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '2px 10px',
                  borderRadius: 999,
                  backgroundColor: isNormal
                    ? 'rgba(82, 196, 26, 0.22)'
                    : 'rgba(255, 77, 79, 0.22)',
                }}
              >
                <span
                  className="status-chip-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: isNormal ? '#52c41a' : '#ff4d4f',
                    display: 'inline-block',
                  }}
                />
                <span className="status-chip-text">
                  {isNormal ? t('status.normal') : t('status.forbidden')}
                </span>
              </span>
            );
          }
        : undefined,
      sorter: isTimeField,
      defaultSortOrder:
        field.name === 'updateTime' ? ('descend' as const) : undefined,
      width: isTimeField ? 180 : undefined,
    };
  });

  searchFields.forEach((field) => {
    if (
      tableFieldNames.has(field.name) ||
      field.name === 'id' ||
      isNonPrimaryIdField(field.name)
    ) {
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
      valueEnum:
        field.name === 'status'
          ? {
              '1': { text: t('status.normal') },
              '0': { text: t('status.forbidden') },
            }
          : undefined,
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
