<template>
  <a-config-provider :theme="themeConfig">
    <login-form
      v-if="!token"
      @success="onLoginSuccess"
    />
    <div
      v-else-if="!permissionReady"
      class="app-loading-wrap"
    >
      <a-spin size="large" />
      <div class="app-loading-text">
        {{ APP_MESSAGES.permissionLoading }}
      </div>
    </div>
    <module-layout
      v-else
      :dark-mode="darkMode"
      :menu-codes="menuCodes"
      :permission-codes="permissionCodes"
      :menu-scopes="menuScopes"
      :all-data-write="allDataWrite"
      :permission-ready="permissionReady"
      :current-user="currentUser"
      :current-user-id="currentUserId"
      :current-dept-id="currentDeptId"
      :current-dept-name="currentDeptName"
      :current-group-code="currentGroupCode"
      @toggle-theme="onToggleTheme"
      @logout="onLogout"
    />
  </a-config-provider>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { message, theme } from 'ant-design-vue';
import { fetchPermissionScope, logout } from './api/auth';
import { clearAuthToken, getStoredToken, saveAuthToken } from './api/http';
import LoginForm from './components/LoginForm.vue';
import ModuleLayout from './components/ModuleLayout.vue';
import { isAdminByPermissionCodes } from './utils/module-ui';

const THEME_KEY = 'stock_admin_theme_dark';
const USERNAME_KEY = 'stock_admin_username';
const PERMISSION_TIMEOUT_MS = 8000;
const APP_MESSAGES = {
  authExpired: 'ログインの有効期限が切れました',
  permissionLoading: '権限情報を読み込み中です',
  permissionLoadFail: '権限情報の取得に失敗しました。再ログインしてください',
  permissionLoadTimeout: '権限情報の読み込みがタイムアウトしました。再ログインしてください',
  loginSuccess: 'ログインしました',
};

const token = ref(getStoredToken());
const darkMode = ref(localStorage.getItem(THEME_KEY) === '1');
const currentUser = ref(localStorage.getItem(USERNAME_KEY) || '');
const currentUserId = ref(null);
const currentDeptId = ref(null);
const currentDeptName = ref('');
const currentGroupCode = ref('');
const menuCodes = ref([]);
const permissionCodes = ref([]);
const menuScopes = ref([]);
const allDataWrite = ref(false);
const permissionReady = ref(false);

const themeConfig = computed(() => ({
  algorithm: darkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));

onMounted(() => {
  window.addEventListener('auth-expired', handleAuthExpired);
  applyThemeMode();
  if (token.value) loadPermissions();
});

onBeforeUnmount(() => {
  window.removeEventListener('auth-expired', handleAuthExpired);
});

function handleAuthExpired() {
  token.value = null;
  currentUser.value = '';
  currentUserId.value = null;
  currentDeptId.value = null;
  currentDeptName.value = '';
  currentGroupCode.value = '';
  clearAuthToken();
  localStorage.removeItem(USERNAME_KEY);
  menuCodes.value = [];
  permissionCodes.value = [];
  menuScopes.value = [];
  allDataWrite.value = false;
  permissionReady.value = false;
  message.warning(APP_MESSAGES.authExpired);
}

function onLoginSuccess(payload) {
  saveAuthToken(payload.token);

  const displayName = String(
    payload?.username
      || payload?.userName
      || payload?.nickname
      || payload?.nickName
      || payload?.loginName
      || payload?.account
      || payload?.loginInputUsername
      || '',
  ).trim();

  if (displayName) {
    currentUser.value = displayName;
    localStorage.setItem(USERNAME_KEY, displayName);
  }

  token.value = payload.token;
  permissionReady.value = false;
  loadPermissions();
  message.success(APP_MESSAGES.loginSuccess);
}

function onToggleTheme(next) {
  darkMode.value = Boolean(next);
  localStorage.setItem(THEME_KEY, darkMode.value ? '1' : '0');
  applyThemeMode();
}

function applyThemeMode() {
  document.documentElement.setAttribute('data-theme-mode', darkMode.value ? 'dark' : 'light');
}

async function onLogout() {
  try {
    await logout();
  } catch {
    // noop
  }

  clearAuthToken();
  localStorage.removeItem(USERNAME_KEY);
  token.value = null;
  currentUser.value = '';
  currentDeptId.value = null;
  currentDeptName.value = '';
  currentGroupCode.value = '';
  menuCodes.value = [];
  permissionCodes.value = [];
  menuScopes.value = [];
  allDataWrite.value = false;
  permissionReady.value = false;
}

async function loadPermissions() {
  try {
    const scope = await withTimeout(fetchPermissionScope(), PERMISSION_TIMEOUT_MS);
    menuCodes.value = scope.menuCodes || [];
    permissionCodes.value = scope.permissionCodes || [];
    menuScopes.value = scope.menus || [];
    currentDeptId.value = scope.deptId || null;
    currentDeptName.value = scope.deptName || '';
    currentGroupCode.value = scope.groupCode || '';
    currentUserId.value = scope.userId || null;
    allDataWrite.value = Boolean(
      scope.allDataWrite
      || scope.superAdmin
      || scope.isAdmin
      || isAdminByPermissionCodes([
        ...(scope.permissionCodes || []),
        ...(scope.roleCodes || []),
        ...(scope.menuCodes || []),
      ])
    );
    permissionReady.value = true;
  } catch (error) {
    menuCodes.value = [];
    permissionCodes.value = [];
    menuScopes.value = [];
    allDataWrite.value = false;
    permissionReady.value = false;
    clearAuthToken();
    localStorage.removeItem(USERNAME_KEY);
    token.value = null;
    currentUser.value = '';
    currentUserId.value = null;
    currentDeptId.value = null;
    currentDeptName.value = '';
    currentGroupCode.value = '';
    const isTimeout = String(error?.message || '') === 'PERMISSION_TIMEOUT';
    message.warning(isTimeout ? APP_MESSAGES.permissionLoadTimeout : APP_MESSAGES.permissionLoadFail);
  }
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('PERMISSION_TIMEOUT'));
    }, timeoutMs);

    Promise.resolve(promise)
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
</script>

<style scoped>
.app-loading-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.app-loading-text {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
}

:global(html[data-theme-mode='dark']) .app-loading-text {
  color: rgba(255, 255, 255, 0.82);
}
</style>
