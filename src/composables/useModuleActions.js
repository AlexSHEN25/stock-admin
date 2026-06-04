import { message } from 'ant-design-vue';
import { reapplyRequestInbound } from '../api/module';
import { TABLE_TEXT } from '../utils/module-ui';

export function useModuleActions(options) {
  const {
    moduleKey,
    canWrite,
    rows,
    emit,
    detailNavigations,
    downloadRequestFormFile,
    downloadRequestFormPdf,
    markMessageRead,
    markAllMessagesRead,
    markMessageListRead,
    markAllMessageListRead,
    getRecordId,
    reload,
  } = options;

  function goDetailModule(record) {
    const navigation = detailNavigations[moduleKey.value];
    if (!navigation) return;
    const id = getRecordId(record);
    if (!id) return;
    sessionStorage.setItem(navigation.storageKey, String(id));
    emit('navigate-module', navigation.targetModule);
  }

  async function handleRowExtraAction(actionKey, record) {
    if (actionKey === 'detail') {
      goDetailModule(record);
      return;
    }
    if (actionKey === 'download') {
      await downloadRequestForm(record);
      return;
    }
    if (actionKey === 'pdf') {
      await downloadRequestFormAsPdf(record);
      return;
    }
    if (actionKey === 'reapplyInbound') {
      await onReapplyInbound(record);
      return;
    }
    if (actionKey === 'read') {
      if (!canWrite?.value) return;
      await onReadMessage(record);
    }
  }

  function canShowRowExtraAction(actionKey, record) {
    if (actionKey === 'reapplyInbound') {
      return Boolean(canWrite?.value) && moduleKey.value === 'requestForm' && Number(record?.state) !== 2;
    }
    if (actionKey !== 'read') return true;
    return Boolean(canWrite?.value) && moduleKey.value === 'message' && Number(record?.isRead) !== 1;
  }

  async function onReapplyInbound(record) {
    if (!canWrite?.value) return;
    const id = getRecordId(record);
    if (!id) return;
    try {
      await reapplyRequestInbound(id);
      message.success(TABLE_TEXT.reapplyInboundSuccess);
      if (typeof reload === 'function') {
        await reload();
      }
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.reapplyInboundFail);
    }
  }

  async function onReadMessage(record) {
    if (!canWrite?.value) return;
    const id = getRecordId(record);
    if (!id) return;
    try {
      await markMessageRead(id);
      rows.value = markMessageListRead(rows.value, id);
      message.success(TABLE_TEXT.read);
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.readUpdateFail);
    }
  }

  async function onReadAllMessages() {
    if (!canWrite?.value) return;
    try {
      await markAllMessagesRead();
      rows.value = markAllMessageListRead(rows.value);
      message.success(TABLE_TEXT.readAll);
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.readUpdateFail);
    }
  }

  async function downloadRequestForm(record) {
    const id = getRecordId(record);
    if (!id) return;
    try {
      await downloadRequestFormFile(id, TABLE_TEXT.downloadFail);
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.downloadFail);
    }
  }

  async function downloadRequestFormAsPdf(record) {
    const id = getRecordId(record);
    if (!id) return;
    try {
      await downloadRequestFormPdf(id, TABLE_TEXT.downloadFail);
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.downloadFail);
    }
  }

  return {
    goDetailModule,
    handleRowExtraAction,
    canShowRowExtraAction,
    onReadMessage,
    onReadAllMessages,
    onReapplyInbound,
    downloadRequestForm,
    downloadRequestFormAsPdf,
  };
}
