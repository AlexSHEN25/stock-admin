/**
 * @name umi 的路由配置
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: '登录',
        path: '/user/login',
        component: './user/login',
      },
    ],
  },
  {
    path: '/',
    routes: [
      {
        path: '/',
        redirect: '/manage/user',
      },
      {
        path: '/manage',
        routes: [{ path: '/manage', redirect: '/manage/user' }],
      },
      {
        path: '/manage/:resource',
        component: './Crud',
        hideInMenu: true,
      },
      {
        path: '/stock',
        redirect: '/manage/user',
      },
      {
        path: '*',
        component: './404',
      },
    ],
  },
];
