<template>
  <div class="login-wrap">
    <a-card :title="i18n.login" class="login-card">
      <a-form layout="vertical">
        <a-form-item :label="i18n.username">
          <a-input v-model:value="form.username" autocomplete="username" />
        </a-form-item>
        <a-form-item :label="i18n.password">
          <a-input-password v-model:value="form.password" autocomplete="current-password" @pressEnter="submit" />
        </a-form-item>
        <a-button type="primary" :loading="loading" block @click="submit">{{ i18n.login }}</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { login } from '../api/auth';

const props = defineProps({
  currentLang: { type: String, default: 'ja-JP' },
});
const emit = defineEmits(['success']);
const loading = ref(false);
const form = reactive({ username: '', password: '' });
const i18n = computed(() => {
  const low = String(props.currentLang || '').toLowerCase();
  if (low.startsWith('zh')) return { login: '登录', username: '用户名', password: '密码', enterRequired: '请输入用户名和密码', tokenMissing: '未返回 token', loginFailed: '登录失败' };
  if (low.startsWith('en')) return { login: 'Login', username: 'Username', password: 'Password', enterRequired: 'Please enter username and password', tokenMissing: 'Token not returned', loginFailed: 'Login failed' };
  return { login: 'ログイン', username: 'ユーザー名', password: 'パスワード', enterRequired: 'ユーザー名とパスワードを入力してください', tokenMissing: 'token が返却されませんでした', loginFailed: 'ログインに失敗しました' };
});

async function submit() {
  if (!form.username || !form.password) {
    message.warning(i18n.value.enterRequired);
    return;
  }
  loading.value = true;
  try {
    const inputUsername = String(form.username || '').trim();
    const res = await login({ username: inputUsername, password: form.password });
    if (!res?.token) throw new Error(i18n.value.tokenMissing);
    emit('success', { ...res, loginInputUsername: inputUsername });
  } catch (error) {
    message.error(error.message || i18n.value.loginFailed);
  } finally {
    loading.value = false;
  }
}
</script>
