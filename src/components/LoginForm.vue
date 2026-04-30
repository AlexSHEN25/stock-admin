<template>
  <div class="login-wrap">
    <a-card title="ログイン" class="login-card">
      <a-form layout="vertical">
        <a-form-item label="ユーザー名">
          <a-input v-model:value="form.username" autocomplete="username" />
        </a-form-item>
        <a-form-item label="パスワード">
          <a-input-password v-model:value="form.password" autocomplete="current-password" @pressEnter="submit" />
        </a-form-item>
        <a-button type="primary" :loading="loading" block @click="submit">ログイン</a-button>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { login } from '../api/auth';

const emit = defineEmits(['success']);
const loading = ref(false);
const form = reactive({ username: '', password: '' });

async function submit() {
  if (!form.username || !form.password) {
    message.warning('ユーザー名とパスワードを入力してください');
    return;
  }
  loading.value = true;
  try {
    const res = await login({ username: form.username, password: form.password });
    if (!res?.token) throw new Error('token が返却されませんでした');
    emit('success', res);
  } catch (error) {
    message.error(error.message || 'ログインに失敗しました');
  } finally {
    loading.value = false;
  }
}
</script>
