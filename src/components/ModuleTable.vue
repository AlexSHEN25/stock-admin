<template>
  <a-card
    :class="['module-surface', { 'customer-matrix-surface': isCustomerGoodsSummary || isRequestItemMatrix }]"
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
      :can-batch-stock-flow="canOpenBatchStockFlow"
      :can-export="canExportCurrentList"
      :export-loading="exportLoading"
      :can-generate-request-form="canGenerateRequestForm"
      :can-move-delivery-to-request="canMoveDeliveryToRequest"
      :can-move-request-to-delivery="canMoveRequestToDelivery"
      :request-submitting="requestFlowSubmitting"
      :goods-import-loading="goodsImportLoading"
      :selected-count="selectedRequestCount"
      :query-input-type="queryInputType"
      :query-options="queryOptions"
      :query-placeholder="queryPlaceholder"
      :has-active-filters="hasActiveFilters"
      @search="searchCurrentModule"
      @reload="reloadCurrentModule"
      @reset="resetCurrentModuleQuery"
      @batch-delete="onBatchDelete"
      @create="openCreate"
      @sheet-inbound="openBatchStockDrawer('inbound')"
      @sheet-outbound="openSheetOutboundModal"
      @batch-stock-flow="openBatchStockFlow"
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

    <div :class="['table-stage', { 'customer-matrix-stage': isCustomerGoodsSummary || isRequestItemMatrix, 'request-matrix-stage': isRequestItemMatrix, 'excel-table-stage': isExcelEditModule }]">
      <div
        v-if="isExcelEditModule && !isRequestItemMatrix"
        class="excel-grid-hint"
      >
        <span class="excel-grid-hint-dot" />
        <span class="excel-grid-hint-text">セルをクリックして選択、ダブルクリックまたは Enter で編集できます。保存・追加・生成ボタンで一括反映します。</span>
      </div>
      <div
        v-if="isRequestItemMatrix"
        class="request-template-workbook"
      >
        <div
          v-if="activeRequestTemplateSheet"
          :key="activeRequestTemplateSheet.key"
          class="request-template-sheet"
        >
          <div class="request-template-sheet-title">
            <span>{{ activeRequestTemplateSheet.groupCode }}</span>
            <strong>{{ activeRequestTemplateSheet.customer.name }}</strong>
          </div>
          <div
            class="request-template-grid"
            :style="{ gridTemplateColumns: requestTemplateColumns(activeRequestTemplateSheet) }"
          >
            <div
              v-for="cell in requestTemplateHeaderCells(activeRequestTemplateSheet)"
              :key="cell.key"
              :class="['request-template-cell', cell.className]"
              :style="requestTemplateCellStyle(cell)"
            >
              {{ cell.value }}
            </div>
          </div>
          <div
            class="request-template-detail"
            :style="{ gridTemplateColumns: requestTemplateDetailColumns(activeRequestTemplateSheet) }"
          >
            <div
              v-for="header in activeRequestTemplateSheet.template.detailHeaders"
              :key="header.key"
              class="request-template-detail-header"
            >
              {{ header.label }}
            </div>
            <template
              v-for="record in activeRequestTemplateSheet.rows"
              :key="requestTemplateRecordKey(activeRequestTemplateSheet, record)"
            >
              <div
                v-for="header in activeRequestTemplateSheet.template.detailHeaders"
                :key="`${requestTemplateRecordKey(activeRequestTemplateSheet, record)}-${header.key}`"
                :class="['request-template-detail-cell', { 'request-template-detail-cell-selected': isRequestTemplateRowSelected(activeRequestTemplateSheet, record) }]"
              >
                <button
                  v-if="header.key === 'qty' && requestFlowSourceQty(record, 'requestItem') > 0"
                  type="button"
                  :class="['request-matrix-cell', { 'request-matrix-cell-selected': isRequestTemplateRowSelected(activeRequestTemplateSheet, record) }]"
                  @click="toggleRequestTemplateRow(activeRequestTemplateSheet, record)"
                >
                  {{ formatQty(requestFlowSourceQty(record, 'requestItem')) }}
                </button>
                <span v-else>{{ requestTemplateDetailValue(record, header.key) }}</span>
              </div>
            </template>
          </div>
        </div>
        <div
          v-else
          class="request-template-empty"
        >
          請求書明細がありません
        </div>
        <div
          v-if="requestTemplateSheets.length > 0"
          class="request-template-actionbar"
        >
          <div class="request-template-selection-summary">
            <strong>{{ requestTemplateSheetTabLabel(activeRequestTemplateSheet) }}</strong>
            <span>{{ activeRequestTemplateSelectedCount }} / {{ activeRequestTemplateRowCount }} 件選択</span>
          </div>
          <div class="request-template-actions">
            <button
              type="button"
              class="request-template-action"
              :disabled="activeRequestTemplateRowCount === 0"
              @click="selectActiveRequestTemplateSheetRows"
            >
              現在シートを全選択
            </button>
            <button
              type="button"
              class="request-template-action"
              :disabled="activeRequestTemplateSelectedCount === 0"
              @click="clearActiveRequestTemplateSheetSelection"
            >
              選択解除
            </button>
            <button
              type="button"
              class="request-template-action request-template-action-primary"
              :disabled="requestFlowSubmitting || activeRequestTemplateSelectedCount === 0"
              @click="moveSelectedRequestToDelivery"
            >
              発送予定表へ戻す
            </button>
          </div>
        </div>
        <div
          v-if="requestItemMonthTabs.length > 0"
          class="request-template-tabs"
        >
          <button
            v-for="month in requestItemMonthTabs"
            :key="month.key"
            type="button"
            :class="['request-template-tab', { 'request-template-tab-active': month.key === activeRequestItemMonthKey }]"
            @click="activateRequestItemMonth(month.key)"
          >
            {{ month.label }}
            <span class="request-template-tab-count">{{ formatQty(month.qty) }}</span>
          </button>
        </div>
      </div>
      <a-table
        v-else
        :key="props.moduleKey"
        :class="['module-table', { 'excel-edit-table': isExcelEditModule, 'request-matrix-table': isRequestItemMatrix }]"
        :row-key="getRowKey"
        :row-class-name="rowClassName"
        :columns="displayColumns"
        :data-source="tableRows"
        :row-selection="displayRowSelection"
        :loading="loading || goodsStockLoading || requestItemPreviewLoading"
        :pagination="tablePagination"
        :scroll="tableScroll"
        :sticky="tableSticky"
        @change="onChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="isRequestItemCustomerColumn(column.key)">
            <button
              v-if="requestItemMatrixQty(record, column.key) > 0"
              type="button"
              :class="['request-matrix-cell', { 'request-matrix-cell-selected': isRequestMatrixCellSelected(record, column.key) }]"
              @click="toggleRequestMatrixCell(record, column.key)"
            >
              {{ formatQty(requestItemMatrixQty(record, column.key)) }}
            </button>
            <span
              v-else
              class="request-matrix-empty"
            >
              -
            </span>
          </template>
          <template v-else-if="String(column.key) === 'requestItemMatrixTotal'">
            <span class="request-matrix-total">
              {{ formatQty(record.requestItemMatrixTotal) }}
            </span>
          </template>
          <template v-else-if="canRenderExcelInlineEditor(record, column.key)">
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
          <template v-else-if="String(column.key) === 'stockCategory'">
            {{ stockOrderCategoryLabel(record) }}
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
      :show-mode-switch="batchStockModeSwitchable"
      :submitting="batchStockSubmitting"
      :search-fields="batchStockSearchFields"
      :query-state="batchStockQueryState"
      :table-text="TABLE_TEXT"
      :query-input-type="batchStockQueryInputType"
      :query-options="queryOptions"
      :query-placeholder="queryPlaceholder"
      :has-active-filters="hasActiveFilters"
      @cancel="batchStockDrawerOpen = false"
      @submit="submitBatchStockFlow"
      @page-change="loadBatchStockGoodsPage"
      @search="searchBatchStockGoods"
      @reset-search="resetBatchStockGoodsSearch"
      @update-draft="updateBatchStockDraft"
      @update-setting="updateBatchStockSetting"
      @update-mode="switchBatchStockMode"
      @update-query-field="updateBatchStockQueryField"
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
  fetchRequestItemCartPreview,
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
  GOODS_TABLE_CONFIG,
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
import { formatTokyoDate, formatTokyoDateStart } from '../utils/timezone';

