import { ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { fetchPage } from '../api/module';
import { filterUnreadMessages, markAllMessagesRead, markMessageRead, removeMessageById } from '../utils/message';
import TABLE_TEXT, { HEADER_UI, MODULE_LAYOUT_CONFIG } from '../utils/module-ui';

const HEADER_MESSAGE_SOURCE_NAVIGATIONS = MODULE_LAYOUT_CONFIG.headerMessageSourceNavigations || {};

export function useHeaderMessages(options) {
  const {
    currentUser,
    navigateModule,
  } = options;

  const unreadCount = ref(0);
  const unreadMessages = ref([]);

  watch(
    () => currentUser?.value,
    async (username) => {
      if (!username) return;
      await loadUnreadMessages(true);
    },
    { immediate: true },
  );

  async function fetchUnreadMessagePage(pageSize) {
    return fetchPage('message', {
      pageNum: 1,
      pageSize,
      isRead: 0,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
  }

  async function loadUnreadMessages(withList = false) {
    try {
      const page = await fetchUnreadMessagePage(withList ? 20 : 1);
      const unreadOnly = filterUnreadMessages(page?.records || []);
      unreadCount.value = withList ? unreadOnly.length : Number(page?.total || 0);
      if (withList) {
        unreadMessages.value = unreadOnly;
      }
    } catch {
      // ignore header polling errors
    }
  }

  async function onMessagePopoverOpenChange(open) {
    if (open) {
      await loadUnreadMessages(true);
    }
  }

  async function onReadOneInHeader(item) {
    const id = item?.id;
    if (!id) return;

    try {
      await markMessageRead(id);
      unreadMessages.value = removeMessageById(unreadMessages.value, id);
      unreadCount.value = Math.max(0, Number(unreadCount.value || 0) - 1);
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.readUpdateFail);
    }
  }

  async function onReadAllInHeader() {
    try {
      await markAllMessagesRead();
      unreadMessages.value = [];
      unreadCount.value = 0;
    } catch (error) {
      message.error(error?.message || TABLE_TEXT.readUpdateFail);
    }
  }

  async function onJumpMessageSource(item) {
    const sourceId = Number(item?.sourceId || 0);
    if (!sourceId) {
      message.warning(HEADER_UI.messageSourceMissing);
      return;
    }

    try {
      if (item?.id) {
        await markMessageRead(item.id);
        unreadMessages.value = removeMessageById(unreadMessages.value, item.id);
        unreadCount.value = Math.max(0, Number(unreadCount.value || 0) - 1);
      }
    } catch {
      // ignore read failure before navigation
    }

    const navigation = HEADER_MESSAGE_SOURCE_NAVIGATIONS[String(Number(item?.type || 0))] || HEADER_MESSAGE_SOURCE_NAVIGATIONS.default;
    if (!navigation) return;

    sessionStorage.setItem(navigation.storageKey, String(sourceId));
    navigateModule(navigation.targetModule);
  }

  return {
    unreadCount,
    unreadMessages,
    loadUnreadMessages,
    onMessagePopoverOpenChange,
    onReadOneInHeader,
    onReadAllInHeader,
    onJumpMessageSource,
  };
}
