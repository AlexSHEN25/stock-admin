<template>
  <a-card
    :class="['module-surface', { 'customer-matrix-surface': isCustomerGoodsSummary }]"
    :title="null"
    :bordered="false"
  >
    <module-search-toolbar
      :fields="visibleQueryFields"
      :query-state="queryState"
      :table-text="TABLE_TEXT"
      :module-key="props.moduleKey"
      :can-write="canWrite && !isCustomerGoodsSummary"
      :can-batch-delete="canBatchDeleteInModule()"
      :can-create="canCreateInModule()"
      :can-sheet-inbound="canOpenSheetInbound"
      :can-sheet-outbound="canOpenSheetOutbound"
      :can-export="canExportCurrentList"
      :export-loading="exportLoading"
      :can-generate-request-form="canGenerateRequestForm"
      :can-move-delivery-to-request="canMoveDeliveryToRequest"
      :can-move-request-to-delivery="canMoveRequestToDelivery"
      :request-submitting="requestFlowSubmitting"
      :goods-import-loading="goodsImportLoading"
      :selected-count="selectedRowKeys.length"
      :query-input-type="queryInputType"
      :query-options="queryOptions"
      :query-placeholder="queryPlaceholder"
      :has-active-filters="hasActiveFilters"
      @search="doSearch"
      @reload="reload"
      @reset="resetQuery"
      @batch-delete="onBatchDelete"
      @create="openCreate"
      @sheet-inbound="openBatchStockDrawer('inbound')"
      @sheet-outbound="openSheetOutboundModal"
      @export-current="exportCurrentList"
      @download-goods-template="downloadGoodsImportTemplate"
      @goods-import="importGoodsBatchFromFile"
      @read-all="onReadAllMessages"
      @generate-request-form="generateRequestForm"
      @fill-selected-qty="fillSelectedRequestFlowQty"
      @clear-selected-qty="clearSelectedRequestFlowQty"
      @move-delivery-to-request="moveSelectedDeliveryToRequest"
      @move-request-to-delivery="moveSelectedRequestToDelivery"
      @update-field="updateQueryField"
    />

    <div :class="['table-stage', { 'customer-matrix-stage': isCustomerGoodsSummary, 'excel-table-stage': isExcelEditModule }]">
      <div
        v-if="isExcelEditModule"
        class="excel-grid-hint"
      >
        <span class="excel-grid-hint-dot" />
        <span class="excel-grid-hint-text">セルをクリックして選択、ダブルクリックまたは Enter で編集できます。保存・追加・生成ボタンで一括反映します。</span>
      </div>
      <a-table
        :key="props.moduleKey"
        :class="['module-table', { 'excel-edit-table': isExcelEditModule }]"
        :row-key="getRowKey"
        :row-class-name="rowClassName"
        :columns="columns"
        :data-source="tableRows"
        :row-selection="tableRowSelection"
        :loading="loading || goodsStockLoading"
        :pagination="tablePagination"
        :scroll="tableScroll"
        :sticky="tableSticky"
        @change="onChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="canRenderExcelInlineEditor(record, column.key)">
            <module-inline-editor
              :field="column.key"
              :edit-state="editState"
              :relation-options="relationOptions"
              :is-avatar-field="isAvatarField"
              :before-avatar-upload="beforeInlineAvatarUpload"
              :inline-field="inlineField"
              :input-type="inlineInputType"
              :is-multi-relation-field="isMultiRelationField"
              :number-min-by-field="numberMinByField"
              :number-precision-by-field="numberPrecisionByField"
              :select-options="scopedSelectOptions"
              @update-field="updateInlineField"
            />
          </template>
          <template v-else-if="String(column.key) === 'skuId'">
            {{ record.skuId ?? '-' }}
          </template>
          <template v-else-if="column.key === 'mainImage' || column.key === 'image' || column.key === 'imageUrl'">
            <a-image
              v-if="resolveGoodsImageUrl(record)"
              :src="resolveGoodsImageUrl(record)"
              :width="56"
              :height="56"
              style="object-fit: cover; border-radius: 6px;"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="isAvatarField(column.key)">
            <a-image
              v-if="resolveAvatarSrc(record)"
              :src="resolveAvatarSrc(record)"
              :width="56"
              :height="56"
              style="object-fit: cover; border-radius: 6px;"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'statusDesc'">
            <a-tag :color="Number(record.status) === 1 ? 'success' : 'default'">
              {{ normalizeDisplayLabel(record.statusDesc || (Number(record.status) === 1 ? 'ON' : 'OFF')) }}
            </a-tag>
          </template>
          <template v-else-if="String(column.key) === 'inventoryStatus'">
            <a-tag :color="isActiveStatus(record.inventoryStatus ?? record.status ?? record.statusDesc) ? 'success' : 'default'">
              {{ formatInventoryStatus(record.inventoryStatus ?? record.status ?? record.statusDesc) }}
            </a-tag>
          </template>
          <template v-else-if="String(column.key) === 'isHot'">
            {{ Number(record.isHot) === 1 ? TABLE_TEXT.hotYes : TABLE_TEXT.hotNo }}
          </template>
          <template v-else-if="String(column.key) === 'changeQty'">
            {{ formatQty(record.changeQty) }}
          </template>
          <template v-else-if="String(column.key) === 'currentQty' && isSplitStockManagement">
            <div class="qty-breakdown">
              <div class="qty-breakdown-total">
                {{ formatQty(record.currentQty) }}
              </div>
              <div
                v-if="customerQtyBreakdown(record).length > 0"
                class="qty-breakdown-list"
              >
                <div
                  v-for="item in customerQtyBreakdown(record)"
                  :key="item.key"
                  class="qty-breakdown-line"
                >
                  <span class="qty-breakdown-customer">{{ item.label }}</span>
                  <span class="qty-breakdown-qty">{{ formatQty(item.qty) }}</span>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="isRequestFlowModule && String(column.key) === 'moveQty'">
            <div
              v-if="!isActiveExcelCell(record, column.key)"
              :class="['excel-display-cell', { 'excel-display-cell-selected': isSelectedExcelCell(record, column.key) }]"
              role="button"
              tabindex="0"
              title="ダブルクリックまたは Enter で編集"
              @click.stop="activateExcelCell(record, column.key)"
              @dblclick.stop="editExcelCell(record, column.key)"
              @keydown.enter.prevent.stop="editExcelCell(record, column.key)"
            >
              <span class="excel-display-value">{{ requestFlowQtyValue(record) }}</span>
              <span class="excel-edit-limit">/ {{ requestFlowMaxQty(record) || '-' }}</span>
            </div>
            <div
              v-else
              class="excel-edit-cell"
              @click.stop
            >
              <a-input-number
                :value="requestFlowQtyValue(record)"
                :min="1"
                :max="requestFlowMaxQty(record) || undefined"
                :precision="0"
                class="excel-edit-input"
                autofocus
                @update:value="(value) => updateRequestFlowQty(record, value)"
                @blur="deactivateExcelCell"
                @press-enter="deactivateExcelCell"
              />
              <span class="excel-edit-limit">
                / {{ requestFlowMaxQty(record) || '-' }}
              </span>
            </div>
          </template>
          <template v-else-if="canRenderRequestFlowDraftEditor(record, column.key)">
            <div
              class="excel-edit-cell"
              @click.stop
            >
              <a-input-number
                v-if="excelCellInputType(column.key) === 'number'"
                :value="requestFlowCellDraftValue(record, column.key)"
                :precision="numberPrecisionByField(column.key)"
                class="excel-edit-input excel-edit-input-wide"
                autofocus
                @update:value="(value) => updateRequestFlowCellDraft(record, column.key, value)"
                @blur="deactivateExcelCell"
                @press-enter="deactivateExcelCell"
              />
              <a-input
                v-else
                :value="requestFlowCellDraftValue(record, column.key)"
                class="excel-text-input"
                autofocus
                @update:value="(value) => updateRequestFlowCellDraft(record, column.key, value)"
                @focus="placeCursorAtEnd"
                @blur="deactivateExcelCell"
                @press-enter="deactivateExcelCell"
              />
            </div>
          </template>
          <template v-else-if="isEditing(record) && isExcelEditModule && column.key !== '__actions'">
            {{ normalizeDisplayLabel(cellDisplayValue(record, column.key)) }}
          </template>
          <template v-else-if="String(column.key) === 'updateTime'">
            {{ formatTime(record.updateTime) }}
          </template>
          <template v-else-if="isPermissionNamesField(column.key)">
            <div
              v-if="permissionNameList(record).length"
              class="permission-chip-list"
            >
              <a-tag
                v-for="item in permissionNameList(record)"
                :key="item"
                class="permission-chip"
              >
                {{ item }}
              </a-tag>
            </div>
            <span v-else>-</span>
          </template>
          <template v-else-if="hasEnumOptionsMerged(column.key)">
            {{ enumLabelMerged(column.key, cellDisplayValue(record, column.key)) }}
          </template>
          <template v-else-if="column.key !== '__actions'">
            {{ normalizeDisplayLabel(cellDisplayValue(record, column.key)) }}
          </template>

          <template v-else-if="column.key === '__actions'">
            <module-row-actions
              :record="record"
              :actions="rowExtraActions"
              :table-text="TABLE_TEXT"
              :can-write="canWrite"
              :can-inline-edit="canInlineEditRecord(record)"
              :can-edit="canEditRecord(record)"
              :can-delete="canDeleteRecord(record)"
              :editing="isEditing(record)"
              :show-inbound="canUseGoodsInboundActions"
              :inbound-done="isGoodsInboundDone(record)"
              :show-outbound="canUseGoodsOutboundActions"
              :can-outbound="canGoodsOutbound(record)"
              :can-show-extra-action="canShowRowExtraAction"
              @inbound="openGoodsInboundModal"
              @outbound="openGoodsOutboundModal"
              @extra-action="handleRowExtraAction"
              @inline-edit="startInlineEdit"
              @save="saveInlineEdit"
              @cancel="cancelInlineEdit"
              @edit="openEdit"
              @delete="onDelete"
            />
          </template>
        </template>
      </a-table>
    </div>

    <module-edit-modal
      v-if="!isGoodsManagement"
      :open="modalOpen"
      :can-write="canWrite"
      :fields="visibleFormKeys"
      :form-state="formState"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isFormFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="isAvatarField"
      :before-avatar-upload="beforeAvatarUpload"
      :input-type="inputType"
      :form-placeholder="formPlaceholder"
      :is-field-disabled="isFormFieldDisabled"
      :is-multi-relation-field="isMultiRelationField"
      :number-min-by-field="numberMinByField"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="scopedSelectOptions"
      @save="submit"
      @cancel="modalOpen = false"
      @update-field="updateFormField"
    />
    <module-edit-modal
      v-if="isGoodsManagement || isSplitStockManagement"
      :open="goodsInboundModalOpen"
      :can-write="true"
      :fields="GOODS_INBOUND_FIELDS"
      :form-state="goodsInboundForm"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isGoodsInboundFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="() => false"
      :before-avatar-upload="() => false"
      :input-type="goodsInboundInputType"
      :form-placeholder="() => ''"
      :is-multi-relation-field="() => false"
      :number-min-by-field="goodsInboundNumberMin"
      :number-max-by-field="() => undefined"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="goodsInboundSelectOptions"
      @save="submitGoodsInbound"
      @cancel="goodsInboundModalOpen = false"
      @update-field="updateGoodsInboundField"
    />
    <module-edit-modal
      v-if="isGoodsManagement || isSplitStockManagement"
      :open="goodsOutboundModalOpen"
      :can-write="true"
      :fields="visibleGoodsOutboundFields"
      :form-state="goodsOutboundForm"
      :relation-options="relationOptions"
      :table-text="TABLE_TEXT"
      :is-required="isGoodsOutboundFieldRequired"
      :normalize-title="normalizeTitle"
      :is-avatar-field="() => false"
      :before-avatar-upload="() => false"
      :input-type="goodsOutboundInputType"
      :form-placeholder="goodsOutboundPlaceholder"
      :is-multi-relation-field="() => false"
      :number-min-by-field="goodsOutboundNumberMin"
      :number-max-by-field="goodsOutboundNumberMax"
      :number-precision-by-field="numberPrecisionByField"
      :select-options="goodsOutboundSelectOptions"
      @save="submitGoodsOutbound"
      @cancel="goodsOutboundModalOpen = false"
      @update-field="updateGoodsOutboundField"
    />
    <stock-sheet-flow-modal
      v-if="sheetOutboundModalOpen"
      :open="sheetOutboundModalOpen"
      :mode="sheetFlowMode"
      :allow-group-outbound="canUseGroupAllocation"
      :rows="sheetOutboundRows"
      :drafts="sheetOutboundDrafts"
      :settings="sheetOutboundSettings"
      :relation-options="relationOptions"
      :submitting="sheetOutboundSubmitting"
      :row-key="goodsRowKey"
      :active-row-key="sheetOutboundActiveRowKey"
      @cancel="sheetOutboundModalOpen = false"
      @submit="submitSheetFlow"
      @update-draft="updateSheetOutboundDraft"
      @update-setting="updateSheetOutboundSetting"
      @add-customer-allocation="addCustomerAllocation"
      @update-customer-allocation="updateCustomerAllocation"
      @remove-customer-allocation="removeCustomerAllocation"
    />
    <goods-batch-stock-drawer
      v-if="batchStockDrawerOpen"
      :open="batchStockDrawerOpen"
      :mode="batchStockMode"
      :rows="batchStockRows"
      :loading="batchStockLoading"
      :pagination="batchStockPaginationConfig"
      :selected-keys="batchStockSelectedKeys"
      :drafts="batchStockDrafts"
      :settings="batchStockSettings"
      :row-key="goodsRowKey"
      :source-type-options="stockSourceTypeOptions"
      :warehouse-options="relationOptions.warehouseId || []"
      :stock-type-options="relationOptions.stockTypeId || []"
      :limit-quantity-to-current="isGroupBatchInbound"
      :submitting="batchStockSubmitting"
      @cancel="batchStockDrawerOpen = false"
      @submit="submitBatchStockFlow"
      @page-change="loadBatchStockGoodsPage"
      @update-draft="updateBatchStockDraft"
      @update-setting="updateBatchStockSetting"
      @update-selected-keys="updateBatchStockSelectedKeys"
    />
    <goods-drawer
      :open="goodsDrawerOpen"
      :title="goodsDrawerTitle"
      :loading="goodsDrawerLoading || goodsDetailLoading"
      :saving="goodsDetailSaving"
      :mode="goodsDrawerMode"
      :form="goodsForm"
      :relation-options="relationOptions"
      :hot-options="hotOptions"
      :table-text="TABLE_TEXT"
      :select-options="scopedSelectOptions"
      :resolve-image-url="resolveGoodsImageUrl"
      @cancel="closeGoodsDrawer"
      @save="saveGoodsDrawer"
      @upload-image="beforeGoodsImageUpload"
      @update-field="updateGoodsFormField"
    />
  </a-card>
