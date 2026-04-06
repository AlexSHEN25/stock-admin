import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { getErrorMessage } from '@/services/http';
import { login } from '@/services/user';
import { t } from '@/utils/i18n';

type LoginFormValues = {
  username: string;
  password: string;
};

const LOGIN_ROUTE = '/user/login';

const resolveBasePrefix = () => {
  const index = window.location.pathname.indexOf(LOGIN_ROUTE);
  if (index >= 0) {
    return window.location.pathname.slice(0, index);
  }
  return '';
};

export default () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <LoginForm<LoginFormValues>
        logo={false}
        title={t('app.title')}
        submitter={{
          searchConfig: {
            submitText: t('login.submit'),
          },
        }}
        onFinish={async (values) => {
          try {
            const res = await login(values);
            const token = res?.data?.token;
            const username = res?.data?.username || values.username;

            if (!token) {
              message.error(t('login.failed'));
              return false;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            message.success(t('login.success'));
            const basePrefix = resolveBasePrefix();
            window.location.href = `${basePrefix}/`;
            return true;
          } catch (error) {
            message.error(getErrorMessage(error));
            return false;
          }
        }}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder={t('login.username')}
          rules={[
            {
              required: true,
              message: t('login.requiredUsername'),
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder={t('login.password')}
          rules={[
            {
              required: true,
              message: t('login.requiredPassword'),
            },
          ]}
        />
      </LoginForm>
    </div>
  );
};
