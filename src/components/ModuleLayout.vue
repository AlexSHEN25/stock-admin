<template>
  <a-layout class="layout-root">
    <a-layout-sider
      width="280"
      class="left-sider"
    >
      <div class="logo">
        {{ HEADER_UI.appTitle }}
      </div>
      <a-menu
        v-if="menuItems.length > 0"
        class="left-menu"
        mode="inline"
        :items="menuItems"
        :selected-keys="selectedKeys"
        :open-keys="openKeys"
        @click="onMenuClick"
        @open-change="onOpenChange"
      />
      <a-empty
        v-else
        :description="HEADER_UI.noMenuHint"
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
                  <strong>{{ HEADER_UI.messageTitle }}</strong>
                  <a-button
                    type="link"
                    size="small"
                    @click="onReadAllInHeader"
                  >
                    {{ HEADER_UI.readAll }}
                  </a-button>
                </div>
                <a-empty
                  v-if="unreadMessages.length === 0"
                  :description="HEADER_UI.messageEmpty"
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
                              {{ HEADER_UI.read }}
                            </a-button>
                            <a-button
                              type="link"
                              size="small"
                              @click="onJumpMessageSource(item)"
                            >
                              {{ HEADER_UI.detail }}
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
                {{ HEADER_UI.messageTitle }}
              </a-button>
            </a-badge>
          </a-popover>
          <a-switch
            :checked="darkMode"
            :checked-children="HEADER_UI.darkModeOn"
            :un-checked-children="HEADER_UI.darkModeOff"
            @change="(v) => $emit('toggle-theme', v)"
          />
          <div class="user-badge">
            <span class="user-badge-name">{{ currentUser || '-' }}</span>
          </div>
          <a-button
            type="link"
            @click="openPasswordModal"
          >
            {{ HEADER_UI.changePassword }}
          </a-button>
          <a-popconfirm
            :title="HEADER_UI.logoutConfirm || 'ログアウトしますか？'"
            :ok-text="HEADER_UI.yes || 'はい'"
            :cancel-text="HEADER_UI.cancel"
            @confirm="$emit('logout')"
          >
            <a-button type="link">
              {{ HEADER_UI.logout }}
            </a-button>
          </a-popconfirm>
        </a-space>
      </a-layout-header>
      <a-layout-content class="content-wrap">
        <brand-tree-manager
          v-if="hasMenus && activeModule === 'brand'"
          :module-actions="activeModuleActions"
        />
        <module-table
          v-else-if="hasMenus && activeModule"
          :module-key="activeModule"
          :permission-codes="permissionCodes"
          :module-actions="activeModuleActions"
          :all-data-write="allDataWrite"
          :permission-ready="permissionReady"
          :current-user="currentUser"
          :current-user-id="currentUserId"
          :current-dept-id="currentDeptId"
          :current-dept-name="currentDeptName"
          :current-group-code="currentGroupCode"
          :fixed-query-params="activeModuleContext.fixedQueryParams || {}"
          @navigate-module="onNavigateModule"
        />
        <a-empty
          v-else
          :description="HEADER_UI.noMenuHint"
        >
          <template #image>
            <div style="font-size: 16px; color: rgba(0, 0, 0, 0.65);">
              {{ HEADER_UI.noMenuTitle }}
            </div>
          </template>
        </a-empty>
      </a-layout-content>
    </a-layout>
  </a-layout>

  <a-modal
    :open="passwordModalOpen"
    :title="HEADER_UI.changePassword"
    :ok-text="HEADER_UI.save"
    :cancel-text="HEADER_UI.cancel"
    :confirm-loading="passwordSubmitting"
    @ok="submitPasswordChange"
    @cancel="closePasswordModal"
  >
    <a-form layout="vertical">
      <a-form-item
        :label="HEADER_UI.newPassword"
        required
      >
        <a-input-password v-model:value="passwordForm.password" />
      </a-form-item>
      <a-form-item
        :label="HEADER_UI.confirmPassword"
        required
      >
        <a-input-password v-model:value="passwordForm.confirmPassword" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { computed, toRef } from 'vue';
import { useHeaderMessages } from '../composables/useHeaderMessages';
import { useModuleMenu } from '../composables/useModuleMenu';
import { usePasswordChange } from '../composables/usePasswordChange';
import { HEADER_UI } from '../utils/module-ui';
import BrandTreeManager from './BrandTreeManager.vue';
import ModuleTable from './ModuleTable.vue';

const props = defineProps({
  darkMode: { type: Boolean, default: false },
  menuCodes: { type: Array, default: () => [] },
  permissionCodes: { type: Array, default: () => [] },
  menuScopes: { type: Array, default: () => [] },
  allDataWrite: { type: Boolean, default: false },
  permissionReady: { type: Boolean, default: false },
  currentUser: { type: String, default: '' },
  currentUserId: { type: Number, default: null },
  currentDeptId: { type: Number, default: null },
  currentDeptName: { type: String, default: '' },
  currentGroupCode: { type: String, default: '' },
});

defineEmits(['logout', 'toggle-theme']);

const {
  menuItems,
  hasMenus,
  activeModule,
  activeModuleContext,
  activeLabel,
  selectedKeys,
  openKeys,
  onMenuClick,
  onNavigateModule,
} = useModuleMenu({
  menuCodes: toRef(props, 'menuCodes'),
  permissionCodes: toRef(props, 'permissionCodes'),
  menuScopes: toRef(props, 'menuScopes'),
  permissionReady: toRef(props, 'permissionReady'),
  allDataWrite: toRef(props, 'allDataWrite'),
  currentGroupCode: toRef(props, 'currentGroupCode'),
  currentUserId: toRef(props, 'currentUserId'),
});

const activeModuleActions = computed(() => {
  const scope = (props.menuScopes || []).find((item) => item?.key === activeModule.value);
  return scope?.actions || {
    read: false,
    create: false,
    edit: false,
    delete: false,
    batchDelete: false,
    inlineEdit: false,
  };
});

const {
  unreadCount,
  unreadMessages,
  onMessagePopoverOpenChange,
  onReadOneInHeader,
  onReadAllInHeader,
  onJumpMessageSource,
} = useHeaderMessages({
  currentUser: toRef(props, 'currentUser'),
  navigateModule: onNavigateModule,
});

const {
  passwordModalOpen,
  passwordSubmitting,
  passwordForm,
  openPasswordModal,
  closePasswordModal,
  submitPasswordChange,
} = usePasswordChange({
  currentUser: toRef(props, 'currentUser'),
});

function onOpenChange(keys) {
  openKeys.value = keys;
}
</script>
