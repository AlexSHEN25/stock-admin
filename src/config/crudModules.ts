import { CRUD_RESOURCE_SCHEMA_MAP } from './crudResourceSchema';

export type JavaFieldType =
  | 'String'
  | 'Integer'
  | 'Long'
  | 'BigDecimal'
  | 'LocalDateTime';

export interface CrudField {
  name: string;
  type: JavaFieldType;
  label?: string;
}

export interface CrudModule {
  resource: string;
  name: string;
  group: '基础资料' | '库存业务' | '系统管理';
  fields: CrudField[];
  tableFields?: CrudField[];
  searchFields?: CrudField[];
}

export const CRUD_MODULES: CrudModule[] = [
  {
    resource: 'user',
    name: 'ユーザー',
    group: '系统管理',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'username', type: 'String', label: 'ユーザー名' },
      { name: 'deptId', type: 'Long', label: '部署' },
      { name: 'password', type: 'String', label: 'パスワード' },
      { name: 'email', type: 'String', label: 'メールアドレス' },
      { name: 'phone', type: 'String', label: '電話番号' },
      { name: 'avatar', type: 'String', label: 'アバター' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'brand',
    name: 'ブランド',
    group: '基础资料',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'name', type: 'String', label: 'ブランド名' },
      { name: 'englishName', type: 'String', label: '英語名' },
      { name: 'image', type: 'String', label: '画像' },
      { name: 'content', type: 'String', label: '説明' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'goods',
    name: '商品',
    group: '基础资料',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'name', type: 'String', label: '商品名' },
      { name: 'englishName', type: 'String', label: '英語名' },
      { name: 'seriesId', type: 'Long', label: 'シリーズ' },
      { name: 'brandId', type: 'Long', label: 'ブランド' },
      { name: 'categoryId', type: 'Long', label: 'カテゴリ' },
      { name: 'makerId', type: 'Long', label: 'メーカー' },
      { name: 'status', type: 'Integer', label: '状態' },
      { name: 'description', type: 'String', label: '説明' },
      { name: 'isHot', type: 'Integer', label: '人気商品' },
      { name: 'sort', type: 'Integer', label: '並び順' },
    ],
  },

  {
    resource: 'warehouse',
    name: '倉庫',
    group: '基础资料',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'name', type: 'String', label: '倉庫名' },
      { name: 'code', type: 'String', label: 'コード' },
      { name: 'address', type: 'String', label: '住所' },
      { name: 'managerId', type: 'Long', label: '管理者' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'customer',
    name: '顧客',
    group: '基础资料',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'customerCode', type: 'String', label: '顧客コード' },
      { name: 'name', type: 'String', label: '顧客名' },
      { name: 'englishName', type: 'String', label: '英語名' },
      { name: 'contactPerson', type: 'String', label: '担当者' },
      { name: 'phone', type: 'String', label: '電話番号' },
      { name: 'email', type: 'String', label: 'メール' },
      { name: 'country', type: 'String', label: '国' },
      { name: 'city', type: 'String', label: '都市' },
      { name: 'address', type: 'String', label: '住所' },
      { name: 'levelId', type: 'Integer', label: 'レベル' },
      { name: 'remark', type: 'String', label: '備考' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'stock',
    name: '在庫',
    group: '库存业务',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'goodsId', type: 'Integer', label: '商品ID' },
      { name: 'goodsName', type: 'String', label: '商品名' },
      { name: 'skuCode', type: 'String', label: 'SKUコード' },
      { name: 'warehouseId', type: 'Integer', label: '倉庫' },
      { name: 'currentQty', type: 'Integer', label: '在庫数' },
      { name: 'lockQty', type: 'Integer', label: 'ロック数' },
      { name: 'price', type: 'BigDecimal', label: '価格' },
      { name: 'priceUpdateTime', type: 'LocalDateTime', label: '価格更新時間' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'role',
    name: 'ロール',
    group: '系统管理',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'name', type: 'String', label: 'ロール名' },
      { name: 'code', type: 'String', label: 'コード' },
      { name: 'remark', type: 'String', label: '備考' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },

  {
    resource: 'permission',
    name: '権限',
    group: '系统管理',
    fields: [
      { name: 'id', type: 'Long', label: 'ID' },
      { name: 'name', type: 'String', label: '権限名' },
      { name: 'code', type: 'String', label: 'コード' },
      { name: 'module', type: 'String', label: 'モジュール' },
      { name: 'type', type: 'Integer', label: 'タイプ' },
      { name: 'parentId', type: 'Long', label: '親ID' },
      { name: 'path', type: 'String', label: 'パス' },
      { name: 'sort', type: 'Integer', label: '並び順' },
      { name: 'icon', type: 'String', label: 'アイコン' },
      { name: 'component', type: 'String', label: 'コンポーネント' },
      { name: 'status', type: 'Integer', label: '状態' },
    ],
  },
];

export const CRUD_MODULE_MAP = CRUD_MODULES.reduce(
  (acc, module) => {
    const schema = CRUD_RESOURCE_SCHEMA_MAP[module.resource];
    acc[module.resource] = {
      ...module,
      tableFields: schema?.tableFields || module.fields,
      searchFields: schema?.searchFields || module.fields,
    };
    return acc;
  },
  {} as Record<string, CrudModule>,
);
