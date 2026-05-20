<template>
  <a-config-provider :theme="themeConfig">
    <login-form
      v-if="!token"
      @success="onLoginSuccess"
    />
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
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue';
import { message, theme } from 'ant-design-vue';
import { fetchPermissionScope, logout } from './api/auth';
import { TOKEN_KEY } from './api/http';

const LoginForm = defineAsyncComponent(() => import('./components/LoginForm.vue'));
const ModuleLayout = defineAsyncComponent(() => import('./components/ModuleLayout.vue'));

const THEME_KEY = 'stock_admin_theme_dark';
const USERNAME_KEY = 'stock_admin_username';

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
  message.warning('ログインの有効期限が切れました');
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
  loadPermissions();
  message.success('ログインしました');
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
    const scope = await fetchPermissionScope();
    menuCodes.value = scope.menuCodes || [];
    permissionCodes.value = scope.permissionCodes || [];
    permissionReady.value = true;
  } catch {
    menuCodes.value = [];
    permissionCodes.value = [];
    permissionReady.value = false;
  }
}
</script>
