import dayjs from 'dayjs';
import type { CrudField } from '@/config/crudModules';
import { LONG_TEXT_KEYS, NUMBER_TYPES } from './constants';
import type { CrudRecord } from './types';

export const toTitle = (name: string) =>
  name.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

export const isLongTextField = (fieldName: string) =>
  LONG_TEXT_KEYS.some((key) =>
    fieldName.toLowerCase().includes(key.toLowerCase()),
  );

export const normalizePayload = (values: CrudRecord, fields: CrudField[]) => {
  const payload: CrudRecord = { ...values };

  fields.forEach((field) => {
    const value = payload[field.name];

    if (value === undefined || value === null || value === '') {
      return;
    }

    if (NUMBER_TYPES.has(field.type)) {
      payload[field.name] = Number(value);
    }

    if (field.type === 'LocalDateTime') {
      payload[field.name] = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    }
  });

  return payload;
};
