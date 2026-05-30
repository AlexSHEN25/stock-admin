<template>
  <a-modal
    :open="open"
    :title="title"
    width="860px"
    @cancel="$emit('cancel')"
  >
    <a-spin :spinning="loading">
      <a-form layout="vertical">
        <a-divider orientation="left">商品基本</a-divider>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="名称" required><a-input v-model:value="form.name" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="英語名"><a-input v-model:value="form.englishName" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="ブランド" required><a-select v-model:value="form.brandId" :options="relationOptions.brandId || []" show-search allow-clear option-filter-prop="label" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="シリーズ" required><a-select v-model:value="form.seriesId" :options="relationOptions.seriesId || []" show-search allow-clear option-filter-prop="label" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="カテゴリ" required><a-select v-model:value="form.categoryId" :options="relationOptions.categoryId || []" show-search allow-clear option-filter-prop="label" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="メーカー" required><a-select v-model:value="form.makerId" :options="relationOptions.makerId || []" show-search allow-clear option-filter-prop="label" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="状態"><a-select v-model:value="form.status" :options="selectOptions('status')" allow-clear /></a-form-item></a-col>
        </a-row>

        <a-divider orientation="left">SKU情報</a-divider>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="品番" required><a-input v-model:value="form.skuCode" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="品名"><a-input v-model:value="form.skuName" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="価格" required><a-input-number v-model:value="form.price" :min="0.01" :precision="2" style="width:100%" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="通貨"><a-select v-model:value="form.currency" :options="selectOptions('currency')" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="表示順"><a-input-number v-model:value="form.sort" :min="0" style="width:100%" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="人気商品"><a-select v-model:value="form.isHot" :options="hotOptions" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="説明"><a-textarea v-model:value="form.description" :rows="3" /></a-form-item></a-col>
        </a-row>

        <a-divider orientation="left">詳細設定</a-divider>
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="原価"><a-input-number v-model:value="form.costPrice" :min="0.01" :precision="2" style="width:100%" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="改定価格"><a-input-number v-model:value="form.updatePrice" :min="0.01" :precision="2" style="width:100%" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item :label="'価格更新日時' + (form.updatePrice ? ' *' : '')"><a-date-picker v-model:value="form.priceUpdateTime" value-format="YYYY-MM-DD HH:mm:ss" show-time style="width:100%" /></a-form-item></a-col>
          <a-col v-if="mode !== 'create'" :span="12">
            <a-form-item label="バーコード">
              <div class="barcode-readonly-wrap">
                <a-qrcode v-if="form.barcode" :value="String(form.barcode)" :size="96" />
                <span v-else>-</span>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12"><a-form-item label="重量"><a-input-number v-model:value="form.weight" style="width:100%" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="体積"><a-input-number v-model:value="form.volume" style="width:100%" /></a-form-item></a-col>
        </a-row>

        <a-divider orientation="left">画像</a-divider>
        <a-row :gutter="12">
          <a-col :span="24">
            <a-upload accept="image/*" :show-upload-list="false" :before-upload="beforeUploadImage">
              <a-button>画像アップロード</a-button>
            </a-upload>
            <div style="margin-top:8px;">
              <img v-if="resolveImageUrl(form)" :src="resolveImageUrl(form)" class="goods-thumb">
            </div>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
    <template #footer>
      <a-space>
        <a-button @click="$emit('cancel')">{{ tableText.cancel }}</a-button>
        <a-button type="primary" :loading="saving" @click="$emit('save')">{{ tableText.save }}</a-button>
      </a-space>
    </template>
  </a-modal>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  mode: { type: String, default: 'detail' },
  form: { type: Object, required: true },
  relationOptions: { type: Object, required: true },
  hotOptions: { type: Array, default: () => [] },
  tableText: { type: Object, required: true },
  selectOptions: { type: Function, required: true },
  resolveImageUrl: { type: Function, required: true },
});

const emit = defineEmits(['cancel', 'save', 'upload-image']);

function beforeUploadImage(file) {
  emit('upload-image', file);
  return false;
}
</script>
