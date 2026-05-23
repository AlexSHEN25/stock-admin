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
      :permission-ready="permissionReady"
      :current-user="currentUser"
      @toggle-theme="onToggleTheme"
      @logout="onLogout"
    />
  </a-config-provider>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { message, theme } from 'ant-design-vue';
import { fetchPermissionScope, logout } from './api/auth';
import { TOKEN_KEY } from './api/http';
import LoginForm from './components/LoginForm.vue';
import ModuleLayout from './components/ModuleLayout.vue';
import { MODULE_GROUPS } from './utils/module';
import { MODULE_LAYOUT_CONFIG } from './utils/module-ui';

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

const token = ref(localStorage.getItem(TOKEN_KEY));
const darkMode = ref(localStorage.getItem(THEME_KEY) === '1');
const currentUser = ref(localStorage.getItem(USERNAME_KEY) || '');
const menuCodes = ref([]);
const permissionCodes = ref([]);
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
  localStorage.removeItem(USERNAME_KEY);
  menuCodes.value = [];
  permissionCodes.value = [];
  permissionReady.value = false;
  message.warning(APP_MESSAGES.authExpired);
}

function onLoginSuccess(payload) {
  localStorage.setItem(TOKEN_KEY, payload.token);

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

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  token.value = null;
  currentUser.value = '';
  menuCodes.value = [];
  permissionCodes.value = [];
  permissionReady.value = false;
}

async function loadPermissions() {
  try {
    const scope = await withTimeout(fetchPermissionScope(), PERMISSION_TIMEOUT_MS);
    menuCodes.value = scope.menuCodes || [];
    permissionCodes.value = scope.permissionCodes || [];
    permissionReady.value = true;
    logPermissionMapping(menuCodes.value, permissionCodes.value);
  } catch (error) {
    menuCodes.value = [];
    permissionCodes.value = [];
    permissionReady.value = false;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    token.value = null;
    currentUser.value = '';
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

function logPermissionMapping(menuCodeList, permissionCodeList) {
  const menuSet = new Set((menuCodeList || []).map((item) => String(item || '').trim()).filter(Boolean));
  const permSet = new Set((permissionCodeList || []).map((item) => String(item || '').trim()).filter(Boolean));
  const aliasesByModule = MODULE_LAYOUT_CONFIG.permissionAliases || {};
  const moduleKeys = MODULE_GROUPS.flatMap((group) => group.children.map((child) => child.key));

  const rows = moduleKeys.map((moduleKey) => {
    const aliases = aliasesByModule[moduleKey] || [moduleToUpperSnake(moduleKey)];
    const menuHits = aliases
      .map((alias) => `MENU_${alias}`)
      .filter((code) => menuSet.has(code));
    const permHits = aliases.flatMap((alias) => {
      const read = `DATA_${alias}_READ`;
      const write = `DATA_${alias}_WRITE`;
      return [read, write].filter((code) => permSet.has(code));
    });
    return {
      moduleKey,
      aliases: aliases.join(','),
      menuHits: menuHits.join(','),
      permHits: permHits.join(','),
      visible: menuSet.size > 0 ? (menuHits.length > 0 && permHits.length > 0) : permHits.length > 0,
    };
  });

  const hitCodes = new Set(rows.flatMap((row) => row.permHits ? row.permHits.split(',').filter(Boolean) : []));
  const unmatchedPermCodes = [...permSet].filter((code) => !hitCodes.has(code));

  console.groupCollapsed('[Permission Mapping]');
  console.table(rows);
  if (unmatchedPermCodes.length > 0) {
    console.log('[Unmatched Permission Codes]', unmatchedPermCodes);
  } else {
    console.log('[Unmatched Permission Codes] none');
  }
  console.groupEnd();
}

function moduleToUpperSnake(moduleKey) {
  return String(moduleKey || '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toUpperCase();
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
