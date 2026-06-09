<template>
  <a-upload
    v-if="isAvatarField(editableField)"
    accept="image/*"
    list-type="picture-card"
    :show-upload-list="false"
    :before-upload="(file) => beforeAvatarUpload(editableField, file)"
  >
    <img
      v-if="value"
      :src="value"
      class="goods-thumb"
      alt="avatar"
    >
    <div v-else>
      + Upload
    </div>
  </a-upload>
  <a-select
    v-else-if="inputType(editableField) === 'relation'"
    v-model:value="value"
    :options="relationOptions[editableField] || []"
    :mode="isMultiRelationField(editableField) ? 'multiple' : undefined"
    show-search
    allow-clear
    option-filter-prop="label"
    style="width: 100%"
  />
  <a-input-number
    v-else-if="inputType(editableField) === 'number' || inputType(editableField) === 'decimal'"
    v-model:value="value"
    :min="numberMinByField(editableField)"
    :precision="numberPrecisionByField(editableField)"
    style="width: 100%"
  />
  <a-select
    v-else-if="inputType(editableField) === 'select'"
    v-model:value="value"
    :options="selectOptions(editableField)"
    allow-clear
  />
  <a-switch
    v-else-if="inputType(editableField) === 'switch'"
    v-model:checked="value"
  />
  <a-date-picker
    v-else-if="inputType(editableField) === 'datetime'"
    v-model:value="value"
    value-format="YYYY-MM-DD HH:mm:ss"
    show-time
    style="width: 100%"
  />
  <a-input
    v-else
    v-model:value="value"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  field: { type: String, required: true },
  editState: { type: Object, required: true },
  relationOptions: { type: Object, required: true },
  isAvatarField: { type: Function, required: true },
  beforeAvatarUpload: { type: Function, required: true },
  inlineField: { type: Function, required: true },
  inputType: { type: Function, required: true },
  isMultiRelationField: { type: Function, required: true },
  numberMinByField: { type: Function, required: true },
  numberPrecisionByField: { type: Function, required: true },
  selectOptions: { type: Function, required: true },
});

const emit = defineEmits(['update-field']);
const editableField = computed(() => props.inlineField(props.field));
const value = computed({
  get: () => props.editState[editableField.value],
  set: (nextValue) => emit('update-field', editableField.value, nextValue),
});
</script>
