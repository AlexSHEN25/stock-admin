import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { login } from '@/services/user';

export default () => {
  const handleSubmit = async (values: any) => {
    try {
      const res = await login(values);

      if (res.code === 200) {
        const { token, username } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        message.success(res.message || '登录成功');

        window.location.href = '/';
      } else {
        message.error(res.message);
      }
    } catch (_e) {
      message.error('请求异常');
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
