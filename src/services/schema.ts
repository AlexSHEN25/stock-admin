import { httpRequest } from './http';
import type { CrudField, CrudModule, JavaFieldType } from '@/config/crudModules';

export interface SchemaField {
  name: string;
  title: string;
  type: string;
  required: boolean;
  table: boolean;
  search: boolean;
  dict?: string;
  ref?: string;
  refLabelField?: string;
  refValueField?: string;
  refDisplayField?: string;
}

export interface SchemaVO {
  resource: string;
  name: string;
  group: string;
  fields: SchemaField[];
}

const mapSchemaFieldTypeToJavaFieldType = (type: string): JavaFieldType => {
  switch (type) {
    case 'NUMBER':
      return 'BigDecimal';
    case 'DATE':
    case 'DATETIME':
      return 'LocalDateTime';
    default:
      return 'String';
  }
};

const toCrudField = (field: SchemaField): CrudField => ({
  name: field.name,
  type: mapSchemaFieldTypeToJavaFieldType(field.type),
  label: field.title,
});

export const schemaToCrudModule = (schema: SchemaVO): CrudModule => {
  const allFields = (schema.fields || []).map(toCrudField);
  const tableFields = (schema.fields || [])
    .filter((field) => field.table)
    .map(toCrudField);
  const searchFields = (schema.fields || [])
    .filter((field) => field.search)
    .map(toCrudField);

  return {
    resource: schema.resource,
    name: schema.name || schema.resource,
    group: (schema.group || '') as CrudModule['group'],
    fields: allFields,
    tableFields: tableFields.length > 0 ? tableFields : allFields,
    searchFields,
  };
};

export const getSchema = async (resource: string) => {
  const res = await httpRequest<SchemaVO>(`/api/schema/${resource}`, {
    method: 'GET',
  });
  return res.data;
};

export const listSchemas = async () => {
  const res = await httpRequest<SchemaVO[]>('/api/schema', {
    method: 'GET',
  });
  return res.data || [];
};

