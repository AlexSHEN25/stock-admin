import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { createItem, fetchGoodsDetail, updateItem, uploadFileByBizType } from '../api/module';
import TABLE_TEXT from '../utils/module-ui';

export function useGoodsDrawer(options) {
  const {
    normalizePayload,
    loadRelationOptions,
    relationOptions,
    fetchGoodsCascadeOptions,
    keys,
    pagination,
    rows,
    reload,
    notify,
  } = options;

  const goodsDetailRecord = ref(null);
  const goodsDetailLoading = ref(false);
  const goodsDrawerOpen = ref(false);
  const goodsDrawerMode = ref('detail');
  const goodsDrawerLoading = ref(false);
  const goodsDetailSaving = ref(false);
  const goodsForm = reactive({});
  const highlightedPrimaryId = ref(null);
  let highlightTimer = null;
  let cascadeRequestSeq = 0;

  const goodsDrawerTitle = computed(() => {
    if (goodsDrawerMode.value === 'create') return TABLE_TEXT.create;
    if (goodsDrawerMode.value === 'edit') return TABLE_TEXT.edit;
    return TABLE_TEXT.detail;
  });
  const hotOptions = computed(() => [
    { label: '通常', value: 0 },
    { label: '人気', value: 1 },
  ]);

  async function openGoodsDrawerCreate() {
    goodsDrawerMode.value = 'create';
    goodsDrawerOpen.value = true;
    goodsDetailRecord.value = null;
    resetGoodsForm({
      status: 1,
      currency: 'JPY',
    });
    await loadRelationOptions(['brandId', 'seriesId', 'categoryId', 'makerId'], keys.value);
    await loadGoodsCascadeOptions();
  }

  async function openGoodsDrawerEdit(record) {
    goodsDrawerMode.value = 'edit';
    goodsDrawerOpen.value = true;
    goodsDetailRecord.value = record || null;
    resetGoodsForm(record || {});
    await hydrateGoodsDetail(record);
    await loadGoodsCascadeOptions({ seriesId: goodsForm.seriesId, brandId: goodsForm.brandId });
  }

  async function hydrateGoodsDetail(record) {
    const goodsId = record?.goodsId ?? record?.id;
    if (goodsId === undefined || goodsId === null || String(goodsId).trim() === '') return;
    goodsDetailLoading.value = true;
    try {
      const detail = await fetchGoodsDetail(goodsId);
      if (!detail || typeof detail !== 'object') return;
      goodsDetailRecord.value = { ...(record || {}), ...normalizeGoodsDetail(detail) };
      resetGoodsForm(goodsDetailRecord.value);
      loadGoodsCascadeOptions({ seriesId: goodsForm.seriesId, brandId: goodsForm.brandId });
    } catch (_e) {
      // Keep row values when detail endpoint is temporarily unavailable.
    } finally {
      goodsDetailLoading.value = false;
    }
  }

  function normalizeGoodsDetail(detail) {
    return {
      id: pickValue(detail, 'id'),
      goodsId: pickValue(detail, 'goodsId'),
      brandId: pickValue(detail, 'brandId'),
      seriesId: pickValue(detail, 'seriesId'),
      makerId: pickValue(detail, 'makerId'),
      categoryId: pickValue(detail, 'categoryId'),
      costPrice: pickValue(detail, 'costPrice', 'cost_price'),
      updatePrice: pickValue(detail, 'updatePrice', 'update_price'),
      priceUpdateTime: pickValue(detail, 'priceUpdateTime', 'price_update_time'),
      barcode: pickValue(detail, 'barcode'),
      weight: pickValue(detail, 'weight'),
      volume: pickValue(detail, 'volume'),
      imageUrl: resolveGoodsImageUrl(detail),
    };
  }

  function closeGoodsDrawer() {
    goodsDrawerOpen.value = false;
  }

  function updateGoodsFormField(field, value) {
    goodsForm[field] = value;
    if (field === 'brandId') {
      goodsForm.seriesId = null;
      goodsForm.makerId = null;
      loadGoodsCascadeOptions({ brandId: value, seriesId: null });
      return;
    }
    if (field === 'seriesId') {
      goodsForm.makerId = null;
      loadGoodsCascadeOptions({ seriesId: value, brandId: goodsForm.brandId });
    }
  }

  function resetGoodsForm(source) {
    const base = source || {};
    const fields = [
      'id', 'goodsId', 'skuId',
      'name', 'englishName', 'brandId', 'seriesId', 'categoryId', 'makerId', 'status',
      'description', 'sort', 'isHot',
      'skuCode', 'skuName', 'price', 'currency',
      'costPrice', 'updatePrice', 'priceUpdateTime', 'barcode', 'weight', 'volume', 'imageUrl',
    ];
    fields.forEach((field) => { goodsForm[field] = base[field] ?? null; });
    goodsForm.brandId = pickValue(base, 'brandId');
    goodsForm.seriesId = pickValue(base, 'seriesId');
    goodsForm.makerId = pickValue(base, 'makerId');
    goodsForm.categoryId = pickValue(base, 'categoryId');
    goodsForm.imageUrl = resolveGoodsImageUrl(base);
    goodsForm.isHot = Number(base.isHot ?? 0) === 1 ? 1 : 0;
    if (!goodsForm.currency) goodsForm.currency = 'JPY';
  }

  function beforeGoodsImageUpload(file) {
    uploadGoodsImageToBackend(file, goodsForm.imageUrl, (url) => {
      goodsForm.imageUrl = url;
    });
    return false;
  }

  async function uploadGoodsImageToBackend(file, oldPath, onSuccess) {
    try {
      const imagePath = await uploadFileByBizType('GOODS', file, oldPath);
      if (!imagePath) {
        notify.error('画像アップロードに失敗しました');
        return;
      }
      onSuccess(String(imagePath || ''));
      notify.success('画像をアップロードしました');
    } catch (error) {
      notify.error(error?.message || '画像アップロードに失敗しました');
    }
  }

  function resolveGoodsImageUrl(source) {
    const obj = source && typeof source === 'object' ? source : {};
    const direct = pickValue(
      obj,
      'imageUrl',
      'image_url',
      'mainImage',
      'mainImageUrl',
      'image',
      'imgUrl',
      'img',
      'cover',
      'coverUrl',
    );
    if (direct) return String(direct);

    const candidates = []
      .concat(Array.isArray(obj.images) ? obj.images : [])
      .concat(Array.isArray(obj.imageList) ? obj.imageList : [])
      .concat(Array.isArray(obj.goodsImages) ? obj.goodsImages : [])
      .concat(Array.isArray(obj.goodsImageList) ? obj.goodsImageList : []);
    for (const item of candidates) {
      const nested = pickValue(item || {}, 'imageUrl', 'image_url', 'url', 'imgUrl', 'path');
      if (nested) return String(nested);
    }
    return '';
  }

  function validateGoodsForm() {
    if (!goodsForm.name || String(goodsForm.name).trim() === '') return '名称を入力してください';
    if (!goodsForm.skuCode || String(goodsForm.skuCode).trim() === '') return '品番を入力してください';
    if (goodsForm.price === undefined || goodsForm.price === null || String(goodsForm.price).trim() === '') return '価格を入力してください';
    if (!goodsForm.brandId || !goodsForm.categoryId) return 'ブランド/カテゴリを選択してください';
    if (goodsForm.updatePrice !== undefined && goodsForm.updatePrice !== null && String(goodsForm.updatePrice).trim() !== '') {
      if (!goodsForm.priceUpdateTime || String(goodsForm.priceUpdateTime).trim() === '') return '改定価格を入力した場合、価格更新日時は必須です';
    }
    return '';
  }

  async function loadGoodsCascadeOptions(params = {}) {
    if (typeof fetchGoodsCascadeOptions !== 'function' || !relationOptions) return;
    const requestSeq = ++cascadeRequestSeq;
    try {
      const data = await fetchGoodsCascadeOptions(buildCascadeQuery(params));
      if (requestSeq !== cascadeRequestSeq) return;
      applyCascadeOptions(data);
    } catch (_error) {
      // Keep existing options if the cascade endpoint is temporarily unavailable.
    }
  }

  function buildCascadeQuery(params) {
    const query = {};
    const seriesId = params.seriesId ?? goodsForm.seriesId;
    const brandId = params.brandId ?? goodsForm.brandId;
    if (seriesId !== undefined && seriesId !== null && String(seriesId).trim() !== '') {
      query.seriesId = seriesId;
    }
    if (brandId !== undefined && brandId !== null && String(brandId).trim() !== '') {
      query.brandId = brandId;
    }
    return query;
  }

  function applyCascadeOptions(data) {
    const brandOptions = normalizeCascadeOptions(data?.brandOptions);
    const seriesOptions = normalizeCascadeOptions(data?.seriesOptions);
    const makerOptions = normalizeCascadeOptions(data?.makerOptions);
    if (brandOptions.length > 0) {
      relationOptions.brandId = brandOptions;
      clearIfMissing('brandId', brandOptions);
    }
    if (seriesOptions.length > 0) {
      relationOptions.seriesId = seriesOptions;
      clearIfMissing('seriesId', seriesOptions);
    }
    if (makerOptions.length > 0) {
      relationOptions.makerId = makerOptions;
      clearIfMissing('makerId', makerOptions);
    }
  }

  function normalizeCascadeOptions(source) {
    const seen = new Set();
    return (Array.isArray(source) ? source : [])
      .map((item) => {
        const value = item?.value ?? item?.id ?? item?.code;
        const label = item?.label ?? item?.name ?? item?.text;
        if (value === undefined || value === null || label === undefined || label === null) return null;
        const valueKey = String(value);
        if (seen.has(valueKey)) return null;
        seen.add(valueKey);
        return { value, label: String(label), raw: item };
      })
      .filter(Boolean);
  }

  function clearIfMissing(field, options) {
    const current = goodsForm[field];
    if (current === undefined || current === null || String(current).trim() === '') return;
    const exists = options.some((option) => String(option.value) === String(current));
    if (!exists) goodsForm[field] = null;
  }

  async function saveGoodsDrawer() {
    const err = validateGoodsForm();
    if (err) {
      notify.warning(err);
      return;
    }
    goodsDetailSaving.value = true;
    try {
      const rawName = goodsForm.name ? String(goodsForm.name).trim() : '';
      const rawSkuName = goodsForm.skuName ? String(goodsForm.skuName).trim() : '';
      const payload = {
        ...goodsDetailRecord.value,
        ...goodsForm,
        skuName: rawSkuName || rawName,
        isHot: Number(goodsForm.isHot) === 1 ? 1 : 0,
      };
      if (!payload.updatePrice) payload.priceUpdateTime = null;
      if (!payload.currency) payload.currency = 'JPY';
      if (goodsDrawerMode.value === 'create') {
        const created = await createItem('goods', normalizePayload(payload));
        notify.success(TABLE_TEXT.createSuccess);
        goodsDrawerOpen.value = false;
        pagination.current = 1;
        highlightedPrimaryId.value = resolvePrimaryId(created) || null;
      } else {
        payload.id = payload.id || payload.goodsId;
        await updateItem('goods', normalizePayload(payload));
        notify.success(TABLE_TEXT.updateSuccess);
        goodsDrawerOpen.value = false;
      }
      await reload();
      if (goodsDrawerMode.value === 'create') {
        if (!highlightedPrimaryId.value && rows.value?.length) {
          highlightedPrimaryId.value = resolvePrimaryId(rows.value[0]);
        }
        scheduleHighlightClear();
      }
    } catch (error) {
      notify.error(error?.message || TABLE_TEXT.updateFail);
    } finally {
      goodsDetailSaving.value = false;
    }
  }

  function resolvePrimaryId(record) {
    if (!record || typeof record !== 'object') return null;
    return record.skuId ?? record.id ?? record.goodsId ?? null;
  }

  function rowClassName(record) {
    if (!highlightedPrimaryId.value) return '';
    const id = resolvePrimaryId(record);
    return String(id) === String(highlightedPrimaryId.value) ? 'row-highlight-new' : '';
  }

  function scheduleHighlightClear() {
    if (highlightTimer) clearTimeout(highlightTimer);
    highlightTimer = setTimeout(() => {
      highlightedPrimaryId.value = null;
      highlightTimer = null;
    }, 3000);
  }

  function pickValue(source, ...keys) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
    }
    return null;
  }

  onBeforeUnmount(() => {
    if (highlightTimer) {
      clearTimeout(highlightTimer);
      highlightTimer = null;
    }
  });

  return {
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
    updateGoodsFormField,
    beforeGoodsImageUpload,
    resolveGoodsImageUrl,
    saveGoodsDrawer,
    rowClassName,
  };
}
