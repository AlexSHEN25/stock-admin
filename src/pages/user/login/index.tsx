import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { getErrorMessage } from '@/services/http';
import { login } from '@/services/user';

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
        message.success(res.message || '登录成功');
        window.location.href = '/';
        return;
      }
      message.error(res.message || '登录失败');
    } catch (e) {
      message.error(getErrorMessage(e, '请求异常'));
    }
  };

  return (
    <div style={{ marginTop: 120 }}>
      <LoginForm onFinish={handleSubmit}>
        <ProFormText
          name="username"
          placeholder="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        />
        <ProFormText.Password
          name="password"
          placeholder="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        />
      </LoginForm>
    </div>
  );
};
