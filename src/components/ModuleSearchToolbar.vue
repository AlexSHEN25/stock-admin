<template>
  <div class="search-toolbar">
    <div class="search-filters">
      <template
        v-for="field in fields"
        :key="field"
      >
        <a-select
          v-if="queryInputType(field) === 'select'"
          v-model:value="query[field]"
          :options="queryOptions(field)"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
          allow-clear
        />
        <a-input
          v-else-if="queryInputType(field) === 'text'"
          v-model:value="query[field]"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
          @press-enter="$emit('reload')"
        />
        <a-input-number
          v-else
          v-model:value="query[field]"
          :placeholder="queryPlaceholder(field)"
          class="search-control"
        />
      </template>
    </div>
    <div class="search-actions">
      <a-button
        type="primary"
        class="search-btn search-btn-main"
        @click="$emit('search')"
      >
        {{ tableText.search }}
      </a-button>
      <a-button
        class="search-btn"
        :disabled="!hasActiveFilters(fields, queryState)"
        @click="$emit('reset')"
      >
        {{ tableText.reset }}
      </a-button>
      <a-popconfirm
        v-if="canWrite && canBatchDelete && selectedCount > 0"
        :title="tableText.confirmBatchDelete"
        :ok-text="tableText.yes"
        :cancel-text="tableText.no"
        @confirm="$emit('batch-delete')"
      >
        <a-button
          danger
          class="search-btn"
        >
          {{ tableText.batchDelete }}
        </a-button>
      </a-popconfirm>
      <a-button
        v-else-if="canWrite && canBatchDelete"
        danger
        class="search-btn"
        disabled
      >
        {{ tableText.batchDelete }}
      </a-button>
      <a-button
        v-if="canWrite && canCreate"
        type="primary"
        class="search-btn search-btn-create"
        @click="$emit('create')"
      >
        {{ tableText.create }}
      </a-button>
      <a-button
        v-if="moduleKey === 'message'"
        class="search-btn"
        @click="$emit('read-all')"
      >
        {{ tableText.readAll }}
      </a-button>
      <a-button
        v-if="moduleKey === 'requestItem'"
        type="primary"
        class="search-btn"
        @click="$emit('open-candidates')"
      >
        明細追加
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fields: { type: Array, default: () => [] },
  queryState: { type: Object, required: true },
  tableText: { type: Object, required: true },
  moduleKey: { type: String, required: true },
  canWrite: { type: Boolean, default: false },
  canBatchDelete: { type: Boolean, default: false },
  canCreate: { type: Boolean, default: false },
  selectedCount: { type: Number, default: 0 },
  queryInputType: { type: Function, required: true },
  queryOptions: { type: Function, required: true },
  queryPlaceholder: { type: Function, required: true },
  hasActiveFilters: { type: Function, required: true },
});

const emit = defineEmits([
  'search',
  'reload',
  'reset',
  'batch-delete',
  'create',
  'read-all',
  'open-candidates',
  'update-field',
]);
const query = computed(() => new Proxy(props.queryState, {
  set(_target, field, value) {
    emit('update-field', field, value);
    return true;
  },
}));
</script>
