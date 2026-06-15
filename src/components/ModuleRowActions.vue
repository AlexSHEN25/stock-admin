<template>
  <a-space>
    <a-button
      v-if="showInbound"
      type="primary"
      size="small"
      :disabled="inboundDone"
      @click="$emit('inbound', record)"
    >
      {{ inboundDone ? tableText.inboundDone : tableText.inbound }}
    </a-button>

    <a-button
      v-if="showOutbound && canOutbound"
      type="primary"
      size="small"
      danger
      @click="$emit('outbound', record)"
    >
      {{ tableText.outbound }}
    </a-button>

    <a
      v-for="action in actions"
      v-show="canShowExtraAction(action.key, record)"
      :key="action.key"
    >
      <a-popconfirm
        v-if="action.key === 'approve' || action.key === 'reject'"
        :title="getConfirmTitle(action.key)"
        :ok-text="tableText.yes"
        :cancel-text="tableText.no"
        @confirm="$emit('extra-action', action.key, record)"
      >
        <a>{{ action.label }}</a>
      </a-popconfirm>
      <a
        v-else
        @click="$emit('extra-action', action.key, record)"
      >
        {{ action.label }}
      </a>
    </a>
    <a
      v-if="canWrite && canInlineEdit && !editing"
      @click="$emit('inline-edit', record)"
    >{{ tableText.inlineEdit }}</a>
    <a
      v-if="canWrite && canEdit && editing"
      @click="$emit('save', record)"
    >{{ tableText.save }}</a>
    <a
      v-if="canWrite && canEdit && editing"
      @click="$emit('cancel')"
    >{{ tableText.cancel }}</a>
    <a
      v-if="canWrite && canEdit"
      @click="$emit('edit', record)"
    >{{ tableText.edit }}</a>
    <a-popconfirm
      v-if="canWrite && canDelete"
      :title="tableText.confirmDelete"
      :ok-text="tableText.yes"
      :cancel-text="tableText.no"
      @confirm="$emit('delete', record)"
    >
      <a>{{ tableText.delete }}</a>
    </a-popconfirm>
    <span v-if="!canWrite">{{ tableText.readonly }}</span>
  </a-space>
</template>

<script setup>
defineProps({
  record: { type: Object, required: true },
  actions: { type: Array, default: () => [] },
  tableText: { type: Object, required: true },
  canWrite: { type: Boolean, default: false },
  canInlineEdit: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  showInbound: { type: Boolean, default: false },
  inboundDone: { type: Boolean, default: false },
  showOutbound: { type: Boolean, default: false },
  canOutbound: { type: Boolean, default: false },
  canShowExtraAction: { type: Function, required: true },
});

defineEmits([
  'extra-action',
  'inline-edit',
  'save',
  'cancel',
  'edit',
  'delete',
  'inbound',
  'outbound',
]);

function getConfirmTitle(actionKey) {
  if (actionKey === 'approve') return '承認しますか？';
  if (actionKey === 'reject') return '却下しますか？';
  return '実行しますか？';
}
</script>
