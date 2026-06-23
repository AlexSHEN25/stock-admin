import { computed, reactive, ref } from 'vue';
import {
  addRequestItemsFromStockOrder,
  getCandidateItems,
  matchRequestItems,
  reapplyRequestItemInbound,
  removeRequestItems,
} from '../api/module';
import { getNavigationState } from '../utils/navigation-state';
import TABLE_TEXT from '../utils/module-ui';

export function useRequestItemCandidates(options) {
  const {
    moduleKey,
    queryState,
    rows,
    reload,
    notify,
  } = options;

  const candidateModalOpen = ref(false);
  const candidateLoading = ref(false);
  const candidateRows = ref([]);
  const candidateSelectedKeys = ref([]);
  const candidateInboundLoadingKeys = ref([]);
  const candidateInboundAppliedKeys = ref([]);
  const candidateQtyState = reactive({});

  const isRequestItemModule = computed(() => moduleKey.value === 'requestItem');
  const tableRows = computed(() => {
    if (!isRequestItemModule.value) return rows.value;
    return (rows.value || []).filter((item) => Number(item?.state ?? item?.requestItemState ?? 1) === 1);
  });
  const pendingSelectedRows = computed(() => {
    const selectedKeys = new Set((candidateSelectedKeys.value || []).map((x) => String(x)));
    return (candidateRows.value || [])
      .filter((item) => selectedKeys.has(String(candidateRowKey(item))))
      .filter((item) => canStillAppendCandidate(item));
  });
  const candidateSubmitText = computed(() => (
    pendingSelectedRows.value.length > 0
      ? `追加（${pendingSelectedRows.value.length}件）`
      : '追加'
  ));

  function resolveCurrentRequestId() {
    const fromQuery = Number(queryState.requestId);
    if (fromQuery) return fromQuery;
    const first = rows.value?.[0];
    const fromRow = Number(first?.requestId);
    if (fromRow) return fromRow;
    const raw = getNavigationState('jump_request_form_id');
    const fromJump = Number(raw);
    if (fromJump) return fromJump;
    return null;
  }

  function resolveCandidateStockRecordId(record) {
    const raw = record?.stockRecordId
      ?? record?.stock_record_id
      ?? record?.stockRecordID
      ?? record?.stockRecord?.id
      ?? record?.recordId
      ?? record?.record_id;
    const id = Number(raw);
    return Number.isNaN(id) ? 0 : id;
  }

  function resolveCandidateStockOrderItemId(record) {
    const raw = record?.stockOrderItemId
      ?? record?.stock_order_item_id
      ?? record?.orderItemId
      ?? record?.order_item_id
      ?? record?.stockOrderItem?.id;
    const id = Number(raw);
    return Number.isNaN(id) ? 0 : id;
  }

  function candidateRowKey(record) {
    const raw = resolveCandidateStockOrderItemId(record)
      || resolveCandidateStockRecordId(record)
      || record?.id;
    return raw === undefined || raw === null || String(raw).trim() === '' ? '' : String(raw);
  }

  function resolveCandidateOrderKey(record) {
    const raw = record?.stockOrderId ?? record?.stock_order_id ?? record?.orderId ?? record?.order_id ?? record?.orderNo;
    return raw === undefined || raw === null || String(raw).trim() === '' ? '' : String(raw);
  }

  function resolveCandidateMaxQty(record) {
    const sources = [
      record?.maxRequestQty,
      record?.max_request_qty,
      record?.availableQty,
      record?.available_qty,
      record?.remainQty,
      record?.remain_qty,
      record?.leftQty,
      record?.left_qty,
      record?.canRequestQty,
      record?.can_request_qty,
      record?.requestableQty,
      record?.requestable_qty,
      record?.requestQty,
      record?.outQty,
      record?.changeQty,
    ];
    for (const value of sources) {
      const qty = Number(value);
      if (!Number.isNaN(qty) && qty > 0) {
        return Math.floor(qty);
      }
    }
    return 0;
  }

  function resolveCandidateFilledQty(record) {
    const sources = [
      record?.requestQty,
      record?.approveQty,
      record?.appliedQty,
      record?.usedQty,
      record?.linkedQty,
      record?.selectedQty,
    ];
    for (const value of sources) {
      const qty = Number(value);
      if (!Number.isNaN(qty) && qty >= 0) {
        return Math.floor(Math.abs(qty));
      }
    }
    return 0;
  }

  function resolveCandidateRemainingQty(record) {
    const maxQty = maxRequestQty(record);
    if (maxQty <= 0) return 0;

    const remainingSources = [
      record?.remainingQty,
      record?.remainQty,
      record?.leftQty,
      record?.availableQty,
      record?.canRequestQty,
      record?.requestableQty,
    ];
    for (const value of remainingSources) {
      const qty = Number(value);
      if (!Number.isNaN(qty) && qty >= 0) {
        return Math.min(Math.floor(Math.abs(qty)), maxQty);
      }
    }

    const filledQty = resolveCandidateFilledQty(record);
    const rawRequestQty = Number(record?.requestQty);
    const rawOutQty = Number(record?.outQty ?? record?.changeQty ?? 0);
    if (!Number.isNaN(rawRequestQty) && !Number.isNaN(rawOutQty)) {
      const sourceMax = Math.max(Math.abs(rawOutQty), Math.abs(rawRequestQty));
      if (sourceMax > 0) {
        const remaining = Math.max(sourceMax - filledQty, 0);
        return Math.min(remaining || sourceMax, maxQty);
      }
    }

    return Math.max(maxQty - filledQty, 0);
  }

  function canStillAppendCandidate(record) {
    return resolveCandidateRemainingQty(record) > 0;
  }

  function candidateStatus(record) {
    if (canStillAppendCandidate(record)) return '可追加';
    if (Number(record?.selected) === 1 || record?.selected === true || Boolean(record?.requestItemId ?? record?.request_item_id ?? record?.requestItem?.id)) {
      return '追加済み';
    }
    return '未追加';
  }

  function maxRequestQty(record) {
    if (record?.availableQty !== undefined && record?.availableQty !== null) {
      const availableQty = Math.abs(Number(record.availableQty));
      return Number.isNaN(availableQty) ? 0 : Math.floor(availableQty);
    }
    const candidateMax = resolveCandidateMaxQty(record);
    if (candidateMax > 0) return candidateMax;
    const qty = Number(record?.changeQty ?? record?.outQty ?? record?.requestQty ?? 0);
    const normalized = Math.abs(qty);
    return normalized > 0 ? normalized : 1;
  }

  function clampRequestQty(record, value) {
    const raw = Math.abs(Number(value || 0));
    if (!raw) return 0;
    return Math.min(raw, maxRequestQty(record));
  }

  function formatQty(value) {
    const num = Number(value);
    if (Number.isNaN(num)) return value ?? '-';
    return Math.abs(num);
  }

  async function loadCandidateRows() {
    const requestId = resolveCurrentRequestId();
    if (!requestId) {
      candidateRows.value = [];
      return;
    }
    candidateLoading.value = true;
    try {
      const list = await getCandidateItems(requestId);
      candidateRows.value = (Array.isArray(list) ? list : []).filter(isOutboundCandidate);
      Object.keys(candidateQtyState).forEach((key) => delete candidateQtyState[key]);
      candidateRows.value.forEach((item) => {
        const key = candidateRowKey(item);
        if (!key) return;
        const seedQty = Number(item?.requestQty ?? item?.changeQty ?? item?.outQty ?? 1);
        candidateQtyState[key] = Math.max(1, Math.abs(seedQty || 1));
      });
      candidateSelectedKeys.value = expandKnifeHandleSelection(candidateRows.value
        .filter(isCandidateAdded)
        .map((item) => candidateRowKey(item))
        .filter((id) => id !== undefined && id !== null && String(id).trim() !== ''));
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.fetchFail);
    } finally {
      candidateLoading.value = false;
    }
  }

  function openCandidateModal() {
    candidateModalOpen.value = true;
    loadCandidateRows();
  }

  function closeCandidateModal() {
    candidateModalOpen.value = false;
  }

  function onCandidateSelectChange(keys) {
    candidateSelectedKeys.value = expandKnifeHandleSelection(keys);
  }

  function onCandidateQtyChange(key, value) {
    candidateQtyState[key] = value;
  }

  function expandKnifeHandleSelection(keys) {
    const selected = new Set((keys || []).map((key) => String(key)));
    const candidates = candidateRows.value || [];

    candidates.forEach((item) => {
      const key = candidateRowKey(item);
      if (!selected.has(String(key))) return;
      if (!isKnifeCandidate(item) && !isHandleCandidate(item)) return;

      const orderKey = resolveCandidateOrderKey(item);
      if (!orderKey) return;
      candidates
        .filter((candidate) => resolveCandidateOrderKey(candidate) === orderKey)
        .filter((candidate) => (isKnifeCandidate(item) ? isHandleCandidate(candidate) : isKnifeCandidate(candidate)))
        .forEach((candidate) => {
          const pairKey = candidateRowKey(candidate);
          if (pairKey !== undefined && pairKey !== null) selected.add(String(pairKey));
        });
    });

    return Array.from(selected);
  }

  async function refreshRequestItemContext() {
    await reload();
    await loadCandidateRows();
  }

  async function submitAddCandidates() {
    const requestId = resolveCurrentRequestId();
    const items = pendingSelectedRows.value
      .map((item) => ({
        maxQty: maxRequestQty(item),
        stockRecordId: resolveCandidateStockRecordId(item),
        stockOrderItemId: resolveCandidateStockOrderItemId(item),
        requestQty: clampRequestQty(item, candidateQtyState[candidateRowKey(item)]),
      }));
    const payloadItems = items.map(({ maxQty: _maxQty, ...rest }) => rest);

    if (!requestId) {
      notify.warning('請求書を選択してください');
      return;
    }
    if (items.length === 0) {
      notify.warning('追加する未追加の商品を選択してください');
      return;
    }
    if (items.some((item) => !item.stockRecordId && !item.stockOrderItemId)) {
      notify.warning('候補データに出庫明細IDまたは在庫履歴IDがありません');
      return;
    }
    if (items.some((item) => !item.requestQty || item.requestQty <= 0)) {
      notify.warning('請求数量を入力してください');
      return;
    }
    if (items.some((item) => item.requestQty > item.maxQty)) {
      notify.warning('請求数量は出庫数量以下にしてください');
      return;
    }

    candidateLoading.value = true;
    try {
      await addRequestItemsFromStockOrder({
        requestId,
        items: payloadItems.filter((item) => (item.stockRecordId || item.stockOrderItemId) && item.requestQty > 0),
      });
      notify.success('請求書明細を更新しました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.saveFail);
    } finally {
      candidateLoading.value = false;
    }
  }

  async function submitMatchCandidates() {
    const requestId = resolveCurrentRequestId();
    const items = pendingSelectedRows.value.map((item) => ({
      stockRecordId: resolveCandidateStockRecordId(item),
      stockOrderItemId: resolveCandidateStockOrderItemId(item),
      requestQty: clampRequestQty(item, candidateQtyState[candidateRowKey(item)]),
    }));
    if (!requestId) {
      notify.warning('請求書を選択してください');
      return;
    }
    if (items.length === 0) {
      notify.warning('マッチする商品を選択してください');
      return;
    }
    if (items.some((item) => !item.stockRecordId && !item.stockOrderItemId)) {
      notify.warning('候補データに出庫明細IDまたは在庫履歴IDがありません');
      return;
    }

    candidateLoading.value = true;
    try {
      await matchRequestItems({ requestId, items });
      notify.success('請求書明細をマッチしました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.saveFail);
    } finally {
      candidateLoading.value = false;
    }
  }

  async function submitCandidateInbound(record) {
    const requestId = resolveCurrentRequestId();
    const key = candidateRowKey(record);
    if (!key || candidateInboundLoadingKeys.value.some((item) => String(item) === String(key))) return;
    if (isCandidateInboundApplied(record)) return;
    if (!requestId || !isCandidateAdded(record)) {
      notify.warning('表示する請求書を選択してください');
      return;
    }

    candidateInboundLoadingKeys.value = [...candidateInboundLoadingKeys.value, key];
    try {
      const inboundOrderId = await reapplyRequestItemInbound({
        requestId,
        items: [{
          stockRecordId: resolveCandidateStockRecordId(record),
          requestQty: clampRequestQty(record, candidateQtyState[key]),
        }],
      });
      candidateInboundAppliedKeys.value = [
        ...candidateInboundAppliedKeys.value.filter((item) => String(item) !== String(key)),
        key,
      ];
      record.inboundApplied = true;
      record.inboundOrderId = inboundOrderId || record.inboundOrderId;
      notify.success('発送予定表から入庫申請を作成しました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.saveFail);
    } finally {
      candidateInboundLoadingKeys.value = candidateInboundLoadingKeys.value
        .filter((item) => String(item) !== String(key));
    }
  }

  function isCandidateInboundApplied(record) {
    const key = candidateRowKey(record);
    if (candidateInboundAppliedKeys.value.some((item) => String(item) === String(key))) return true;
    return Boolean(
      record?.inboundApplied
      || record?.inboundDone
      || record?.stockInboundApplied
      || record?.stockInboundId
      || record?.inboundOrderId,
    );
  }

  async function removeRequestItem(record, getRecordId) {
    const requestId = resolveCurrentRequestId();
    const stockRecordId = resolveCandidateStockRecordId(record);
    const stockOrderItemId = resolveCandidateStockOrderItemId(record);
    const requestItemId = Number(getRecordId(record));
    if (!requestId || (!stockRecordId && !stockOrderItemId && !requestItemId)) return;
    try {
      await removeRequestItems({
        requestId,
        stockRecordIds: stockRecordId ? [stockRecordId] : undefined,
        stockOrderItemIds: stockOrderItemId ? [stockOrderItemId] : undefined,
        orderItemIds: stockOrderItemId ? [stockOrderItemId] : undefined,
        requestItemIds: requestItemId ? [requestItemId] : undefined,
      });
      notify.success('請求書明細を発送予定表へ戻しました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.deleteFail);
    }
  }

  async function removeCandidate(record) {
    const requestId = resolveCurrentRequestId();
    const stockRecordId = resolveCandidateStockRecordId(record);
    const stockOrderItemId = resolveCandidateStockOrderItemId(record);
    const requestItemId = Number(record?.requestItemId ?? record?.request_item_id ?? record?.requestItem?.id);
    if (!requestId || (!stockRecordId && !stockOrderItemId && !requestItemId) || !isCandidateAdded(record)) return;
    candidateLoading.value = true;
    try {
      await removeRequestItems({
        requestId,
        stockRecordIds: stockRecordId ? [stockRecordId] : undefined,
        stockOrderItemIds: stockOrderItemId ? [stockOrderItemId] : undefined,
        orderItemIds: stockOrderItemId ? [stockOrderItemId] : undefined,
        requestItemIds: requestItemId ? [requestItemId] : undefined,
      });
      notify.success('発送予定表から商品を削除しました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.deleteFail);
    } finally {
      candidateLoading.value = false;
    }
  }

  function isKnifeCandidate(record) {
    const text = candidateText(record);
    return text.includes('刀') || text.toLowerCase().includes('knife');
  }

  function isHandleCandidate(record) {
    const text = candidateText(record).toLowerCase();
    return text.includes('ハンド') || text.includes('handle') || text.includes('柄');
  }

  function candidateText(record) {
    return [
      record?.goodsName,
      record?.skuName,
      record?.categoryName,
      record?.seriesName,
      record?.remark,
    ].map((value) => String(value || '')).join(' ');
  }

  function isOutboundCandidate(record) {
    const orderTypeValue = record?.orderType ?? record?.stockOrderType;
    const changeQty = Number(record?.changeQty ?? record?.outQty ?? 0);
    const hasOrderType = orderTypeValue !== undefined && orderTypeValue !== null && String(orderTypeValue).trim() !== '';
    const hasQty = !Number.isNaN(changeQty) && changeQty !== 0;
    return (!hasOrderType && !hasQty) || isOutboundType(orderTypeValue) || changeQty < 0;
  }


  function isCandidateAdded(record) {
    return !canStillAppendCandidate(record);
  }

  function isOutboundType(value) {
    const text = String(value ?? '').trim().toLowerCase();
    if (text === '2') return true;
    return ['出庫', 'outbound'].some((keyword) => text.includes(keyword));
  }

  return {
    isRequestItemModule,
    tableRows,
    candidateModalOpen,
    candidateLoading,
    candidateRows,
    candidateSelectedKeys,
    candidateInboundLoadingKeys,
    candidateQtyState,
    candidateSubmitText,
    candidateRowKey,
    maxRequestQty,
    formatQty,
    openCandidateModal,
    closeCandidateModal,
    onCandidateSelectChange,
    onCandidateQtyChange,
    submitAddCandidates,
    submitMatchCandidates,
    submitCandidateInbound,
    isCandidateInboundApplied,
    removeRequestItem,
    removeCandidate,
    canStillAppendCandidate,
    candidateStatus,
  };
}