</template>

<script setup>
import { computed, h, reactive, ref, toRef, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  fetchEnumOptions,
  fetchPage,
  fetchItem,
  fetchOutboundStockOrderOptions,
  fetchGoodsCascadeOptions,
  fetchDeliverySchedulePage,
  fetchRequestItemCartPage,
  addRequestItemsToCart,
  removeRequestItemsFromCart,
  fetchCustomerStockGoodsTreePage,
  fetchMyGroupStockAvailable,
  fetchModuleOptions,
  importGoodsByExcel,
  importCustomerByExcel,
  createRequestFormWithSelectedItems,
  createItemByUrl,
  updateItem,
  removeItem,
  uploadFileByBizType,
} from '../api/module';
import GoodsDrawer from './GoodsDrawer.vue';
import GoodsBatchStockDrawer from './GoodsBatchStockDrawer.vue';
import ModuleEditModal from './ModuleEditModal.vue';
import ModuleInlineEditor from './ModuleInlineEditor.vue';
import ModuleRowActions from './ModuleRowActions.vue';
import ModuleSearchToolbar from './ModuleSearchToolbar.vue';
import StockSheetFlowModal from './StockSheetFlowModal.vue';
import { useGoodsDrawer } from '../composables/useGoodsDrawer';
import { useModuleActions } from '../composables/useModuleActions';
import { useModuleFieldBehavior } from '../composables/useModuleFieldBehavior';
import { useModuleMedia } from '../composables/useModuleMedia';
import { useModuleOptions } from '../composables/useModuleOptions';
import { useModuleTablePresentation } from '../composables/useModuleTablePresentation';
import { useRelationOptions } from '../composables/useRelationOptions';
import { useModuleTableSchema } from '../composables/useModuleTableSchema';
import { useModuleTableState } from '../composables/useModuleTableState';
import { approveStockOrder, fetchCurrentUserCustomerPage } from '../api/module';
import { downloadFileByUrl, downloadRequestFormFile, downloadRequestFormPdf } from '../utils/download';
import { markAllMessageListRead, markAllMessagesRead, markMessageListRead, markMessageRead } from '../utils/message';
import { submitDeliveryAllocationFlow, submitGoodsStockOutboundFlow, submitSheetStockInboundFlow, submitSheetStockOutboundFlow, submitStockInboundFlow, submitStockOrderItemReturnFlow, submitStockQuantityAdjustment } from '../utils/stock';
import { getModulePreset, guessFieldType, isRequiredFormField, mapNameFieldToIdField, normalizeTitle, relationLabel, relationModuleByField } from '../utils/module';
import TABLE_TEXT, {
  MODULE_DETAIL_NAVIGATIONS,
  MODULE_QUERY_JUMPS,
  getModuleEnumOptions,
  getRowExtraActions,
  isAdminByPermissionCodes,
} from '../utils/module-ui';
import {
  GOODS_OUTBOUND_MODE,
  REQUEST_FORM_STATE,
  STOCK_ORDER_SOURCE_TYPE,
  STOCK_ORDER_STATE,
  STOCK_ORDER_TYPE,
  STOCK_SCOPE,
  STOCK_SOURCE_TYPE,
} from '../utils/constants';
import { clearNavigationState, getNavigationState, setNavigationState } from '../utils/navigation-state';
import { hasActiveFilters } from '../utils/table';

const STOCK_EDIT_PAYLOAD_FIELDS = ['id', 'goodsId', 'goodsName', 'skuId', 'skuCode', 'warehouseId', 'price', 'currency', 'stockTypeId', 'status', 'version'];
const GOODS_INBOUND_FIELDS = ['sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'saleDeadline', 'remark'];
const GOODS_OUTBOUND_FIELDS = ['outboundMode', 'stockScope', 'customerId', 'deptId', 'warehouseId', 'stockTypeId', 'quantity', 'remark'];
const STOCK_ORDER_DEFAULT_SOURCE_TYPE = STOCK_ORDER_SOURCE_TYPE.SYSTEM;
const STOCK_ORDER_DEFAULT_STATE = STOCK_ORDER_STATE.PENDING;
const STOCK_ORDER_USER_SOURCE_TYPES = new Set([STOCK_ORDER_SOURCE_TYPE.INBOUND_REQUEST, STOCK_ORDER_SOURCE_TYPE.SYSTEM]);
const STOCK_ORDER_USER_STATES = new Set([STOCK_ORDER_STATE.PENDING, STOCK_ORDER_STATE.PROCESSING]);
const REQUEST_FORM_DEFAULT_STATE = REQUEST_FORM_STATE.PENDING;
const REQUEST_FORM_COMPLETED_STATE = REQUEST_FORM_STATE.COMPLETED;
const REQUEST_FORM_USER_STATES = new Set([REQUEST_FORM_STATE.PENDING, REQUEST_FORM_STATE.APPLYING]);
const NORMAL_STOCK_TYPE_KEYWORDS = ['騾壼ｸｸ', 'normal'];

const props = defineProps({
  moduleKey: { type: String, required: true },
  permissionCodes: { type: Array, default: () => [] },
  moduleActions: { type: Object, default: null },
  allDataWrite: { type: Boolean, default: false },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
  currentUserId: { type: Number, default: null },
  currentDeptId: { type: Number, default: null },
  currentDeptName: { type: String, default: '' },
  currentGroupCode: { type: String, default: '' },
  fixedQueryParams: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['navigate-module']);
const goodsInboundModalOpen = ref(false);
const goodsOutboundModalOpen = ref(false);
const goodsImportLoading = ref(false);
const exportLoading = ref(false);
const goodsStockLoading = ref(false);
const goodsInboundForm = reactive({});
const goodsOutboundForm = reactive({});
const requestItemQtyState = reactive({});
const requestFlowCellDraftState = reactive({});
const selectedExcelCell = ref('');
const activeExcelCell = ref('');
const requestFlowSubmitting = ref(false);
const sheetOutboundModalOpen = ref(false);
const sheetOutboundSubmitting = ref(false);
const sheetFlowMode = ref('outbound');
const sheetOutboundRows = ref([]);
const sheetOutboundActiveRowKey = ref('');
const sheetOutboundDrafts = reactive({});
const sheetOutboundSettings = reactive({
  allocationMode: 'customer',
  outboundMode: 'CUSTOMER',
  customerOutboundMode: 'CUSTOMER',
  warehouseId: null,
  stockTypeId: null,
  customerId: null,
  deptId: null,
  groupCode: null,
  customerAllocations: [],
  saleDeadline: null,
  remark: '',
});
const batchStockDrawerOpen = ref(false);
const batchStockSubmitting = ref(false);
const batchStockLoading = ref(false);
const batchStockMode = ref('inbound');
const batchStockRows = ref([]);
const batchStockSelectedKeys = ref([]);
const batchStockDrafts = reactive({});
const batchStockSettings = reactive({
  sourceType: STOCK_SOURCE_TYPE.SELF_INBOUND,
  warehouseId: null,
  stockTypeId: null,
  quantity: 1,
  saleDeadline: null,
  remark: '',
});
const batchStockPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const goodsFlowByRowKey = reactive({});
const goodsStockRows = ref([]);
const customerGoodsMatrixColumns = ref([]);
const activeGoodsRowKey = ref('');
const isGoodsManagement = computed(() => props.moduleKey === 'goods');
const isSplitStockManagement = computed(() => (
  props.moduleKey === 'stock'
  || props.moduleKey === 'stockSelf'
  || props.moduleKey === 'stockSummary'
  || props.moduleKey === 'stockGroup'
  || /^stockGroup[ABC]$/.test(props.moduleKey)
));
const isSelfStockModule = computed(() => (
  props.moduleKey === 'stock'
  || props.moduleKey === 'stockSelf'
  || props.moduleKey === 'stockSummary'
));
const isGroupStockModule = computed(() => (
  props.moduleKey === 'stockGroup'
  || /^stockGroup[ABC]$/.test(props.moduleKey)
));
const canUseGroupAllocation = computed(() => isAdminUser.value && isSelfStockModule.value);
const isCustomerGoodsSummary = computed(() => props.moduleKey === 'stockCustomerGoods');
const isRequestFlowModule = computed(() => props.moduleKey === 'deliverySchedule' || props.moduleKey === 'requestItem');
const isRequestManagementModule = computed(() => props.moduleKey === 'requestForm' || isRequestFlowModule.value);
const isExcelEditModule = computed(() => isRequestManagementModule.value);
const customerGoodsMatrixTableColumns = computed(() => {
  if (!isCustomerGoodsSummary.value) return [];
  const staticColumns = [
    {
      title: '商品名',
      dataIndex: 'goodsName',
      key: 'goodsName',
      fixed: 'left',
      width: 180,
      ellipsis: false,
    },
    {
      title: 'カテゴリ名',
      dataIndex: 'categoryName',
      key: 'categoryName',
      fixed: 'left',
      width: 160,
      ellipsis: false,
    },
    {
      title: '合計数量',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      fixed: 'right',
      width: 110,
      ellipsis: false,
      align: 'right',
    },
  ];
  const dynamicColumns = (customerGoodsMatrixColumns.value || []).map((item) => ({
    title: String(item?.customerName || item?.customerId || '-'),
    dataIndex: customerGoodsMatrixKey(item?.customerId),
    key: customerGoodsMatrixKey(item?.customerId),
    width: 120,
    ellipsis: false,
    align: 'right',
  }));
  return [
    staticColumns[0],
    staticColumns[1],
    ...dynamicColumns,
    staticColumns[2],
  ];
});
const tableScroll = computed(() => {
  if (!isCustomerGoodsSummary.value) {
    return { x: 'max-content' };
  }
  const totalWidth = customerGoodsMatrixTableColumns.value.reduce((sum, column) => (
    sum + Number(column?.width || 120)
  ), 0);
  return {
    x: Math.max(totalWidth, 960),
  };
});
const tableSticky = computed(() => (
  isCustomerGoodsSummary.value
    ? { offsetScroll: 0 }
    : false
));
const tableRowSelection = computed(() => {
  if (isCustomerGoodsSummary.value) return undefined;
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: isSplitStockManagement.value && stockCurrentQty(record) <= 0,
    }),
  };
});
const modulePath = computed(() => {
  if (isSplitStockManagement.value) return 'stock';
  return props.moduleKey;
});
const preset = computed(() => getModulePreset(props.moduleKey));
const rowExtraActions = computed(() => {
  const base = getRowExtraActions(props.moduleKey) || [];
  return base;
});
const canWrite = computed(() => {
  if (props.moduleKey === 'deliverySchedule') return true;
  if (isAdminUser.value) return true;
  const actions = props.moduleActions || {};
  return Boolean(actions.create || actions.edit || actions.delete || actions.batchDelete || actions.inlineEdit);
});
const canGenerateRequestForm = computed(() => (
  props.moduleKey === 'requestItem'
  && canWrite.value
  && selectedRowKeys.value.length > 0
));
const canMoveDeliveryToRequest = computed(() => (
  props.moduleKey === 'deliverySchedule'
  && canWrite.value
));
const canMoveRequestToDelivery = computed(() => (
  props.moduleKey === 'requestItem'
  && canWrite.value
));
const canUseGoodsInboundActions = computed(() => (
  isSelfStockModule.value
  || isGroupStockModule.value
));
const canUseGoodsOutboundActions = computed(() => (
  isSplitStockManagement.value
));
const isAdminUser = computed(() => isAdminByPermissionCodes(props.permissionCodes || []));
const {
  statusOptions,
  queryInputType,
  queryPlaceholder,
  inputType,
  requiredForForm,
  selectOptionsForField,
  enumOptionsForField,
  inlineField,
  inlineInputType,
  isReadonlyField,
  normalizePayload,
  formatTime,
} = useModuleFieldBehavior({
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  isGoodsManagement,
  guessFieldType,
  isRequiredFormField,
  mapNameFieldToIdField,
  normalizeTitle,
  getModuleEnumOptions,
});

const MODULE_SUBMIT_HANDLERS = {
  stock: submitStockFlow,
};

const {
  rows,
  loading,
  modalOpen,
  editing,
  editingRaw,
  formState,
  editState,
  queryState,
  selectedRowKeys,
  pagination,
  initQuery,
  applyPendingQuery,
  reload,
  buildQueryParams,
  resetQuery,
  doSearch,
  onChange,
  onSelectChange,
  openCreate: openCreateState,
  openEdit: openEditState,
  submit: submitState,
  onDelete: onDeleteState,
  onBatchDelete,
  isEditing: isEditingState,
  startInlineEdit: startInlineEditState,
  cancelInlineEdit,
  saveInlineEdit: saveInlineEditState,
} = useModuleTableState({
  modulePath,
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  canCreateRecord: () => canCreateInModule(),
  canEditRecord: (record) => canEditRecord(record),
  canDeleteRecord: (record) => canDeleteRecord(record),
  canBatchDeleteRecord: () => canBatchDeleteInModule(),
  getQueryFields: () => queryFields.value,
  queryInputType,
  getFormKeys: () => activeFormKeys(),
  inputType,
  inlineField,
  isReadonlyField,
  requiredForForm,
  mapNameFieldToIdField: queryNameFieldToIdField,
  moduleSubmitHandlers: MODULE_SUBMIT_HANDLERS,
  buildQueryFieldAlias: (field) => field,
  buildExtraQueryParams: () => (
    props.moduleKey === 'message' && isAdminUser.value
      ? { all: true, scope: 'all' }
      : { ...stockViewQueryParams(), ...(props.fixedQueryParams || {}) }
  ),
  fetchPageData: (path, params) => fetchPageDataByModule(path, params),
});

