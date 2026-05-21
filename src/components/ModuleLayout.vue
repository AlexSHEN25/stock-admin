<template>
  <a-layout class="layout-root">
    <a-layout-sider
      v-if="hasMenus"
      width="280"
      class="left-sider"
    >
      <div class="logo">
        在庫管理
      </div>
      <a-menu
        class="left-menu"
        mode="inline"
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="onMenuClick"
        @open-change="(keys) => (openKeys = keys)"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="top-header">
        <div class="top-header-title">
          {{ activeLabel }}
        </div>
        <a-space
          class="top-header-tools"
          :size="12"
        >
          <a-popover
            trigger="click"
            placement="bottomRight"
            overlay-class-name="message-popover"
            @open-change="onMessagePopoverOpenChange"
          >
            <template #content>
              <div style="width: 340px; max-height: 420px; overflow: auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <strong>メッセージ</strong>
                  <a-button
                    type="link"
                    size="small"
                    @click="onReadAllInHeader"
                  >
                    全部既読
                  </a-button>
                </div>
                <a-empty
                  v-if="unreadMessages.length === 0"
                  description="未読メッセージはありません"
                />
                <a-list
                  v-else
                  size="small"
                  :data-source="unreadMessages"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <div style="width:100%;">
                        <div style="font-size:13px;line-height:1.5;word-break:break-all;">
                          {{ item.message || '-' }}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
                          <span style="font-size:12px;color:#999;">ID: {{ item.id }}</span>
                          <a-space :size="4">
                            <a-button
                              type="link"
                              size="small"
                              @click="onReadOneInHeader(item)"
                            >
                              既読
                            </a-button>
                            <a-button
                              type="link"
                              size="small"
                              @click="onJumpMessageSource(item)"
                            >
                              詳細
                            </a-button>
                          </a-space>
                        </div>
                      </div>
                    </a-list-item>
                  </template>
                </a-list>
              </div>
            </template>
            <a-badge
              :count="unreadCount"
              :overflow-count="99"
            >
              <a-button type="text">
                メッセージ
              </a-button>
            </a-badge>
          </a-popover>
          <a-switch
            :checked="darkMode"
            checked-children="夜"
            un-checked-children="昼"
            @change="(v) => $emit('toggle-theme', v)"
          />
          <div class="user-badge">
            <span class="user-badge-name">{{ currentUser || '-' }}</span>
          </div>
          <a-button
            type="link"
            @click="openPasswordModal"
          >
            パスワード変更
          </a-button>
          <a-button
            type="link"
            @click="$emit('logout')"
          >
            ログアウト
          </a-button>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content-wrap">
        <module-table
          :module-key="activeModule"
          :permission-codes="permissionCodes"
          :permission-ready="permissionReady"
          :current-user="currentUser"
          @navigate-module="onNavigateModule"
        />
      </a-layout-content>
    </a-layout>
  </a-layout>

  <a-modal
    :open="passwordModalOpen"
    title="パスワード変更"
    ok-text="保存"
    cancel-text="キャンセル"
    :confirm-loading="passwordSubmitting"
    @ok="submitPasswordChange"
    @cancel="closePasswordModal"
  >
    <a-form layout="vertical">
      <a-form-item
        label="新しいパスワード"
        required
      >
        <a-input-password v-model:value="passwordForm.password" />
      </a-form-item>
      <a-form-item
        label="新しいパスワード（確認）"
        required
      >
        <a-input-password v-model:value="passwordForm.confirmPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { changeMyPassword } from '../api/auth';
import { fetchPage, readAllMessages, readMessage } from '../api/module';
import { MODULE_GROUPS } from '../utils/module';
import ModuleTable from './ModuleTable.vue';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  menuCodes: { type: Array, default: () => [] },
  permissionCodes: { type: Array, default: () => [] },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
});

defineEmits(['logout', 'toggle-theme']);

