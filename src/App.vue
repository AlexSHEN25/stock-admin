<template>
  <a-config-provider :theme="themeConfig">
    <login-form v-if="!token" :currentLang="currentLang" @success="onLoginSuccess" />
    <module-layout
      v-else
      :darkMode="darkMode"
      :menuCodes="menuCodes"
      :permissionCodes="permissionCodes"
      :permissionReady="permissionReady"
      :currentLang="currentLang"
      :currentUser="currentUser"
      @toggle-theme="onToggleTheme"
      @change-lang="onChangeLang"
      @logout="onLogout"
    />
  </a-config-provider>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { message, theme } from 'ant-design-vue';
import { fetchPermissionScope, logout, probeI18n } from './api/auth';
import { LANG_KEY, TOKEN_KEY } from './api/http';
import LoginForm from './components/LoginForm.vue';
import ModuleLayout from './components/ModuleLayout.vue';

const THEME_KEY = 'stock_admin_theme_dark';
const USERNAME_KEY = 'stock_admin_username';
const token = ref(localStorage.getItem(TOKEN_KEY));
const darkMode = ref(localStorage.getItem(THEME_KEY) === '1');
const currentLang = ref(localStorage.getItem(LANG_KEY) || 'ja-JP');
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
  message.warning('ログイン有効期限が切れました');
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
    void checkI18nProbe();
  } catch {
    menuCodes.value = [];
    permissionCodes.value = [];
    permissionReady.value = false;
  }
}

async function checkI18nProbe() {
  try {
    const res = await probeI18n();
    if (!res.ok || !res.localeMatched) {
      console.warn('[i18n-probe] locale may not be fully applied', res);
    }
  } catch (error) {
    console.warn('[i18n-probe] request failed', error);
  }
}

function onChangeLang(nextLang) {
  const value = String(nextLang || '').trim();
  if (!value) return;
  currentLang.value = value;
  localStorage.setItem(LANG_KEY, value);
  void checkI18nProbe();
}
</script>
