<template>
  <a-card
    class="brand-tree-surface"
    :bordered="false"
  >
    <div class="brand-tree-toolbar">
      <a-space
        :size="12"
        wrap
      >
        <a-input
          :value="query.brandName"
          placeholder="ブランド名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.brandName = value; }"
          @press-enter="loadRows"
        />
        <a-input
          :value="query.brandEnglishName"
          placeholder="英語名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.brandEnglishName = value; }"
          @press-enter="loadRows"
        />
        <a-input
          :value="query.seriesName"
          placeholder="シリーズ名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.seriesName = value; }"
          @press-enter="loadRows"
        />
        <a-input
          :value="query.seriesEnglishName"
          placeholder="シリーズ英語名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.seriesEnglishName = value; }"
          @press-enter="loadRows"
        />
        <a-input
          :value="query.makerName"
          placeholder="メーカー名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.makerName = value; }"
          @press-enter="loadRows"
        />
        <a-input
          :value="query.makerEnglishName"
          placeholder="メーカー英語名"
          allow-clear
          style="width: 220px;"
          @update:value="(value) => { query.makerEnglishName = value; }"
          @press-enter="loadRows"
        />
        <a-select
          :value="query.status"
          placeholder="状態"
          allow-clear
          style="width: 140px;"
          :options="statusOptions"
          @update:value="(value) => { query.status = value; }"
        />
        <a-button
          type="primary"
          @click="loadRows"
        >
          検索
        </a-button>
        <a-button @click="resetQuery">
          リセット
        </a-button>
      </a-space>
      <a-button
        v-if="canCreate"
        type="primary"
        @click="openCreate"
      >
        新規追加
      </a-button>
    </div>

    <a-table
      :row-key="rowKey"
      :loading="loading"
      :columns="columns"
      :data-source="rows"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="Number(record.status) === 1 ? 'success' : 'default'">
            {{ Number(record.status) === 1 ? '有効' : '無効' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'updateTime'">
          {{ formatTime(record.updateTime) }}
        </template>
        <template v-else-if="column.key === 'actions'">
          <span v-if="!canRowActions">閲覧のみ</span>
          <a-space
            v-else
            :size="8"
          >
            <a-button
              v-if="canEdit"
              type="link"
              @click="openEdit(record)"
            >
              編集
            </a-button>
            <a-popconfirm
              v-if="canDelete"
              title="このブランド配下のシリーズとメーカーも一緒に削除します。よろしいですか。"
              ok-text="はい"
              cancel-text="キャンセル"
              @confirm="removeBrand(record)"
            >
              <a-button
                type="link"
                danger
              >
                削除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>

  <a-modal
    :open="modalOpen"
    :title="editing ? 'ブランドツリー編集' : 'ブランドツリー新規追加'"
    :confirm-loading="saving"
    :width="1080"
    wrap-class-name="brand-tree-modal-wrap"
    ok-text="保存"
    cancel-text="キャンセル"
    @ok="submit"
    @cancel="closeModal"
  >
    <div class="tree-editor">
      <div class="tree-editor-head">
        <div class="tree-editor-title">
          ブランド情報
        </div>
        <div class="tree-editor-tip">
          ブランド -> シリーズ -> メーカーをまとめて保存します
        </div>
      </div>

      <div class="brand-form-grid">
        <a-form-item
          label="ブランド名"
          required
        >
          <a-input
            v-model:value="form.name"
            placeholder="ブランド名を入力"
          />
        </a-form-item>
        <a-form-item label="英語名">
          <a-input
            v-model:value="form.englishName"
            placeholder="英語名を入力"
          />
        </a-form-item>
        <a-form-item
          label="状態"
          required
        >
          <a-select
            v-model:value="form.status"
            :options="statusOptions"
          />
        </a-form-item>
        <a-form-item label="画像">
          <div class="brand-image-field">
            <a-upload
              :show-upload-list="false"
              :before-upload="beforeBrandImageUpload"
            >
              <a-button>画像アップロード</a-button>
            </a-upload>
            <a-image
              v-if="form.image"
              :src="form.image"
              :width="72"
              :height="72"
              style="object-fit: cover; border-radius: 10px;"
            />
          </div>
        </a-form-item>
      </div>

      <a-form-item label="説明">
        <a-textarea
          v-model:value="form.content"
          :rows="3"
          placeholder="ブランド説明を入力"
        />
      </a-form-item>

      <div class="series-section-head">
        <div class="tree-editor-title">
          シリーズ一覧
        </div>
        <a-button
          type="dashed"
          @click="addSeries"
        >
          シリーズ追加
        </a-button>
      </div>

      <a-empty
        v-if="form.series.length === 0"
        description="シリーズを追加してください"
      />

      <div
        v-else
        class="series-list"
      >
        <div
          v-for="(series, seriesIndex) in form.series"
          :key="series.__key"
          class="series-card"
        >
          <div class="series-card-head">
            <div class="series-card-title">
              シリーズ {{ seriesIndex + 1 }}
            </div>
            <a-button
              danger
              type="link"
              @click="removeSeries(seriesIndex)"
            >
              シリーズ削除
            </a-button>
          </div>

          <div class="brand-form-grid">
            <a-form-item
              label="シリーズ名"
              required
            >
              <a-input
                v-model:value="series.name"
                placeholder="シリーズ名を入力"
              />
            </a-form-item>
            <a-form-item label="英語名">
              <a-input
                v-model:value="series.englishName"
                placeholder="英語名を入力"
              />
            </a-form-item>
            <a-form-item
              label="状態"
              required
            >
              <a-select
                v-model:value="series.status"
                :options="statusOptions"
              />
            </a-form-item>
          </div>

          <a-form-item label="説明">
            <a-textarea
              v-model:value="series.content"
              :rows="2"
              placeholder="シリーズ説明を入力"
            />
          </a-form-item>

          <div class="makers-section-head">
            <div class="makers-section-title">
              メーカー一覧
            </div>
            <a-button
              type="dashed"
              size="small"
              @click="addMaker(series)"
            >
              メーカー追加
            </a-button>
          </div>

          <a-empty
            v-if="series.makers.length === 0"
            description="メーカーを追加してください"
          />

          <div
            v-else
            class="maker-list"
          >
            <div
              v-for="(maker, makerIndex) in series.makers"
              :key="maker.__key"
              class="maker-card"
            >
              <div class="maker-card-head">
                <div class="maker-card-title">
                  メーカー {{ makerIndex + 1 }}
                </div>
                <a-button
                  danger
                  type="link"
                  size="small"
                  @click="removeMaker(series, makerIndex)"
                >
                  メーカー削除
                </a-button>
              </div>
              <div class="maker-grid">
                <a-form-item
                  label="メーカー名"
                  required
                >
                  <a-input
                    v-model:value="maker.name"
                    placeholder="メーカー名を入力"
                  />
                </a-form-item>
                <a-form-item label="英語名">
                  <a-input
                    v-model:value="maker.englishName"
                    placeholder="英語名を入力"
                  />
                </a-form-item>
                <a-form-item
                  label="状態"
                  required
                >
                  <a-select
                    v-model:value="maker.status"
                    :options="statusOptions"
                  />
                </a-form-item>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import {
  fetchBrandHierarchyPage,
  fetchBrandTreeDetail,
  removeItem,
  saveBrandTree,
  uploadFileByBizType,
} from '../api/module';
import { formatTokyoDateTime } from '../utils/timezone';

const props = defineProps({
  moduleActions: {
    type: Object,
    default: () => ({
      read: false,
      create: false,
      edit: false,
      delete: false,
    }),
  },
});

const statusOptions = [
  { label: '有効', value: 1 },
  { label: '無効', value: 0 },
];

const columns = [
  { title: 'ブランド名', dataIndex: 'brandName', key: 'brandName', width: 160 },
  { title: 'ブランド英語名', dataIndex: 'brandEnglishName', key: 'brandEnglishName', width: 180 },
  { title: 'シリーズ名', dataIndex: 'seriesName', key: 'seriesName', width: 160 },
  { title: 'シリーズ英語名', dataIndex: 'seriesEnglishName', key: 'seriesEnglishName', width: 180 },
  { title: 'メーカー名', dataIndex: 'makerName', key: 'makerName', width: 160 },
  { title: 'メーカー英語名', dataIndex: 'makerEnglishName', key: 'makerEnglishName', width: 180 },
  { title: '状態', dataIndex: 'status', key: 'status', width: 100 },
  { title: '更新日時', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
  { title: '操作', key: 'actions', width: 150, fixed: 'right' },
];

const loading = ref(false);
const saving = ref(false);
const modalOpen = ref(false);
const editing = ref(false);
const rows = ref([]);
const query = reactive({
  brandName: '',
  brandEnglishName: '',
  seriesName: '',
  seriesEnglishName: '',
  makerName: '',
  makerEnglishName: '',
  status: undefined,
});
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});
const form = reactive(createEmptyForm());

const canCreate = computed(() => Boolean(props.moduleActions?.create));
const canEdit = computed(() => Boolean(props.moduleActions?.edit));
const canDelete = computed(() => Boolean(props.moduleActions?.delete));
const canRowActions = computed(() => canEdit.value || canDelete.value);

onMounted(() => {
  loadRows();
});

async function loadRows() {
  loading.value = true;
  try {
    const page = await fetchBrandHierarchyPage({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      brandName: query.brandName || undefined,
      brandEnglishName: query.brandEnglishName || undefined,
      seriesName: query.seriesName || undefined,
      seriesEnglishName: query.seriesEnglishName || undefined,
      makerName: query.makerName || undefined,
      makerEnglishName: query.makerEnglishName || undefined,
      status: query.status,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
    rows.value = Array.isArray(page.records) ? page.records : [];
    pagination.total = Number(page.total || 0);
  } catch (error) {
    message.error(error?.message || 'ブランド一覧の取得に失敗しました');
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.brandName = '';
  query.brandEnglishName = '';
  query.seriesName = '';
  query.seriesEnglishName = '';
  query.makerName = '';
  query.makerEnglishName = '';
  query.status = undefined;
  pagination.current = 1;
  loadRows();
}

function handleTableChange(nextPagination) {
  pagination.current = Number(nextPagination?.current || 1);
  pagination.pageSize = Number(nextPagination?.pageSize || 10);
  loadRows();
}

function rowKey(record) {
  return [
    record?.brandId ?? 'brand',
    record?.seriesId ?? 'series',
    record?.makerId ?? 'maker',
  ].join('-');
}

function resolveBrandId(record) {
  return record?.brandId ?? record?.id ?? null;
}

function openCreate() {
  if (!canCreate.value) return;
  replaceForm(createEmptyForm());
  editing.value = false;
  modalOpen.value = true;
}

async function openEdit(record) {
  const brandId = resolveBrandId(record);
  if (!canEdit.value || !brandId) return;
  try {
    const detail = await fetchBrandTreeDetail(brandId);
    replaceForm(normalizeDetail(detail));
    editing.value = true;
    modalOpen.value = true;
  } catch (error) {
    message.error(error?.message || 'ブランドツリー詳細の取得に失敗しました');
  }
}

async function removeBrand(record) {
  const brandId = resolveBrandId(record);
  if (!canDelete.value || !brandId) return;
  try {
    await removeItem('brand', brandId);
    message.success('削除しました');
    if (rows.value.length === 1 && pagination.current > 1) {
      pagination.current -= 1;
    }
    await loadRows();
  } catch (error) {
    message.error(error?.message || '削除に失敗しました');
  }
}

function closeModal() {
  modalOpen.value = false;
}

function addSeries() {
  form.series.push(createSeriesNode());
}

function removeSeries(index) {
  form.series.splice(index, 1);
}

function addMaker(series) {
  series.makers.push(createMakerNode());
}

function removeMaker(series, index) {
  series.makers.splice(index, 1);
}

async function beforeBrandImageUpload(file) {
  try {
    const uploaded = await uploadFileByBizType('brand', file, form.image || '');
    form.image = uploaded || '';
    message.success('画像をアップロードしました');
  } catch (error) {
    message.error(error?.message || '画像アップロードに失敗しました');
  }
  return false;
}

async function submit() {
  const validationMessage = validateForm();
  if (validationMessage) {
    message.warning(validationMessage);
    return;
  }
  saving.value = true;
  try {
    await saveBrandTree(toPayload());
    message.success(editing.value ? '更新しました' : '追加しました');
    modalOpen.value = false;
    await loadRows();
  } catch (error) {
    message.error(error?.message || '保存に失敗しました');
  } finally {
    saving.value = false;
  }
}

function validateForm() {
  if (!String(form.name || '').trim()) return 'ブランド名を入力してください';
  for (let i = 0; i < form.series.length; i += 1) {
    const series = form.series[i];
    if (!String(series.name || '').trim()) {
      return `シリーズ${i + 1}の名称を入力してください`;
    }
    for (let j = 0; j < series.makers.length; j += 1) {
      const maker = series.makers[j];
      if (!String(maker.name || '').trim()) {
        return `シリーズ${i + 1}のメーカー${j + 1}の名称を入力してください`;
      }
    }
  }
  return '';
}

function toPayload() {
  return {
    id: form.id || undefined,
    name: normalizeText(form.name),
    englishName: normalizeText(form.englishName),
    image: normalizeText(form.image),
    content: normalizeText(form.content),
    status: Number(form.status ?? 1),
    series: form.series.map((series) => ({
      id: series.id || undefined,
      name: normalizeText(series.name),
      englishName: normalizeText(series.englishName),
      content: normalizeText(series.content),
      status: Number(series.status ?? 1),
      makers: series.makers.map((maker) => ({
        id: maker.id || undefined,
        name: normalizeText(maker.name),
        englishName: normalizeText(maker.englishName),
        status: Number(maker.status ?? 1),
      })),
    })),
  };
}

function replaceForm(next) {
  form.id = next.id || null;
  form.name = next.name || '';
  form.englishName = next.englishName || '';
  form.image = next.image || '';
  form.content = next.content || '';
  form.status = Number(next.status ?? 1);
  form.series = Array.isArray(next.series) ? next.series : [];
}

function normalizeDetail(detail) {
  const source = detail && typeof detail === 'object' ? detail : {};
  return {
    id: source.id || null,
    name: source.name || '',
    englishName: source.englishName || '',
    image: source.image || '',
    content: source.content || '',
    status: Number(source.status ?? 1),
    series: Array.isArray(source.children)
      ? source.children.map((item) => ({
        id: item.id || null,
        name: item.name || '',
        englishName: item.englishName || '',
        content: item.content || '',
        status: Number(item.status ?? 1),
        makers: Array.isArray(item.children)
          ? item.children.map((maker) => ({
            id: maker.id || null,
            name: maker.name || '',
            englishName: maker.englishName || '',
            status: Number(maker.status ?? 1),
            __key: createLocalKey('maker'),
          }))
          : [],
        __key: createLocalKey('series'),
      }))
      : [],
  };
}

function createEmptyForm() {
  return {
    id: null,
    name: '',
    englishName: '',
    image: '',
    content: '',
    status: 1,
    series: [],
  };
}

function createSeriesNode() {
  return {
    id: null,
    name: '',
    englishName: '',
    content: '',
    status: 1,
    makers: [],
    __key: createLocalKey('series'),
  };
}

function createMakerNode() {
  return {
    id: null,
    name: '',
    englishName: '',
    status: 1,
    __key: createLocalKey('maker'),
  };
}

function createLocalKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value) {
  const text = String(value || '').trim();
  return text || undefined;
}

function formatTime(value) {
  return formatTokyoDateTime(value);
}
</script>

<style scoped>
.brand-tree-surface :deep(.ant-card-body) {
  padding: 20px 24px 24px;
}

.brand-tree-surface :deep(.ant-table-wrapper),
.brand-tree-surface :deep(.ant-table),
.brand-tree-surface :deep(.ant-table-container) {
  background: transparent;
}

.brand-tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.tree-editor {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 4px;
}

.tree-editor-head,
.series-section-head,
.series-card-head,
.makers-section-head,
.maker-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.tree-editor-head,
.series-section-head {
  margin-bottom: 16px;
}

.tree-editor-title,
.series-card-title,
.makers-section-title,
.maker-card-title {
  font-weight: 600;
}

.tree-editor-tip {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.brand-form-grid,
.maker-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 12px;
}

.brand-image-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.series-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.series-card,
.maker-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  background: #fafafa;
}

.series-card {
  padding: 16px 16px 8px;
}

.maker-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.maker-card {
  padding: 12px 12px 0;
  background: #fff;
}

:global(.brand-tree-modal-wrap .ant-modal-content) {
  border-radius: 18px;
  overflow: hidden;
}

:global(.brand-tree-modal-wrap .ant-modal-header) {
  padding-bottom: 18px;
}

:global(.brand-tree-modal-wrap .ant-modal-body) {
  padding-top: 8px;
}

:global(.brand-tree-modal-wrap .ant-form-item-label > label) {
  font-weight: 600;
}

:global(.brand-tree-modal-wrap .ant-input),
:global(.brand-tree-modal-wrap .ant-input-affix-wrapper),
:global(.brand-tree-modal-wrap .ant-input-number),
:global(.brand-tree-modal-wrap .ant-select-selector),
:global(.brand-tree-modal-wrap textarea.ant-input) {
  border-radius: 10px !important;
}

:global(.brand-tree-modal-wrap .ant-empty) {
  margin-block: 20px;
}

:global(html[data-theme-mode='dark']) .brand-tree-surface.ant-card,
:global(html[data-theme-mode='dark']) .brand-tree-surface.ant-card-bordered,
:global(html[data-theme-mode='dark']) .brand-tree-surface .ant-card-body {
  background: #101010 !important;
  border-color: #2a2a2a !important;
  box-shadow: none !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table-wrapper),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table-container),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-spin-container),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table-tbody > tr > td) {
  background: #101010 !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table-thead > tr > th) {
  background: #141414 !important;
  color: #f3f3f3 !important;
  border-bottom: 1px solid #2f2f2f !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-table-tbody > tr > td) {
  color: #e8e8e8 !important;
  border-bottom: 1px solid #232323 !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-pagination),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-pagination-options),
:global(html[data-theme-mode='dark']) .brand-tree-surface :deep(.ant-select-selector) {
  background: #101010 !important;
}

:global(html[data-theme-mode='dark']) .tree-editor,
:global(html[data-theme-mode='dark']) .tree-editor-title,
:global(html[data-theme-mode='dark']) .series-card-title,
:global(html[data-theme-mode='dark']) .makers-section-title,
:global(html[data-theme-mode='dark']) .maker-card-title {
  color: #f5f5f5;
}

:global(html[data-theme-mode='dark']) .tree-editor-tip {
  color: rgba(255, 255, 255, 0.58);
}

:global(html[data-theme-mode='dark']) .series-card {
  border-color: #303030;
  background: linear-gradient(180deg, #181818 0%, #141414 100%);
}

:global(html[data-theme-mode='dark']) .maker-card {
  border-color: #2a2a2a;
  background: #111111;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-content,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-header,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-body,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-footer {
  background: #141414 !important;
  border-color: #2f2f2f !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-title,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-form-item-label > label,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-empty-description,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-upload,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-link {
  color: #f2f2f2 !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-modal-close {
  color: #cfcfcf !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-input,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-input-affix-wrapper,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-input-number,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-select-selector,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap textarea.ant-input {
  background: #1a1a1a !important;
  border-color: #3a3a3a !important;
  color: #f3f3f3 !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-input::placeholder,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap textarea.ant-input::placeholder,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-select-selection-placeholder {
  color: rgba(255, 255, 255, 0.38) !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-select-arrow,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-input-number-handler-wrap {
  color: #bfbfbf !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-default,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-dashed {
  background: #1a1a1a !important;
  border-color: #3a3a3a !important;
  color: #ededed !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-default:hover,
:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-dashed:hover {
  background: #222222 !important;
  border-color: #4a4a4a !important;
  color: #ffffff !important;
}

:global(html[data-theme-mode='dark']) .brand-tree-modal-wrap .ant-btn-dangerous.ant-btn-link {
  color: #ff7875 !important;
}

@media (max-width: 960px) {
  .brand-tree-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .brand-form-grid,
  .maker-grid {
    grid-template-columns: 1fr;
  }
}
</style>