const menuItems = ref([]);
const hasMenus = ref(false);
const HIDDEN_MODULES = ['stockOrderItem'];
const HIDDEN_MODULE_CONFIG = {
  stockOrderItem: { parent: 'stockOrder', label: '入出庫明細' },
};
const MODULE_PERMISSION_ALIASES = {
  goods: ['GOODS_MANAGEMENT', 'GOODS_BUNDLE'],
};
const firstModule = MODULE_GROUPS[0].children[0].key;
const activeModule = ref(firstModule);
const activeLabel = ref(findLabelByKey(firstModule));
const selectedKeys = ref([firstModule]);
const openKeys = ref([MODULE_GROUPS[0].key]);
const nodeMap = ref(new Map());
const allModules = MODULE_GROUPS.flatMap((g) => g.children.map((c) => c.key));
const allowedModules = ref(new Set([...allModules, ...HIDDEN_MODULES]));
const passwordModalOpen = ref(false);
const passwordSubmitting = ref(false);
const passwordForm = reactive({
  password: '',
  confirmPassword: '',
});
const unreadCount = ref(0);
const unreadMessages = ref([]);

watch(
  () => [props.menuCodes, props.permissionCodes, props.permissionReady],
  () => initMenus(),
  { immediate: true, deep: true },
);

watch(
  () => props.currentUser,
  async () => {
    if (!props.currentUser) return;
    await loadUnreadMessages(true);
  },
  { immediate: true },
);

function rebuildMap(items) {
  const map = new Map();
  walk(items, map);
  nodeMap.value = map;
}

function walk(items, map) {
  items.forEach((item) => {
    map.set(item.key, item);
    if (item.children?.length) walk(item.children, map);
  });
}

function normalizeModuleKey(key) {
  const val = String(key || '');
  const parts = val.split('/').filter(Boolean);
  if (parts.length === 0) return '';
  if (parts[parts.length - 1] === 'page' && parts.length > 1) {
    return parts[parts.length - 2];
  }
  return parts[parts.length - 1];
}

function onMenuClick({ key }) {
  const node = nodeMap.value.get(key);
  if (node?.children?.length) return;

  const moduleKey = normalizeModuleKey(key);
  if (!isValidModule(moduleKey)) return;

  activeModule.value = moduleKey;
  activeLabel.value = findLabelByKey(key);
  selectedKeys.value = [key];
}

function onNavigateModule(moduleKey) {
  const target = normalizeModuleKey(moduleKey);
  if (!isValidModule(target)) return;
  const hiddenConfig = HIDDEN_MODULE_CONFIG[target];
  const menuKey = hiddenConfig?.parent || target;
  activeModule.value = target;
  selectedKeys.value = [menuKey];
  activeLabel.value = findLabelByKey(target);
  const parent = MODULE_GROUPS.find((g) => g.children.some((c) => c.key === menuKey));
  if (parent) {
    openKeys.value = [parent.key];
  }
}

function isValidModule(moduleKey) {
  return Boolean(moduleKey) && allowedModules.value.has(moduleKey);
}

function findLabelByKey(key) {
  if (HIDDEN_MODULE_CONFIG[key]?.label) return HIDDEN_MODULE_CONFIG[key].label;
  for (const group of MODULE_GROUPS) {
    const hit = group.children.find((item) => item.key === key);
    if (hit) return hit.label;
  }
  return '';
}

function initMenus() {
  const allowed = buildAllowedModulesByCodes();
  const mergedAllowed = allowed.size > 0 ? allowed : new Set(allModules);
  HIDDEN_MODULES.forEach((m) => mergedAllowed.add(m));
  allowedModules.value = mergedAllowed;

  const filtered = MODULE_GROUPS.map((group) => ({
    ...group,
    children: group.children.filter((item) => allowedModules.value.has(item.key)),
  })).filter((group) => group.children.length > 0);

  menuItems.value = filtered.map((group) => ({
    key: group.key,
    label: group.label,
    children: group.children.map((item) => ({ key: item.key, label: item.label })),
  }));

  hasMenus.value = menuItems.value.length > 0;
  rebuildMap(menuItems.value);
  ensureActiveModule();
}

