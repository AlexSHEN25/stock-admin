import { message } from 'antd';
import ContentTopBar from '@/components/ContentTopBar';
import type { ApiResult } from '@/services/http';
import { t } from '@/utils/i18n';
import { initTheme } from '@/utils/theme';

const LOGIN_ROUTE = '/user/login';
const isLoginPage = () => window.location.pathname.endsWith(LOGIN_ROUTE);
const resolveBasePrefix = () => {
  const loginIndex = window.location.pathname.indexOf(LOGIN_ROUTE);
  if (loginIndex >= 0) {
    return window.location.pathname.slice(0, loginIndex);
  }
  return window.location.pathname.startsWith('/stock/') ? '/stock' : '';
};
const redirectToLogin = () => {
  const basePrefix = resolveBasePrefix();
  window.location.href = `${basePrefix}${LOGIN_ROUTE}`;
};

const MANAGE_MENU_GROUPS = [
  {
    path: '/manage/goods',
    name: '商品管理',
    children: [
      { path: '/manage/goods', name: '商品管理' },
      { path: '/manage/brand', name: '品牌管理' },
      { path: '/manage/series', name: '系列管理' },
      { path: '/manage/maker', name: '产地管理' },
      { path: '/manage/goodsType', name: '商品类型' },
    ],
  },
  {
    path: '/manage/stock',
    name: '库存管理',
    children: [
      { path: '/manage/stock', name: '库存管理' },
      { path: '/manage/stockOrder', name: '出入库单' },
      { path: '/manage/stockOrderItem', name: '出入库明细' },
      { path: '/manage/stockRecord', name: '库存流水' },
      { path: '/manage/priceRecord', name: '价格记录' },
      { path: '/manage/warehouse', name: '仓库管理' },
    ],
  },
  {
    path: '/manage/customer',
    name: '客户管理',
    children: [
      { path: '/manage/customer', name: '客户管理' },
      { path: '/manage/customerLevel', name: '客户等级' },
    ],
  },
  {
    path: '/manage/user',
    name: '用户管理',
    children: [
      { path: '/manage/user', name: '用户管理' },
      { path: '/manage/role', name: '角色管理' },
      { path: '/manage/permission', name: '权限管理' },
      { path: '/manage/userRole', name: '用户角色' },
      { path: '/manage/rolePermission', name: '角色权限' },
      { path: '/manage/dept', name: '部门管理' },
      { path: '/manage/userToken', name: '登录令牌' },
    ],
  },
  {
    path: '/manage/requestForm',
    name: '请求书管理',
    children: [
      { path: '/manage/requestForm', name: '请领单' },
      { path: '/manage/requestItem', name: '请领明细' },
    ],
  },
  {
    path: '/manage/config',
    name: '系统配置',
    children: [
      { path: '/manage/config', name: '系统配置' },
      { path: '/manage/message', name: '消息管理' },
      { path: '/manage/operateLog', name: '操作日志' },
    ],
  },
];

export async function getInitialState() {
  initTheme();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || '用户';

  if (!token && !isLoginPage()) {
    redirectToLogin();
  }

  return {
    username,
    currentUser: token ? { name: username } : undefined,
  };
}

export const layout = () => {
  return {
    title: t('app.title'),
    menu: {
      locale: false,
      defaultOpenAll: false,
    },
    fixedHeader: false,
    menuFooterRender: false,
    menuDataRender: () => [
      {
        path: '/manage',
        name: '后台管理',
        children: MANAGE_MENU_GROUPS,
      },
    ],
    headerRender: false,
    rightContentRender: false,
    actionsRender: false,
    childrenRender: (children: any) => (
      <>
        <ContentTopBar />
        {children}
      </>
    ),
    onPageChange: () => {
      const token = localStorage.getItem('token');
      if (!token && !isLoginPage()) {
        redirectToLogin();
      }
    },
  };
};

export const request = {
  responseInterceptors: [
    (response: any) => {
      const res = response?.data as ApiResult<any> | undefined;
      if (res && typeof res.code === 'number' && res.code !== 200) {
        message.error(res.message || t('common.requestFailed'));
        throw new Error(res.message || 'Request failed');
      }
      return response;
    },
  ],
};