const isUserSelfEditMode = computed(() => props.moduleKey === 'user' && editing.value);
const backendFieldSet = computed(() => new Set(Object.keys(rows.value[0] || {})));
const {
  keys,
  queryFields,
  columns,
  formKeys,
} = useModuleTableSchema({
  rows,
  preset,
  moduleKey: computed(() => props.moduleKey),
  isGoodsManagement,
  normalizeTitle,
  isReadonlyField,
  canWrite,
  isEditing: (record) => isEditing(record),
  startInlineEdit: (record) => startInlineEdit(record),
  normalizeQueryField,
  editingRaw,
  isUserSelfEditMode,
  mapNameFieldToIdField,
  onExcelCellClick: activateExcelCell,
  onExcelCellEdit: editExcelCell,
  isExcelCellSelected: isSelectedExcelCell,
});
const {
  queryRelationOptions,
  relationOptions,
  loadRelationOptions,
  loadQueryRelationOptions,
  dedupeOptions,
  invalidateRelationModuleOptions,
} = useRelationOptions({
  fetchModuleOptions,
  fetchCurrentUserCustomerPage,
  relationLabel,
  relationModuleByField,
  inputType,
  isReadonlyField,
  inlineField,
  mapNameFieldToIdField,
  currentDeptId: props.currentDeptId,
  currentDeptName: props.currentDeptName,
  currentUser: props.currentUser,
  currentUserId: toRef(props, 'currentUserId'),
});
const {
  loadDynamicEnumOptions,
  mergedEnumOptions,
  selectOptionsMerged,
  hasEnumOptionsMerged,
  loadSourceOrderOptions,
} = useModuleOptions({
  moduleKey: computed(() => props.moduleKey),
  queryFields,
  formKeys,
  keys,
  relationOptions,
  fetchEnumOptions,
  fetchOutboundStockOrderOptions,
  enumOptionsForField,
  selectOptionsForField,
  dedupeOptions,
  relationLabel,
});
const {
  tablePagination,
  enumLabelMerged,
  getRecordId,
  isPermissionNamesField,
  permissionNameList,
  getRowKey,
  normalizeDisplayLabel,
  numberMinByField,
  numberPrecisionByField,
} = useModuleTablePresentation({
  moduleKey: computed(() => props.moduleKey),
  pagination,
  formatTime,
  mergedEnumOptions,
});

const {
  goodsDrawerOpen,
  goodsDrawerMode,
  goodsDrawerLoading,
  goodsDetailLoading,
  goodsDetailSaving,
  goodsForm,
  goodsDrawerTitle,
  hotOptions,
  openGoodsDrawerCreate,
  openGoodsDrawerEdit,
  closeGoodsDrawer,
  beforeGoodsImageUpload,
  resolveGoodsImageUrl,
  saveGoodsDrawer,
  updateGoodsFormField,
  rowClassName,
} = useGoodsDrawer({
  normalizePayload,
  loadRelationOptions,
  relationOptions,
  fetchGoodsCascadeOptions,
  keys,
  pagination,
  rows,
  reload,
  notify: message,
});

const visibleQueryFields = computed(() => {
  const fixed = props.fixedQueryParams || {};
  const list = (queryFields.value || [])
    .filter((field) => !Object.prototype.hasOwnProperty.call(fixed, field));
  if (props.moduleKey === 'requestItem') {
    return list.filter((field) => String(field || '').toLowerCase() !== 'requestid');
  }
  if (props.moduleKey !== 'stockOrderItem') return list;
  return list.filter((field) => String(field || '').toLowerCase() !== 'orderid');
});
const tableRows = computed(() => {
  if (isGoodsManagement.value) {
    return mergeGoodsWithStock(rows.value, goodsStockRows.value);
  }
  if (isSplitStockManagement.value) {
    return rows.value;
  }
  if (isRequestFlowModule.value) {
    return aggregateRequestFlowRows(rows.value, props.moduleKey);
  }
  return rows.value;
});

function aggregateRequestFlowRows(sourceRows = [], moduleKey = props.moduleKey) {
  const groups = new Map();
  for (const record of Array.isArray(sourceRows) ? sourceRows : []) {
    if (!record || typeof record !== 'object') continue;
    const normalized = normalizeRequestFlowRecord(record, moduleKey);
    const key = requestFlowAggregateKey(normalized);
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        ...normalized,
        id: key,
        aggregateKey: key,
        __sources: [normalized],
        sourceQty: requestFlowSourceQty(normalized, moduleKey),
      });
      continue;
    }
    existing.__sources.push(normalized);
    existing.sourceQty += requestFlowSourceQty(normalized, moduleKey);
    existing.quantity = Number(existing.quantity || 0) + Number(normalized.quantity || 0);
    existing.availableQty = Number(existing.availableQty || 0) + Number(normalized.availableQty || 0);
    existing.requestQty = Number(existing.requestQty || 0) + Number(normalized.requestQty || 0);
  }
  return [...groups.values()].map((record) => ({
    ...record,
    sourceQty: Math.max(0, Math.floor(Number(record.sourceQty || 0))),
  }));
}

function normalizeRequestFlowRecord(record, moduleKey = props.moduleKey) {
  const isRequestItem = moduleKey === 'requestItem';
  const quantity = Number(isRequestItem
    ? record?.requestQty ?? record?.availableQty ?? 0
    : record?.quantity ?? record?.availableQty ?? 0);
  const bizNo = record?.bizNo ?? record?.orderNo ?? record?.sourceOrderNo ?? '';
  const outboundDate = record?.outboundDate ?? record?.bizDate ?? record?.scheduledShipDate ?? '';
  const stockRecordId = record?.stockRecordId ?? record?.stock_record_id ?? record?.recordId ?? record?.record_id ?? null;
  const stockOrderItemId = record?.stockOrderItemId ?? record?.stock_order_item_id ?? record?.orderItemId ?? record?.order_item_id ?? null;
  return {
    ...record,
    bizNo,
    outboundDate,
    stockRecordId,
    stockOrderItemId,
    quantity: moduleKey === 'deliverySchedule' ? safeWholeQty(quantity) : Number(record?.quantity ?? 0),
    availableQty: safeWholeQty(record?.availableQty ?? quantity),
    requestQty: safeWholeQty(record?.requestQty ?? quantity),
    sourceQty: safeWholeQty(quantity),
  };
}

function requestFlowAggregateKey(record) {
  return [
    record?.customerId,
    record?.customerName,
    record?.country,
    record?.groupCode,
    record?.outboundDate,
    record?.goodsId,
    record?.skuId,
    record?.skuCode,
    record?.stockTypeId,
    record?.price,
    record?.currency,
  ].map((value) => String(value ?? '')).join('|');
}

function requestFlowSourceQty(record, moduleKey = props.moduleKey) {
  if (moduleKey === 'requestItem') {
    return safeWholeQty(record?.requestQty ?? record?.availableQty ?? record?.sourceQty ?? 0);
  }
  return safeWholeQty(record?.quantity ?? record?.sourceQty ?? 0);
}

function safeWholeQty(value) {
  const qty = Number(value);
  if (Number.isNaN(qty)) return 0;
  return Math.max(0, Math.floor(Math.abs(qty)));
}

function stockViewQueryParams() {
  if (props.moduleKey === 'stockSelf' || props.moduleKey === 'stockSummary' || props.moduleKey === 'stock') {
    return {};
  }
  if (props.moduleKey === 'stockGroup') {
    const groupCode = String(props.currentGroupCode || '').trim().toUpperCase();
    return groupCode ? { stockScope: 'group', groupCode } : { stockScope: 'group' };
  }
  const match = String(props.moduleKey || '').match(/^stockGroup([ABC])$/);
  if (!match) return {};
  return {
    stockScope: 'group',
    groupCode: match[1],
  };
}

function fetchPageDataByModule(path, params) {
  if (props.moduleKey === 'deliverySchedule') {
    return fetchDeliverySchedulePage(params);
  }
  if (props.moduleKey === 'requestItem') {
    return fetchRequestItemCartPage(params);
  }
  if (props.moduleKey === 'stockCustomerGoods') {
    return fetchCustomerStockGoodsTreePage(params).then(normalizeCustomerGoodsTreePage);
  }
  return fetchPage(path, params);
}

const visibleFormKeys = computed(() => {
  const list = editing.value ? activeFormKeys() : formKeys.value.filter((field) => String(field || '').toLowerCase() !== 'status');
  return filterFinanceFormKeys(list, formState);
});
const visibleGoodsOutboundFields = computed(() => GOODS_OUTBOUND_FIELDS.filter((field) => {
  if (field === 'customerId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE.CUSTOMER;
  if (field === 'deptId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE.DEPT;
  if (field === 'stockScope') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE.CUSTOMER;
  return true;
}));
const canOpenSheetOutbound = computed(() => (
  (isSelfStockModule.value || isGroupStockModule.value)
  && canWrite.value
  && selectedGoodsRows().some((record) => stockCurrentQty(record) > 0)
));
const canOpenSheetInbound = computed(() => (
  (isSelfStockModule.value || isGroupStockModule.value)
  && canWrite.value
));
const canExportCurrentList = computed(() => (
  props.moduleKey === 'goods'
  || props.moduleKey === 'stockSelf'
  || props.moduleKey === 'customer'
));
const stockSourceTypeOptions = computed(() => (
  getModuleEnumOptions('stock', 'sourceType')
    .filter((option) => Number(option?.value) !== STOCK_SOURCE_TYPE.PURCHASE_INBOUND)
));
const batchStockPaginationConfig = computed(() => {
  if (batchStockMode.value !== 'inbound') return false;
  return {
    current: batchStockPagination.current,
    pageSize: batchStockPagination.pageSize,
    total: batchStockPagination.total,
    showSizeChanger: true,
  };
});
const isGroupBatchInbound = computed(() => isGroupStockModule.value && batchStockMode.value === 'inbound');

watch(
  () => [props.moduleKey, JSON.stringify(props.fixedQueryParams || {})],
  async () => {
    if (!props.moduleKey) return;
    pagination.current = 1;
    initQuery();
    applyPendingQuery(MODULE_QUERY_JUMPS[props.moduleKey]);
    await loadDynamicEnumOptions();
    await loadQueryRelationOptions(queryFields.value);
    await loadScopedRelationOptions(formKeys.value, keys.value);
    await loadSourceOrderOptions();
    await reload();
    if (isGoodsManagement.value) {
      await loadGoodsStockRows();
    }
  },
  { immediate: true },
);

function normalizeQueryField(field) {
  const key = String(field || '');
  if (props.moduleKey === 'stockCustomerGoods') return key;
  if (key === 'sourceOrderId') return key;
  if (!key.endsWith('Id')) return key;
  if (relationModuleByField(key)) return `${key.slice(0, -2)}Name`;
  const nameField = `${key.slice(0, -2)}Name`;
  if (backendFieldSet.value.has(nameField)) return nameField;
  return key;
}

function customerGoodsMatrixKey(customerId) {
  return `customer_${String(customerId ?? '')}`;
}

function normalizeCustomerGoodsTreePage(page) {
  const records = Array.isArray(page?.records) ? page.records : [];
  return {
    ...page,
    records: stripEmptyTreeChildren(records),
  };
}

function stripEmptyTreeChildren(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    if (!row || typeof row !== 'object') return row;
    const next = { ...row };
    if (Array.isArray(next.children) && next.children.length > 0) {
      next.children = stripEmptyTreeChildren(next.children);
    } else {
      delete next.children;
    }
    return next;
  });
}

async function submitStockFlow({ buildEditPayload, getRecordId, normalizePayload: normalizeSubmitPayload }) {
  if (editing.value && isSplitStockManagement.value) {
    try {
      const rawPayload = buildEditPayload(getRecordId);
      const normalizedPayload = normalizeSubmitPayload(rawPayload);
      const beforeQty = Number(editingRaw.value?.currentQty ?? 0);
      const afterQty = Number(rawPayload.currentQty ?? beforeQty);
      const payload = Object.fromEntries(
        STOCK_EDIT_PAYLOAD_FIELDS
          .filter((field) => Object.prototype.hasOwnProperty.call(rawPayload, field))
          .map((field) => [
            field,
            Object.prototype.hasOwnProperty.call(normalizedPayload, field) ? normalizedPayload[field] : rawPayload[field],
          ]),
      );
      await updateItem(modulePath.value, payload);
      await submitStockQuantityAdjustment({
        beforeQty,
        afterQty,
        record: rawPayload,
      });
      modalOpen.value = false;
      message.success(TABLE_TEXT.updateSuccess);
      await reload();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.saveFail);
    }
    return;
  }

  await submitStockInboundFlow({
    formState,
    closeModal: () => {
      modalOpen.value = false;
    },
    reload,
    notify: message,
  });
}

function updateFormField(field, value) {
  formState[field] = value;
  applyFinanceToggleState(formState, field, value);
}

function updateQueryField(field, value) {
  queryState[field] = value;
}

function updateInlineField(field, value) {
  editState[field] = value;
  applyFinanceToggleState(editState, field, value);
}

async function openGoodsInboundModal(record) {
  if (isGroupStockModule.value) {
    await openBatchStockDrawer('inbound');
    return;
  }
  const rowKey = goodsRowKey(record);
  Object.keys(goodsInboundForm).forEach((key) => delete goodsInboundForm[key]);
  activeGoodsRowKey.value = rowKey;
  goodsInboundForm.goodsId = record?.goodsId ?? record?.id;
  goodsInboundForm.skuId = record?.skuId ?? null;
  goodsInboundForm.sourceType = STOCK_SOURCE_TYPE.SELF_INBOUND;
  goodsInboundForm.warehouseId = null;
  goodsInboundForm.stockTypeId = null;
  goodsInboundForm.quantity = null;
  goodsInboundForm.saleDeadline = null;
  goodsInboundForm.remark = null;
  await loadRelationOptions(['warehouseId', 'stockTypeId', 'customerId'], keys.value);
  goodsInboundForm.warehouseId = findOptionByMinId(relationOptions.warehouseId || [])?.value ?? null;
  goodsInboundForm.stockTypeId = findOptionByMinId(relationOptions.stockTypeId || [])?.value ?? null;
  goodsInboundModalOpen.value = true;
}

function updateGoodsInboundField(field, value) {
  goodsInboundForm[field] = value;
}

function goodsInboundInputType(field) {
  if (field === 'sourceType') return 'select';
  if (field === 'warehouseId' || field === 'stockTypeId') return 'relation';
  if (field === 'quantity') return 'number';
  if (field === 'saleDeadline') return 'datetime';
  return 'textarea';
}

function goodsInboundSelectOptions(field) {
  if (field === 'sourceType') return getModuleEnumOptions('stock', 'sourceType');
  return scopedSelectOptions(field);
}

