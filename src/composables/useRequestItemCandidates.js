import { computed, reactive, ref } from 'vue';
import { addRequestItems, getCandidateItems, removeRequestItems } from '../api/module';
import { TABLE_TEXT } from '../utils/module-ui';

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
      ? `追加（${candidateSelectedKeys.value.length}件）`
      : '追加'
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

  function candidateRowKey(record) {
    return resolveCandidateStockRecordId(record) ?? record?.stockOrderItemId ?? record?.stock_order_item_id ?? record?.id;
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
      candidateRows.value = Array.isArray(list) ? list : [];
      Object.keys(candidateQtyState).forEach((key) => delete candidateQtyState[key]);
      candidateRows.value.forEach((item) => {
        const key = candidateRowKey(item);
        if (!key) return;
        const seedQty = Number(item?.requestQty ?? item?.changeQty ?? 1);
        candidateQtyState[key] = Math.max(1, Math.abs(seedQty || 1));
      });
      candidateSelectedKeys.value = candidateRows.value
        .filter((item) => Number(item?.selected) === 1 || item?.selected === true)
        .map((item) => candidateRowKey(item))
        .filter((id) => id !== undefined && id !== null);
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
    candidateSelectedKeys.value = keys;
  }

  function onCandidateQtyChange(key, value) {
    candidateQtyState[key] = value;
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
        requestQty: clampRequestQty(item, candidateQtyState[candidateRowKey(item)]),
      }));
    const payloadItems = items.map(({ maxQty: _maxQty, ...rest }) => rest);
    if (!requestId) {
      notify.warning('請求書を選択してください');
      return;
    }
    if (candidateSelectedKeys.value.length === 0) {
      notify.warning('追加する明細を選択してください');
      return;
    }
    if (items.some((item) => !item.stockRecordId)) {
      notify.warning('候補データに在庫履歴IDがありません');
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
      await addRequestItems({ requestId, items: payloadItems.filter((item) => item.stockRecordId && item.requestQty > 0) });
      notify.success('申請明細を更新しました');
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
    const requestItemId = Number(getRecordId(record));
    if (!requestId || (!stockRecordId && !requestItemId)) return;
    try {
      await removeRequestItems({
        requestId,
        stockRecordIds: stockRecordId ? [stockRecordId] : undefined,
        requestItemIds: requestItemId ? [requestItemId] : undefined,
      });
      notify.success('申請明細を削除しました');
      await refreshRequestItemContext();
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.deleteFail);
    }
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
