import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import App from './App.vue';
import './styles.css';

function showFatalError(error) {
  const app = document.getElementById('app');
  if (!app) return;
  const message = String(error?.message || error || 'Unknown error');
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#111827;color:#fff;font-family:Arial,'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;padding:24px;">
      <div style="max-width:720px;width:100%;background:#1f2937;border:1px solid #374151;border-radius:8px;padding:20px;">
        <h1 style="font-size:20px;margin:0 0 12px;">画面表示中にエラーが発生しました</h1>
        <pre style="white-space:pre-wrap;word-break:break-word;margin:0;color:#fecaca;">${escapeHtml(message)}</pre>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const app = createApp(App);
app.config.errorHandler = (error) => {
  console.error(error);
  showFatalError(error);
};
window.addEventListener('unhandledrejection', (event) => {
  console.error(event.reason);
  showFatalError(event.reason);
});

app.use(Antd).mount('#app');