function isGoodsInboundFieldRequired(field) {
  return ['sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'saleDeadline'].includes(field);
}

function goodsInboundNumberMin(field) {
  if (field === 'quantity') return 1;
  return numberMinByField(field);
}

async function submitGoodsInbound() {
  const rowKey = activeGoodsRowKey.value;
  const success = await submitStockInboundFlow({
    formState: goodsInboundForm,
    closeModal: () => {
      goodsInboundModalOpen.value = false;
    },
    reload,
    notify: message,
  });
  if (success && rowKey) {
    goodsFlowByRowKey[rowKey] = {
      goodsId: Number(goodsInboundForm.goodsId),
      skuId: goodsInboundForm.skuId ? Number(goodsInboundForm.skuId) : null,
      sourceType: Number(goodsInboundForm.sourceType),
      warehouseId: Number(goodsInboundForm.warehouseId),
      stockTypeId: Number(goodsInboundForm.stockTypeId),
      inboundQty: Number(goodsInboundForm.quantity),
      outboundQty: Number(goodsFlowByRowKey[rowKey]?.outboundQty || 0),
    };
    persistGoodsFlowState();
    await loadGoodsStockRows();
  }
}

async function openGoodsOutboundModal(record) {
  if (!canGoodsOutbound(record)) {
    message.warning(TABLE_TEXT.inboundFirst);
    return;
  }
  await openSheetOutboundModal(record);
}

function updateGoodsOutboundField(field, value) {
  goodsOutboundForm[field] = value;
  if (field === 'outboundMode') {
    goodsOutboundForm.customerId = null;
    goodsOutboundForm.deptId = null;
  }
  if (['stockScope', 'warehouseId', 'stockTypeId'].includes(field)) {
    refreshGroupAvailableQty();
  }
}

async function refreshGroupAvailableQty() {
  if (goodsOutboundForm.stockScope !== STOCK_SCOPE.GROUP) return;
  const { goodsId, skuId, warehouseId, stockTypeId } = goodsOutboundForm;
  if (!goodsId || !skuId || !warehouseId || !stockTypeId) return;
  try {
    goodsOutboundForm.groupAvailableQty = await fetchMyGroupStockAvailable({
      goodsId,
      skuId,
      warehouseId,
      stockTypeId,
      deptId: props.currentDeptId || undefined,
      groupCode: props.currentGroupCode || undefined,
    });
    if (Number(goodsOutboundForm.quantity) > goodsOutboundForm.groupAvailableQty) {
      goodsOutboundForm.quantity = goodsOutboundForm.groupAvailableQty;
    }
  } catch (error) {
    message.error(error.message || TABLE_TEXT.fetchFail);
  }
}

function goodsOutboundInputType(field) {
  if (field === 'outboundMode' || field === 'stockScope') return 'select';
  if (['customerId', 'deptId', 'warehouseId', 'stockTypeId'].includes(field)) return 'relation';
  if (field === 'quantity') return 'number';
  return 'textarea';
}

function goodsOutboundSelectOptions(field) {
  if (field === 'outboundMode') {
    return [
      { label: '顧客出庫', value: GOODS_OUTBOUND_MODE.CUSTOMER },
      { label: '部署振替', value: GOODS_OUTBOUND_MODE.DEPT },
    ];
  }
  if (field === 'stockScope') {
    const options = [{ label: '自社在庫から出庫申請', value: STOCK_SCOPE.SELF }];
    if (props.currentGroupCode) {
      options.push({
        label: `${props.currentGroupCode}組在庫から出庫`,
        value: STOCK_SCOPE.GROUP,
      });
    }
    return options;
  }
  return scopedSelectOptions(field);
}

function isGoodsOutboundFieldRequired(field) {
  if (field === 'customerId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE.CUSTOMER;
  if (field === 'deptId') return goodsOutboundForm.outboundMode === GOODS_OUTBOUND_MODE.DEPT;
  return ['outboundMode', 'stockScope', 'warehouseId', 'stockTypeId', 'quantity'].includes(field);
}

function goodsOutboundPlaceholder(field) {
  if (field === 'quantity') return `最大 ${availableGoodsOutboundQty(activeGoodsRowKey.value)}`;
  return '';
}

function goodsOutboundNumberMin(field) {
  if (field === 'quantity') return 1;
  return numberMinByField(field);
}

function goodsOutboundNumberMax(field) {
  if (field === 'quantity') return availableGoodsOutboundQty(activeGoodsRowKey.value);
  return undefined;
}

async function submitGoodsOutbound() {
  const rowKey = activeGoodsRowKey.value;
  const maxQty = availableGoodsOutboundQty(rowKey);
  const quantity = Number(goodsOutboundForm.quantity);
  if (!maxQty || quantity > maxQty) {
    message.warning(TABLE_TEXT.maxOutboundQuantity(maxQty));
    return;
  }
  const success = await submitGoodsStockOutboundFlow({
    formState: goodsOutboundForm,
    maxQuantity: maxQty,
    closeModal: () => {
      goodsOutboundModalOpen.value = false;
    },
    reload,
    notify: message,
  });
  if (success && rowKey) {
    goodsFlowByRowKey[rowKey].outboundQty = Number(goodsFlowByRowKey[rowKey]?.outboundQty || 0) + quantity;
    persistGoodsFlowState();
    await loadGoodsStockRows();
  }
}

async function downloadGoodsImportTemplate() {
  if (props.moduleKey === 'goods') {
    downloadLocalGoodsImportTemplate();
    return;
  }
  const config = importTemplateConfigByModule();
  if (!config) return;
  try {
    await downloadFileByUrl(config.url, config.fileName);
  } catch (error) {
    message.error(error?.message || config.failMessage);
  }
}

async function exportCurrentList() {
  if (!canExportCurrentList.value || exportLoading.value) return;
  const config = exportConfigByModule();
  if (!config) return;
  exportLoading.value = true;
  try {
    await downloadFileByUrl(config.url, config.fileName, {
      sortBy: 'updateTime',
      sortOrder: 'desc',
      ...buildQueryParams(),
    });
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.exportFail);
  } finally {
    exportLoading.value = false;
  }
}

function exportConfigByModule() {
  if (props.moduleKey === 'goods') {
    return {
      url: '/api/goods/export',
      fileName: 'goods-export.xlsx',
    };
  }
  if (props.moduleKey === 'customer') {
    return {
      url: '/api/customer/export',
      fileName: 'customers-export.xlsx',
    };
  }
  if (props.moduleKey === 'stockSelf') {
    return {
      url: '/api/stock/self/export',
      fileName: 'stock-self-export.xlsx',
    };
  }
  return null;
}

function importTemplateConfigByModule() {
  if (props.moduleKey === 'goods') {
    return {
      url: '/api/goods/import/template',
      fileName: 'goods-import-template.xls',
      failMessage: TABLE_TEXT.goodsTemplateDownloadFail,
    };
  }
  if (props.moduleKey === 'customer') {
    return {
      url: '/api/customer/import/template',
      fileName: 'customers-import-template.xlsx',
      failMessage: '顧客テンプレートのダウンロードに失敗しました',
    };
  }
  return null;
}

function downloadLocalGoodsImportTemplate() {
  const columns = [
    'ID',
    'Name',
    'English Name',
    'Brand ID',
    'Series ID',
    'Category ID',
    'Maker ID',
    'SKU Code',
    'SKU Name',
    'Price',
    'Currency',
    'Status',
  ];
  const sample = [
    '',
    'Sample Goods',
    'Sample Goods EN',
    '',
    '',
    '',
    '',
    'SKU001',
    'Sample SKU',
    '1000',
    'JPY',
    '1',
  ];
  const rows = [columns, sample];
  const worksheet = rows.map((row) => (
    `<tr>${row.map((cell) => `<td>${escapeExcelXml(cell)}</td>`).join('')}</tr>`
  )).join('');
  const html = `<?xml version="1.0" encoding="UTF-8"?>
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <style>td{mso-number-format:"\\@";}</style>
      </head>
      <body><table>${worksheet}</table></body>
    </html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'goods-import-template.xls';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function escapeExcelXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function importGoodsBatchFromFile(file) {
  const rawFile = file?.originFileObj || file;
  if (!rawFile) return false;
  goodsImportLoading.value = true;
  try {
    const result = props.moduleKey === 'customer'
      ? await importCustomerByExcel(rawFile)
      : await importGoodsByExcel(rawFile);
    const summary = formatImportSummary(result);
    const failed = importFailureCount(result);
    if (failed > 0) {
      message.error(summary || importFailMessage());
      showImportResult(result, { force: true });
    } else {
      message.success(summary || importSuccessMessage());
      if (props.moduleKey === 'customer') {
        showImportResult(result, { force: true });
      }
    }
    await reload();
  } catch (error) {
    message.error(error?.message || importFailMessage());
  } finally {
    goodsImportLoading.value = false;
  }
  return false;
}

function formatImportSummary(result) {
  if (!result || typeof result !== 'object') return '';
  const total = Number(result.totalCount ?? result.total ?? result.rows?.length ?? 0);
  const success = Number(result.successCount ?? 0);
  const created = Number(result.createdCount ?? 0);
  const updated = Number(result.updatedCount ?? 0);
  const failed = Number(result.failureCount ?? 0);
  const parts = [];
  if (total > 0) parts.push(`${TABLE_TEXT.goodsImportSummary.total} ${total}`);
  if (success > 0) parts.push(`${TABLE_TEXT.goodsImportSummary.success} ${success}`);
  if (created > 0) parts.push(`${TABLE_TEXT.goodsImportSummary.created} ${created}`);
  if (updated > 0) parts.push(`${TABLE_TEXT.goodsImportSummary.updated} ${updated}`);
  if (failed > 0) parts.push(`${TABLE_TEXT.goodsImportSummary.failed} ${failed}`);
  return parts.length > 0 ? parts.join(' / ') : '';
}

function importFailureCount(result) {
  if (!result || typeof result !== 'object') return 0;
  const byCount = Number(result.failureCount ?? 0);
  if (byCount > 0) return byCount;
  const rows = Array.isArray(result.rows) ? result.rows : [];
  return rows.filter((row) => row?.success === false || String(row?.action || '').toUpperCase() === 'FAILED').length;
}

function importSuccessMessage() {
  return props.moduleKey === 'customer'
    ? '顧客を一括導入しました'
    : TABLE_TEXT.goodsImportSuccess;
}

function importFailMessage() {
  return props.moduleKey === 'customer'
    ? '顧客一括導入に失敗しました'
    : TABLE_TEXT.goodsImportFail;
}

function showImportResult(result, options = {}) {
  const rows = Array.isArray(result?.rows) ? result.rows : [];
  const failed = importFailureCount(result);
  if (!options.force && rows.length === 0 && failed === 0) return;
  const summary = formatImportSummary(result);
  const lines = rows.length > 0
    ? rows.map((row) => formatImportRowLine(row))
    : ['エラー明細はありません。'];
  const hasErrorReport = Boolean(result?.errorReportBase64);
  const modal = failed > 0 ? Modal.error : Modal.info;
  modal({
    title: failed > 0 ? `${importResultTitle()}に失敗しました` : `${importResultTitle()}結果`,
    width: 760,
    content: h('div', [
      h('div', { style: 'margin-bottom: 12px;' }, summary),
      h('pre', {
        style: 'max-height: 420px; overflow: auto; white-space: pre-wrap; margin: 0;',
      }, lines.join('\n')),
      hasErrorReport
        ? h('div', { style: 'margin-top: 12px;' }, [
          h('button', {
            type: 'button',
            class: 'ant-btn ant-btn-primary',
            onClick: () => downloadImportErrorReport(result),
          }, 'エラーレポートをダウンロード'),
        ])
        : null,
    ]),
  });
}

function importResultTitle() {
  return props.moduleKey === 'customer' ? '顧客導入' : '商品導入';
}

function formatImportRowLine(row) {
  return [
    `row ${row?.rowNo ?? '-'}`,
    row?.action || '-',
    row?.success ? 'OK' : 'FAILED',
    row?.skuCode ? `sku=${row.skuCode}` : '',
    row?.customerCode ? `code=${row.customerCode}` : '',
    row?.goodsId ? `goodsId=${row.goodsId}` : '',
    row?.skuId ? `skuId=${row.skuId}` : '',
    row?.customerId ? `id=${row.customerId}` : '',
    row?.message || '',
  ].filter(Boolean).join(' | ');
}

function downloadImportErrorReport(result) {
  const base64 = String(result?.errorReportBase64 || '').trim();
  if (!base64) return;
  const fileName = String(result?.errorReportFileName || 'import_error_report.xlsx');
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

async function openSheetOutboundModal(record = null) {
  const selected = (record ? [record] : selectedGoodsRows())
    .filter((item) => !isSplitStockManagement.value || stockCurrentQty(item) > 0);
  if (selected.length === 0) {
    message.warning(TABLE_TEXT.selectDeliveryGoods);
    return;
  }
  await prepareSheetOutboundModal(selected);
}

function queryNameFieldToIdField(field) {
  if (props.moduleKey === 'deliverySchedule' && ['customerName', 'categoryName', 'goodsName'].includes(String(field || ''))) {
    return '';
  }
  return mapNameFieldToIdField(field);
}

async function prepareSheetOutboundModal(selected) {
  sheetFlowMode.value = isSplitStockManagement.value ? 'outbound' : 'delivery';
  sheetOutboundRows.value = selected;
  Object.keys(sheetOutboundDrafts).forEach((key) => delete sheetOutboundDrafts[key]);
  selected.forEach((record) => {
    sheetOutboundDrafts[goodsRowKey(record)] = isSplitStockManagement.value
      ? {
        aQty: 0,
        bQty: 0,
        cQty: 0,
        remark: '',
      }
      : {
        deliveryQty: 0,
        aQty: 0,
        bQty: 0,
        cQty: 0,
        saleDeadline: null,
        remark: '',
      };
  });
  sheetOutboundActiveRowKey.value = goodsRowKey(selected[0]);
  sheetOutboundSettings.customerOutboundMode = isGroupStockModule.value ? 'GROUP_CUSTOMER' : 'CUSTOMER';
  sheetOutboundSettings.outboundMode = sheetOutboundSettings.customerOutboundMode;
  sheetOutboundSettings.allocationMode = canUseGroupAllocation.value ? 'group' : 'customer';
  sheetOutboundSettings.warehouseId = firstNonEmptyValue(selected, 'warehouseId');
  sheetOutboundSettings.stockTypeId = firstNonEmptyValue(selected, 'stockTypeId');
  sheetOutboundSettings.customerId = null;
  sheetOutboundSettings.deptId = firstNonEmptyValue(selected, 'deptId') || props.currentDeptId || null;
  sheetOutboundSettings.groupCode = resolveCurrentStockGroupCode(selected);
  sheetOutboundSettings.customerAllocations = [];
  sheetOutboundSettings.saleDeadline = null;
  sheetOutboundSettings.remark = '';
  invalidateRelationModuleOptions('customer');
  await loadRelationOptions(['warehouseId', 'stockTypeId', 'customerId'], keys.value);
  sheetOutboundModalOpen.value = true;
}

async function openBatchStockDrawer(mode) {
  const normalizedMode = mode === 'outbound' ? 'outbound' : 'inbound';
  batchStockMode.value = normalizedMode;
  batchStockSelectedKeys.value = [];
  Object.keys(batchStockDrafts).forEach((key) => delete batchStockDrafts[key]);
  batchStockSettings.sourceType = STOCK_SOURCE_TYPE.SELF_INBOUND;
  batchStockSettings.warehouseId = null;
  batchStockSettings.stockTypeId = null;
  batchStockSettings.quantity = 1;
  batchStockSettings.saleDeadline = null;
  batchStockSettings.remark = normalizedMode === 'inbound' ? '一括入庫' : '一括出庫';
  batchStockDrawerOpen.value = true;

  if (normalizedMode === 'inbound') {
    await loadRelationOptions(['warehouseId', 'stockTypeId'], []);
    batchStockSettings.warehouseId = findOptionByMinId(relationOptions.warehouseId || [])?.value ?? relationOptions.warehouseId?.[0]?.value ?? null;
    batchStockSettings.stockTypeId = findOptionByMinId(relationOptions.stockTypeId || [])?.value ?? relationOptions.stockTypeId?.[0]?.value ?? null;
    await loadBatchStockGoodsPage({ pageNum: 1, pageSize: batchStockPagination.pageSize });
    return;
  }

  const rowsForDrawer = (tableRows.value || []).filter((record) => canGoodsOutbound(record));
  if (rowsForDrawer.length === 0) {
    batchStockDrawerOpen.value = false;
    message.warning(TABLE_TEXT.selectDeliveryGoods);
    return;
  }

  batchStockRows.value = rowsForDrawer;
  seedBatchStockDrafts(rowsForDrawer);
}

async function loadBatchStockGoodsPage({ pageNum = 1, pageSize = 10 } = {}) {
  batchStockLoading.value = true;
  batchStockSelectedKeys.value = [];
  try {
    if (isGroupBatchInbound.value) {
      const page = await fetchPage('stock', {
        pageNum,
        pageSize,
        sortBy: 'updateTime',
        sortOrder: 'desc',
        stockScope: 'self',
      });
      const rowsForDrawer = Array.isArray(page.records) ? page.records : [];
      batchStockRows.value = rowsForDrawer;
      batchStockPagination.current = Number(page.pageNum || pageNum);
      batchStockPagination.pageSize = Number(page.pageSize || pageSize);
      batchStockPagination.total = Number(page.total || rowsForDrawer.length);
      Object.keys(batchStockDrafts).forEach((key) => delete batchStockDrafts[key]);
      seedBatchStockDrafts(rowsForDrawer);
      return;
    }
    const page = await fetchPage('goods', {
      pageNum,
      pageSize,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
    const goodsRows = Array.isArray(page.records) ? page.records : [];
    const rowsForDrawer = goodsRows.map((record) => ({
      ...record,
      goodsId: record?.goodsId ?? record?.id ?? null,
    }));
    batchStockRows.value = rowsForDrawer;
    batchStockPagination.current = Number(page.pageNum || pageNum);
    batchStockPagination.pageSize = Number(page.pageSize || pageSize);
    batchStockPagination.total = Number(page.total || rowsForDrawer.length);
    Object.keys(batchStockDrafts).forEach((key) => delete batchStockDrafts[key]);
    seedBatchStockDrafts(rowsForDrawer);
  } catch (error) {
    batchStockRows.value = [];
    message.error(error?.message || TABLE_TEXT.fetchFail);
  } finally {
    batchStockLoading.value = false;
  }
}

function seedBatchStockDrafts(records) {
  (records || []).forEach((record) => {
    const inboundMode = batchStockMode.value === 'inbound';
    batchStockDrafts[goodsRowKey(record)] = {
      sourceType: inboundMode
        ? Number(batchStockSettings.sourceType || STOCK_SOURCE_TYPE.SELF_INBOUND)
        : record?.sourceType ?? null,
      warehouseId: inboundMode
        ? batchStockSettings.warehouseId ?? record?.warehouseId ?? null
        : record?.warehouseId ?? batchStockSettings.warehouseId ?? null,
      stockTypeId: inboundMode
        ? batchStockSettings.stockTypeId ?? record?.stockTypeId ?? null
        : record?.stockTypeId ?? batchStockSettings.stockTypeId ?? null,
      quantity: Number(batchStockSettings.quantity || 1),
      saleDeadline: inboundMode ? batchStockSettings.saleDeadline || null : null,
      remark: '',
    };
  });
}

function updateBatchStockDraft(rowKey, field, value) {
  if (!batchStockDrafts[rowKey]) {
    batchStockDrafts[rowKey] = {};
  }
  batchStockDrafts[rowKey][field] = value;
}

function updateBatchStockSetting(field, value) {
  batchStockSettings[field] = value;
}

function updateBatchStockSelectedKeys(keys) {
  batchStockSelectedKeys.value = (Array.isArray(keys) ? keys : []).map((key) => String(key));
}

async function submitBatchStockFlow() {
  const selected = new Set(batchStockSelectedKeys.value.map((key) => String(key)));
  const items = (batchStockRows.value || [])
    .filter((record) => selected.has(goodsRowKey(record)))
    .map((record) => {
      const draft = batchStockDrafts[goodsRowKey(record)] || {};
      return {
        record,
        stockId: Number(record?.stockId ?? 0) || null,
        goodsId: Number(record?.goodsId ?? record?.id ?? 0) || null,
        skuId: record?.skuId ? Number(record.skuId) : null,
        warehouseId: batchStockMode.value === 'inbound'
          ? Number(draft.warehouseId ?? batchStockSettings.warehouseId ?? record?.warehouseId ?? 0) || null
          : Number(record?.warehouseId ?? batchStockSettings.warehouseId ?? 0) || null,
        stockTypeId: batchStockMode.value === 'inbound'
          ? Number(draft.stockTypeId ?? batchStockSettings.stockTypeId ?? record?.stockTypeId ?? 0) || null
          : Number(record?.stockTypeId ?? batchStockSettings.stockTypeId ?? 0) || null,
        sourceType: batchStockMode.value === 'inbound'
          ? Number(draft.sourceType ?? batchStockSettings.sourceType ?? STOCK_SOURCE_TYPE.SELF_INBOUND)
          : null,
        quantity: Number(draft.quantity || 0),
        saleDeadline: batchStockMode.value === 'inbound' ? (draft.saleDeadline || null) : null,
        remark: String(draft.remark || '').trim() || null,
      };
    });

  const invalid = items.some((item) => (
    item.quantity <= 0
    || (batchStockMode.value === 'outbound' && (!item.stockId || item.quantity > availableGoodsOutboundQty(goodsRowKey(item.record))))
    || (isGroupBatchInbound.value && (!item.stockId || item.quantity > stockCurrentQty(item.record)))
    || (batchStockMode.value === 'inbound'
      && !item.stockId
      && !(item.goodsId && item.skuId && item.sourceType && item.warehouseId && item.stockTypeId))
  ));
  if (items.length === 0 || invalid) {
    message.warning(TABLE_TEXT.requiredField);
    return;
  }

  batchStockSubmitting.value = true;
  try {
    if (isGroupBatchInbound.value) {
      const groupCode = resolveCurrentStockGroupCode();
      if (!groupCode) {
        message.warning(TABLE_TEXT.requiredField);
        return;
      }
      await submitGroupBatchInboundFromSelfStock(items, groupCode);
      message.success(TABLE_TEXT.stockFlowSuccess);
      batchStockDrawerOpen.value = false;
      batchStockSelectedKeys.value = [];
      selectedRowKeys.value = [];
      await reload();
      await loadGoodsStockRows();
      return;
    }
    const payload = {
      remark: batchStockSettings.remark || (batchStockMode.value === 'inbound' ? '一括入庫' : '一括出庫'),
      items: items.map((item) => removeEmptyBatchStockItem({
        stockId: batchStockMode.value === 'inbound' ? null : item.stockId,
        goodsId: item.goodsId,
        skuId: item.skuId,
        sourceType: item.sourceType,
        warehouseId: item.warehouseId,
        stockTypeId: item.stockTypeId,
        quantity: item.quantity,
        saleDeadline: item.saleDeadline,
        remark: item.remark,
      })),
    };
    await createItemByUrl(
      batchStockMode.value === 'inbound' ? '/api/stock/inbound/batch' : '/api/stock/outbound/batch',
      payload,
    );
    message.success(batchStockMode.value === 'inbound' ? TABLE_TEXT.stockFlowSuccess : TABLE_TEXT.stockOutboundSuccess);
    batchStockDrawerOpen.value = false;
    batchStockSelectedKeys.value = [];
    selectedRowKeys.value = [];
    await reload();
    await loadGoodsStockRows();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  } finally {
    batchStockSubmitting.value = false;
  }
}

async function submitGroupBatchInboundFromSelfStock(items, groupCode) {
  const remark = batchStockSettings.remark || '一括入庫';
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await createItemByUrl('/api/stock/group/allocate', {
      stockId: item.stockId,
      allocations: [
        {
          groupCode,
          quantity: item.quantity,
        },
      ],
      remark: [remark, item.remark].filter(Boolean).join(' / ') || null,
    });
  }
}

function removeEmptyBatchStockItem(item) {
  return Object.fromEntries(Object.entries(item || {}).filter(([, value]) => (
    value !== undefined && value !== null && String(value).trim() !== ''
  )));
}

function selectedGoodsRows() {
  if ((!isGoodsManagement.value && !isSplitStockManagement.value) || selectedRowKeys.value.length === 0) return [];
  const selected = new Set(selectedRowKeys.value.map((key) => String(key)));
  return (tableRows.value || []).filter((record) => selected.has(String(getRowKey(record))));
}

function firstNonEmptyValue(records, field) {
  const hit = (records || []).find((record) => record?.[field] !== undefined && record?.[field] !== null && String(record[field]).trim() !== '');
  return hit?.[field] ?? null;
}

function resolveCurrentStockGroupCode(records = []) {
  const direct = firstNonEmptyValue(records, 'groupCode');
  if (direct) return String(direct).trim().toUpperCase();
  const match = String(props.moduleKey || '').match(/^stockGroup([ABC])$/);
  if (match) return match[1];
  return props.currentGroupCode ? String(props.currentGroupCode).trim().toUpperCase() : null;
}

function updateSheetOutboundDraft(rowKey, field, value) {
  if (!sheetOutboundDrafts[rowKey]) {
    sheetOutboundDrafts[rowKey] = {};
  }
  sheetOutboundDrafts[rowKey][field] = value;
}

function updateSheetOutboundSetting(field, value) {
  sheetOutboundSettings[field] = value;
}

async function addCustomerAllocation() {
  invalidateRelationModuleOptions('customer');
  await loadRelationOptions(['customerId'], []);
  const list = Array.isArray(sheetOutboundSettings.customerAllocations)
    ? [...sheetOutboundSettings.customerAllocations]
    : [];
  list.push({
    key: `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    customerId: null,
    quantity: null,
  });
  sheetOutboundSettings.customerAllocations = list;
}

