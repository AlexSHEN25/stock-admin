import { computed, reactive, ref } from 'vue';
import { addRequestItemsFromStockOrder, getCandidateItems, removeRequestItems } from '../api/module';
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
  const candidateQtyState = reactive({});

  const isRequestItemModule = computed(() => moduleKey.value === 'requestItem');
  const tableRows = computed(() => {
    if (!isRequestItemModule.value) return rows.value;
    return (rows.value || []).filter((item) => Number(item?.state ?? item?.requestItemState ?? 1) === 1);
  });
  const candidateSubmitText = computed(() => (
    candidateSelectedKeys.value.length > 0
      ? `\u8ffd\u52a0\uff08${candidateSelectedKeys.value.length}\u4ef6\uff09`
      : '\u8ffd\u52a0'
  ));

  function resolveCurrentRequestId() {
    const fromQuery = Number(queryState.requestId);
    if (fromQuery) return fromQuery;
    const first = rows.value?.[0];
    const fromRow = Number(first?.requestId);
    if (fromRow) return fromRow;
    const raw = sessionStorage.getItem('jump_request_form_id');
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
    return resolveCandidateStockOrderItemId(record) || resolveCandidateStockRecordId(record) || record?.id;
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
    ];
    for (const value of sources) {
      const qty = Number(value);
      if (!Number.isNaN(qty) && qty > 0) {
        return Math.floor(qty);
      }
    }
    return 0;
  }

  function maxRequestQty(record) {
    const candidateMax = resolveCandidateMaxQty(record);
    if (candidateMax > 0) return candidateMax;
    const qty = Number(record?.changeQty ?? 0);
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
      candidateRows.value = (Array.isArray(list) ? list : []).filter(isCompletedOutboundCandidate);
      Object.keys(candidateQtyState).forEach((key) => delete candidateQtyState[key]);
      candidateRows.value.forEach((item) => {
        const key = candidateRowKey(item);
        if (!key) return;
        const seedQty = Number(item?.requestQty ?? item?.changeQty ?? 1);
        candidateQtyState[key] = Math.max(1, Math.abs(seedQty || 1));
      });
      candidateSelectedKeys.value = expandKnifeHandleSelection(candidateRows.value
        .filter((item) => Number(item?.selected) === 1 || item?.selected === true)
        .map((item) => candidateRowKey(item))
        .filter((id) => id !== undefined && id !== null));
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
    const selectedKeys = new Set((candidateSelectedKeys.value || []).map((x) => String(x)));
    const items = (candidateRows.value || [])
      .filter((item) => selectedKeys.has(String(candidateRowKey(item))))
      .map((item) => ({
        maxQty: maxRequestQty(item),
        stockRecordId: resolveCandidateStockRecordId(item),
        stockOrderItemId: resolveCandidateStockOrderItemId(item),
        requestQty: clampRequestQty(item, candidateQtyState[candidateRowKey(item)]),
      }));
    const payloadItems = items.map(({ maxQty: _maxQty, ...rest }) => rest);

    if (!requestId) {
      notify.warning('\u8acb\u6c42\u66f8\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044');
      return;
    }
    if (candidateSelectedKeys.value.length === 0) {
      notify.warning('\u8ffd\u52a0\u3059\u308b\u660e\u7d30\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044');
      return;
    }
    if (items.some((item) => !item.stockRecordId && !item.stockOrderItemId)) {
      notify.warning('\u5019\u88dc\u30c7\u30fc\u30bf\u306b\u51fa\u5eab\u660e\u7d30ID\u307e\u305f\u306f\u5728\u5eab\u5c65\u6b74ID\u304c\u3042\u308a\u307e\u305b\u3093');
      return;
    }
    if (items.some((item) => !item.requestQty || item.requestQty <= 0)) {
      notify.warning('\u8acb\u6c42\u6570\u91cf\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044');
      return;
    }
    if (items.some((item) => item.requestQty > item.maxQty)) {
      notify.warning('\u8acb\u6c42\u6570\u91cf\u306f\u51fa\u5eab\u6570\u91cf\u4ee5\u4e0b\u306b\u3057\u3066\u304f\u3060\u3055\u3044');
      return;
    }

    candidateLoading.value = true;
    try {
      await addRequestItemsFromStockOrder({
        requestId,
        items: payloadItems.filter((item) => (item.stockRecordId || item.stockOrderItemId) && item.requestQty > 0),
      });
      notify.success('\u8acb\u6c42\u66f8\u660e\u7d30\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f');
      candidateModalOpen.value = false;
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.saveFail);
    } finally {
      candidateLoading.value = false;
    }
  }

  async function removeRequestItem(record, getRecordId) {
    const requestId = resolveCurrentRequestId();
    const stockRecordId = Number(record?.stockRecordId);
    const stockOrderItemId = Number(record?.stockOrderItemId ?? record?.orderItemId);
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
      notify.success('\u8acb\u6c42\u66f8\u660e\u7d30\u3092\u51fa\u5eab\u4f1d\u7968\u660e\u7d30\u3078\u623b\u3057\u307e\u3057\u305f');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.deleteFail);
    }
  }

  function isKnifeCandidate(record) {
    const text = candidateText(record);
    return text.includes('\u5200') || text.toLowerCase().includes('knife');
  }

  function isHandleCandidate(record) {
    const text = candidateText(record).toLowerCase();
    return text.includes('\u30cf\u30f3\u30c9') || text.includes('handle') || text.includes('\u67c4');
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

  function isCompletedOutboundCandidate(record) {
    const stateValue = record?.state ?? record?.orderState ?? record?.stockOrderState ?? record?.stateCode;
    const orderTypeValue = record?.orderType ?? record?.stockOrderType;
    const changeQty = Number(record?.changeQty ?? record?.outQty ?? 0);
    const hasState = stateValue !== undefined && stateValue !== null && String(stateValue).trim() !== '';
    const hasOrderType = orderTypeValue !== undefined && orderTypeValue !== null && String(orderTypeValue).trim() !== '';
    const hasQty = !Number.isNaN(changeQty) && changeQty !== 0;

    const completed = !hasState || isCompletedState(stateValue);
    const outbound = (!hasOrderType && !hasQty) || isOutboundType(orderTypeValue) || changeQty < 0;
    return completed && outbound;
  }

  function isCompletedState(value) {
    const text = String(value ?? '').trim().toLowerCase();
    if (text === '2') return true;
    return ['完了', '完成', 'completed', 'complete', 'done'].some((keyword) => text.includes(keyword));
  }

  function isOutboundType(value) {
    const text = String(value ?? '').trim().toLowerCase();
    if (text === '2') return true;
    return ['出庫', '出库', 'outbound'].some((keyword) => text.includes(keyword));
  }

  return {
    isRequestItemModule,
    tableRows,
    candidateModalOpen,
    candidateLoading,
    candidateRows,
    candidateSelectedKeys,
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
    removeRequestItem,
  };
}
