import { CRUD_MODULES } from './crudModules';

/**
 * 字段名 → 日文 映射（核心字典）
 */
const FIELD_NAME_MAP: Record<string, string> = {
  id: 'ID',
  name: '名称',
  englishName: '英語名',
  image: '画像',
  content: '内容',
  status: '状態',
  code: 'コード',
  address: '住所',
  phone: '電話番号',
  email: 'メールアドレス',
  password: 'パスワード',
  username: 'ユーザー名',
  avatar: 'アバター',
  remark: '備考',
  description: '説明',
  sort: '並び順',

  createTime: '作成時間',
  updateTime: '更新時間',
  priceUpdateTime: '価格更新時間',

  price: '価格',
  oldPrice: '旧価格',
  newPrice: '新価格',
  discount: '割引率',

  qty: '数量',
  currentQty: '現在庫',
  lockQty: 'ロック数量',
  beforeQty: '変更前数量',
  changeQty: '変更数量',
  afterQty: '変更後数量',

  customer: '顧客',
  customerId: '顧客ID',
  customerName: '顧客名',

  goods: '商品',
  goodsId: '商品ID',
  goodsName: '商品名',

  brandId: 'ブランドID',
  brandName: 'ブランド名',

  seriesId: 'シリーズID',
  seriesName: 'シリーズ名',

  categoryId: 'カテゴリID',
  categoryName: 'カテゴリ名',

  makerId: 'メーカーID',
  makerName: 'メーカー名',

  warehouseId: '倉庫ID',

  orderId: '注文ID',
  orderNo: '注文番号',

  userId: 'ユーザーID',

  requesterId: '申請者ID',
  requesterName: '申請者',

  operatorId: '操作担当ID',
  operatorName: '操作担当',

  approverId: '承認者ID',
  approverName: '承認者',

  bizNo: '業務番号',

  type: 'タイプ',
  state: '状態',
};

/**
 * 自动把 camelCase 转成 日文（智能拆词）
 */
const splitWords = (name: string): string[] => {
  return name.replace(/([A-Z])/g, ' $1').split(' ');
};

/**
 * 自动生成 label（核心逻辑）
 */
const generateLabel = (fieldName: string): string => {
  // 1️⃣ 完整匹配优先
  if (FIELD_NAME_MAP[fieldName]) {
    return FIELD_NAME_MAP[fieldName];
  }

  // 2️⃣ 拆词匹配
  const words = splitWords(fieldName);

  const result = words.map((word) => {
    const lower = word.charAt(0).toLowerCase() + word.slice(1);
    return FIELD_NAME_MAP[lower] || word;
  });

  return result.join('');
};

/**
 * ✅ 一键生成
 */
export const CRUD_COLUMN_LABELS: Record<
  string,
  Record<string, string>
> = CRUD_MODULES.reduce(
  (acc, module) => {
    const fieldMap: Record<string, string> = {};

    module.fields.forEach((field) => {
      fieldMap[field.name] = generateLabel(field.name);
    });

    acc[module.resource] = fieldMap;

    return acc;
  },
  {} as Record<string, Record<string, string>>,
);