function updateCustomerAllocation(key, field, value) {
  const list = Array.isArray(sheetOutboundSettings.customerAllocations)
    ? [...sheetOutboundSettings.customerAllocations]
    : [];
  const item = list.find((row) => String(row.key) === String(key));
  if (!item) return;
  item[field] = value;
  sheetOutboundSettings.customerAllocations = list;
}

function removeCustomerAllocation(key) {
  sheetOutboundSettings.customerAllocations = (Array.isArray(sheetOutboundSettings.customerAllocations)
    ? sheetOutboundSettings.customerAllocations
    : []).filter((row) => String(row.key) !== String(key));
}

function validSheetCustomerAllocations() {
  return (Array.isArray(sheetOutboundSettings.customerAllocations)
    ? sheetOutboundSettings.customerAllocations
    : []).filter((item) => (
    item?.customerId !== undefined
      && item?.customerId !== null
      && String(item.customerId).trim() !== ''
      && Number(item?.quantity || 0) > 0
  ));
}

async function submitSheetFlow() {
  const validCustomerAllocations = validSheetCustomerAllocations();
  const useCustomerAllocation = sheetFlowMode.value !== 'inbound'
    && (
      sheetOutboundSettings.allocationMode === 'customer'
        || validCustomerAllocations.length > 0
    );

  if (useCustomerAllocation && validCustomerAllocations.length === 0) {
    message.warning('顧客と1以上の出庫数量を入力してください');
    return;
  }

  if (sheetFlowMode.value === 'outbound') {
    const invalid = sheetOutboundRows.value.some((record) => {
      const draft = sheetOutboundDrafts[goodsRowKey(record)] || {};
      const total = useCustomerAllocation
        ? validCustomerAllocations.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
        : Number(draft.aQty || 0) + Number(draft.bQty || 0) + Number(draft.cQty || 0);
      return total > availableGoodsOutboundQty(goodsRowKey(record));
    });
    if (invalid) {
      message.warning(TABLE_TEXT.outboundBelowCurrentQty);
      return;
    }
  }
  if (sheetFlowMode.value === 'delivery') {
    const invalid = sheetOutboundRows.value.some((record) => {
      const draft = sheetOutboundDrafts[goodsRowKey(record)] || {};
      const groupTotal = Number(draft.aQty || 0) + Number(draft.bQty || 0) + Number(draft.cQty || 0);
      return groupTotal > availableGoodsOutboundQty(goodsRowKey(record));
    });
    if (invalid) {
      message.warning(TABLE_TEXT.abcTotalBelowCurrentQty);
      return;
    }
  }

  sheetOutboundSubmitting.value = true;
  try {
    const submitFlow = sheetFlowMode.value === 'inbound'
      ? submitSheetStockInboundFlow
      : (!useCustomerAllocation
        ? submitDeliveryAllocationFlow
        : submitSheetStockOutboundFlow);
    const success = await submitFlow({
      items: sheetOutboundRows.value.map((record) => ({
        record,
        draft: sheetOutboundDrafts[goodsRowKey(record)] || {},
      })),
      settings: {
        ...sheetOutboundSettings,
        allocationMode: useCustomerAllocation ? 'customer' : sheetOutboundSettings.allocationMode,
        customerAllocations: useCustomerAllocation
          ? validCustomerAllocations
          : sheetOutboundSettings.customerAllocations,
        currentDeptId: props.currentDeptId || null,
      },
      notify: message,
    });
    if (success) {
      sheetOutboundModalOpen.value = false;
      selectedRowKeys.value = [];
      sheetOutboundActiveRowKey.value = '';
      await reload();
      await loadGoodsStockRows();
    }
  } catch (error) {
    message.error(error.message || TABLE_TEXT.saveFail);
  } finally {
    sheetOutboundSubmitting.value = false;
  }
}

function isGoodsInboundDone(record) {
  if (isSplitStockManagement.value) {
    return Number(
      record?.outboundMaxQty
        ?? record?.currentQty
        ?? record?.availableQty
        ?? record?.stockQty
        ?? record?.quantity
        ?? 0,
    ) > 0;
  }
  const state = goodsFlowByRowKey[goodsRowKey(record)];
  return Boolean(
    (state && Number(state.inboundQty) > 0)
      || record?.inboundDone,
  );
}

function canGoodsOutbound(record) {
  if (isSplitStockManagement.value) {
    return availableGoodsOutboundQty(goodsRowKey(record)) > 0;
  }
  return isGoodsInboundDone(record) && availableGoodsOutboundQty(goodsRowKey(record)) > 0;
}