const STOCK_EDIT_PAYLOAD_FIELDS = ['id', 'goodsId', 'goodsName', 'skuId', 'skuCode', 'warehouseId', 'price', 'currency', 'stockTypeId', 'status', 'version'];
const GOODS_INBOUND_FIELDS = ['sourceType', 'warehouseId', 'stockTypeId', 'quantity', 'saleDeadline', 'remark'];
const GOODS_OUTBOUND_FIELDS = ['outboundMode', 'stockScope', 'customerId', 'deptId', 'warehouseId', 'stockTypeId', 'quantity', 'remark'];
const REQUEST_TEMPLATE_DETAIL_HEADERS = {
  JP_WIDE: [
    { key: 'description', label: '摘要', width: 'minmax(220px, 2fr)' },
    { key: 'bizDate', label: '出庫日', width: '96px' },
    { key: 'qty', label: '数量', width: '88px' },
    { key: 'unitPrice', label: '単価', width: '110px' },
    { key: 'amount', label: '金額', width: '110px' },
    { key: 'remark', label: '備考欄', width: '140px' },
  ],
  EN: [
    { key: 'no', label: 'No.', width: '64px' },
    { key: 'brandName', label: 'Brand', width: '130px' },
    { key: 'description', label: 'Item', width: 'minmax(220px, 2fr)' },
    { key: 'bizDate', label: 'Ship Date', width: '104px' },
    { key: 'qty', label: 'Qty', width: '88px' },
    { key: 'unitPrice', label: 'Unit price', width: '110px' },
    { key: 'amount', label: 'Price', width: '110px' },
    { key: 'remark', label: 'Remark', width: '140px' },
    { key: 'hsCode', label: 'HS Code', width: '120px' },
  ],
  JP_COMPACT: [
    { key: 'description', label: '摘要', width: 'minmax(220px, 2fr)' },
    { key: 'bizDate', label: '出庫日', width: '96px' },
    { key: 'qty', label: '数量', width: '88px' },
    { key: 'unitPrice', label: '単価', width: '110px' },
    { key: 'amount', label: '金額', width: '110px' },
    { key: 'remark', label: '備考欄', width: '140px' },
  ],
};
const REQUEST_FORM_TEMPLATE_LAYOUTS = {
  A: {
    colCount: 13,
    colWidths: ['70px', '70px', '78px', '78px', '78px', '78px', '78px', '78px', '78px', '84px', '88px', '104px', '104px'],
    rowHeights: { 1: 48, 7: 28, 8: 34, 9: 34, 10: 34, 11: 54, 15: 36, 16: 32 },
    detailHeaders: REQUEST_TEMPLATE_DETAIL_HEADERS.JP_WIDE,
    cells: [
      { r: 1, c: 1, cs: 13, v: '請　求　書', className: 'template-title' },
      { r: 3, c: 1, v: '登録番号：' },
      { r: 3, c: 12, cs: 2, v: 'T6120001175542' },
      { r: 4, c: 1, cs: 6, dynamic: 'customerName' },
      { r: 4, c: 8, v: '請求日：' },
      { r: 5, c: 1, v: 'ご担当' },
      { r: 5, c: 3, cs: 4, dynamic: 'contactName' },
      { r: 7, c: 10, cs: 4, v: '株式会社 H&K' },
      { r: 8, c: 3, cs: 7, dynamic: 'customerAddress' },
      { r: 9, c: 3, cs: 5, v: '前払い' },
      { r: 9, c: 8, cs: 6, v: '兵庫県尼崎市昭和通3丁目90-1　尼崎Ｋ．Ｒビルディング　6F' },
      { r: 10, c: 1, v: '支払期限：' },
      { r: 10, c: 3, cs: 7, v: 'TEL：06-6439-6361' },
      { r: 11, c: 1, v: '振込先：' },
      { r: 11, c: 3, cs: 7, v: 'みずほ銀行　尼崎支店（600）\n普通　1738095' },
      { r: 11, c: 10, v: 'FAX：06-6439-6362' },
      { r: 12, c: 1, v: 'E-Mail：' },
      { r: 13, c: 1, v: '担当：' },
      { r: 15, c: 1, cs: 2, v: '前回ご請求額' },
      { r: 15, c: 3, cs: 3, v: '前回入金金額' },
      { r: 15, c: 6, cs: 4, v: '調整金額' },
      { r: 15, c: 10, cs: 2, v: '繰越金額' },
      { r: 15, c: 12, v: '今回ご買上額' },
      { r: 15, c: 13, v: '今回ご請求額' },
      { r: 16, c: 1, cs: 13, v: '0' },
    ],
  },
  B: {
    colCount: 9,
    colWidths: ['82px', '132px', '168px', '132px', '96px', '96px', '96px', '120px', '120px'],
    rowHeights: { 1: 34, 2: 26, 3: 38, 5: 46, 6: 32, 7: 42, 8: 32, 9: 32, 21: 48 },
    detailHeaders: REQUEST_TEMPLATE_DETAIL_HEADERS.EN,
    cells: [
      { r: 1, c: 1, cs: 9, v: 'H&K CO., ＬＴＤ.(カブシキガイシャ エイチアンドケー)', className: 'template-title' },
      { r: 2, c: 1, cs: 9, v: 'TEL:(06)6439-6361     Email:cho@handk.co' },
      { r: 3, c: 1, cs: 9, v: 'Amagasaki K.R Bld.1F, 3-90-1, Showadori, Amagasaki City, Hyogo Prefecture, 660-0881, Japan' },
      { r: 5, c: 1, cs: 9, v: 'ＩＮＶＯＩＣＥ', className: 'template-title' },
      { r: 6, c: 1, v: 'MESSRS：' },
      { r: 6, c: 3, cs: 4, dynamic: 'customerName' },
      { r: 6, c: 8, v: 'DATE:' },
      { r: 7, c: 1, v: 'Address:' },
      { r: 7, c: 3, cs: 3, dynamic: 'customerAddress' },
      { r: 7, c: 8, v: 'FOB' },
      { r: 8, c: 1, v: 'Tel：' },
      { r: 8, c: 2, dynamic: 'customerPhone' },
      { r: 8, c: 3, v: 'Country of Origin:' },
      { r: 8, c: 8, v: 'Japan' },
      { r: 9, c: 1, v: 'EMAIL：' },
      { r: 9, c: 2, dynamic: 'customerEmail' },
      { r: 9, c: 3, v: 'TRANSPORTED FROM:' },
      { r: 9, c: 8, v: 'Osaka JAPAN' },
      { r: 11, c: 1, cs: 9, v: '【Bank information】' },
      { r: 12, c: 1, cs: 9, v: 'Bank Name: Resona Bank, Ltd.' },
      { r: 13, c: 1, cs: 9, v: 'Bank Address: 1-5-25 KIBA KOTO TOKYO JAPAN' },
      { r: 14, c: 1, cs: 9, v: 'Swift Code:  DIWAJPJT' },
      { r: 15, c: 1, cs: 9, v: 'Account No.（IBAN）:1532589' },
      { r: 16, c: 1, cs: 9, v: 'Account Type: Savings account(Futsuu)' },
      { r: 17, c: 1, cs: 9, v: 'Branch No.：528' },
      { r: 18, c: 1, cs: 9, v: 'Branch name：NISHINOMIYAKITAGUCHI Branch' },
      { r: 19, c: 1, cs: 9, v: 'Beneficiary Name: H AND K CO.,LTD' },
      { r: 20, c: 1, cs: 9, v: 'Beneficiary Address: Amagasaki K.R Bld.1F, 3-90-1, Showadori, Amagasaki City, Hyogo Prefecture, 660-0881, Japan' },
      { r: 21, c: 1, cs: 9, v: '※When total amount of order is less than 1 million yen,the bank transfer fee will be borne by the customer.' },
    ],
  },
  C: {
    colCount: 7,
    colWidths: ['92px', '86px', '122px', '150px', '110px', '110px', '126px'],
    rowHeights: { 1: 48, 7: 34, 9: 46, 14: 36, 15: 32 },
    detailHeaders: REQUEST_TEMPLATE_DETAIL_HEADERS.JP_COMPACT,
    cells: [
      { r: 1, c: 1, cs: 7, v: '請　求　書', className: 'template-title' },
      { r: 3, c: 1, v: '登録番号：' },
      { r: 3, c: 7, v: 'T6120001175542' },
      { r: 4, c: 1, cs: 3, dynamic: 'customerName' },
      { r: 4, c: 5, v: '請求日：' },
      { r: 7, c: 1, cs: 7, v: '下記のとおり、御請求申し上げます。' },
      { r: 8, c: 1, v: '締　日：' },
      { r: 8, c: 3, v: '株式会社Ｈ＆Ｋ' },
      { r: 9, c: 1, v: '支払期限：' },
      { r: 9, c: 3, v: '-' },
      { r: 9, c: 4, cs: 4, v: '〒660-0881  兵庫県尼崎市昭和通3丁目90-1\n尼崎Ｋ．Ｒビルディング　1F' },
      { r: 10, c: 1, v: '振込先：' },
      { r: 10, c: 3, v: 'みずほ銀行' },
      { r: 10, c: 4, v: 'TEL：06-6439-6361' },
      { r: 10, c: 7, v: 'FAX：06-6439-6362' },
      { r: 11, c: 1, v: '尼崎支店（600）' },
      { r: 11, c: 4, v: '担当：' },
      { r: 12, c: 1, v: '普通　1738095' },
      { r: 12, c: 4, v: 'E-Mail：' },
      { r: 14, c: 1, v: '前回ご請求額' },
      { r: 14, c: 3, v: '前回入金金額' },
      { r: 14, c: 4, v: '調整金額' },
      { r: 14, c: 5, v: '繰越金額' },
      { r: 14, c: 6, v: '今回ご買上額' },
      { r: 14, c: 7, v: '今回ご請求額' },
      { r: 15, c: 1, v: '0' },
      { r: 15, c: 5, v: '0' },
    ],
  },
};
const STOCK_ORDER_DEFAULT_SOURCE_TYPE = STOCK_ORDER_SOURCE_TYPE.SYSTEM;
const STOCK_ORDER_DEFAULT_STATE = STOCK_ORDER_STATE.PENDING;
const STOCK_ORDER_USER_SOURCE_TYPES = new Set([STOCK_ORDER_SOURCE_TYPE.INBOUND_REQUEST, STOCK_ORDER_SOURCE_TYPE.SYSTEM]);
const STOCK_ORDER_USER_STATES = new Set([STOCK_ORDER_STATE.PENDING, STOCK_ORDER_STATE.PROCESSING]);
const REQUEST_FORM_DEFAULT_STATE = REQUEST_FORM_STATE.PENDING;
const REQUEST_FORM_COMPLETED_STATE = REQUEST_FORM_STATE.COMPLETED;
const REQUEST_FORM_USER_STATES = new Set([REQUEST_FORM_STATE.PENDING, REQUEST_FORM_STATE.APPLYING]);
const NORMAL_STOCK_TYPE_KEYWORDS = ['騾壼ｸｸ', 'normal'];
const REQUEST_ITEM_UNKNOWN_MONTH_KEY = '__unknown_month__';

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
const selectedRequestMatrixCells = ref([]);
const selectedExcelCell = ref('');
const activeExcelCell = ref('');
const requestFlowSubmitting = ref(false);
const requestItemPreviewLoading = ref(false);
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
const batchStockModeSwitchable = ref(false);
const batchStockRows = ref([]);
const batchStockSelectedKeys = ref([]);
const batchStockDrafts = reactive({});
const batchStockQueryState = reactive({});
const batchStockSettings = reactive({
  sourceType: STOCK_SOURCE_TYPE.SELF_INBOUND,
  warehouseId: null,
  stockTypeId: null,
  quantity: 1,
  bizDate: null,
  remark: '',
});
const batchStockPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const batchStockSearchFields = computed(() => GOODS_TABLE_CONFIG.queryFields || []);
const goodsFlowByRowKey = reactive({});
const goodsStockRows = ref([]);
const customerGoodsMatrixColumns = ref([]);
const requestItemCustomerColumns = ref([]);
const requestItemPreviewRows = ref([]);
const activeRequestItemMonthKey = ref('');
const activeRequestTemplateSheetKey = ref('');
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
const isRequestItemMatrix = computed(() => props.moduleKey === 'requestItem');
const isRequestManagementModule = computed(() => props.moduleKey === 'requestForm' || isRequestFlowModule.value);
const isExcelEditModule = computed(() => isRequestManagementModule.value);
const requestItemMatrixColumns = computed(() => {
  if (!isRequestItemMatrix.value) return [];
  const staticColumns = [
    {
      title: '商品名',
      dataIndex: 'goodsName',
      key: 'goodsName',
      fixed: 'left',
      width: 220,
      ellipsis: false,
    },
    {
      title: '品番',
      dataIndex: 'skuCode',
      key: 'skuCode',
      fixed: 'left',
      width: 150,
      ellipsis: false,
    },
    {
      title: 'カテゴリ',
      dataIndex: 'categoryName',
      key: 'categoryName',
      width: 150,
      ellipsis: false,
    },
    {
      title: '在庫分類',
      dataIndex: 'stockTypeName',
      key: 'stockTypeName',
      width: 130,
      ellipsis: false,
    },
  ];
  const groupColumns = ['A', 'B', 'C'].map((groupCode) => {
    const children = requestItemCustomerColumns.value
      .filter((customer) => customer.groupCode === groupCode)
      .map((customer) => ({
        title: customer.name,
        dataIndex: requestItemCustomerKey(customer.id),
        key: requestItemCustomerKey(customer.id),
        width: 132,
        align: 'right',
        ellipsis: false,
        className: 'request-matrix-customer-cell',
      }));
    return children.length > 0
      ? {
        title: groupCode,
        key: `requestItemGroup${groupCode}`,
        align: 'center',
        children,
      }
      : null;
  }).filter(Boolean);
  return [
    ...staticColumns,
    ...groupColumns,
    {
      title: '合計',
      dataIndex: 'requestItemMatrixTotal',
      key: 'requestItemMatrixTotal',
      fixed: 'right',
      width: 110,
      align: 'right',
      className: 'request-matrix-total-cell',
    },
  ];
});
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
const displayColumns = computed(() => {
  if (isRequestItemMatrix.value) return requestItemMatrixColumns.value;
  if (isCustomerGoodsSummary.value) return customerGoodsMatrixTableColumns.value;
  return columns.value;
});
const tableScroll = computed(() => {
  if (!isCustomerGoodsSummary.value && !isRequestItemMatrix.value) {
    return { x: 'max-content' };
  }
  const sourceColumns = isRequestItemMatrix.value ? requestItemMatrixColumns.value : customerGoodsMatrixTableColumns.value;
  const totalWidth = flattenTableColumns(sourceColumns).reduce((sum, column) => (
    sum + Number(column?.width || 120)
  ), 0);
  return {
    x: Math.max(totalWidth, 960),
  };
});
const tableSticky = computed(() => (
  isCustomerGoodsSummary.value || isRequestItemMatrix.value
    ? { offsetScroll: 0 }
    : false
));
const tableRowSelection = computed(() => {
  if (isCustomerGoodsSummary.value || isRequestItemMatrix.value) return undefined;
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: onSelectChange,
    getCheckboxProps: (record) => ({
      disabled: isSplitStockManagement.value && stockCurrentQty(record) <= 0,
    }),
  };
});
const displayRowSelection = computed(() => tableRowSelection.value);
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
  && (
    selectedRequestCount.value > 0
    || Number(activeRequestTemplateSheet.value?.rows?.length || 0) > 0
  )
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
const selectedRequestCount = computed(() => (
  isRequestItemMatrix.value ? selectedRequestMatrixCells.value.length : selectedRowKeys.value.length
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
      : { ...stockViewQueryParams(), ...stockOrderUserQueryParams(), ...(props.fixedQueryParams || {}) }
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
  if (isRequestItemMatrix.value) {
    return buildRequestItemMatrixRows(requestItemPreviewRows.value);
  }
  if (isRequestFlowModule.value) {
    return aggregateRequestFlowRows(rows.value, props.moduleKey);
  }
  return rows.value;
});

