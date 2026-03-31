import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { getErrorMessage } from '@/services/http';
import { login } from '@/services/user';
import { t } from '@/utils/i18n';

export default () => {
  const handleSubmit = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      const res = await login(values);
      if (res.code === 200 && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.username || values.username);
        message.success(res.message || t('login.success'));
        window.location.href = window.location.pathname.endsWith('/user/login')
          ? window.location.pathname.replace(/\/user\/login$/, '/')
          : '/';
        return;
      }
      message.error(res.message || t('login.failed'));
    } catch (e) {
      message.error(getErrorMessage(e, t('login.exception')));
    }
  };

  return (
    <div style={{ marginTop: 120 }}>
      <LoginForm onFinish={handleSubmit}>
        <ProFormText
          name="username"
          placeholder={t('login.username')}
          rules={[{ required: true, message: t('login.requiredUsername') }]}
        />
        <ProFormText.Password
          name="password"
          placeholder={t('login.password')}
          rules={[{ required: true, message: t('login.requiredPassword') }]}
        />
      </LoginForm>
    </div>
  );
};
