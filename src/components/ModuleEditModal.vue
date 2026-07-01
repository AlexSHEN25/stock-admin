<template>
  <a-modal
    :open="open"
    :title="null"
    :ok-text="tableText.save"
    :cancel-text="tableText.cancel"
    :ok-button-props="{ disabled: !canWrite }"
    wrap-class-name="module-edit-modal"
    @ok="$emit('save')"
    @cancel="$emit('cancel')"
  >
    <a-form layout="vertical">
      <a-form-item
        v-for="field in fields"
        :key="field"
        :required="isRequired(field)"
      >
        <template #label>
          {{ normalizeTitle(field) }}
        </template>
        <a-upload
          v-if="isAvatarField(field)"
          accept="image/*"
          list-type="picture-card"
          :show-upload-list="false"
          :before-upload="(file) => beforeAvatarUpload(field, file)"
        >
          <img
            v-if="form[field]"
            :src="form[field]"
            class="goods-thumb"
          >
          <div v-else>
            + {{ tableText.upload }}
          </div>
        </a-upload>
        <a-input
          v-else-if="inputType(field) === 'text'"
          v-model:value="form[field]"
          :disabled="isFieldDisabled(field)"
          :placeholder="formPlaceholder(field)"
        />
        <a-select
          v-else-if="inputType(field) === 'relation'"
          v-model:value="form[field]"
          :options="relationOptions[field] || []"
          :disabled="isFieldDisabled(field)"
          :mode="isMultiRelationField(field) ? 'multiple' : undefined"
          show-search
          allow-clear
          option-filter-prop="label"
          :placeholder="formPlaceholder(field)"
        />
        <a-input-number
          v-else-if="inputType(field) === 'number' || inputType(field) === 'decimal'"
          v-model:value="form[field]"
          :disabled="isFieldDisabled(field)"
          :min="numberMinByField(field)"
          :max="numberMaxByField(field)"
          :precision="numberPrecisionByField(field)"
          style="width: 100%"
        />
        <a-select
          v-else-if="inputType(field) === 'select'"
          v-model:value="form[field]"
          :options="selectOptions(field)"
          :disabled="isFieldDisabled(field)"
          allow-clear
        />
        <a-switch
          v-else-if="inputType(field) === 'switch'"
          v-model:checked="form[field]"
          :disabled="isFieldDisabled(field)"
        />
        <a-date-picker
          v-else-if="inputType(field) === 'datetime'"
          v-model:value="form[field]"
          :disabled="isFieldDisabled(field)"
          :format="dateFormatByField(field)"
          :value-format="dateValueFormatByField(field)"
          :show-time="dateShowTimeByField(field)"
          style="width: 100%"
        />
        <a-textarea
          v-else
          v-model:value="form[field]"
          :disabled="isFieldDisabled(field)"
          :rows="3"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  fields: { type: Array, default: () => [] },
  formState: { type: Object, required: true },
  relationOptions: { type: Object, required: true },
  tableText: { type: Object, required: true },
  isRequired: { type: Function, required: true },
  normalizeTitle: { type: Function, required: true },
  isAvatarField: { type: Function, required: true },
  beforeAvatarUpload: { type: Function, required: true },
  inputType: { type: Function, required: true },
  formPlaceholder: { type: Function, required: true },
  isFieldDisabled: { type: Function, default: () => false },
  isMultiRelationField: { type: Function, required: true },
  numberMinByField: { type: Function, required: true },
  numberMaxByField: { type: Function, default: () => undefined },
  numberPrecisionByField: { type: Function, required: true },
  selectOptions: { type: Function, required: true },
});

const emit = defineEmits(['cancel', 'save', 'update-field']);
const form = computed(() => new Proxy(props.formState, {
  set(_target, field, value) {
    emit('update-field', field, value);
    return true;
  },
}));

function isHourOnlyDateTimeField(field) {
  return field === 'saleDeadline';
}

function isDateOnlyField(field) {
  return String(field || '').toLowerCase() === 'bizdate';
}

function dateFormatByField(field) {
  if (isDateOnlyField(field)) return 'YYYY-MM-DD';
  return isHourOnlyDateTimeField(field) ? 'MM-DD HH時' : 'YYYY-MM-DD HH:mm:ss';
}

function dateValueFormatByField(field) {
  if (isDateOnlyField(field)) return 'YYYY-MM-DD';
  return isHourOnlyDateTimeField(field) ? 'YYYY-MM-DD HH:00:00' : 'YYYY-MM-DD HH:mm:ss';
}

function dateShowTimeByField(field) {
  if (isDateOnlyField(field)) return false;
  return isHourOnlyDateTimeField(field) ? { format: 'HH' } : true;
}
</script>