function flattenTableColumns(sourceColumns = []) {
  const output = [];
  (Array.isArray(sourceColumns) ? sourceColumns : []).forEach((column) => {
    if (Array.isArray(column?.children) && column.children.length > 0) {
      output.push(...flattenTableColumns(column.children));
      return;
    }
    output.push(column);
  });
  return output;
}

function requestItemCustomerKey(customerId) {
  return `requestCustomer_${String(customerId ?? '')}`;
}

function isRequestItemCustomerColumn(key) {
  return String(key || '').startsWith('requestCustomer_');
}

function requestItemMatrixQty(record, key) {
  const qty = record?.__customerQtyMap?.[String(key || '')] ?? 0;
  const value = Number(qty);
  return Number.isNaN(value) ? 0 : value;
}

function requestMatrixCellKey(record, customerColumnKey) {
  return `${getRowKey(record)}::${String(customerColumnKey || '')}`;
}

function isRequestMatrixCellSelected(record, customerColumnKey) {
  return selectedRequestMatrixCells.value.includes(requestMatrixCellKey(record, customerColumnKey));
}

function toggleRequestMatrixCell(record, customerColumnKey) {
  const key = requestMatrixCellKey(record, customerColumnKey);
  const current = new Set(selectedRequestMatrixCells.value);
  if (current.has(key)) {
    current.delete(key);
  } else {
    current.add(key);
  }
  selectedRequestMatrixCells.value = [...current];
}

function buildRequestItemMatrixRows(sourceRows = []) {
  const groups = new Map();
  for (const record of Array.isArray(sourceRows) ? sourceRows : []) {
    if (!record || typeof record !== 'object') continue;
    const normalized = normalizeRequestFlowRecord(record, 'requestItem');
    const rowKey = requestItemMatrixRowKey(normalized);
    const customerId = normalized?.customerId ?? normalized?.customer_id;
    const customerKey = requestItemCustomerKey(customerId);
    const qty = requestFlowSourceQty(normalized, 'requestItem');
    const existing = groups.get(rowKey);
    if (!existing) {
      groups.set(rowKey, {
        ...normalized,
        id: rowKey,
        aggregateKey: rowKey,
        __sources: [normalized],
        __customerQtyMap: {
          [customerKey]: qty,
        },
        __customerSourceMap: {
          [customerKey]: [normalized],
        },
        requestItemMatrixTotal: qty,
      });
      continue;
    }
    existing.__sources.push(normalized);
    existing.__customerQtyMap[customerKey] = Number(existing.__customerQtyMap[customerKey] || 0) + qty;
    if (!Array.isArray(existing.__customerSourceMap[customerKey])) {
      existing.__customerSourceMap[customerKey] = [];
    }
    existing.__customerSourceMap[customerKey].push(normalized);
    existing.requestItemMatrixTotal = Number(existing.requestItemMatrixTotal || 0) + qty;
  }
  return [...groups.values()];
}