function availableGoodsOutboundQty(rowKey) {
  if (isSplitStockManagement.value) {
    const record = tableRows.value.find((item) => goodsRowKey(item) === rowKey);
    return Math.max(0, Number(record?.outboundMaxQty ?? record?.currentQty ?? 0));
  }
  if (goodsOutboundForm.stockScope === 'group' && rowKey === activeGoodsRowKey.value) {
    return Math.max(0, Number(goodsOutboundForm.groupAvailableQty || 0));
  }
  const state = goodsFlowByRowKey[rowKey] || {};
  const inboundQty = Number(state.inboundQty || 0);
  const outboundQty = Number(state.outboundQty || 0);
  if (inboundQty > 0) {
    return Math.max(0, inboundQty - outboundQty);
  }
  const record = tableRows.value.find((item) => goodsRowKey(item) === rowKey);
  return Math.max(0, Number(record?.outboundMaxQty ?? record?.currentQty ?? 0));
}

function goodsRowKey(record) {
  const key = getRecordId(record) ?? record?.goodsId ?? record?.id;
  return key === undefined || key === null ? '' : String(key);
}

async function loadGoodsStockRows() {
  goodsStockLoading.value = true;
  try {
    const firstPage = await fetchPage('stock', {
      pageNum: 1,
      pageSize: 50,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
    const pageCount = Math.ceil(Number(firstPage.total || 0) / 50);
    const remainingPages = pageCount > 1
      ? await Promise.all(Array.from({ length: pageCount - 1 }, (_, index) => fetchPage('stock', {
        pageNum: index + 2,
        pageSize: 50,
        sortBy: 'updateTime',
        sortOrder: 'desc',
      })))
      : [];
    goodsStockRows.value = [
      ...(Array.isArray(firstPage.records) ? firstPage.records : []),
      ...remainingPages.flatMap((page) => (Array.isArray(page.records) ? page.records : [])),
    ];
  } catch (error) {
    goodsStockRows.value = [];
    message.error(error.message || TABLE_TEXT.fetchFail);
  } finally {
    goodsStockLoading.value = false;
  }
}

function mergeGoodsWithStock(goodsRows, stockRows) {
  const stocks = Array.isArray(stockRows) ? stockRows : [];
  return (Array.isArray(goodsRows) ? goodsRows : []).map((goods) => {
    const matched = stocks.filter((stock) => isSameGoodsStock(goods, stock));
    const currentQty = matched.reduce((total, stock) => total + stockCurrentQty(stock), 0);
    const stock = matched.find((item) => stockCurrentQty(item) > 0) || matched[0] || {};
    return {
      ...goods,
      goodsId: goods?.goodsId ?? goods?.id ?? stock?.goodsId ?? null,
      skuId: goods?.skuId ?? stock?.skuId ?? null,
      warehouseId: goods?.warehouseId ?? stock?.warehouseId ?? null,
      warehouseName: goods?.warehouseName ?? stock?.warehouseName ?? null,
      stockTypeId: goods?.stockTypeId ?? stock?.stockTypeId ?? null,
      stockTypeName: goods?.stockTypeName ?? stock?.stockTypeName ?? null,
      inventoryStatus: goods?.inventoryStatus ?? goods?.status ?? goods?.statusDesc ?? null,
      currentQty,
      outboundMaxQty: currentQty,
      customerQtyBreakdown: buildCustomerQtyBreakdown(matched),
      stockId: matched.length === 1 ? matched[0]?.id : null,
    };
  });
}

function isSameGoodsStock(goods, stock) {
  const goodsSkuId = Number(goods?.skuId);
  const stockSkuId = Number(stock?.skuId);
  if (goodsSkuId && stockSkuId) return goodsSkuId === stockSkuId;
  const goodsId = Number(goods?.goodsId ?? goods?.id);
  const stockGoodsId = Number(stock?.goodsId);
  return Boolean(goodsId && stockGoodsId && goodsId === stockGoodsId);
}

function stockCurrentQty(stock) {
  const value = stock?.currentQty ?? stock?.availableQty ?? stock?.stockQty ?? stock?.quantity ?? 0;
  const quantity = Number(value);
  return Number.isNaN(quantity) ? 0 : quantity;
}

function formatQty(value) {
  const quantity = Number(value);
  if (Number.isNaN(quantity)) return value ?? '-';
  return Math.abs(quantity);
}

function isActiveStatus(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return false;
  if (['0', 'false', 'off', 'disabled', 'inactive', 'invalid', '無効', '无效'].includes(text)) return false;
  return ['1', 'true', 'on', 'enabled', 'active', 'valid', '有効', '有效'].includes(text);
}

function formatInventoryStatus(value) {
  return isActiveStatus(value) ? '有効' : '無効';
}

function buildCustomerQtyBreakdown(stocks) {
  const grouped = new Map();
  (Array.isArray(stocks) ? stocks : []).forEach((stock, index) => {
    const qty = stockCurrentQty(stock);
    if (qty <= 0) return;
    const customerId = stock?.customerId ?? stock?.customer_code ?? stock?.customerCode ?? '';
    const label = String(
      stock?.customerName
        || stock?.customer_name
        || stock?.customerCode
        || stock?.customer_code
        || customerId
        || '?????',
    ).trim() || '?????';
    const key = String(customerId || label || index);
    const current = grouped.get(key) || { key, label, qty: 0 };
    current.qty += qty;
    grouped.set(key, current);
  });
  return Array.from(grouped.values()).sort((a, b) => a.label.localeCompare(b.label, 'ja'));
}

function customerQtyBreakdown(record) {
  if (!record || !isSplitStockManagement.value) return [];
  const source = Array.isArray(record?.customerQtyBreakdown) ? record.customerQtyBreakdown : [];
  return source
    .map((item, index) => ({
      key: String(item?.key ?? index),
      label: String(item?.label || '?????').trim() || '?????',
      qty: Number(item?.qty ?? 0),
    }))
    .filter((item) => !Number.isNaN(item.qty) && item.qty !== 0);
}

function persistGoodsFlowState() {
  // Browser storage cache removed intentionally.
}

function openCreate() {
  if (!canWrite.value || !canCreateInModule()) return;
  if (isGoodsManagement.value) {
    openGoodsDrawerCreate();
    return;
  }
  if (!canOpenHierarchyCreate()) return;
  const opened = openCreateState();
  if (opened) {
    if (Object.prototype.hasOwnProperty.call(formState, 'status')) {
      formState.status = 1;
    }
    applyStockOrderCreateDefaults();
    applyRequestFormCreateDefaults();
    loadScopedRelationOptions(formKeys.value, keys.value).then(() => {
      applyStockOrderRelationDefaults();
    });
    loadSourceOrderOptions();
  }
}

async function openEdit(record) {
  if (!canWrite.value || !canEditRecord(record)) return;
  if (isGoodsManagement.value) {
    openGoodsDrawerEdit(record);
    return;
  }
  const editRecord = await loadEditDetail(record);
  const opened = openEditState(editRecord, getRecordId);
  if (opened) {
    loadScopedRelationOptions(activeFormKeys(), keys.value);
    loadSourceOrderOptions();
  }
}

async function loadEditDetail(record) {
  if (isSplitStockManagement.value) return loadStockDetail(record);
  if (!hasRelationFormOptions()) return record;
  try {
    const detail = await fetchItem(props.moduleKey, getRecordId(record));
    return detail && typeof detail === 'object' ? { ...record, ...detail } : record;
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.fetchFail);
    return record;
  }
}

function hasRelationFormOptions() {
  return ['brand', 'series', 'maker'].includes(props.moduleKey);
}

async function loadStockDetail(record) {
  if (!isSplitStockManagement.value) return record;
  try {
    const detail = await fetchItem(modulePath.value, getRecordId(record));
    return detail && typeof detail === 'object' ? { ...record, ...detail } : record;
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.fetchFail);
    return record;
  }
}

async function loadScopedRelationOptions(formFields, tableKeys) {
  await loadRelationOptions(formFields, tableKeys);
  ensureCurrentDeptRelationOption();
  if (!isSplitStockManagement.value) return;
  if (!editing.value) {
    applyDefaultSplitStockWarehouse();
    return;
  }

  try {
    const scopedRows = await fetchModuleOptions(props.moduleKey);
    applySplitStockRelationScope(scopedRows);
  } catch (_error) {
    applySplitStockRelationScope(rows.value);
  }
}

function applySplitStockRelationScope(scopedRows) {
  const list = Array.isArray(scopedRows) ? scopedRows : [];
  scopeRelationOptionsByRecords('goodsId', list, 'goodsId', ['goodsName', 'name', 'skuCode']);
  scopeRelationOptionsByRecords('warehouseId', list, 'warehouseId', ['warehouseName', 'name', 'code']);
  ensureCurrentDeptRelationOption();
  scopeWarehouseOptionsByModuleLabel();
  applyDefaultSplitStockWarehouse();
}

function scopeRelationOptionsByRecords(field, records, idField, labelFields) {
  const idSet = new Set(records
    .map((item) => item?.[idField])
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .map((value) => String(value)));
  if (idSet.size === 0 || !Array.isArray(relationOptions[field])) return;

  const existingOptions = relationOptions[field] || [];
  const existingByValue = new Map(existingOptions.map((option) => [String(option.value), option]));
  const scopedOptions = [];
  const seen = new Set();

  records.forEach((record) => {
    const rawValue = record?.[idField];
    if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') return;
    const valueKey = String(rawValue);
    if (seen.has(valueKey)) return;
    seen.add(valueKey);
    const existing = existingByValue.get(valueKey);
    scopedOptions.push(existing || {
      value: rawValue,
      label: firstNonEmpty(record, labelFields) || `ID:${rawValue}`,
    });
  });

  relationOptions[field] = dedupeOptions(scopedOptions);
}

function scopeWarehouseOptionsByModuleLabel() {
  relationOptions.warehouseId = dedupeOptions(relationOptions.warehouseId || []);
}

function applyDefaultSplitStockWarehouse() {
  const options = relationOptions.warehouseId || [];
  if (!Array.isArray(options) || options.length === 0) return;
  const current = formState.warehouseId;
  const hasCurrent = current !== undefined
    && current !== null
    && options.some((option) => String(option.value) === String(current));
  if (hasCurrent) return;
  if (options.length === 1 || (!editing.value && props.moduleKey !== 'stock')) {
    const preferred = findSplitStockWarehouseOption(options);
    formState.warehouseId = (preferred || options[0]).value;
  }
}

function findSplitStockWarehouseOption(options) {
  const keywords = splitStockWarehouseKeywords();
  return (options || []).find((option) => {
    const label = String(option?.label || '').toLowerCase();
    return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
  });
}

function splitStockWarehouseKeywords() {
  return ['自社', 'self'];
}

