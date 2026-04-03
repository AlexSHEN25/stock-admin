import type { CrudField } from './crudModules';

export interface CrudResourceSchema {
  tableFields: CrudField[];
  searchFields: CrudField[];
}

export const CRUD_RESOURCE_SCHEMA_MAP: Record<string, CrudResourceSchema> = {
  brand: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'image',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'image',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  series: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  maker: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  goodsType: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  goods: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'status',
        type: 'Integer',
      },
      {
        name: 'newPrice',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'images',
        type: 'String',
      },
      {
        name: 'description',
        type: 'String',
      },
      {
        name: 'isHot',
        type: 'Integer',
      },
      {
        name: 'version',
        type: 'Long',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'status',
        type: 'Integer',
      },
      {
        name: 'newPrice',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'images',
        type: 'String',
      },
      {
        name: 'description',
        type: 'String',
      },
      {
        name: 'isHot',
        type: 'Integer',
      },
      {
        name: 'version',
        type: 'Long',
      },
    ],
  },
  warehouse: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'address',
        type: 'String',
      },
      {
        name: 'managerId',
        type: 'Long',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'address',
        type: 'String',
      },
      {
        name: 'managerId',
        type: 'Long',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  customerLevel: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  customer: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'customerCode',
        type: 'String',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'contactPerson',
        type: 'String',
      },
      {
        name: 'phone',
        type: 'String',
      },
      {
        name: 'email',
        type: 'String',
      },
      {
        name: 'country',
        type: 'String',
      },
      {
        name: 'city',
        type: 'String',
      },
      {
        name: 'address',
        type: 'String',
      },
      {
        name: 'levelId',
        type: 'Integer',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'customerCode',
        type: 'String',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'contactPerson',
        type: 'String',
      },
      {
        name: 'phone',
        type: 'String',
      },
      {
        name: 'email',
        type: 'String',
      },
      {
        name: 'country',
        type: 'String',
      },
      {
        name: 'city',
        type: 'String',
      },
      {
        name: 'address',
        type: 'String',
      },
      {
        name: 'levelId',
        type: 'Integer',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  dept: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'parentId',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'leaderId',
        type: 'Long',
      },
      {
        name: 'sort',
        type: 'Integer',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'parentId',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'leaderId',
        type: 'Long',
      },
      {
        name: 'sort',
        type: 'Integer',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  stock: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'currentQty',
        type: 'Integer',
      },
      {
        name: 'lockQty',
        type: 'Integer',
      },
      {
        name: 'availableQty',
        type: 'Integer',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  stockRecord: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'bizNo',
        type: 'String',
      },
      {
        name: 'orderId',
        type: 'Long',
      },
      {
        name: 'orderItemId',
        type: 'Long',
      },
      {
        name: 'stockId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'beforeQty',
        type: 'Integer',
      },
      {
        name: 'changeQty',
        type: 'Integer',
      },
      {
        name: 'afterQty',
        type: 'Integer',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'sourceType',
        type: 'Integer',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'customerId',
        type: 'Long',
      },
      {
        name: 'customerName',
        type: 'String',
      },
      {
        name: 'requesterId',
        type: 'Long',
      },
      {
        name: 'requesterName',
        type: 'String',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'bizNo',
        type: 'String',
      },
      {
        name: 'orderId',
        type: 'Long',
      },
      {
        name: 'orderItemId',
        type: 'Long',
      },
      {
        name: 'stockId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'beforeQty',
        type: 'Integer',
      },
      {
        name: 'changeQty',
        type: 'Integer',
      },
      {
        name: 'afterQty',
        type: 'Integer',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'sourceType',
        type: 'Integer',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'customerId',
        type: 'Long',
      },
      {
        name: 'customerName',
        type: 'String',
      },
      {
        name: 'requesterId',
        type: 'Long',
      },
      {
        name: 'requesterName',
        type: 'String',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
  },
  stockOrder: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'orderNo',
        type: 'String',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'sourceType',
        type: 'Integer',
      },
      {
        name: 'sourceId',
        type: 'Long',
      },
      {
        name: 'totalQty',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
      {
        name: 'requesterId',
        type: 'Long',
      },
      {
        name: 'requesterName',
        type: 'String',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'approverId',
        type: 'Long',
      },
      {
        name: 'approverName',
        type: 'String',
      },
      {
        name: 'approveTime',
        type: 'LocalDateTime',
      },
      {
        name: 'finishTime',
        type: 'LocalDateTime',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'orderNo',
        type: 'String',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'sourceType',
        type: 'Integer',
      },
      {
        name: 'sourceId',
        type: 'Long',
      },
      {
        name: 'totalQty',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
      {
        name: 'requesterId',
        type: 'Long',
      },
      {
        name: 'requesterName',
        type: 'String',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'approverId',
        type: 'Long',
      },
      {
        name: 'approverName',
        type: 'String',
      },
      {
        name: 'approveTime',
        type: 'LocalDateTime',
      },
      {
        name: 'finishTime',
        type: 'LocalDateTime',
      },
    ],
  },
  stockOrderItem: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'orderId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'beforeQty',
        type: 'Integer',
      },
      {
        name: 'changeQty',
        type: 'Integer',
      },
      {
        name: 'afterQty',
        type: 'Integer',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'orderId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'beforeQty',
        type: 'Integer',
      },
      {
        name: 'changeQty',
        type: 'Integer',
      },
      {
        name: 'afterQty',
        type: 'Integer',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
  },
  priceRecord: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'oldPrice',
        type: 'BigDecimal',
      },
      {
        name: 'newPrice',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'oldPrice',
        type: 'BigDecimal',
      },
      {
        name: 'newPrice',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'priceUpdateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'operatorId',
        type: 'Long',
      },
      {
        name: 'operatorName',
        type: 'String',
      },
    ],
  },
  requestForm: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'bizNo',
        type: 'String',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'deptId',
        type: 'Long',
      },
      {
        name: 'deptName',
        type: 'String',
      },
      {
        name: 'customerId',
        type: 'Long',
      },
      {
        name: 'customerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'totalQty',
        type: 'Integer',
      },
      {
        name: 'requestQty',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
      {
        name: 'approverId',
        type: 'Long',
      },
      {
        name: 'approveName',
        type: 'String',
      },
      {
        name: 'approveTime',
        type: 'LocalDateTime',
      },
      {
        name: 'approveRemark',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'bizNo',
        type: 'String',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'deptId',
        type: 'Long',
      },
      {
        name: 'deptName',
        type: 'String',
      },
      {
        name: 'customerId',
        type: 'Long',
      },
      {
        name: 'customerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'totalQty',
        type: 'Integer',
      },
      {
        name: 'requestQty',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
      {
        name: 'approverId',
        type: 'Long',
      },
      {
        name: 'approveName',
        type: 'String',
      },
      {
        name: 'approveTime',
        type: 'LocalDateTime',
      },
      {
        name: 'approveRemark',
        type: 'String',
      },
    ],
  },
  requestItem: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'requestId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'requestQty',
        type: 'Integer',
      },
      {
        name: 'approveQty',
        type: 'Integer',
      },
      {
        name: 'outQty',
        type: 'Integer',
      },
      {
        name: 'stockRecordId',
        type: 'Long',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'requestId',
        type: 'Long',
      },
      {
        name: 'goodsId',
        type: 'Long',
      },
      {
        name: 'sku',
        type: 'String',
      },
      {
        name: 'goodsName',
        type: 'String',
      },
      {
        name: 'englishName',
        type: 'String',
      },
      {
        name: 'brandId',
        type: 'Long',
      },
      {
        name: 'brandName',
        type: 'String',
      },
      {
        name: 'seriesId',
        type: 'Long',
      },
      {
        name: 'seriesName',
        type: 'String',
      },
      {
        name: 'typeId',
        type: 'Long',
      },
      {
        name: 'typeName',
        type: 'String',
      },
      {
        name: 'makerId',
        type: 'Long',
      },
      {
        name: 'makerName',
        type: 'String',
      },
      {
        name: 'warehouseId',
        type: 'Long',
      },
      {
        name: 'price',
        type: 'BigDecimal',
      },
      {
        name: 'discount',
        type: 'BigDecimal',
      },
      {
        name: 'requestQty',
        type: 'Integer',
      },
      {
        name: 'approveQty',
        type: 'Integer',
      },
      {
        name: 'outQty',
        type: 'Integer',
      },
      {
        name: 'stockRecordId',
        type: 'Long',
      },
      {
        name: 'remark',
        type: 'String',
      },
    ],
  },
  message: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'message',
        type: 'String',
      },
      {
        name: 'sourceId',
        type: 'Long',
      },
      {
        name: 'isRead',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'message',
        type: 'String',
      },
      {
        name: 'sourceId',
        type: 'Long',
      },
      {
        name: 'isRead',
        type: 'Integer',
      },
      {
        name: 'state',
        type: 'Integer',
      },
    ],
  },
  user: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'deptId',
        type: 'Long',
      },
      {
        name: 'deptName',
        type: 'String',
      },
      {
        name: 'email',
        type: 'String',
      },
      {
        name: 'phone',
        type: 'String',
      },
      {
        name: 'avatar',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'deptId',
        type: 'Long',
      },
      {
        name: 'email',
        type: 'String',
      },
      {
        name: 'phone',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  role: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'remark',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  permission: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'module',
        type: 'String',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'parentId',
        type: 'Long',
      },
      {
        name: 'path',
        type: 'String',
      },
      {
        name: 'sort',
        type: 'Integer',
      },
      {
        name: 'icon',
        type: 'String',
      },
      {
        name: 'component',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'code',
        type: 'String',
      },
      {
        name: 'module',
        type: 'String',
      },
      {
        name: 'type',
        type: 'Integer',
      },
      {
        name: 'parentId',
        type: 'Long',
      },
      {
        name: 'path',
        type: 'String',
      },
      {
        name: 'sort',
        type: 'Integer',
      },
      {
        name: 'icon',
        type: 'String',
      },
      {
        name: 'component',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  userRole: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'roleId',
        type: 'Long',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'roleId',
        type: 'Long',
      },
    ],
  },
  rolePermission: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'roleId',
        type: 'Long',
      },
      {
        name: 'permissionId',
        type: 'Long',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'roleId',
        type: 'Long',
      },
      {
        name: 'permissionId',
        type: 'Long',
      },
    ],
  },
  userToken: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'token',
        type: 'String',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'loginTime',
        type: 'LocalDateTime',
      },
      {
        name: 'expireTime',
        type: 'LocalDateTime',
      },
      {
        name: 'loginIp',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'token',
        type: 'String',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'loginTime',
        type: 'LocalDateTime',
      },
      {
        name: 'expireTime',
        type: 'LocalDateTime',
      },
      {
        name: 'loginIp',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
    ],
  },
  config: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'group',
        type: 'String',
      },
      {
        name: 'title',
        type: 'String',
      },
      {
        name: 'tip',
        type: 'String',
      },
      {
        name: 'type',
        type: 'String',
      },
      {
        name: 'value',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'name',
        type: 'String',
      },
      {
        name: 'group',
        type: 'String',
      },
      {
        name: 'title',
        type: 'String',
      },
      {
        name: 'tip',
        type: 'String',
      },
      {
        name: 'type',
        type: 'String',
      },
      {
        name: 'value',
        type: 'String',
      },
      {
        name: 'content',
        type: 'String',
      },
    ],
  },
  operateLog: {
    tableFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'createTime',
        type: 'LocalDateTime',
      },
      {
        name: 'updateTime',
        type: 'LocalDateTime',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'module',
        type: 'String',
      },
      {
        name: 'operation',
        type: 'String',
      },
      {
        name: 'method',
        type: 'String',
      },
      {
        name: 'requestUrl',
        type: 'String',
      },
      {
        name: 'requestIp',
        type: 'String',
      },
      {
        name: 'requestParam',
        type: 'String',
      },
      {
        name: 'responseData',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
      {
        name: 'errorMsg',
        type: 'String',
      },
      {
        name: 'costTime',
        type: 'Integer',
      },
    ],
    searchFields: [
      {
        name: 'id',
        type: 'Long',
      },
      {
        name: 'userId',
        type: 'Long',
      },
      {
        name: 'username',
        type: 'String',
      },
      {
        name: 'module',
        type: 'String',
      },
      {
        name: 'operation',
        type: 'String',
      },
      {
        name: 'method',
        type: 'String',
      },
      {
        name: 'requestUrl',
        type: 'String',
      },
      {
        name: 'requestIp',
        type: 'String',
      },
      {
        name: 'requestParam',
        type: 'String',
      },
      {
        name: 'responseData',
        type: 'String',
      },
      {
        name: 'status',
        type: 'Integer',
      },
      {
        name: 'errorMsg',
        type: 'String',
      },
      {
        name: 'costTime',
        type: 'Integer',
      },
    ],
  },
};
