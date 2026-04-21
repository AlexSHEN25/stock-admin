export interface BaseVO {
  id?: number;
  createTime?: string;
  updateTime?: string;
}

export interface BrandMakerRelationVO extends BaseVO {
  brandId?: number;
  makerId?: number;
}

export interface BrandVO extends BaseVO {
  name?: string;
  englishName?: string;
  image?: string;
  content?: string;
  status?: number;
}

export interface CategoryVO extends BaseVO {
  name?: string;
  status?: number;
}

export interface ConfigVO extends BaseVO {
  name?: string;
  group?: string;
  title?: string;
  tip?: string;
  type?: string;
  value?: string;
  content?: string;
}

export interface CustomerLevelVO extends BaseVO {
  name?: string;
  discount?: number;
  remark?: string;
  status?: number;
}

export interface CustomerVO extends BaseVO {
  customerCode?: string;
  name?: string;
  englishName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  levelId?: number;
  ownerUserId?: number;
  ownerDeptId?: number;
  remark?: string;
  status?: number;
}

export interface DeptVO extends BaseVO {
  parentId?: number;
  name?: string;
  code?: string;
  leaderId?: number;
  sort?: number;
  status?: number;
}

export interface GoodsImageVO extends BaseVO {
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  imageUrl?: string;
  sort?: number;
}

export interface GoodsLevelPriceVO extends BaseVO {
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  levelId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  effectiveTime?: string;
  expireTime?: string;
  status?: number;
}

export interface GoodsSkuSpecVO extends BaseVO {
  skuId?: number;
  skuCode?: string;
  specId?: number;
  specName?: string;
  specValue?: string;
  sort?: number;
}

export interface GoodsSkuVO extends BaseVO {
  goodsId?: number;
  skuCode?: string;
  skuName?: string;
  price?: number;
  currency?: string;
  costPrice?: number;
  updatePrice?: number;
  priceUpdateTime?: string;
  barcode?: string;
  weight?: number;
  volume?: number;
  status?: number;
}

export interface CategoryVO extends BaseVO {
  name?: string;
  status?: number;
}

export interface GoodsVO extends BaseVO {
  name?: string;
  englishName?: string;
  skuCode?: string;
  seriesId?: number;
  brandId?: number;
  typeId?: number;
  makerId?: number;
  price?: number;
  discount?: number;
  newPrice?: number;
  priceUpdateTime?: string;
  images?: string;
  description?: string;
  isHot?: number;
  status?: number;
}

export interface LoginVO extends BaseVO {
  token?: string;
  userId?: number;
  username?: string;
}

export interface LogoutVO extends BaseVO {
  success?: boolean;
  userId?: number;
}

export interface MakerVO extends BaseVO {
  name?: string;
  status?: number;
}

export interface MessageVO extends BaseVO {
  type?: number;
  userId?: number;
  message?: string;
  sourceId?: number;
  isRead?: number;
  state?: number;
}

export interface OperateLogVO extends BaseVO {
  userId?: number;
  username?: string;
  module?: string;
  operation?: string;
  method?: string;
  requestUrl?: string;
  requestIp?: string;
  requestParam?: string;
  responseData?: string;
  status?: number;
  errorMsg?: string;
  costTime?: number;
}

export interface PermissionVO extends BaseVO {
  name?: string;
  code?: string;
  module?: string;
  type?: number;
  parentId?: number;
  path?: string;
  sort?: number;
  icon?: string;
  component?: string;
  status?: number;
}

export interface PriceRecordVO extends BaseVO {
  goodsId?: number;
  goodsName?: string;
  englishName?: string;
  skuId?: number;
  skuCode?: string;
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  discount?: number;
  priceUpdateTime?: string;
  operatorId?: number;
  operatorName?: string;
}

export interface RequestFormVO extends BaseVO {
  bizNo?: string;
  userId?: number;
  username?: string;
  deptId?: number;
  deptName?: string;
  customerId?: number;
  customerName?: string;
  warehouseId?: number;
  totalQty?: number;
  requestQty?: number;
  state?: number;
  approverId?: number;
  approveName?: string;
  approveTime?: string;
  approveRemark?: string;
}

