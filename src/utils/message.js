import { readAllMessages, readMessage } from '../api/module';

export async function markMessageRead(messageId) {
  return readMessage(messageId);
}

export async function markAllMessagesRead() {
  return readAllMessages();
}

export function filterUnreadMessages(records) {
  const list = Array.isArray(records) ? records : [];
  return list.filter((item) => Number(item?.isRead || 0) === 0);
}

export function removeMessageById(records, messageId) {
  const list = Array.isArray(records) ? records : [];
  return list.filter((item) => Number(item?.id) !== Number(messageId));
}

export function markMessageListRead(records, messageId) {
  const list = Array.isArray(records) ? records : [];
  return list.map((item) => (
    Number(item?.id) === Number(messageId)
      ? { ...item, isRead: 1 }
      : item
  ));
}

export function markAllMessageListRead(records) {
  const list = Array.isArray(records) ? records : [];
  return list.map((item) => ({ ...item, isRead: 1 }));
}
