<template>
  <a-config-provider :theme="themeConfig">
    <login-form v-if="!token" @success="onLoginSuccess" />
    <module-layout v-else :darkMode="darkMode" @toggle-theme="onToggleTheme" @logout="onLogout" />
  </a-config-provider>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { message, theme } from 'ant-design-vue';
import { logout } from './api/auth';
import { TOKEN_KEY } from './api/http';
import LoginForm from './components/LoginForm.vue';
import ModuleLayout from './components/ModuleLayout.vue';

const THEME_KEY = 'stock_admin_theme_dark';
const token = ref(localStorage.getItem(TOKEN_KEY));
const darkMode = ref(localStorage.getItem(THEME_KEY) === '1');
const themeConfig = computed(() => ({
  algorithm: darkMode.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
}));

onMounted(() => {
  window.addEventListener('auth-expired', handleAuthExpired);
  applyThemeMode();
});

onBeforeUnmount(() => {
  window.removeEventListener('auth-expired', handleAuthExpired);
});

function handleAuthExpired() {
  token.value = null;
  message.warning('ログイン有効期限が切れました');
}

function onLoginSuccess(payload) {
  localStorage.setItem(TOKEN_KEY, payload.token);
  token.value = payload.token;
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
  token.value = null;
}
</script>