export interface RequestItemVO extends BaseVO {
  requestId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  requestQty?: number;
  approveQty?: number;
  outQty?: number;
  stockRecordId?: number;
  remark?: string;
}

export interface RolePermissionVO extends BaseVO {
  roleId?: number;
  permissionId?: number;
}

export interface RoleVO extends BaseVO {
  name?: string;
  code?: string;
  remark?: string;
  status?: number;
}

export interface SeriesVO extends BaseVO {
  name?: string;
  englishName?: string;
  content?: string;
  status?: number;
}

export interface StockOrderItemVO extends BaseVO {
  orderId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  price?: number;
  currency?: string;
  remark?: string;
}

export interface StockOrderVO extends BaseVO {
  orderNo?: string;
  type?: number;
  typeId?: number;
  warehouseId?: number;
  sourceType?: number;
  sourceId?: number;
  totalQty?: number;
  state?: number;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  version?: number;
  finishTime?: string;
}

export interface StockPageVO extends BaseVO {
  goodsId?: number;
  goodsName?: string;
  skuId?: number;
  skuCode?: string;
  typeId?: number;
  warehouseId?: number;
  currentQty?: number;
  lockQty?: number;
  availableQty?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  status?: number;
}

export interface StockRecordVO extends BaseVO {
  bizNo?: string;
  orderId?: number;
  orderItemId?: number;
  stockId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  type?: number;
  sourceType?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  customerId?: number;
  customerName?: string;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

export interface StockVO extends BaseVO {
  goodsId?: number;
  goodsName?: string;
  skuId?: number;
  skuCode?: string;
  typeId?: number;
  warehouseId?: number;
  currentQty?: number;
  lockQty?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  status?: number;
  version?: number;
}

export interface UserRoleVO extends BaseVO {
  userId?: number;
  roleId?: number;
}

export interface UserTokenVO extends BaseVO {
  token?: string;
  userId?: number;
  loginTime?: string;
  expireTime?: string;
  loginIp?: string;
  status?: number;
}

export interface UserVO extends BaseVO {
  username?: string;
  deptId?: number;
  deptName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
}

export interface WarehouseVO extends BaseVO {
  name?: string;
  code?: string;
  address?: string;
  managerId?: number;
  status?: number;
}

export interface CreateBrandDTO {
  name?: string;
  englishName?: string;
  image?: string;
  content?: string;
  status?: number;
}

export interface CreateBrandMakerRelationDTO {
  brandId?: number;
  makerId?: number;
}

export interface CreateCategoryDTO {
  name?: string;
  status?: number;
}

export interface CreateConfigDTO {
  name?: string;
  group?: string;
  title?: string;
  tip?: string;
  type?: string;
  value?: string;
  content?: string;
}

export interface CreateCustomerDTO {
  customerCode?: string;
  name?: string;
  englishName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  levelId?: number;
  ownerUserId?: number;
  ownerDeptId?: number;
  remark?: string;
  status?: number;
}

export interface CreateCustomerLevelDTO {
  name?: string;
  discount?: number;
  remark?: string;
  status?: number;
}

export interface CreateDeptDTO {
  parentId?: number;
  name?: string;
  code?: string;
  leaderId?: number;
  sort?: number;
  status?: number;
}

export interface CreateGoodsDTO {
  name?: string;
  englishName?: string;
  skuCode?: string;
  seriesId?: number;
  brandId?: number;
  typeId?: number;
  makerId?: number;
  price?: number;
  discount?: number;
  status?: number;
  newPrice?: number;
  priceUpdateTime?: string;
  images?: string;
  description?: string;
  isHot?: number;
  version?: number;
}

export interface CreateGoodsImageDTO {
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  imageUrl?: string;
  sort?: number;
}

export interface CreateGoodsLevelPriceDTO {
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  levelId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  effectiveTime?: string;
  expireTime?: string;
  status?: number;
}

export interface CreateGoodsSkuDTO {
  goodsId?: number;
  skuCode?: string;
  skuName?: string;
  price?: number;
  currency?: string;
  costPrice?: number;
  updatePrice?: number;
  priceUpdateTime?: string;
  barcode?: string;
  weight?: number;
  volume?: number;
  status?: number;
}

export interface CreateGoodsSkuSpecDTO {
  skuId?: number;
  skuCode?: string;
  specId?: number;
  specName?: string;
  specValue?: string;
  sort?: number;
}

export interface CreateCategoryDTO {
  name?: string;
  status?: number;
}

export interface CreateMakerDTO {
  name?: string;
  status?: number;
}

export interface CreateMessageDTO {
  type?: number;
  userId?: number;
  message?: string;
  sourceId?: number;
  isRead?: number;
  state?: number;
}

export interface CreateOperateLogDTO {
  userId?: number;
  username?: string;
  module?: string;
  operation?: string;
  method?: string;
  requestUrl?: string;
  requestIp?: string;
  requestParam?: string;
  responseData?: string;
  status?: number;
  errorMsg?: string;
  costTime?: number;
}

export interface CreatePermissionDTO {
  name?: string;
  code?: string;
  module?: string;
  type?: number;
  parentId?: number;
  path?: string;
  sort?: number;
  icon?: string;
  component?: string;
  status?: number;
}

export interface CreatePriceRecordDTO {
  goodsId?: number;
  goodsName?: string;
  englishName?: string;
  skuId?: number;
  skuCode?: string;
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  discount?: number;
  priceUpdateTime?: string;
  operatorId?: number;
  operatorName?: string;
}

export interface CreateRequestFormDTO {
  bizNo?: string;
  userId?: number;
  username?: string;
  deptId?: number;
  deptName?: string;
  customerId?: number;
  customerName?: string;
  warehouseId?: number;
  totalQty?: number;
  requestQty?: number;
  state?: number;
  approverId?: number;
  approveName?: string;
  approveTime?: string;
  approveRemark?: string;
}

export interface CreateRequestItemDTO {
  requestId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  requestQty?: number;
  approveQty?: number;
  outQty?: number;
  stockRecordId?: number;
  remark?: string;
}

export interface CreateRoleDTO {
  name?: string;
  code?: string;
  remark?: string;
  status?: number;
}

export interface CreateRolePermissionDTO {
  roleId?: number;
  permissionId?: number;
}

export interface CreateSeriesDTO {
  name?: string;
  englishName?: string;
  content?: string;
  status?: number;
}

export interface CreateStockDTO {
  goodsId?: number;
  goodsName?: string;
  skuId?: number;
  skuCode?: string;
  typeId?: number;
  warehouseId?: number;
  currentQty?: number;
  lockQty?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  status?: number;
  version?: number;
}

export interface CreateStockOrderDTO {
  orderNo?: string;
  type?: number;
  typeId?: number;
  warehouseId?: number;
  sourceType?: number;
  sourceId?: number;
  totalQty?: number;
  state?: number;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  version?: number;
  finishTime?: string;
}

export interface CreateStockOrderItemDTO {
  orderId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  price?: number;
  currency?: string;
  remark?: string;
}

export interface CreateStockRecordDTO {
  bizNo?: string;
  orderId?: number;
  orderItemId?: number;
  stockId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  type?: number;
  sourceType?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  customerId?: number;
  customerName?: string;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

export interface CreateUserDTO {
  username?: string;
  deptId?: number;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface CreateUserRoleDTO {
  userId?: number;
  roleId?: number;
}

export interface CreateUserTokenDTO {
  token?: string;
  userId?: number;
  loginTime?: string;
  expireTime?: string;
  loginIp?: string;
  status?: number;
}

export interface CreateWarehouseDTO {
  name?: string;
  code?: string;
  address?: string;
  managerId?: number;
  status?: number;
}

export interface BrandMakerRelationQueryDTO {
  id?: number;
  brandId?: number;
  makerId?: number;
}

export interface BrandQueryDTO {
  id?: number;
  name?: string;
  englishName?: string;
  image?: string;
  content?: string;
  status?: number;
}

export interface CategoryQueryDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface ConfigQueryDTO {
  id?: number;
  name?: string;
  group?: string;
  title?: string;
  tip?: string;
  type?: string;
  value?: string;
  content?: string;
}

export interface CustomerLevelQueryDTO {
  id?: number;
  name?: string;
  discount?: number;
  remark?: string;
  status?: number;
}

export interface CustomerQueryDTO {
  id?: number;
  customerCode?: string;
  name?: string;
  englishName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  levelId?: number;
  ownerUserId?: number;
  ownerDeptId?: number;
  remark?: string;
  status?: number;
}

export interface DeptQueryDTO {
  id?: number;
  parentId?: number;
  name?: string;
  code?: string;
  leaderId?: number;
  sort?: number;
  status?: number;
}

export interface GoodsImageQueryDTO {
  id?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  imageUrl?: string;
  sort?: number;
}

export interface GoodsLevelPriceQueryDTO {
  id?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  levelId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  effectiveTime?: string;
  expireTime?: string;
  status?: number;
}

export interface GoodsQueryDTO {
  id?: number;
  name?: string;
  englishName?: string;
  skuCode?: string;
  seriesId?: number;
  brandId?: number;
  typeId?: number;
  makerId?: number;
  price?: number;
  discount?: number;
  status?: number;
  newPrice?: number;
  priceUpdateTime?: string;
  images?: string;
  description?: string;
  isHot?: number;
  version?: number;
}

export interface GoodsSkuQueryDTO {
  id?: number;
  goodsId?: number;
  skuCode?: string;
  skuName?: string;
  price?: number;
  currency?: string;
  costPrice?: number;
  updatePrice?: number;
  priceUpdateTime?: string;
  barcode?: string;
  weight?: number;
  volume?: number;
  status?: number;
}

export interface GoodsSkuSpecQueryDTO {
  id?: number;
  skuId?: number;
  skuCode?: string;
  specId?: number;
  specName?: string;
  specValue?: string;
  sort?: number;
}

export interface CategoryQueryDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface MakerQueryDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface MessageQueryDTO {
  id?: number;
  type?: number;
  userId?: number;
  message?: string;
  sourceId?: number;
  isRead?: number;
  state?: number;
}

export interface OperateLogQueryDTO {
  id?: number;
  userId?: number;
  username?: string;
  module?: string;
  operation?: string;
  method?: string;
  requestUrl?: string;
  requestIp?: string;
  requestParam?: string;
  responseData?: string;
  status?: number;
  errorMsg?: string;
  costTime?: number;
}

export interface PermissionQueryDTO {
  id?: number;
  name?: string;
  code?: string;
  module?: string;
  type?: number;
  parentId?: number;
  path?: string;
  sort?: number;
  icon?: string;
  component?: string;
  status?: number;
}

export interface PriceRecordQueryDTO {
  id?: number;
  goodsId?: number;
  goodsName?: string;
  englishName?: string;
  skuId?: number;
  skuCode?: string;
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  discount?: number;
  priceUpdateTime?: string;
  operatorId?: number;
  operatorName?: string;
}

export interface RequestFormQueryDTO {
  id?: number;
  bizNo?: string;
  userId?: number;
  username?: string;
  deptId?: number;
  deptName?: string;
  customerId?: number;
  customerName?: string;
  warehouseId?: number;
  totalQty?: number;
  requestQty?: number;
  state?: number;
  approverId?: number;
  approveName?: string;
  approveTime?: string;
  approveRemark?: string;
}

export interface RequestItemQueryDTO {
  id?: number;
  requestId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  requestQty?: number;
  approveQty?: number;
  outQty?: number;
  stockRecordId?: number;
  remark?: string;
}

export interface RolePermissionQueryDTO {
  id?: number;
  roleId?: number;
  permissionId?: number;
}

export interface RoleQueryDTO {
  id?: number;
  name?: string;
  code?: string;
  remark?: string;
  status?: number;
}

export interface SeriesQueryDTO {
  id?: number;
  name?: string;
  englishName?: string;
  content?: string;
  status?: number;
}

export interface StockOrderItemQueryDTO {
  id?: number;
  orderId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  price?: number;
  currency?: string;
  remark?: string;
}

export interface StockOrderQueryDTO {
  id?: number;
  orderNo?: string;
  type?: number;
  typeId?: number;
  warehouseId?: number;
  sourceType?: number;
  sourceId?: number;
  totalQty?: number;
  state?: number;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  version?: number;
  finishTime?: string;
}

export interface StockQueryDTO {
  goodsName?: string;
  skuCode?: string;
  skuId?: number;
  typeId?: number;
  currency?: string;
  warehouseId?: number;
  status?: number;
}

export interface StockRecordQueryDTO {
  id?: number;
  bizNo?: string;
  orderId?: number;
  orderItemId?: number;
  stockId?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  sourceType?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  customerId?: number;
  customerName?: string;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

export interface UserQueryDTO {
  username?: string;
  deptId?: number;
  email?: string;
  phone?: string;
  status?: number;
}

export interface UserRoleQueryDTO {
  id?: number;
  userId?: number;
  roleId?: number;
}

export interface UserTokenQueryDTO {
  id?: number;
  token?: string;
  userId?: number;
  loginTime?: string;
  expireTime?: string;
  loginIp?: string;
  status?: number;
}

export interface WarehouseQueryDTO {
  id?: number;
  name?: string;
  code?: string;
  address?: string;
  managerId?: number;
  status?: number;
}

export interface UpdateBrandDTO {
  id?: number;
  name?: string;
  englishName?: string;
  image?: string;
  content?: string;
  status?: number;
}

export interface UpdateBrandMakerRelationDTO {
  id?: number;
  brandId?: number;
  makerId?: number;
}

export interface UpdateCategoryDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface UpdateConfigDTO {
  id?: number;
  name?: string;
  group?: string;
  title?: string;
  tip?: string;
  type?: string;
  value?: string;
  content?: string;
}

export interface UpdateCustomerDTO {
  id?: number;
  customerCode?: string;
  name?: string;
  englishName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  address?: string;
  levelId?: number;
  ownerUserId?: number;
  ownerDeptId?: number;
  remark?: string;
  status?: number;
}

export interface UpdateCustomerLevelDTO {
  id?: number;
  name?: string;
  discount?: number;
  remark?: string;
  status?: number;
}

export interface UpdateDeptDTO {
  id?: number;
  parentId?: number;
  name?: string;
  code?: string;
  leaderId?: number;
  sort?: number;
  status?: number;
}

export interface UpdateGoodsDTO {
  id?: number;
  name?: string;
  englishName?: string;
  skuCode?: string;
  seriesId?: number;
  brandId?: number;
  typeId?: number;
  makerId?: number;
  price?: number;
  discount?: number;
  status?: number;
  newPrice?: number;
  priceUpdateTime?: string;
  images?: string;
  description?: string;
  isHot?: number;
  version?: number;
}

export interface UpdateGoodsImageDTO {
  id?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  imageUrl?: string;
  sort?: number;
}

export interface UpdateGoodsLevelPriceDTO {
  id?: number;
  goodsId?: number;
  skuId?: number;
  skuCode?: string;
  levelId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  effectiveTime?: string;
  expireTime?: string;
  status?: number;
}

export interface UpdateGoodsSkuDTO {
  id?: number;
  goodsId?: number;
  skuCode?: string;
  skuName?: string;
  price?: number;
  currency?: string;
  costPrice?: number;
  updatePrice?: number;
  priceUpdateTime?: string;
  barcode?: string;
  weight?: number;
  volume?: number;
  status?: number;
}

export interface UpdateGoodsSkuSpecDTO {
  id?: number;
  skuId?: number;
  skuCode?: string;
  specId?: number;
  specName?: string;
  specValue?: string;
  sort?: number;
}

export interface UpdateCategoryDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface UpdateMakerDTO {
  id?: number;
  name?: string;
  status?: number;
}

export interface UpdateMessageDTO {
  id?: number;
  type?: number;
  userId?: number;
  message?: string;
  sourceId?: number;
  isRead?: number;
  state?: number;
}

export interface UpdateOperateLogDTO {
  id?: number;
  userId?: number;
  username?: string;
  module?: string;
  operation?: string;
  method?: string;
  requestUrl?: string;
  requestIp?: string;
  requestParam?: string;
  responseData?: string;
  status?: number;
  errorMsg?: string;
  costTime?: number;
}

export interface UpdatePermissionDTO {
  id?: number;
  name?: string;
  code?: string;
  module?: string;
  type?: number;
  parentId?: number;
  path?: string;
  sort?: number;
  icon?: string;
  component?: string;
  status?: number;
}

export interface UpdatePriceRecordDTO {
  id?: number;
  goodsId?: number;
  goodsName?: string;
  englishName?: string;
  skuId?: number;
  sku?: string;
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  discount?: number;
  priceUpdateTime?: string;
  operatorId?: number;
  operatorName?: string;
}

export interface UpdateRequestFormDTO {
  id?: number;
  bizNo?: string;
  userId?: number;
  username?: string;
  deptId?: number;
  deptName?: string;
  customerId?: number;
  customerName?: string;
  warehouseId?: number;
  totalQty?: number;
  requestQty?: number;
  state?: number;
  approverId?: number;
  approveName?: string;
  approveTime?: string;
  approveRemark?: string;
}

export interface UpdateRequestItemDTO {
  id?: number;
  requestId?: number;
  goodsId?: number;
  skuId?: number;
  sku?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  requestQty?: number;
  approveQty?: number;
  outQty?: number;
  stockRecordId?: number;
  remark?: string;
}

export interface UpdateRoleDTO {
  id?: number;
  name?: string;
  code?: string;
  remark?: string;
  status?: number;
}

export interface UpdateRolePermissionDTO {
  id?: number;
  roleId?: number;
  permissionId?: number;
}

export interface UpdateSeriesDTO {
  id?: number;
  name?: string;
  englishName?: string;
  content?: string;
  status?: number;
}

export interface UpdateStockDTO {
  id?: number;
  goodsId?: number;
  goodsName?: string;
  skuId?: number;
  sku?: string;
  typeId?: number;
  warehouseId?: number;
  currentQty?: number;
  lockQty?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  status?: number;
  version?: number;
}

export interface UpdateStockOrderDTO {
  id?: number;
  orderNo?: string;
  type?: number;
  typeId?: number;
  warehouseId?: number;
  sourceType?: number;
  sourceId?: number;
  totalQty?: number;
  state?: number;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
  approverId?: number;
  approverName?: string;
  approveTime?: string;
  version?: number;
  finishTime?: string;
}

export interface UpdateStockOrderItemDTO {
  id?: number;
  orderId?: number;
  goodsId?: number;
  skuId?: number;
  sku?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  price?: number;
  currency?: string;
  remark?: string;
}

export interface UpdateStockRecordDTO {
  id?: number;
  bizNo?: string;
  orderId?: number;
  orderItemId?: number;
  stockId?: number;
  goodsId?: number;
  skuId?: number;
  sku?: string;
  goodsName?: string;
  englishName?: string;
  brandId?: number;
  brandName?: string;
  seriesId?: number;
  seriesName?: string;
  typeId?: number;
  typeName?: string;
  makerId?: number;
  makerName?: string;
  warehouseId?: number;
  beforeQty?: number;
  changeQty?: number;
  afterQty?: number;
  type?: number;
  sourceType?: number;
  price?: number;
  currency?: string;
  priceUpdateTime?: string;
  customerId?: number;
  customerName?: string;
  requesterId?: number;
  requesterName?: string;
  operatorId?: number;
  operatorName?: string;
  remark?: string;
}

export interface UpdateUserDTO {
  id?: number;
  username?: string;
  deptId?: number;
  password?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: number;
}

export interface UpdateUserRoleDTO {
  id?: number;
  userId?: number;
  roleId?: number;
}

export interface UpdateUserTokenDTO {
  id?: number;
  token?: string;
  userId?: number;
  loginTime?: string;
  expireTime?: string;
  loginIp?: string;
  status?: number;
}

export interface UpdateWarehouseDTO {
  id?: number;
  name?: string;
  code?: string;
  address?: string;
  managerId?: number;
  status?: number;
}

export interface PageResult<T> {
  total: number;
  pageNum: number;
  pageSize: number;
  records: T[];
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}