function ensureActiveModule() {
  const first = menuItems.value[0]?.children?.[0];
  if (!first) return;

  if (!allowedModules.value.has(activeModule.value)) {
    activeModule.value = first.key;
    selectedKeys.value = [first.key];
    activeLabel.value = first.label || findLabelByKey(first.key);
    openKeys.value = [menuItems.value[0].key];
    return;
  }

  activeLabel.value = findLabelByKey(selectedKeys.value[0] || activeModule.value);
}

function buildAllowedModulesByCodes() {
  if (!props.permissionReady) return new Set(allModules);

  const menuCodes = new Set((props.menuCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const permCodes = new Set((props.permissionCodes || []).map((x) => String(x || '').trim()).filter(Boolean));
  const allowed = new Set();

  allModules.forEach((moduleKey) => {
    const aliases = MODULE_PERMISSION_ALIASES[moduleKey] || [moduleToUpperSnake(moduleKey)];
    const hasMenu = aliases.some((x) => menuCodes.has(`MENU_${x}`));
    const hasData = aliases.some((x) => permCodes.has(`DATA_${x}_READ`) || permCodes.has(`DATA_${x}_WRITE`));
    if (hasMenu && hasData) allowed.add(moduleKey);
  });

  return allowed;
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function openPasswordModal() {
  passwordForm.password = '';
  passwordForm.confirmPassword = '';
  passwordModalOpen.value = true;
}

function closePasswordModal() {
  passwordModalOpen.value = false;
}

async function submitPasswordChange() {
  const p1 = String(passwordForm.password || '');
  const p2 = String(passwordForm.confirmPassword || '');
  if (!p1) {
    message.warning('新しいパスワードを入力してください');
    return;
  }
  if (p1 !== p2) {
    message.warning('確認用パスワードが一致しません');
    return;
  }
  passwordSubmitting.value = true;
  try {
    await changeMyPassword(props.currentUser, p1);
    message.success('パスワードを更新しました');
    closePasswordModal();
  } catch (error) {
    message.error(error?.message || 'パスワード更新に失敗しました');
  } finally {
    passwordSubmitting.value = false;
  }
}

async function loadUnreadMessages(withList = false) {
  try {
    const pageSize = withList ? 20 : 1;
    const page = await fetchPage('message', {
      pageNum: 1,
      pageSize,
      isRead: 0,
      sortBy: 'updateTime',
      sortOrder: 'desc',
    });
    unreadCount.value = Number(page?.total || 0);
    unreadMessages.value = withList ? (page?.records || []) : unreadMessages.value;
  } catch {
    // ignore header polling errors
  }
}

async function onMessagePopoverOpenChange(open) {
  if (open) {
    await loadUnreadMessages(true);
    return;
  }
  await loadUnreadMessages(false);
}

async function onReadOneInHeader(item) {
  const id = item?.id;
  if (!id) return;
  try {
    await readMessage(id);
    unreadMessages.value = unreadMessages.value.filter((x) => Number(x?.id) !== Number(id));
    unreadCount.value = Math.max(0, Number(unreadCount.value || 0) - 1);
    await loadUnreadMessages(true);
  } catch (error) {
    message.error(error?.message || '既読更新に失敗しました');
  }
}

async function onReadAllInHeader() {
  try {
    await readAllMessages();
    unreadMessages.value = [];
    unreadCount.value = 0;
    await loadUnreadMessages(true);
  } catch (error) {
    message.error(error?.message || '既読更新に失敗しました');
  }
}

async function onJumpMessageSource(item) {
  const sourceId = Number(item?.sourceId || 0);
  if (!sourceId) {
    message.warning('参照先IDがありません');
    return;
  }
  try {
    if (item?.id) {
      await readMessage(item.id);
      unreadMessages.value = unreadMessages.value.filter((x) => Number(x?.id) !== Number(item.id));
      unreadCount.value = Math.max(0, Number(unreadCount.value || 0) - 1);
    }
  } catch {
    // ignore read failure before navigation
  }

  if (Number(item?.type) === 1) {
    sessionStorage.setItem('jump_stock_order_id', String(sourceId));
    onNavigateModule('stockOrderItem');
  } else {
    sessionStorage.setItem('jump_stock_id', String(sourceId));
    onNavigateModule('stockRecord');
  }
  await loadUnreadMessages(true);
}
</script>
