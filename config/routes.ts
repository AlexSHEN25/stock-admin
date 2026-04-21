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
        redirect: '/manage',
      },
      {
        path: '/manage',
        routes: [
          { path: '/manage', component: './ManageIndex' },
          { path: '/manage/:resource', component: './Crud' },
        ],
      },
      {
        path: '/stock',
        redirect: '/manage',
      },
      {
        path: '*',
        component: './404',
      },
    ],
  },
];