function firstNonEmpty(record, fields) {
  for (const field of fields || []) {
    const value = record?.[field];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
}

function ensureCurrentDeptRelationOption() {
  if (!props.currentDeptId) return;
  const currentOption = {
    value: props.currentDeptId,
    label: props.currentDeptName || `ID:${props.currentDeptId}`,
  };
  const list = Array.isArray(relationOptions.deptId) ? relationOptions.deptId : [];
  if (list.length === 0) {
    relationOptions.deptId = [currentOption];
    return;
  }
  if (!list.some((option) => String(option?.value) === String(currentOption.value))) {
    relationOptions.deptId = dedupeOptions([...list, currentOption]);
  }
}

function activeFormKeys() {
  if (editing.value && isSplitStockManagement.value) {
    return ['goodsId', 'skuId', 'skuCode', 'warehouseId', 'currentQty', 'price', 'currency', 'stockTypeId'];
  }
  if (editing.value && props.moduleKey === 'requestForm' && isAdminUser.value) {
    return [...new Set([...formKeys.value, 'state'])];
  }
  return formKeys.value;
}

function filterFinanceFormKeys(fields, state) {
  if (props.moduleKey !== 'requestForm' && props.moduleKey !== 'requestItem') return fields;
  return (fields || []).filter((field) => {
    if (field === 'feeAmount') return Boolean(state.hasFee);
    if (field === 'unpaidAmount') return Boolean(state.hasUnpaid);
    return true;
  });
}

function applyFinanceToggleState(target, field, value) {
  if (props.moduleKey !== 'requestForm' && props.moduleKey !== 'requestItem') return;
  if (field === 'hasFee' && !value) {
    target.feeAmount = null;
  }
  if (field === 'hasUnpaid' && !value) {
    target.unpaidAmount = null;
  }
}

async function submit() {
  if (!canWrite.value) return;
  if (isGoodsManagement.value) return;
  await submitState(getRecordId, normalizeModulePayload);
  refreshRelationOptionCache();
}

async function onDelete(record) {
  if (!canWrite.value || !canDeleteRecord(record)) return;
  if (isSplitStockManagement.value) {
    try {
      await removeItem(modulePath.value, getRecordId(record));
      message.success(TABLE_TEXT.deleteSuccess);
      await reload();
      refreshRelationOptionCache();
    } catch (error) {
      message.error(error.message || TABLE_TEXT.deleteFail);
    }
    return;
  }
  await onDeleteState(record, getRecordId);
  refreshRelationOptionCache();
}

function isEditing(record) {
  return isEditingState(record, getRecordId);
}

function startInlineEdit(record) {
  if (!canWrite.value) return;
  if (!canInlineEditRecord(record) && !(isExcelEditModule.value && canEditRecord(record))) return;
  const started = startInlineEditState(record, getRecordId);
  if (started) {
    loadScopedRelationOptions(formKeys.value, keys.value);
  }
}

async function saveInlineEdit(record) {
  if (!canWrite.value) return;
  if (!canInlineEditRecord(record) && !(isExcelEditModule.value && canEditRecord(record))) return;
  await saveInlineEditState(record, getRecordId, normalizeModulePayload);
  refreshRelationOptionCache();
}

function refreshRelationOptionCache() {
  invalidateRelationModuleOptions([
    'dept',
    'role',
    'permission',
    'warehouse',
    'stockType',
    'goods',
    'goodsSku',
    'customer',
    'customerLevel',
    'series',
    'brand',
    'category',
    'maker',
  ]);
  loadScopedRelationOptions(activeFormKeys(), keys.value);
  loadQueryRelationOptions(queryFields.value);
}

function queryOptions(field) {
  const enumOptions = mergedEnumOptions(field);
  if (enumOptions.length > 0) return enumOptions;
  if (field === 'status') return statusOptions;
  return dedupeOptions(queryRelationOptions[field] || []);
}

function scopedSelectOptions(field) {
  const options = selectOptionsMerged(field);
  const low = String(field || '').toLowerCase();

  if (props.moduleKey === 'requestForm' && low === 'state' && !isAdminUser.value) {
    return options.filter((option) => REQUEST_FORM_USER_STATES.has(Number(option.value)));
  }

  if (props.moduleKey !== 'stockOrder' || isAdminUser.value) return options;

  if (low === 'sourcetype') {
    return options.filter((option) => STOCK_ORDER_USER_SOURCE_TYPES.has(Number(option.value)));
  }
  if (low === 'state') {
    return options.filter((option) => STOCK_ORDER_USER_STATES.has(Number(option.value)));
  }
  return options;
}

function normalizeModulePayload(payload) {
  const output = normalizePayload(payload);
  if (props.moduleKey === 'requestForm' && !isAdminUser.value) {
    if (Object.prototype.hasOwnProperty.call(output, 'state') && !REQUEST_FORM_USER_STATES.has(Number(output.state))) {
      output.state = REQUEST_FORM_DEFAULT_STATE;
    }
    return output;
  }

  if (props.moduleKey !== 'stockOrder' || isAdminUser.value) return output;

  if (Object.prototype.hasOwnProperty.call(output, 'sourceType') && !STOCK_ORDER_USER_SOURCE_TYPES.has(Number(output.sourceType))) {
    output.sourceType = STOCK_ORDER_DEFAULT_SOURCE_TYPE;
  }
  if (Object.prototype.hasOwnProperty.call(output, 'state') && !STOCK_ORDER_USER_STATES.has(Number(output.state))) {
    output.state = STOCK_ORDER_DEFAULT_STATE;
  }
  return output;
}

function applyStockOrderCreateDefaults() {
  if (props.moduleKey !== 'stockOrder' || editing.value) return;
  formState.bizDate = formatDateTime(new Date());
  formState.sourceType = STOCK_ORDER_DEFAULT_SOURCE_TYPE;
  formState.state = STOCK_ORDER_DEFAULT_STATE;
}

function applyRequestFormCreateDefaults() {
  if (props.moduleKey !== 'requestForm' || editing.value) return;
  formState.state = REQUEST_FORM_DEFAULT_STATE;
}

function applyStockOrderRelationDefaults() {
  if (props.moduleKey !== 'stockOrder' || editing.value) return;
  if (formState.stockTypeId !== undefined && formState.stockTypeId !== null && String(formState.stockTypeId).trim() !== '') return;
  const normalStockType = findOptionByKeywords(relationOptions.stockTypeId || [], NORMAL_STOCK_TYPE_KEYWORDS);
  if (normalStockType) {
    formState.stockTypeId = normalStockType.value;
  }
}

function findOptionByKeywords(options, keywords) {
  return (Array.isArray(options) ? options : []).find((option) => {
    const label = String(option?.label || '').toLowerCase();
    return keywords.some((keyword) => label.includes(String(keyword).toLowerCase()));
  });
}

function findOptionByMinId(options) {
  return (Array.isArray(options) ? options : [])
    .map((option, index) => {
      const numericId = Number(option?.value ?? option?.id);
      return {
        option,
        index,
        numericId: Number.isNaN(numericId) ? Number.POSITIVE_INFINITY : numericId,
      };
    })
    .sort((left, right) => left.numericId - right.numericId || left.index - right.index)[0]?.option ?? null;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day} 00:00:00`;
}

const {
  isAvatarField,
  resolveAvatarSrc,
  beforeAvatarUpload,
  beforeInlineAvatarUpload,
} = useModuleMedia({
  moduleKey: computed(() => props.moduleKey),
  formState,
  editState,
  inlineField,
  uploadFileByBizType,
  notify: message,
});

const {
  handleRowExtraAction: handleDefaultRowExtraAction,
  canShowRowExtraAction: canShowDefaultRowExtraAction,
  onReadAllMessages,
} = useModuleActions({
  moduleKey: computed(() => props.moduleKey),
  canWrite,
  rows,
  emit,
  detailNavigations: MODULE_DETAIL_NAVIGATIONS,
  downloadRequestFormFile,
  downloadRequestFormPdf,
  markMessageRead,
  markAllMessagesRead,
  markMessageListRead,
  markAllMessageListRead,
  getRecordId,
  reload,
});

async function handleRowExtraAction(actionKey, record) {
  if (props.moduleKey === 'stockOrder' && (actionKey === 'approve' || actionKey === 'reject')) {
    await submitStockOrderApproval(record, actionKey === 'approve');
    return;
  }
  if (actionKey === 'inbound') {
    await openGoodsInboundModal(record);
    return;
  }
  if (actionKey === 'returnInbound') {
    await submitStockOrderItemReturnFlow({
      record,
      reload,
      notify: message,
    });
    return;
  }
  if (actionKey === 'detail' && props.moduleKey === 'requestForm') {
    rememberRequestFormState(record);
  }
  await handleDefaultRowExtraAction(actionKey, record);
}

async function generateRequestForm() {
  if (props.moduleKey !== 'requestItem') return;
  if (requestFlowSubmitting.value) return;
  const items = selectedRequestFlowRows();
  if (items.length === 0) {
    message.warning(TABLE_TEXT.selectRequestItems);
    return;
  }
  const customerId = resolveRequestItemCustomerId(items);
  if (!customerId) {
    message.warning(TABLE_TEXT.selectRequestForm);
    return;
  }

  requestFlowSubmitting.value = true;
  try {
    const payloadItems = items.map((record) => buildRequestFlowPayloadItem(record))
      .filter((item) => isValidRequestFlowPayloadItem(item));
    if (payloadItems.length === 0) {
      message.warning('請求数量を入力してください');
      return;
    }
    const invalidQty = items.some((record) => {
      const requestQty = Number(requestFlowQtyValue(record) || 0);
      const availableQty = requestFlowMaxQty(record);
      return requestQty < 1 || (availableQty > 0 && requestQty > availableQty);
    });
    if (invalidQty) {
      message.warning('請求数量は1以上、生成可能数量以下で入力してください');
      return;
    }
    await createRequestFormWithSelectedItems({
      customerId,
      items: payloadItems,
    });
    message.success(TABLE_TEXT.requestFormGenerated);
    selectedRowKeys.value = [];
    Object.keys(requestItemQtyState).forEach((key) => delete requestItemQtyState[key]);
    await reload();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  } finally {
    requestFlowSubmitting.value = false;
  }
}

async function moveSelectedDeliveryToRequest() {
  if (props.moduleKey !== 'deliverySchedule') return;
  await submitRequestFlowMove({
    rowsToSubmit: selectedRequestFlowRows(),
    submitter: addRequestItemsToCart,
    emptyMessage: '発送予定表から追加する商品を選択してください',
    successMessage: '請求書明細へ追加しました',
  });
}

async function moveSelectedRequestToDelivery() {
  if (props.moduleKey !== 'requestItem') return;
  await submitRequestFlowMove({
    rowsToSubmit: selectedRequestFlowRows(),
    submitter: removeRequestItemsFromCart,
    emptyMessage: '発送予定表へ戻す明細を選択してください',
    successMessage: '発送予定表へ戻しました',
  });
}

async function submitRequestFlowMove({ rowsToSubmit, submitter, emptyMessage, successMessage }) {
  if (requestFlowSubmitting.value) return;
  const items = Array.isArray(rowsToSubmit) ? rowsToSubmit : [];
  if (items.length === 0) {
    message.warning(emptyMessage);
    return;
  }
  const customerId = resolveRequestItemCustomerId(items);
  if (!customerId) {
    message.warning(TABLE_TEXT.selectRequestForm);
    return;
  }
  const invalidQty = items.some((record) => {
    const requestQty = Number(requestFlowQtyValue(record) || 0);
    const maxQty = requestFlowMaxQty(record);
    return requestQty < 1 || (maxQty > 0 && requestQty > maxQty);
  });
  if (invalidQty) {
    message.warning('処理数量は1以上、選択行の数量以下で入力してください');
    return;
  }
  const payloadItems = items.map((record) => buildRequestFlowPayloadItem(record))
    .filter((item) => isValidRequestFlowPayloadItem(item));
  if (payloadItems.length === 0) {
    message.warning('処理数量を入力してください');
    return;
  }
  requestFlowSubmitting.value = true;
  try {
    await submitter({
      customerId,
      items: payloadItems,
    });
    message.success(successMessage);
    selectedRowKeys.value = [];
    Object.keys(requestItemQtyState).forEach((key) => delete requestItemQtyState[key]);
    await reload();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  } finally {
    requestFlowSubmitting.value = false;
  }
}

function buildRequestFlowPayloadItem(record) {
  const requestQty = Math.max(0, Math.floor(Number(requestFlowQtyValue(record) || 0)));
  const sources = Array.isArray(record?.__sources) && record.__sources.length > 0 ? record.__sources : [record];
  const stockRecordIds = uniquePositiveIds(sources.map((source) => source?.stockRecordId ?? source?.stock_record_id ?? source?.recordId ?? source?.record_id));
  const stockOrderItemIds = uniquePositiveIds(sources.map((source) => source?.stockOrderItemId ?? source?.stock_order_item_id ?? source?.orderItemId ?? source?.order_item_id));
  if (stockRecordIds.length > 1 || stockOrderItemIds.length > 1) {
    return {
      stockRecordIds,
      stockOrderItemIds,
      requestQty,
    };
  }
  return {
    stockRecordId: stockRecordIds[0] || 0,
    stockOrderItemId: stockOrderItemIds[0] || undefined,
    requestQty,
  };
}

function uniquePositiveIds(values = []) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0))];
}

function isValidRequestFlowPayloadItem(item) {
  if (!item || Number(item.requestQty || 0) <= 0) return false;
  if (item.stockRecordId) return true;
  return Array.isArray(item.stockRecordIds) && item.stockRecordIds.length > 0;
}

function resolveRequestItemCustomerId(items = []) {
  const fixed = props.fixedQueryParams?.customerId;
  if (fixed !== undefined && fixed !== null && String(fixed).trim() !== '') return fixed;
  const fromQuery = queryState.customerId;
  if (fromQuery !== undefined && fromQuery !== null && String(fromQuery).trim() !== '') return fromQuery;
  const hit = items.find((record) => record?.customerId !== undefined && record?.customerId !== null && String(record.customerId).trim() !== '');
  return hit?.customerId ?? null;
}

function selectedRequestFlowRows() {
  if (!isRequestFlowModule.value) return [];
  const selected = new Set((selectedRowKeys.value || []).map((key) => String(key)));
  return (tableRows.value || []).filter((record) => selected.has(String(getRowKey(record))));
}

function fillSelectedRequestFlowQty() {
  for (const record of selectedRequestFlowRows()) {
    requestItemQtyState[getRowKey(record)] = Math.max(1, requestFlowMaxQty(record) || 1);
  }
}

function clearSelectedRequestFlowQty() {
  for (const record of selectedRequestFlowRows()) {
    requestItemQtyState[getRowKey(record)] = 1;
  }
}

function excelCellKey(record, field) {
  return `${getRowKey(record)}::${String(field || '')}`;
}

function isActiveExcelCell(record, field) {
  return activeExcelCell.value === excelCellKey(record, field);
}

function isSelectedExcelCell(record, field) {
  return selectedExcelCell.value === excelCellKey(record, field);
}

function activateExcelCell(record, field) {
  if (!isExcelEditModule.value) return;
  selectedExcelCell.value = excelCellKey(record, field);
  activeExcelCell.value = '';
}

function editExcelCell(record, field) {
  if (!isExcelEditModule.value) return;
  if (props.moduleKey === 'requestForm' && !canEditRecord(record)) return;
  if (props.moduleKey === 'requestForm' && !isEditing(record)) return;
  selectedExcelCell.value = excelCellKey(record, field);
  const key = excelCellKey(record, field);
  if (!Object.prototype.hasOwnProperty.call(requestFlowCellDraftState, key)) {
    requestFlowCellDraftState[key] = cellDisplayValue(record, field) ?? '';
  }
  const editableField = inlineField(field);
  if (props.moduleKey === 'requestForm' && !Object.prototype.hasOwnProperty.call(editState, editableField)) {
    editState[editableField] = record?.[field] ?? null;
  }
  activeExcelCell.value = excelCellKey(record, field);
}

function deactivateExcelCell() {
  activeExcelCell.value = '';
}

function canRenderExcelInlineEditor(record, field) {
  if (String(field || '') === '__actions') return false;
  if (!isEditing(record)) return false;
  if (isExcelEditModule.value) return false;
  return !isReadonlyField(field);
}

function canRenderRequestFlowDraftEditor(record, field) {
  if (!isExcelEditModule.value) return false;
  if (String(field || '') === 'moveQty' || String(field || '') === '__actions') return false;
  return isActiveExcelCell(record, field);
}

function cellDisplayValue(record, field) {
  if (isExcelEditModule.value && String(field || '') !== 'moveQty') {
    const key = excelCellKey(record, field);
    if (Object.prototype.hasOwnProperty.call(requestFlowCellDraftState, key)) {
      return requestFlowCellDraftState[key];
    }
  }
  if (!isEditing(record)) return record?.[field];
  const editableField = inlineField(field);
  if (Object.prototype.hasOwnProperty.call(editState, editableField)) {
    return editState[editableField];
  }
  return record?.[field];
}

function requestFlowCellDraftValue(record, field) {
  const key = excelCellKey(record, field);
  if (Object.prototype.hasOwnProperty.call(requestFlowCellDraftState, key)) {
    return requestFlowCellDraftState[key];
  }
  return record?.[field] ?? '';
}

function updateRequestFlowCellDraft(record, field, value) {
  requestFlowCellDraftState[excelCellKey(record, field)] = value;
  if (props.moduleKey === 'requestForm') {
    editState[inlineField(field)] = value;
  }
}

function excelCellInputType(field) {
  const lower = String(field || '').toLowerCase();
  if (lower.includes('qty') || lower.includes('amount') || lower.includes('amt') || lower.includes('price') || lower.includes('rate')) {
    return 'number';
  }
  return 'text';
}

function placeCursorAtEnd(event) {
  const input = event?.target;
  if (!input || typeof input.setSelectionRange !== 'function') return;
  const length = String(input.value ?? '').length;
  requestAnimationFrame(() => {
    input.setSelectionRange(length, length);
  });
}

function requestFlowQtyValue(record) {
  const key = getRowKey(record);
  if (Object.prototype.hasOwnProperty.call(requestItemQtyState, key)) {
    return requestItemQtyState[key];
  }
  const qty = Number(record?.sourceQty ?? record?.requestQty ?? record?.quantity ?? record?.availableQty ?? 1);
  return Math.max(1, Math.abs(Number.isNaN(qty) ? 1 : Math.floor(qty || 1)));
}

function updateRequestFlowQty(record, value) {
  const key = getRowKey(record);
  const availableQty = requestFlowMaxQty(record);
  const nextQty = Math.max(1, Math.floor(Number(value || 1)));
  requestItemQtyState[key] = availableQty > 0 ? Math.min(nextQty, availableQty) : nextQty;
}

function requestFlowMaxQty(record) {
  const qty = Number(record?.sourceQty ?? record?.requestQty ?? record?.quantity ?? record?.availableQty ?? record?.requestableQty ?? record?.remainQty ?? 0);
  return Number.isNaN(qty) ? 0 : Math.max(0, Math.floor(Math.abs(qty)));
}

function canShowRowExtraAction(actionKey, record) {
  if (props.moduleKey === 'stockOrder' && (actionKey === 'approve' || actionKey === 'reject')) {
    return Boolean(props.moduleActions?.edit) && Number(record?.state ?? record?.orderState) !== 2;
  }
  if (actionKey === 'inbound') {
    return props.moduleKey === 'goods' && Boolean(record);
  }
  if (actionKey === 'returnInbound') {
    return props.moduleKey === 'stockOrderItem' && isCompletedOutboundRecord(record);
  }
  return canShowDefaultRowExtraAction(actionKey, record);
}

function canCreateInModule() {
  if (isSplitStockManagement.value) return false;
  if (props.moduleKey === 'deliverySchedule') return false;
  if (props.moduleKey === 'requestItem' && isCurrentRequestCompleted()) return false;
  return Boolean(props.moduleActions?.create) && (isGoodsManagement.value || formKeys.value.length > 0);
}

function isCompletedOutboundRecord(record) {
  const orderType = Number(record?.orderType ?? record?.stockOrderType);
  const state = Number(record?.state ?? record?.orderState);
  const changeQty = Number(record?.changeQty ?? 0);
  const isOutbound = orderType === STOCK_ORDER_TYPE.OUTBOUND || changeQty < 0;
  return isOutbound && state === STOCK_ORDER_STATE.COMPLETED;
}

function rememberRequestFormState(record) {
  const state = resolveRequestFormState(record);
  if (state === null) {
    clearNavigationState('jump_request_form_state');
    return;
  }
  setNavigationState('jump_request_form_state', state);
}

function resolveRequestFormState(record) {
  const raw = record?.state
    ?? record?.requestState
    ?? record?.requestFormState
    ?? record?.requestStatus
    ?? record?.requestFormStatus;
  if (raw === undefined || raw === null || String(raw).trim() === '') return null;
  const state = Number(raw);
  return Number.isNaN(state) ? null : state;
}

function isCompletedRequestRecord(record) {
  const state = resolveRequestFormState(record);
  return state === REQUEST_FORM_COMPLETED_STATE;
}

function isCurrentRequestCompleted() {
  if (props.moduleKey !== 'requestItem') return false;
  const rowCompleted = (rows.value || []).some((row) => isCompletedRequestRecord(row));
  if (rowCompleted) return true;
  const raw = getNavigationState('jump_request_form_state');
  const state = Number(raw);
  return !Number.isNaN(state) && state === REQUEST_FORM_COMPLETED_STATE;
}

function canBatchDeleteInModule() {
  if (isSplitStockManagement.value) return false;
  if (props.moduleKey === 'deliverySchedule') return false;
  if (props.moduleKey === 'requestItem') return false;
  return Boolean(props.moduleActions?.batchDelete);
}

function canDeleteRecord(_record) {
  if (props.moduleKey === 'deliverySchedule') return false;
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(_record)) return false;
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(_record) || isCurrentRequestCompleted())) return false;
  return Boolean(props.moduleActions?.delete);
}

function canEditRecord(record) {
  if (props.moduleKey === 'deliverySchedule') return false;
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(record)) return false;
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(record) || isCurrentRequestCompleted())) return false;
  if (props.moduleKey === 'stockOrder' && Number(record?.state ?? record?.orderState) === STOCK_ORDER_STATE.COMPLETED) return false;
  return Boolean(props.moduleActions?.edit);
}

function canInlineEditRecord(record) {
  if (props.moduleKey === 'deliverySchedule') return false;
  if (props.moduleKey === 'requestForm' && isCompletedRequestRecord(record)) return false;
  if (props.moduleKey === 'requestForm') return canEditRecord(record);
  if (props.moduleKey === 'requestItem' && (isCompletedRequestRecord(record) || isCurrentRequestCompleted())) return false;
  if (props.moduleKey === 'requestItem') return false;
  if (props.moduleKey === 'stockOrder' && Number(record?.state ?? record?.orderState) === STOCK_ORDER_STATE.COMPLETED) return false;
  return Boolean(props.moduleActions?.inlineEdit);
}

async function submitStockOrderApproval(record, approved) {
  const orderId = getRecordId(record);
  if (!orderId) return;
  try {
    await approveStockOrder(orderId, approved, approved ? 'approve' : 'reject');
    message.success(approved ? TABLE_TEXT.approveSuccess : TABLE_TEXT.rejectSuccess);
    await reload();
    if (approved && record?.customerId) {
      emit('navigate-module', {
        moduleKey: 'deliverySchedule',
        fixedQueryParams: { customerId: record.customerId },
        customerId: record.customerId,
        customerName: record.customerName || '',
      });
    }
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  }
}

function isMultiRelationField(field) {
  const key = String(field || '').toLowerCase();
  return key === 'permissionids';
}

function canOpenHierarchyCreate() {
  if (props.moduleKey === 'series') {
    const options = relationOptions.brandId || [];
    if (options.length === 0) {
      message.warning('先にブランドを登録してください');
      return false;
    }
  }
  if (props.moduleKey === 'maker') {
    const options = relationOptions.seriesId || [];
    if (options.length === 0) {
      message.warning('先にシリーズを登録してください');
      return false;
    }
  }
  return true;
}

function isFormFieldRequired(field) {
  if (props.moduleKey === 'user' && editing.value && String(field || '').toLowerCase() === 'password') {
    return false;
  }
  return requiredForForm(field);
}

function formPlaceholder(field) {
  const low = String(field || '').toLowerCase();
  if (props.moduleKey === 'user' && editing.value && low === 'password') {
    return TABLE_TEXT.passwordEmptyNoChange;
  }
  if (props.moduleKey === 'series' && field === 'brandId' && (relationOptions.brandId || []).length === 0) {
    return '先にブランドを登録してください';
  }
  if (props.moduleKey === 'maker' && field === 'seriesId' && (relationOptions.seriesId || []).length === 0) {
    return '先にシリーズを登録してください';
  }
  return '';
}

function isFormFieldDisabled(field) {
  if (editing.value) return false;
  if (props.moduleKey === 'series' && field === 'brandId') {
    return (relationOptions.brandId || []).length === 0;
  }
  if (props.moduleKey === 'maker' && field === 'seriesId') {
    return (relationOptions.seriesId || []).length === 0;
  }
  return false;
}

</script>

<style scoped>
:deep(.module-surface) {
  width: 100%;
}

:deep(.customer-matrix-surface) {
  max-width: 1480px;
  margin: 0 auto;
}

:deep(.customer-matrix-surface > .ant-card-body) {
  padding: 20px 24px 16px;
}

:global(html[data-theme-mode='dark']) :deep(.customer-matrix-surface.ant-card) {
  background: #101010 !important;
  border-color: #2f2f2f !important;
  box-shadow: none !important;
}

:global(html[data-theme-mode='dark']) :deep(.customer-matrix-surface.ant-card > .ant-card-body) {
  background: #101010 !important;
}

:global(html[data-theme-mode='dark']) :deep(.customer-matrix-surface .ant-table-wrapper) {
  background: #0f0f0f !important;
}

.table-stage {
  min-width: 0;
}

.excel-table-stage {
  margin-top: 8px;
  border: 1px solid #cfd8e3;
  border-radius: 10px;
  background: #f8fafc;
  overflow: hidden;
}

:deep(.excel-edit-table .ant-table) {
  background: #ffffff;
  font-size: 13px;
}

:deep(.excel-edit-table .ant-table-container) {
  border-radius: 10px;
}

:deep(.excel-edit-table .ant-table-thead > tr > th) {
  height: 36px;
  padding: 8px 10px;
  border-color: #cfd8e3 !important;
  background: #eaf0f7 !important;
  color: #1f2937;
  font-weight: 700;
  white-space: nowrap;
}

:deep(.excel-edit-table .ant-table-tbody > tr > td) {
  height: 38px;
  padding: 4px 8px;
  border-color: #d8e0ea !important;
  background: #ffffff;
  color: #111827;
  white-space: nowrap;
}

:deep(.excel-edit-table .ant-table-tbody > tr:hover > td) {
  background: #eef6ff !important;
}

:deep(.excel-edit-table .ant-table-tbody > tr:hover > td.excel-grid-cell-selected) {
  background: #ffffff !important;
  color: #111827 !important;
}

:deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-editable) {
  background: #fff8d7;
  box-shadow: inset 0 0 0 1px #efd27a, inset 4px 0 0 #f6c343;
  cursor: cell;
}

:deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected) {
  position: relative;
  background: #ffffff !important;
  color: #111827 !important;
  box-shadow: inset 0 0 0 2px #2563eb !important;
}

:deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected *) {
  color: #111827 !important;
  opacity: 1 !important;
}

:deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected::before) {
  position: absolute;
  top: 7px;
  bottom: 7px;
  left: 7px;
  width: 2px;
  background: #2563eb;
  content: "";
  pointer-events: none;
}

.excel-grid-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #cfd8e3;
  background: linear-gradient(90deg, #fff8d7 0%, #eff6ff 100%);
  color: #334155;
  font-size: 12px;
  font-weight: 600;
}

.excel-grid-hint-text {
  font-size: 12px;
}

.excel-grid-hint-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #f6c343;
  box-shadow: 0 0 0 3px rgba(246, 195, 67, 0.2);
}

.excel-display-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 120px;
  height: 30px;
  margin: -1px -4px;
  padding: 0 8px;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: cell;
  outline: none;
}

.excel-display-cell:hover,
.excel-display-cell:focus {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: inset 0 0 0 1px #2563eb;
}

.excel-display-cell-selected {
  position: relative;
  border-color: #2563eb;
  background: #ffffff;
  color: #111827;
  box-shadow: inset 0 0 0 2px #2563eb;
}

.excel-display-cell-selected::before {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 6px;
  width: 2px;
  background: #2563eb;
  content: "";
}

.excel-display-value {
  color: #0f172a;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.excel-display-cell-selected .excel-display-value {
  color: #111827;
}

.excel-edit-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  min-width: 120px;
}

:deep(.excel-edit-input) {
  width: 86px;
}

:deep(.excel-edit-input-wide) {
  width: 120px;
}

:deep(.excel-text-input) {
  width: 100%;
  min-width: 120px;
}

:deep(.excel-edit-input .ant-input-number-input) {
  height: 28px;
  text-align: right;
  font-weight: 700;
}

:deep(.excel-edit-input.ant-input-number) {
  border-color: #94a3b8;
  background: #ffffff;
}

:deep(.excel-edit-input.ant-input-number-focused),
:deep(.excel-edit-input.ant-input-number:focus-within) {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.16);
}

:deep(.excel-edit-table .ant-input),
:deep(.excel-edit-table .ant-input-number),
:deep(.excel-edit-table .ant-select-selector),
:deep(.excel-edit-table .ant-picker) {
  min-height: 28px;
  border-radius: 3px !important;
}

:deep(.excel-edit-table .ant-input),
:deep(.excel-edit-table .ant-picker),
:deep(.excel-edit-table .ant-select-selector) {
  background: #ffffff !important;
}

.excel-edit-limit {
  color: #64748b;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
}

:global(html[data-theme-mode='dark']) .excel-table-stage {
  border-color: #3a3a3a;
  background: #151515;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table) {
  background: #151515;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-thead > tr > th) {
  border-color: #3a3a3a !important;
  background: #242424 !important;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr > td) {
  border-color: #333333 !important;
  background: #181818;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr:hover > td) {
  background: #222a35 !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr:hover > td.excel-grid-cell-selected) {
  background: #111111 !important;
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-editable) {
  background: #29230f;
  box-shadow: inset 0 0 0 1px #7c651d, inset 4px 0 0 #d6a52a;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected) {
  position: relative;
  background: #111111 !important;
  color: #ffffff !important;
  box-shadow: inset 0 0 0 2px #60a5fa !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected *) {
  color: #ffffff !important;
  opacity: 1 !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-table-tbody > tr > td.excel-grid-cell-selected::before) {
  background: #60a5fa;
}

:global(html[data-theme-mode='dark']) .excel-grid-hint {
  border-bottom-color: #3a3a3a;
  background: linear-gradient(90deg, #29230f 0%, #172033 100%);
  color: #e5e7eb;
}

:global(html[data-theme-mode='dark']) .excel-display-cell:hover,
:global(html[data-theme-mode='dark']) .excel-display-cell:focus {
  border-color: #60a5fa;
  background: #172033;
}

:global(html[data-theme-mode='dark']) .excel-display-cell-selected {
  border-color: #60a5fa;
  background: #111111;
  color: #ffffff;
  box-shadow: inset 0 0 0 2px #60a5fa;
}

:global(html[data-theme-mode='dark']) .excel-display-cell-selected::before {
  background: #60a5fa;
}

:global(html[data-theme-mode='dark']) .excel-display-value {
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) .excel-display-cell-selected .excel-display-value {
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-input.ant-input-number) {
  border-color: #4b5563;
  background: #111111;
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-input),
:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-input-number),
:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-select-selector),
:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-picker) {
  border-color: #4b5563 !important;
  background: #111111 !important;
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-select-selection-item),
:global(html[data-theme-mode='dark']) :deep(.excel-edit-table .ant-picker-input > input) {
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) :deep(.excel-edit-input .ant-input-number-input) {
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) .excel-edit-limit {
  color: #a1a1aa;
}

.customer-matrix-stage {
  margin-top: 8px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92) 0%, rgba(255, 255, 255, 0.98) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

:global(html[data-theme-mode='dark']) :deep(.customer-matrix-surface) {
  background: #101010;
  border-color: #2f2f2f;
}

:global(html[data-theme-mode='dark']) .customer-matrix-stage {
  border-color: #2e2e2e;
  background: #0f0f0f;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

:global(html[data-theme-mode='dark']) .customer-matrix-stage :deep(.ant-table-wrapper) {
  background: #0f0f0f;
}

:global(html[data-theme-mode='dark']) .customer-matrix-stage :deep(.ant-table) {
  background: #0f0f0f;
}

:deep(.row-highlight-new > td) {
  background: #fff7e6 !important;
  transition: background-color 0.3s ease;
}

:deep(.module-table .ant-table-content) {
  overflow-x: auto !important;
}

:deep(.customer-matrix-stage .ant-table-wrapper) {
  min-width: 0;
}

:deep(.customer-matrix-stage .ant-table-container) {
  border-radius: 12px;
}

:deep(.customer-matrix-stage .ant-table-pagination) {
  margin-bottom: 0;
  padding-inline: 4px;
}

</style>
