import {
  BellOutlined,
  BulbOutlined,
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Badge, Dropdown, Space, Tooltip, Typography } from 'antd';
import { logout } from '@/services/user';
import { t } from '@/utils/i18n';
import { getCurrentTheme, toggleCurrentTheme } from '@/utils/theme';
import LocaleSwitcher from '../LocaleSwitcher';

const { Text } = Typography;

const LOGIN_ROUTE = '/user/login';

const ContentTopBar = () => {
  const username = localStorage.getItem('username') || '用户';
  const currentTheme = getCurrentTheme();

  const onLogout = async () => {
    try {
      await logout();
    } catch (_e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = LOGIN_ROUTE;
  };

  const userItems: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <div className="content-top-bar">
      <Space size={16} align="center">
        <LocaleSwitcher />
        <Tooltip
          title={
            currentTheme === 'dark'
              ? t('right.theme.light')
              : t('right.theme.dark')
          }
        >
          <BulbOutlined
            className="top-action-icon"
            onClick={() => {
              toggleCurrentTheme();
              window.location.reload();
            }}
          />
        </Tooltip>
        <Badge dot>
          <BellOutlined className="top-action-icon" />
        </Badge>
        <Dropdown
          menu={{
            items: userItems,
            onClick: async ({ key }) => {
              if (key === 'logout') {
                await onLogout();
              }
            },
          }}
          trigger={['click']}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space size={4}>
              <UserOutlined />
              <Text>{username}</Text>
              <DownOutlined style={{ fontSize: 12 }} />
            </Space>
          </a>
        </Dropdown>
      </Space>
    </div>
  );
};

export default ContentTopBar;