const requestTemplateSheets = computed(() => {
  if (!isRequestItemMatrix.value) return [];
  const grouped = new Map();
  requestItemRowsForActiveMonth.value.forEach((record) => {
    if (!record || typeof record !== 'object') return;
    const normalized = normalizeRequestFlowRecord(record, 'requestItem');
    const customer = resolveRequestTemplateCustomer(normalized);
    const groupCode = normalizeRequestCustomerGroupCode(customer) || normalizeRequestCustomerGroupCode(normalized) || 'A';
    const template = REQUEST_FORM_TEMPLATE_LAYOUTS[groupCode] || REQUEST_FORM_TEMPLATE_LAYOUTS.A;
    const customerId = customer.id ?? normalized?.customerId ?? normalized?.customer_id ?? '';
    const key = `${groupCode}::${String(customerId || customer.name || 'unknown')}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        groupCode,
        template,
        customer,
        rows: [],
      });
    }
    const sheet = grouped.get(key);
    sheet.rows.push({
      ...normalized,
      customerId: customer.id ?? normalized.customerId,
      customerName: customer.name || normalized.customerName,
      customerGroupCode: groupCode,
      groupCode,
      __templateNo: sheet.rows.length + 1,
    });
  });
  return [...grouped.values()].sort((left, right) => (
    left.groupCode.localeCompare(right.groupCode)
    || String(left.customer?.name || '').localeCompare(String(right.customer?.name || ''), 'ja')
  ));
});

const requestItemMonthTabs = computed(() => {
  if (!isRequestItemMatrix.value) return [];
  const grouped = new Map();
  (Array.isArray(requestItemPreviewRows.value) ? requestItemPreviewRows.value : []).forEach((record) => {
    const normalized = normalizeRequestFlowRecord(record, 'requestItem');
    const key = requestItemMonthKey(normalized);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        label: requestItemMonthLabel(key),
        qty: 0,
        count: 0,
      });
    }
    const item = grouped.get(key);
    item.qty += requestFlowSourceQty(normalized, 'requestItem');
    item.count += 1;
  });
  return [...grouped.values()].sort((left, right) => {
    if (left.key === REQUEST_ITEM_UNKNOWN_MONTH_KEY) return 1;
    if (right.key === REQUEST_ITEM_UNKNOWN_MONTH_KEY) return -1;
    return String(right.key).localeCompare(String(left.key));
  });
});

const requestItemRowsForActiveMonth = computed(() => {
  const source = Array.isArray(requestItemPreviewRows.value) ? requestItemPreviewRows.value : [];
  const activeKey = activeRequestItemMonthKey.value;
  if (!activeKey) return source;
  return source.filter((record) => requestItemMonthKey(record) === activeKey);
});

const activeRequestTemplateSheet = computed(() => {
  const sheets = requestTemplateSheets.value;
  if (sheets.length === 0) return null;
  return sheets.find((sheet) => sheet.key === activeRequestTemplateSheetKey.value) || sheets[0];
});
const activeRequestTemplateRowCount = computed(() => activeRequestTemplateSheet.value?.rows?.length || 0);
const activeRequestTemplateSelectedCount = computed(() => {
  const sheet = activeRequestTemplateSheet.value;
  if (!sheet) return 0;
  const selected = new Set(selectedRequestMatrixCells.value);
  return sheet.rows.filter((record) => selected.has(requestTemplateRecordKey(sheet, record))).length;
});

watch(
  requestItemMonthTabs,
  (months) => {
    if (!Array.isArray(months) || months.length === 0) {
      activeRequestItemMonthKey.value = '';
      selectedRequestMatrixCells.value = [];
      return;
    }
    if (!months.some((month) => month.key === activeRequestItemMonthKey.value)) {
      activeRequestItemMonthKey.value = months[0].key;
      selectedRequestMatrixCells.value = [];
    }
  },
  { immediate: true },
);

watch(
  requestTemplateSheets,
  (sheets) => {
    if (!Array.isArray(sheets) || sheets.length === 0) {
      activeRequestTemplateSheetKey.value = '';
      selectedRequestMatrixCells.value = [];
      return;
    }
    if (!sheets.some((sheet) => sheet.key === activeRequestTemplateSheetKey.value)) {
      activeRequestTemplateSheetKey.value = sheets[0].key;
      selectedRequestMatrixCells.value = [];
    }
  },
  { immediate: true },
);

function activateRequestItemMonth(monthKey) {
  if (activeRequestItemMonthKey.value === monthKey) return;
  activeRequestItemMonthKey.value = monthKey;
  activeRequestTemplateSheetKey.value = '';
  selectedRequestMatrixCells.value = [];
}

function requestTemplateSheetTabLabel(sheet) {
  const customerName = sheet?.customer?.name || '未設定';
  return `${sheet?.groupCode || ''} ${customerName}`.trim();
}

function requestItemMonthKey(record) {
  const dateText = resolveRequestItemGoodsOutboundDate(record);
  const match = String(dateText || '').match(/^(\d{4})[-/](\d{1,2})/);
  if (!match) return REQUEST_ITEM_UNKNOWN_MONTH_KEY;
  return `${match[1]}-${String(match[2]).padStart(2, '0')}`;
}

function resolveRequestItemGoodsOutboundDate(record) {
  return firstText(
    record?.outboundDate,
    record?.outbound_date,
    record?.stockOutboundDate,
    record?.stock_outbound_date,
    record?.goodsOutboundDate,
    record?.goods_outbound_date,
    record?.stockRecordBizDate,
    record?.stock_record_biz_date,
    record?.stockBizDate,
    record?.stock_biz_date,
    record?.bizDate,
    record?.biz_date,
    record?.outDate,
    record?.out_date,
  );
}

function requestItemMonthLabel(key) {
  if (key === REQUEST_ITEM_UNKNOWN_MONTH_KEY) return '年月未設定';
  const [year, month] = String(key || '').split('-');
  if (!year || !month) return '年月未設定';
  return `${year}年${month}月`;
}

function selectActiveRequestTemplateSheetRows() {
  const sheet = activeRequestTemplateSheet.value;
  if (!sheet) return;
  selectedRequestMatrixCells.value = sheet.rows
    .filter((record) => requestFlowSourceQty(record, 'requestItem') > 0)
    .map((record) => requestTemplateRecordKey(sheet, record));
}

function clearActiveRequestTemplateSheetSelection() {
  const sheet = activeRequestTemplateSheet.value;
  if (!sheet) {
    selectedRequestMatrixCells.value = [];
    return;
  }
  const currentSheetKeys = new Set(sheet.rows.map((record) => requestTemplateRecordKey(sheet, record)));
  selectedRequestMatrixCells.value = selectedRequestMatrixCells.value.filter((key) => !currentSheetKeys.has(key));
}

function resolveRequestTemplateCustomer(record, groupCode) {
  const id = record?.customerId ?? record?.customer_id;
  const fromColumn = requestItemCustomerColumns.value.find((customer) => (
    String(customer?.id) === String(id)
    && (!groupCode || customer?.groupCode === groupCode)
  )) || requestItemCustomerColumns.value.find((customer) => String(customer?.id) === String(id));
  return {
    id,
    groupCode: normalizeRequestCustomerGroupCode(fromColumn) || normalizeRequestCustomerGroupCode(record),
    name: firstText(
      record?.customerName,
      record?.customer_name,
      fromColumn?.name,
      record?.customerCode,
      record?.customer_code,
      id,
    ),
    englishName: firstText(
      record?.customerEnglishName,
      record?.customer_english_name,
      record?.englishName,
      record?.english_name,
      fromColumn?.englishName,
      fromColumn?.english_name,
    ),
    contactName: firstText(
      record?.contactName,
      record?.contact_name,
      record?.customerContactName,
      record?.customer_contact_name,
      record?.contactPerson,
      record?.contact_person,
      fromColumn?.contactName,
      fromColumn?.contact_name,
      fromColumn?.contactPerson,
      fromColumn?.contact_person,
    ),
    address: buildRequestTemplateCustomerAddress(record, fromColumn),
    phone: firstText(
      record?.customerPhone,
      record?.customer_phone,
      record?.phone,
      record?.tel,
      record?.telephone,
      fromColumn?.phone,
      fromColumn?.tel,
      fromColumn?.telephone,
    ),
    email: firstText(
      record?.customerEmail,
      record?.customer_email,
      record?.email,
      fromColumn?.email,
      fromColumn?.customerEmail,
    ),
    postalCode: firstText(
      record?.postalCode,
      record?.postal_code,
      record?.zipCode,
      record?.zip_code,
      fromColumn?.postalCode,
      fromColumn?.postal_code,
      fromColumn?.zipCode,
      fromColumn?.zip_code,
    ),
    country: firstText(record?.country, fromColumn?.country),
    city: firstText(record?.city, fromColumn?.city),
  };
}

function buildRequestTemplateCustomerAddress(...sources) {
  const direct = firstText(...sources.flatMap((source) => [
    source?.customerAddress,
    source?.customer_address,
    source?.billingAddress,
    source?.billing_address,
    source?.invoiceAddress,
    source?.invoice_address,
    source?.address,
  ]));
  if (direct) return direct;
  const firstSourceWithAddressParts = sources.find((source) => firstText(
    source?.postalCode,
    source?.postal_code,
    source?.zipCode,
    source?.zip_code,
    source?.country,
    source?.city,
  ));
  if (!firstSourceWithAddressParts) return '';
  const postalCode = firstText(
    firstSourceWithAddressParts?.postalCode,
    firstSourceWithAddressParts?.postal_code,
    firstSourceWithAddressParts?.zipCode,
    firstSourceWithAddressParts?.zip_code,
  );
  const area = [
    firstSourceWithAddressParts?.country,
    firstSourceWithAddressParts?.city,
  ].filter((value) => value !== undefined && value !== null && String(value).trim() !== '').join(' ');
  return [postalCode ? `〒${postalCode}` : '', area].filter(Boolean).join(' ');
}

function firstTemplateCustomerText(item, ...keys) {
  for (const key of keys) {
    const camel = key;
    const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    const value = firstText(item?.[camel], item?.[snake]);
    if (value) return value;
  }
  return '';
}

function resolveRequestTemplateCustomerAddress(item) {
  return buildRequestTemplateCustomerAddress({
    customerAddress: firstTemplateCustomerText(item, 'customerAddress'),
    billingAddress: firstTemplateCustomerText(item, 'billingAddress'),
    invoiceAddress: firstTemplateCustomerText(item, 'invoiceAddress'),
    address: item?.address,
    postalCode: firstTemplateCustomerText(item, 'postalCode'),
    zipCode: firstTemplateCustomerText(item, 'zipCode'),
    country: item?.country,
    city: item?.city,
  });
}

function firstText(...values) {
  const hit = values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
  return hit === undefined ? '' : String(hit).trim();
}

function requestTemplateHeaderCells(sheet) {
  const template = sheet?.template || REQUEST_FORM_TEMPLATE_LAYOUTS.A;
  return (template.cells || []).map((cell) => ({
    ...cell,
    __groupCode: sheet?.groupCode || 'A',
    key: `${sheet.key}-${cell.r}-${cell.c}-${cell.dynamic || cell.v || ''}`,
    value: requestTemplateHeaderValue(sheet, cell),
    className: requestTemplateCellClassName(sheet, cell),
  }));
}

function requestTemplateCellClassName(sheet, cell) {
  return [
    cell.className || '',
    `template-${String(sheet?.groupCode || 'A').toLowerCase()}`,
    cell.dynamic ? 'template-dynamic' : '',
    requestTemplateIsSummaryCell(cell) ? 'template-summary' : '',
    requestTemplateShouldWrapCell(cell) ? 'template-wrap' : '',
  ].filter(Boolean).join(' ');
}

function requestTemplateHeaderValue(sheet, cell) {
  if (!cell?.dynamic) return cell?.v ?? '';
  const customer = sheet?.customer || {};
  if (cell.dynamic === 'customerName') {
    const name = sheet?.groupCode === 'B' ? (customer.englishName || customer.name || '') : (customer.name || '');
    return sheet?.groupCode === 'B' ? name : [name, '御中'].filter(Boolean).join(' ');
  }
  if (cell.dynamic === 'contactName') {
    const name = customer.contactName || '';
    return name ? `${name} 様` : '様';
  }
  if (cell.dynamic === 'customerAddress') return customer.address || '';
  if (cell.dynamic === 'customerPhone') return customer.phone || '';
  if (cell.dynamic === 'customerEmail') return customer.email || '';
  return '';
}

function requestTemplateCellStyle(cell) {
  const rowHeight = REQUEST_FORM_TEMPLATE_LAYOUTS[cell?.__groupCode]?.rowHeights?.[cell.r];
  return {
    gridColumn: `${cell.c} / span ${cell.cs || 1}`,
    gridRow: `${cell.r} / span ${cell.rs || 1}`,
    minHeight: `${requestTemplateCellHeight(cell, rowHeight)}px`,
    justifyContent: requestTemplateCellJustify(cell),
    alignItems: requestTemplateCellAlign(cell),
    textAlign: requestTemplateCellTextAlign(cell),
    fontWeight: requestTemplateCellFontWeight(cell),
  };
}

function requestTemplateColumns(sheet) {
  const widths = sheet?.template?.colWidths;
  if (Array.isArray(widths) && widths.length > 0) {
    return widths.map((width) => `minmax(${width}, 1fr)`).join(' ');
  }
  return `repeat(${sheet?.template?.colCount || 1}, minmax(86px, 1fr))`;
}

function requestTemplateCellHeight(cell, rowHeight) {
  if (Number(rowHeight) > 0) return Number(rowHeight);
  if (requestTemplateShouldWrapCell(cell)) return 42;
  return cell?.className?.includes('template-title') ? 48 : 30;
}

function requestTemplateCellJustify(cell) {
  if (cell?.className?.includes('template-title')) return 'center';
  if (requestTemplateIsSummaryCell(cell)) return 'center';
  if (cell?.align === 'right') return 'flex-end';
  if (cell?.align === 'center') return 'center';
  return 'flex-start';
}

function requestTemplateCellAlign(cell) {
  if (cell?.valign === 'top' || requestTemplateShouldWrapCell(cell)) return 'flex-start';
  if (cell?.valign === 'bottom') return 'flex-end';
  return 'center';
}

function requestTemplateCellTextAlign(cell) {
  if (cell?.className?.includes('template-title') || requestTemplateIsSummaryCell(cell)) return 'center';
  return cell?.align || 'left';
}

function requestTemplateCellFontWeight(cell) {
  if (cell?.className?.includes('template-title') || requestTemplateIsSummaryCell(cell)) return 800;
  if (cell?.bold) return 700;
  return 400;
}

function requestTemplateShouldWrapCell(cell) {
  const value = String(cell?.v ?? '');
  return value.includes('\n') || Number(cell?.cs || 1) >= 3;
}

function requestTemplateIsSummaryCell(cell) {
  const groupCode = String(cell?.__groupCode || '').toUpperCase();
  if (groupCode === 'A') return cell?.r === 15 || cell?.r === 16;
  if (groupCode === 'C') return cell?.r === 14 || cell?.r === 15;
  return false;
}

function requestTemplateDetailColumns(sheet) {
  return (sheet?.template?.detailHeaders || REQUEST_TEMPLATE_DETAIL_HEADERS.JP_WIDE)
    .map((header) => header.width || 'minmax(96px, 1fr)')
    .join(' ');
}

function requestTemplateRecordKey(sheet, record) {
  const id = firstText(
    record?.stockRecordId,
    record?.stock_record_id,
    record?.stockOrderItemId,
    record?.stock_order_item_id,
    record?.id,
    record?.aggregateKey,
    record?.goodsId,
    record?.skuId,
    record?.skuCode,
    record?.__templateNo,
  );
  return `${sheet?.key || 'sheet'}::${id}`;
}

function requestTemplateDetailValue(record, key) {
  if (key === 'no') return record?.__templateNo ?? '';
  if (key === 'brandName') return firstText(record?.brandName, record?.brand_name, record?.brand);
  if (key === 'description') {
    return firstText(record?.goodsName, record?.goods_name, record?.itemName, record?.item_name, record?.name, record?.skuCode);
  }
  if (key === 'bizDate') return resolveRequestItemGoodsOutboundDate(record);
  if (key === 'qty') return formatQty(requestFlowSourceQty(record, 'requestItem'));
  if (key === 'unitPrice') return formatRequestTemplateNumber(record?.unitPrice ?? record?.unit_price ?? record?.price);
  if (key === 'amount') return formatRequestTemplateNumber(resolveRequestTemplateAmount(record));
  if (key === 'remark') {
    const outboundDate = resolveRequestItemGoodsOutboundDate(record);
    return outboundDate ? `納品日:${outboundDate}` : '';
  }
  if (key === 'hsCode') return firstText(record?.hsCode, record?.hs_code);
  return firstText(record?.[key]);
}

function resolveRequestTemplateAmount(record) {
  const direct = record?.amount ?? record?.totalAmount ?? record?.total_amount ?? record?.priceAmount ?? record?.price_amount;
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') return direct;
  const qty = Number(requestFlowSourceQty(record, 'requestItem') || 0);
  const price = Number(record?.unitPrice ?? record?.unit_price ?? record?.price ?? 0);
  if (!qty || Number.isNaN(price)) return '';
  return qty * price;
}

function formatRequestTemplateNumber(value) {
  if (value === undefined || value === null || String(value).trim() === '') return '';
  const number = Number(value);
  if (Number.isNaN(number)) return value;
  return number.toLocaleString('ja-JP');
}

function isRequestTemplateRowSelected(sheet, record) {
  return selectedRequestMatrixCells.value.includes(requestTemplateRecordKey(sheet, record));
}

function toggleRequestTemplateRow(sheet, record) {
  const key = requestTemplateRecordKey(sheet, record);
  const current = new Set(selectedRequestMatrixCells.value);
  if (current.has(key)) {
    current.delete(key);
  } else {
    current.add(key);
  }
  selectedRequestMatrixCells.value = [...current];
}

function requestItemMatrixRowKey(record) {
  return [
    record?.goodsId,
    record?.skuId,
    record?.skuCode,
    record?.goodsName,
    record?.categoryId,
    record?.categoryName,
    record?.stockTypeId,
    record?.price,
    record?.currency,
  ].map((value) => String(value ?? '')).join('|');
}

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
  const requestItemQuantity = firstNumericValue(
    record?.requestQty,
    record?.request_qty,
    record?.sourceQty,
    record?.source_qty,
    record?.quantity,
    record?.availableQty,
    record?.available_qty,
    record?.moveQty,
    record?.move_qty,
  );
  const quantity = Number(isRequestItem
    ? requestItemQuantity
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
    availableQty: safeWholeQty(record?.availableQty ?? record?.available_qty ?? quantity),
    requestQty: safeWholeQty(record?.requestQty ?? record?.request_qty ?? quantity),
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
    return safeWholeQty(firstNumericValue(
      record?.requestQty,
      record?.request_qty,
      record?.sourceQty,
      record?.source_qty,
      record?.quantity,
      record?.availableQty,
      record?.available_qty,
      record?.moveQty,
      record?.move_qty,
      0,
    ));
  }
  return safeWholeQty(record?.quantity ?? record?.sourceQty ?? record?.source_qty ?? 0);
}

function safeWholeQty(value) {
  const qty = Number(value);
  if (Number.isNaN(qty)) return 0;
  return Math.max(0, Math.floor(Math.abs(qty)));
}

function firstNumericValue(...values) {
  const hit = values.find((value) => value !== undefined && value !== null && String(value).trim() !== '' && !Number.isNaN(Number(value)));
  return hit ?? 0;
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

function stockOrderUserQueryParams() {
  if (props.moduleKey !== 'stockOrder' || isAdminUser.value) return {};
  const params = {
    orderType: STOCK_ORDER_TYPE.OUTBOUND,
  };
  if (props.currentUserId) {
    params.requesterId = props.currentUserId;
  } else if (props.currentUser) {
    params.requesterName = props.currentUser;
  }
  return params;
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
const canOpenSheetInbound = computed(() => (
  (isSelfStockModule.value || isGroupStockModule.value)
  && canWrite.value
));
const canOpenSheetOutbound = computed(() => (
  (isSelfStockModule.value || isGroupStockModule.value)
  && canWrite.value
  && selectedGoodsRows().some((record) => stockCurrentQty(record) > 0)
));
const canOpenBatchStockFlow = computed(() => (
  isSelfStockModule.value
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
  () => props.moduleKey,
  () => {
    clearTransientUiState();
  },
);

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
    if (isRequestItemMatrix.value) {
      await refreshRequestItemPreview();
    } else {
      requestItemCustomerColumns.value = [];
      requestItemPreviewRows.value = [];
      selectedRequestMatrixCells.value = [];
    }
  },
  { immediate: true },
);

async function reloadCurrentModule() {
  await reload();
  await refreshRequestItemPreview();
}

async function searchCurrentModule() {
  doSearch();
  await refreshRequestItemPreview();
}

async function resetCurrentModuleQuery() {
  resetQuery();
  await refreshRequestItemPreview();
}

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

async function loadRequestItemCustomerColumns() {
  const fromRows = extractRequestItemCustomers(requestItemPreviewRows.value);
  try {
    const params = {
      pageNum: 1,
      pageSize: 300,
    };
    if (props.currentUserId && !isAdminUser.value) {
      params.ownerUserId = Number(props.currentUserId);
    }
    const page = await fetchCurrentUserCustomerPage(params);
    requestItemCustomerColumns.value = mergeRequestItemCustomers(
      normalizeRequestItemCustomers(page?.records || []),
      fromRows,
    );
  } catch (_error) {
    requestItemCustomerColumns.value = fromRows;
  }
}

async function refreshRequestItemPreview() {
  if (!isRequestItemMatrix.value) return;
  requestItemPreviewLoading.value = true;
  selectedRequestMatrixCells.value = [];
  try {
    requestItemPreviewRows.value = await fetchRequestItemPreviewRows();
    await loadRequestItemCustomerColumns();
  } catch (error) {
    requestItemPreviewRows.value = [];
    requestItemCustomerColumns.value = [];
    message.error(error?.message || TABLE_TEXT.fetchFail);
  } finally {
    requestItemPreviewLoading.value = false;
  }
}

async function fetchRequestItemPreviewRows() {
  const customerId = resolveRequestItemPreviewCustomerId();
  const groups = ['A', 'B', 'C'];
  const pages = await Promise.all(groups.map(async (groupCode) => {
    const payload = await fetchRequestItemCartPreview({
      ...buildRequestItemPreviewParams(),
      ...(customerId ? { customerId } : {}),
      groupCode,
    });
    return normalizeRequestItemPreviewPayload(payload, groupCode);
  }));
  return mergeRequestItemPreviewRows(pages.flat(), rows.value || []);
}

function mergeRequestItemPreviewRows(previewRows = [], cartRows = []) {
  const merged = new Map();
  const previewSourceKeys = new Set();
  (Array.isArray(previewRows) ? previewRows : []).forEach((record) => {
    const key = requestItemPreviewRecordKey(record);
    if (!key) return;
    merged.set(key, record);
    const sourceKey = requestItemPreviewSourceKey(record);
    if (sourceKey) previewSourceKeys.add(sourceKey);
  });
  (Array.isArray(cartRows) ? cartRows : []).forEach((record) => {
    const normalized = normalizeRequestItemCartFallbackRecord(record);
    const sourceKey = requestItemPreviewSourceKey(normalized);
    if (!hasRequestItemCustomerInfo(normalized) && sourceKey && previewSourceKeys.has(sourceKey)) return;
    const key = requestItemPreviewRecordKey(normalized);
    if (!key || merged.has(key)) return;
    merged.set(key, normalized);
  });
  return [...merged.values()];
}

function normalizeRequestItemCartFallbackRecord(record) {
  return {
    ...record,
    groupCode: record?.groupCode ?? record?.group_code ?? record?.customerGroupCode ?? record?.customer_group_code,
    customerId: record?.customerId ?? record?.customer_id,
    customerName: record?.customerName ?? record?.customer_name,
    requestQty: firstNumericValue(
      record?.requestQty,
      record?.request_qty,
      record?.sourceQty,
      record?.source_qty,
      record?.quantity,
      record?.availableQty,
      record?.available_qty,
      0,
    ),
  };
}

function requestItemPreviewRecordKey(record) {
  const sourceKey = requestItemPreviewSourceKey(record);
  const customerId = record?.customerId ?? record?.customer_id;
  if (sourceKey) {
    return hasRequestItemCustomerInfo(record)
      ? `customer:${String(customerId ?? record?.customerName ?? record?.customer_name ?? '')}|${sourceKey}`
      : `source:${sourceKey}`;
  }
  const id = record?.cartItemId ?? record?.cart_item_id ?? record?.id;
  if (id !== undefined && id !== null && String(id).trim() !== '') return `id:${id}`;
  return '';
}

function requestItemPreviewSourceKey(record) {
  const stockRecordId = record?.stockRecordId ?? record?.stock_record_id ?? record?.recordId ?? record?.record_id;
  const stockOrderItemId = record?.stockOrderItemId ?? record?.stock_order_item_id ?? record?.orderItemId ?? record?.order_item_id;
  const strongKey = [stockRecordId, stockOrderItemId]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)
    .join('|');
  if (strongKey) return `stock:${strongKey}`;
  const weakParts = [
    record?.goodsId ?? record?.goods_id,
    record?.skuId ?? record?.sku_id,
    record?.skuCode ?? record?.sku_code,
    record?.stockTypeId ?? record?.stock_type_id,
    record?.price,
    record?.currency,
  ].map((value) => String(value ?? '').trim());
  if (!weakParts.some(Boolean)) return '';
  return weakParts.join('|');
}

function hasRequestItemCustomerInfo(record) {
  return [
    record?.customerId,
    record?.customer_id,
    record?.customerName,
    record?.customer_name,
  ].some((value) => value !== undefined && value !== null && String(value).trim() !== '');
}

function buildRequestItemPreviewParams() {
  const params = {};
  (queryFields.value || []).forEach((field) => {
    const value = queryState[field];
    if (value === undefined || value === null || String(value).trim() === '') return;
    params[normalizeQueryField(field)] = value;
  });
  return {
    ...params,
    ...(props.fixedQueryParams || {}),
  };
}

function resolveRequestItemPreviewCustomerId() {
  const fixed = props.fixedQueryParams?.customerId;
  if (fixed !== undefined && fixed !== null && String(fixed).trim() !== '') return fixed;
  const queried = queryState.customerId;
  if (queried !== undefined && queried !== null && String(queried).trim() !== '') return queried;
  return null;
}

function normalizeRequestItemPreviewPayload(payload, groupCode) {
  const records = Array.isArray(payload)
    ? payload
    : payload?.records || payload?.list || payload?.rows || payload?.items || payload?.data || [];
  return (Array.isArray(records) ? records : []).map((record) => ({
    ...record,
    groupCode: record?.groupCode ?? record?.group_code ?? groupCode,
    customerId: record?.customerId ?? record?.customer_id ?? payload?.customerId ?? payload?.customer_id,
    customerName: record?.customerName ?? record?.customer_name ?? payload?.customerName ?? payload?.customer_name,
    customerEnglishName: record?.customerEnglishName ?? record?.customer_english_name ?? record?.englishName ?? record?.english_name ?? payload?.customerEnglishName ?? payload?.customer_english_name ?? payload?.englishName ?? payload?.english_name,
    customerAddress: record?.customerAddress ?? record?.customer_address ?? payload?.customerAddress ?? payload?.customer_address,
    billingAddress: record?.billingAddress ?? record?.billing_address ?? payload?.billingAddress ?? payload?.billing_address,
    invoiceAddress: record?.invoiceAddress ?? record?.invoice_address ?? payload?.invoiceAddress ?? payload?.invoice_address,
    postalCode: record?.postalCode ?? record?.postal_code ?? payload?.postalCode ?? payload?.postal_code,
    zipCode: record?.zipCode ?? record?.zip_code ?? payload?.zipCode ?? payload?.zip_code,
    country: record?.country ?? payload?.country,
    city: record?.city ?? payload?.city,
    customerPhone: record?.customerPhone ?? record?.customer_phone ?? payload?.customerPhone ?? payload?.customer_phone,
    customerEmail: record?.customerEmail ?? record?.customer_email ?? payload?.customerEmail ?? payload?.customer_email,
    contactName: record?.contactName ?? record?.contact_name ?? record?.contactPerson ?? record?.contact_person ?? payload?.contactName ?? payload?.contact_name ?? payload?.contactPerson ?? payload?.contact_person,
  }));
}

function extractRequestItemCustomers(sourceRows = []) {
  return normalizeRequestItemCustomers((Array.isArray(sourceRows) ? sourceRows : []).map((record) => ({
    id: record?.customerId ?? record?.customer_id,
    name: record?.customerName ?? record?.customer_name,
    englishName: record?.customerEnglishName ?? record?.customer_english_name ?? record?.englishName ?? record?.english_name,
    groupCode: record?.customerGroupCode ?? record?.customer_group_code ?? record?.groupCode ?? record?.group_code,
    deptCode: record?.deptCode ?? record?.dept_code,
    deptName: record?.deptName ?? record?.dept_name,
    ownerUserGroupCode: record?.ownerUserGroupCode ?? record?.owner_user_group_code,
    ownerUserDeptCode: record?.ownerUserDeptCode ?? record?.owner_user_dept_code,
    chargeGroupCode: record?.chargeGroupCode ?? record?.charge_group_code,
    managerGroupCode: record?.managerGroupCode ?? record?.manager_group_code,
    salesGroupCode: record?.salesGroupCode ?? record?.sales_group_code,
    customerAddress: record?.customerAddress ?? record?.customer_address,
    billingAddress: record?.billingAddress ?? record?.billing_address,
    invoiceAddress: record?.invoiceAddress ?? record?.invoice_address,
    address: record?.address,
    postalCode: record?.postalCode ?? record?.postal_code,
    zipCode: record?.zipCode ?? record?.zip_code,
    country: record?.country,
    city: record?.city,
    phone: record?.customerPhone ?? record?.customer_phone ?? record?.phone ?? record?.tel ?? record?.telephone,
    email: record?.customerEmail ?? record?.customer_email ?? record?.email,
    contactName: record?.contactName ?? record?.contact_name ?? record?.customerContactName ?? record?.customer_contact_name ?? record?.contactPerson ?? record?.contact_person,
  })));
}

function normalizeRequestItemCustomers(source = []) {
  const seen = new Set();
  return (Array.isArray(source) ? source : [])
    .map((item) => {
      const id = item?.id ?? item?.customerId ?? item?.customer_id;
      const name = String(item?.name ?? item?.customerName ?? item?.customer_name ?? item?.customerCode ?? item?.customer_code ?? id ?? '').trim();
      const groupCode = normalizeRequestCustomerGroupCode(item);
      return {
        id,
        name,
        englishName: firstText(item?.englishName, item?.english_name, item?.customerEnglishName, item?.customer_english_name),
        groupCode,
        ownerUserGroupCode: item?.ownerUserGroupCode ?? item?.owner_user_group_code,
        ownerUserDeptCode: item?.ownerUserDeptCode ?? item?.owner_user_dept_code,
        chargeGroupCode: item?.chargeGroupCode ?? item?.charge_group_code,
        managerGroupCode: item?.managerGroupCode ?? item?.manager_group_code,
        salesGroupCode: item?.salesGroupCode ?? item?.sales_group_code,
        deptCode: item?.deptCode ?? item?.dept_code,
        deptName: item?.deptName ?? item?.dept_name,
        address: resolveRequestTemplateCustomerAddress(item),
        postalCode: firstText(item?.postalCode, item?.postal_code, item?.zipCode, item?.zip_code),
        country: firstText(item?.country),
        city: firstText(item?.city),
        phone: firstText(item?.phone, item?.tel, item?.telephone, item?.customerPhone, item?.customer_phone),
        email: firstText(item?.email, item?.customerEmail, item?.customer_email),
        contactName: firstText(item?.contactName, item?.contact_name, item?.customerContactName, item?.customer_contact_name, item?.contactPerson, item?.contact_person),
      };
    })
    .filter((item) => item.id !== undefined && item.id !== null && item.name)
    .filter((item) => {
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((left, right) => (
      left.groupCode.localeCompare(right.groupCode)
      || String(left.name).localeCompare(String(right.name), 'ja')
    ));
}

function normalizeRequestCustomerGroupCode(item) {
  const raw = String(
    item?.groupCode
      ?? item?.group_code
      ?? item?.customerGroupCode
      ?? item?.customer_group_code
      ?? item?.ownerUserGroupCode
      ?? item?.owner_user_group_code
      ?? item?.ownerUserDeptCode
      ?? item?.owner_user_dept_code
      ?? item?.chargeGroupCode
      ?? item?.charge_group_code
      ?? item?.managerGroupCode
      ?? item?.manager_group_code
      ?? item?.salesGroupCode
      ?? item?.sales_group_code
      ?? item?.userGroupCode
      ?? item?.user_group_code
      ?? item?.staffGroupCode
      ?? item?.staff_group_code
      ?? item?.deptCode
      ?? item?.dept_code
      ?? item?.ownerDeptCode
      ?? item?.owner_dept_code
      ?? item?.groupName
      ?? item?.group_name
      ?? item?.deptName
      ?? item?.dept_name
      ?? item?.ownerDeptName
      ?? item?.owner_dept_name
      ?? '',
  ).trim().toUpperCase();
  const hit = raw.match(/[ABC]/);
  return hit ? hit[0] : '';
}

function mergeRequestItemCustomers(...sources) {
  const map = new Map();
  sources.flat().forEach((item) => {
    if (!item?.id) return;
    const key = String(item.id);
    if (!map.has(key)) {
      map.set(key, item);
      return;
    }
    const existing = map.get(key);
    map.set(key, mergeRequestItemCustomer(existing, item));
  });
  return [...map.values()].sort((left, right) => (
    String(left.groupCode || '').localeCompare(String(right.groupCode || ''))
    || String(left.name).localeCompare(String(right.name), 'ja')
  ));
}

function mergeRequestItemCustomer(existing = {}, incoming = {}) {
  const merged = { ...existing };
  Object.entries(incoming).forEach(([key, value]) => {
    if (value === undefined || value === null || String(value).trim() === '') return;
    merged[key] = value;
  });
  return {
    ...merged,
    name: existing.name || incoming.name || merged.name,
    groupCode: existing.groupCode || incoming.groupCode || merged.groupCode || '',
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

function updateBatchStockQueryField(field, value) {
  batchStockQueryState[field] = value;
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
      fileName: 'goods-import-template.xlsx',
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

async function openBatchStockDrawer(mode, options = {}) {
  const normalizedMode = mode === 'outbound' ? 'outbound' : 'inbound';
  const preservedBizDate = options.preserveSettings ? batchStockSettings.bizDate : null;
  const preservedRemark = options.preserveSettings ? batchStockSettings.remark : '';
  if (!options.preserveSettings) {
    resetBatchStockQueryState();
  }
  batchStockMode.value = normalizedMode;
  batchStockModeSwitchable.value = Boolean(options.allowModeSwitch);
  batchStockSelectedKeys.value = [];
  Object.keys(batchStockDrafts).forEach((key) => delete batchStockDrafts[key]);
  batchStockSettings.sourceType = STOCK_SOURCE_TYPE.SELF_INBOUND;
  batchStockSettings.warehouseId = null;
  batchStockSettings.stockTypeId = null;
  batchStockSettings.quantity = 1;
  batchStockSettings.bizDate = preservedBizDate || formatTokyoDate();
  batchStockSettings.remark = preservedRemark || (normalizedMode === 'inbound' ? '一括入庫' : '一括出庫');
  batchStockDrawerOpen.value = true;

  if (normalizedMode === 'inbound') {
    await loadQueryRelationOptions(batchStockSearchFields.value);
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

async function switchBatchStockMode(mode) {
  if (!batchStockModeSwitchable.value) return;
  const nextMode = mode === 'outbound' ? 'outbound' : 'inbound';
  if (nextMode === batchStockMode.value) return;
  await openBatchStockDrawer(nextMode, { preserveSettings: true, allowModeSwitch: true });
}

async function openBatchStockFlow() {
  await openBatchStockDrawer('inbound', { allowModeSwitch: true });
}

async function loadBatchStockGoodsPage({ pageNum = 1, pageSize = 10 } = {}) {
  batchStockLoading.value = true;
  batchStockSelectedKeys.value = [];
  const searchParams = buildBatchStockSearchParams();
  try {
    if (isGroupBatchInbound.value) {
      const page = await fetchPage('stock', {
        ...searchParams,
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
      ...searchParams,
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

function batchStockQueryInputType(field) {
  if (['name', 'englishName', 'skuCode', 'skuName'].includes(String(field || ''))) return 'text';
  return queryInputType(field);
}

function buildBatchStockSearchParams() {
  const params = {};
  (batchStockSearchFields.value || []).forEach((field) => {
    const value = batchStockQueryState[field];
    if (value === undefined || value === null || String(value).trim() === '') return;
    const targetField = isGroupBatchInbound.value && field === 'name' ? 'goodsName' : field;
    params[targetField] = value;
  });
  return params;
}

function resetBatchStockQueryState() {
  Object.keys(batchStockQueryState).forEach((key) => {
    delete batchStockQueryState[key];
  });
  (batchStockSearchFields.value || []).forEach((field) => {
    batchStockQueryState[field] = undefined;
  });
}

async function searchBatchStockGoods() {
  await loadBatchStockGoodsPage({ pageNum: 1, pageSize: batchStockPagination.pageSize });
}

async function resetBatchStockGoodsSearch() {
  resetBatchStockQueryState();
  await loadBatchStockGoodsPage({ pageNum: 1, pageSize: batchStockPagination.pageSize });
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
      bizDate: batchStockSettings.bizDate || null,
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

function clearObjectState(target) {
  Object.keys(target || {}).forEach((key) => {
    delete target[key];
  });
}

function clearTransientUiState() {
  modalOpen.value = false;
  goodsInboundModalOpen.value = false;
  goodsOutboundModalOpen.value = false;
  sheetOutboundModalOpen.value = false;
  batchStockDrawerOpen.value = false;
  selectedRowKeys.value = [];
  batchStockSelectedKeys.value = [];
  sheetOutboundRows.value = [];
  sheetOutboundActiveRowKey.value = '';
  activeGoodsRowKey.value = '';
  selectedExcelCell.value = '';
  activeExcelCell.value = '';
  clearObjectState(goodsInboundForm);
  clearObjectState(goodsOutboundForm);
  clearObjectState(requestItemQtyState);
  clearObjectState(requestFlowCellDraftState);
  selectedRequestMatrixCells.value = [];
  clearObjectState(sheetOutboundDrafts);
  clearObjectState(batchStockDrafts);
  clearObjectState(goodsFlowByRowKey);
  resetBatchStockQueryState();
  closeGoodsDrawer();
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
        stockId: Number(record?.stockId ?? record?.id ?? 0) || null,
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
        bizDate: batchStockSettings.bizDate || draft.bizDate || null,
        remark: String(draft.remark || '').trim() || null,
      };
    });

  const invalid = items.some((item) => (
    item.quantity <= 0
    || !item.bizDate
    || (batchStockMode.value === 'outbound' && (!item.stockId || item.quantity > availableGoodsOutboundQty(goodsRowKey(item.record))))
    || (isGroupBatchInbound.value && (!item.stockId || item.quantity > stockCurrentQty(item.record)))
    || (batchStockMode.value === 'inbound'
      && !item.stockId
      && !(item.goodsId && item.sourceType && item.warehouseId && item.stockTypeId))
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
      ...(batchStockMode.value === 'inbound' ? { sourceType: Number(batchStockSettings.sourceType || STOCK_SOURCE_TYPE.SELF_INBOUND) } : {}),
      bizDate: batchStockSettings.bizDate || items[0]?.bizDate || null,
      remark: batchStockSettings.remark || (batchStockMode.value === 'inbound' ? '一括入庫' : '一括出庫'),
      items: items.map((item) => removeEmptyBatchStockItem({
        stockId: batchStockMode.value === 'outbound' ? item.stockId : null,
        goodsId: batchStockMode.value === 'inbound' ? item.goodsId : null,
        skuId: batchStockMode.value === 'inbound' ? item.skuId : null,
        warehouseId: batchStockMode.value === 'inbound' ? item.warehouseId : null,
        stockTypeId: batchStockMode.value === 'inbound' ? item.stockTypeId : null,
        quantity: item.quantity,
        bizDate: item.bizDate,
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
      bizDate: item.bizDate || batchStockSettings.bizDate || null,
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

function stockOrderCategoryLabel(record) {
  const category = stockOrderCategoryCode(record);
  const warehouseName = stockOrderWarehouseName(record);
  return [category, warehouseName].filter(Boolean).join(' / ') || '-';
}

function stockOrderCategoryCode(record) {
  const rawGroup = String(record?.groupCode ?? record?.group_code ?? '').trim().toUpperCase();
  if (rawGroup) return rawGroup;
  const deptCode = stockOrderDeptCode(record);
  if (deptCode) return deptCode;
  return String(record?.stockCategory ?? record?.category ?? '').trim().toUpperCase();
}

function stockOrderDeptCode(record) {
  const direct = record?.deptCode ?? record?.dept_code ?? record?.departmentCode ?? record?.department_code;
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
    return String(direct).trim().toUpperCase();
  }
  const deptId = record?.deptId ?? record?.dept_id;
  const options = [
    ...(relationOptions.deptId || []),
    ...(queryRelationOptions.deptId || []),
  ];
  const matched = options.find((option) => String(option?.value) === String(deptId));
  const code = matched?.raw?.code ?? matched?.raw?.deptCode ?? matched?.raw?.dept_code;
  return code !== undefined && code !== null ? String(code).trim().toUpperCase() : '';
}

function stockOrderWarehouseName(record) {
  const direct = record?.warehouseName ?? record?.warehouse_name ?? record?.warehouse;
  if (direct !== undefined && direct !== null && String(direct).trim() !== '') {
    return String(direct).trim();
  }
  const warehouseId = record?.warehouseId ?? record?.warehouse_id;
  const options = [
    ...(relationOptions.warehouseId || []),
    ...(queryRelationOptions.warehouseId || []),
  ];
  const matched = options.find((option) => String(option?.value) === String(warehouseId));
  const name = matched?.raw?.name ?? matched?.raw?.warehouseName ?? matched?.raw?.warehouse_name ?? matched?.label;
  return name !== undefined && name !== null ? String(name).trim() : '';
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
  formState.bizDate = formatTokyoDateStart();
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
  const selectedCustomerIds = uniqueRequestItemCustomerIds(items);
  if (selectedCustomerIds.length > 1) {
    message.warning('同一顧客の明細のみ選択してください');
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
    const createdRequestForm = await createRequestFormWithSelectedItems({
      customerId,
      templateCode: resolveRequestTemplateCode(items),
      groupCode: resolveRequestTemplateCode(items),
      items: payloadItems,
    });
    message.success(TABLE_TEXT.requestFormGenerated);
    showGeneratedRequestFormSaveDialog(createdRequestForm);
    selectedRowKeys.value = [];
    selectedRequestMatrixCells.value = [];
    Object.keys(requestItemQtyState).forEach((key) => delete requestItemQtyState[key]);
    await reloadCurrentModule();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  } finally {
    requestFlowSubmitting.value = false;
  }
}

function showGeneratedRequestFormSaveDialog(createdRequestForm) {
  const ids = resolveCreatedRequestFormIds(createdRequestForm);
  if (ids.length === 0) return;
  Modal.confirm({
    title: '請求書PDFを保存しますか',
    content: '保存先を選択して、生成した請求書PDFを保存できます。',
    okText: 'PDFを保存',
    cancelText: '閉じる',
    async onOk() {
      await downloadGeneratedRequestFormPdf(ids);
    },
  });
}

async function downloadGeneratedRequestFormPdf(createdRequestForm) {
  const ids = Array.isArray(createdRequestForm)
    ? createdRequestForm
    : resolveCreatedRequestFormIds(createdRequestForm);
  if (ids.length === 0) return;
  for (const id of ids) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await downloadRequestFormPdf(id, TABLE_TEXT.downloadFail, {
        promptSavePath: true,
        suggestedFileName: `request_${id}.pdf`,
      });
    } catch (error) {
      message.warning(error?.message || TABLE_TEXT.downloadFail);
    }
  }
}

function resolveCreatedRequestFormIds(payload) {
  const ids = [];
  collectRequestFormIds(payload, ids);
  return [...new Set(ids.map((id) => String(id)).filter((id) => id.trim() !== ''))];
}

function collectRequestFormIds(value, output) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectRequestFormIds(item, output));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const id = value.requestFormId ?? value.request_form_id ?? value.requestId ?? value.request_id ?? value.id;
  if (id !== undefined && id !== null && String(id).trim() !== '') {
    output.push(id);
  }
  ['data', 'record', 'requestForm', 'form', 'items', 'records', 'list'].forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      collectRequestFormIds(value[key], output);
    }
  });
}

function resolveRequestTemplateCode(items = []) {
  const hit = (Array.isArray(items) ? items : []).find((record) => (
    normalizeRequestCustomerGroupCode(record)
    || record?.customerGroupCode
    || record?.customer_group_code
    || record?.groupCode
    || record?.group_code
  ));
  return normalizeRequestCustomerGroupCode(hit) || 'A';
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
    rowsToSubmit: selectedRequestFlowRows({ requireSelection: true }),
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
    selectedRequestMatrixCells.value = [];
    Object.keys(requestItemQtyState).forEach((key) => delete requestItemQtyState[key]);
    await reloadCurrentModule();
  } catch (error) {
    message.error(error?.message || TABLE_TEXT.saveFail);
  } finally {
    requestFlowSubmitting.value = false;
  }
}

function buildRequestFlowPayloadItem(record) {
  const requestQty = Math.max(0, Math.floor(Number(requestFlowQtyValue(record) || 0)));
  const sources = Array.isArray(record?.__sources) && record.__sources.length > 0 ? record.__sources : [record];
  const stockRecordIds = uniquePositiveIds(sources.flatMap((source) => requestFlowStockRecordIds(source)));
  const stockOrderItemIds = uniquePositiveIds(sources.flatMap((source) => requestFlowStockOrderItemIds(source)));
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

function requestFlowStockRecordIds(record) {
  return [
    record?.stockRecordId,
    record?.stock_record_id,
    record?.recordId,
    record?.record_id,
    ...arrayValue(record?.stockRecordIds),
    ...arrayValue(record?.stock_record_ids),
  ];
}

function requestFlowStockOrderItemIds(record) {
  return [
    record?.stockOrderItemId,
    record?.stock_order_item_id,
    record?.orderItemId,
    record?.order_item_id,
    ...arrayValue(record?.stockOrderItemIds),
    ...arrayValue(record?.stock_order_item_ids),
  ];
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
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

function uniqueRequestItemCustomerIds(items = []) {
  return [...new Set((Array.isArray(items) ? items : [])
    .map((record) => record?.customerId ?? record?.customer_id)
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== '')
    .map((value) => String(value)))];
}

function selectedRequestFlowRows(options = {}) {
  if (!isRequestFlowModule.value) return [];
  if (isRequestItemMatrix.value) {
    return selectedRequestMatrixSourceRows(options);
  }
  const selected = new Set((selectedRowKeys.value || []).map((key) => String(key)));
  return (tableRows.value || []).filter((record) => selected.has(String(getRowKey(record))));
}

function selectedRequestMatrixSourceRows(options = {}) {
  const selected = new Set(selectedRequestMatrixCells.value);
  if (selected.size === 0) {
    if (options.requireSelection) return [];
    return activeRequestTemplateSheet.value?.rows || [];
  }
  const templateRows = requestTemplateSheets.value.flatMap((sheet) => (
    sheet.rows.filter((record) => selected.has(requestTemplateRecordKey(sheet, record)))
  ));
  if (templateRows.length > 0) return templateRows;
  return (tableRows.value || []).flatMap((record) => {
    const rowKey = getRowKey(record);
    return Object.entries(record?.__customerSourceMap || {})
      .filter(([customerColumnKey]) => selected.has(`${rowKey}::${customerColumnKey}`))
      .flatMap(([, sourceRows]) => (Array.isArray(sourceRows) ? sourceRows : []));
  });
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
  if (props.moduleKey === 'stockOrder' && String(field || '') === 'totalQty') {
    return record?.totalQty ?? record?.quantity ?? record?.changeQty ?? record?.outQty ?? record?.requestQty;
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
  width: 100%;
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

.request-template-workbook {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  min-height: min(720px, calc(100vh - 220px));
  max-height: calc(100vh - 180px);
  padding: 12px 12px 0;
  background:
    linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px),
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    #eef2f7;
  background-size: 24px 24px;
  overflow: auto;
}

.request-template-sheet {
  flex: 1 0 auto;
  width: 100%;
  min-width: min(1080px, 100%);
  border: 1px solid #aab7c8;
  background: #ffffff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  font-family: "Yu Gothic", "Yu Mincho", "MS PGothic", serif;
}

.request-template-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 260px;
  border: 1px dashed #aab7c8;
  background: rgba(255, 255, 255, 0.72);
  color: #64748b;
  font-weight: 700;
}

.request-template-tabs {
  position: sticky;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  width: 100%;
  min-width: max-content;
  margin-top: 0;
  padding: 8px 10px 0;
  border-top: 1px solid #b7c3d1;
  background: #e7edf5;
}

.request-template-actionbar {
  position: sticky;
  bottom: 34px;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: max-content;
  padding: 8px 10px;
  border-top: 1px solid #b7c3d1;
  background: rgba(248, 250, 252, 0.96);
  box-shadow: 0 -8px 20px rgba(15, 23, 42, 0.06);
}

.request-template-selection-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 12px;
  white-space: nowrap;
}

.request-template-selection-summary strong {
  color: #1d4ed8;
}

.request-template-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.request-template-action {
  height: 30px;
  padding: 0 12px;
  border: 1px solid #aab7c8;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.request-template-action:hover:not(:disabled) {
  border-color: #2563eb;
  color: #1d4ed8;
}

.request-template-action:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.request-template-action-primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

.request-template-action-primary:hover:not(:disabled) {
  background: #1d4ed8;
  color: #ffffff;
}

.request-template-tab {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 96px;
  max-width: 220px;
  height: 30px;
  padding: 0 14px;
  border: 1px solid #aab7c8;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #dbe3ee;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.request-template-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 800;
}

.request-template-tab-active {
  position: relative;
  z-index: 1;
  height: 34px;
  background: #ffffff;
  color: #1d4ed8;
  box-shadow: 0 -1px 0 #ffffff inset;
}

.request-template-sheet-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #b7c3d1;
  background: linear-gradient(180deg, #f8fafc 0%, #e8eef6 100%);
  color: #1f2937;
}

.request-template-sheet-title span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  border: 1px solid #8ea3bd;
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 800;
}

.request-template-sheet-title strong {
  font-size: 14px;
}

.request-template-grid {
  display: grid;
  grid-auto-rows: minmax(28px, auto);
  border-left: 1px solid #c6d0dc;
  border-top: 1px solid #c6d0dc;
  background: #ffffff;
}

.request-template-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 4px 7px;
  border-right: 1px solid #c6d0dc;
  border-bottom: 1px solid #c6d0dc;
  color: #111827;
  font-size: 12px;
  line-height: 1.28;
  white-space: break-spaces;
  overflow-wrap: anywhere;
}

.request-template-cell.template-title {
  justify-content: center;
  min-height: 42px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.16em;
  white-space: pre-wrap;
}

.request-template-cell.template-b.template-title {
  letter-spacing: 0.05em;
}

.request-template-cell.template-summary {
  background: #f8fafc;
}

.request-template-cell.template-dynamic {
  background: #fffef8;
}

.request-template-cell.template-wrap {
  line-height: 1.35;
}

.request-template-detail {
  display: grid;
  border-left: 1px solid #c6d0dc;
  background: #ffffff;
}

.request-template-detail-header,
.request-template-detail-cell {
  min-height: 34px;
  padding: 5px 8px;
  border-right: 1px solid #c6d0dc;
  border-bottom: 1px solid #c6d0dc;
  color: #111827;
  font-size: 12px;
  line-height: 1.35;
}

.request-template-detail-header {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eaf0f7;
  font-weight: 800;
}

.request-template-detail-cell {
  display: flex;
  align-items: flex-start;
  min-width: 0;
  white-space: break-spaces;
  overflow-wrap: anywhere;
}

.request-template-detail-cell-selected {
  background: #eff6ff;
}

.request-matrix-cell,
.request-matrix-total {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-width: 48px;
  min-height: 28px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 0;
  background: transparent;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.request-matrix-cell {
  color: #0f172a;
}

.request-matrix-cell:hover,
.request-matrix-cell-selected {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: inset 0 0 0 1px #2563eb;
}

.request-matrix-total {
  color: #075985;
}

.request-matrix-empty {
  color: #94a3b8;
}

:deep(.request-matrix-customer-cell) {
  background: #fffdf2;
}

:deep(.request-matrix-total-cell) {
  background: #eef6ff;
}

.request-matrix-stage {
  width: 100%;
  padding: 0;
  border-color: #b8c2cf;
  border-radius: 4px;
  background: #eef2f7;
  box-shadow: none;
  overflow: hidden;
}

:deep(.request-matrix-table .ant-table) {
  border-radius: 0;
  background: #ffffff;
  font-size: 13px;
}

:deep(.request-matrix-table .ant-table-container) {
  border-radius: 0;
}

:deep(.request-matrix-table .ant-table-thead > tr > th) {
  height: 30px;
  padding: 5px 8px;
  border-color: #b8c2cf !important;
  background: #e7edf5 !important;
  color: #1f2937;
  font-weight: 700;
  white-space: nowrap;
}

:deep(.request-matrix-table .ant-table-thead > tr:first-child > th) {
  background: #dce6f2 !important;
  text-align: center;
}

:deep(.request-matrix-table .ant-table-tbody > tr > td) {
  height: 32px;
  padding: 1px 6px;
  border-color: #c7d1dd !important;
  background: #ffffff;
  color: #111827;
  white-space: nowrap;
}

:deep(.request-matrix-table .ant-table-tbody > tr:hover > td) {
  background: #f5faff !important;
}

:deep(.request-matrix-table .ant-table-cell-fix-left),
:deep(.request-matrix-table .ant-table-cell-fix-right) {
  background: #f8fafc !important;
}

:deep(.request-matrix-table .request-matrix-customer-cell) {
  background: #fffef7;
}

:deep(.request-matrix-table .request-matrix-total-cell) {
  background: #eef6ff !important;
}

:deep(.request-matrix-table .ant-table-pagination) {
  margin: 8px 10px;
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

:global(html[data-theme-mode='dark']) .request-template-workbook {
  background:
    linear-gradient(90deg, rgba(82, 82, 91, 0.4) 1px, transparent 1px),
    linear-gradient(rgba(82, 82, 91, 0.34) 1px, transparent 1px),
    #18181b;
}

:global(html[data-theme-mode='dark']) .request-template-sheet {
  border-color: #3f3f46;
  background: #111111;
  box-shadow: none;
}

:global(html[data-theme-mode='dark']) .request-template-empty {
  border-color: #3f3f46;
  background: rgba(17, 17, 17, 0.72);
  color: #a1a1aa;
}

:global(html[data-theme-mode='dark']) .request-template-tabs {
  border-top-color: #3f3f46;
  background: #18181b;
}

:global(html[data-theme-mode='dark']) .request-template-actionbar {
  border-top-color: #3f3f46;
  background: rgba(24, 24, 27, 0.96);
  box-shadow: none;
}

:global(html[data-theme-mode='dark']) .request-template-selection-summary {
  color: #d4d4d8;
}

:global(html[data-theme-mode='dark']) .request-template-selection-summary strong {
  color: #93c5fd;
}

:global(html[data-theme-mode='dark']) .request-template-action {
  border-color: #3f3f46;
  background: #111111;
  color: #d4d4d8;
}

:global(html[data-theme-mode='dark']) .request-template-action:hover:not(:disabled) {
  border-color: #60a5fa;
  color: #93c5fd;
}

:global(html[data-theme-mode='dark']) .request-template-action-primary {
  border-color: #2563eb;
  background: #2563eb;
  color: #ffffff;
}

:global(html[data-theme-mode='dark']) .request-template-tab {
  border-color: #3f3f46;
  background: #27272a;
  color: #d4d4d8;
}

:global(html[data-theme-mode='dark']) .request-template-tab-active {
  background: #111111;
  color: #93c5fd;
  box-shadow: 0 -1px 0 #111111 inset;
}

:global(html[data-theme-mode='dark']) .request-template-tab-count {
  background: rgba(96, 165, 250, 0.18);
  color: #bfdbfe;
}

:global(html[data-theme-mode='dark']) .request-template-sheet-title {
  border-color: #3f3f46;
  background: linear-gradient(180deg, #27272a 0%, #1f1f23 100%);
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) .request-template-sheet-title span {
  border-color: #2563eb;
  background: #172033;
  color: #93c5fd;
}

:global(html[data-theme-mode='dark']) .request-template-grid,
:global(html[data-theme-mode='dark']) .request-template-detail {
  border-color: #3f3f46;
  background: #111111;
}

:global(html[data-theme-mode='dark']) .request-template-cell,
:global(html[data-theme-mode='dark']) .request-template-detail-header,
:global(html[data-theme-mode='dark']) .request-template-detail-cell {
  border-color: #333333;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) .request-template-detail-header {
  background: #27272a;
}

:global(html[data-theme-mode='dark']) .request-template-detail-cell-selected {
  background: #172033;
}

:global(html[data-theme-mode='dark']) .request-template-cell.template-summary {
  background: #18181b;
}

:global(html[data-theme-mode='dark']) .request-template-cell.template-dynamic {
  background: #171712;
}

:global(html[data-theme-mode='dark']) .request-matrix-cell {
  color: #f8fafc;
}

:global(html[data-theme-mode='dark']) .request-matrix-cell:hover,
:global(html[data-theme-mode='dark']) .request-matrix-cell-selected {
  border-color: #60a5fa;
  background: #172033;
  box-shadow: inset 0 0 0 1px #60a5fa;
}

:global(html[data-theme-mode='dark']) .request-matrix-total {
  color: #7dd3fc;
}

:global(html[data-theme-mode='dark']) .request-matrix-empty {
  color: #71717a;
}

:global(html[data-theme-mode='dark']) .request-matrix-stage {
  border-color: #3f3f46;
  background: #18181b;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table) {
  background: #111111;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-thead > tr > th) {
  border-color: #3f3f46 !important;
  background: #27272a !important;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-thead > tr:first-child > th) {
  background: #303036 !important;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-tbody > tr > td) {
  border-color: #333333 !important;
  background: #161616;
  color: #f4f4f5;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-tbody > tr:hover > td) {
  background: #1f2937 !important;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-cell-fix-left),
:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .ant-table-cell-fix-right) {
  background: #18181b !important;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .request-matrix-customer-cell) {
  background: #1b1a14;
}

:global(html[data-theme-mode='dark']) :deep(.request-matrix-table .request-matrix-total-cell) {
  background: #152033 !important;
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
