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
  return '';
};
const redirectToLogin = () => {
  const basePrefix = resolveBasePrefix();
  window.location.href = `${basePrefix}${LOGIN_ROUTE}`;
};

const buildManageMenuGroups = () => [
  {
    path: '/manage/user',
    name: t('menu.user'),
    children: [
      { path: '/manage/user', name: t('menu.user.user') },
      { path: '/manage/role', name: t('menu.user.role') },
      { path: '/manage/permission', name: t('menu.user.permission') },
      { path: '/manage/userRole', name: t('menu.user.userRole') },
      { path: '/manage/rolePermission', name: t('menu.user.rolePermission') },
      { path: '/manage/dept', name: t('menu.user.dept') },
      { path: '/manage/userToken', name: t('menu.user.userToken') },
    ],
  },
  {
    path: '/manage/goods',
    name: t('menu.goods'),
    children: [
      { path: '/manage/goods', name: t('menu.goods.goods') },
      { path: '/manage/brand', name: t('menu.goods.brand') },
      { path: '/manage/series', name: t('menu.goods.series') },
      { path: '/manage/goodsType', name: t('menu.goods.goodsType') },
      { path: '/manage/maker', name: t('menu.goods.maker') },
    ],
  },
  {
    path: '/manage/stock',
    name: t('menu.stock'),
    children: [
      { path: '/manage/stock', name: t('menu.stock.stock') },
      { path: '/manage/stockOrder', name: t('menu.stock.stockOrder') },
      { path: '/manage/stockOrderItem', name: t('menu.stock.stockOrderItem') },
      { path: '/manage/stockRecord', name: t('menu.stock.stockRecord') },
      { path: '/manage/priceRecord', name: t('menu.stock.priceRecord') },
      { path: '/manage/warehouse', name: t('menu.stock.warehouse') },
    ],
  },
  {
    path: '/manage/requestForm',
    name: t('menu.request'),
    children: [
      { path: '/manage/requestForm', name: t('menu.request.requestForm') },
      { path: '/manage/requestItem', name: t('menu.request.requestItem') },
    ],
  },
  {
    path: '/manage/customer',
    name: t('menu.customer'),
    children: [
      { path: '/manage/customer', name: t('menu.customer.customer') },
      { path: '/manage/customerLevel', name: t('menu.customer.customerLevel') },
    ],
  },
  {
    path: '/manage/config',
    name: t('menu.system'),
    children: [
      { path: '/manage/config', name: t('menu.system.config') },
      { path: '/manage/message', name: t('menu.system.message') },
      { path: '/manage/operateLog', name: t('menu.system.operateLog') },
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
        name: t('menu.manage'),
        children: buildManageMenuGroups(),
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
