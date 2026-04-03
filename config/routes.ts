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
        routes: [
          { path: '/manage', redirect: '/manage/user' },
          { path: '/manage/user', component: './Crud' },
          { path: '/manage/role', component: './Crud' },
          { path: '/manage/permission', component: './Crud' },
          { path: '/manage/userRole', component: './Crud' },
          { path: '/manage/rolePermission', component: './Crud' },
          { path: '/manage/userToken', component: './Crud' },
          { path: '/manage/dept', component: './Crud' },
          { path: '/manage/goods', component: './Crud' },
          { path: '/manage/brand', component: './Crud' },
          { path: '/manage/series', component: './Crud' },
          { path: '/manage/goodsType', component: './Crud' },
          { path: '/manage/maker', component: './Crud' },
          { path: '/manage/stock', component: './Crud' },
          { path: '/manage/stockOrder', component: './Crud' },
          { path: '/manage/stockOrderItem', component: './Crud' },
          { path: '/manage/stockRecord', component: './Crud' },
          { path: '/manage/priceRecord', component: './Crud' },
          { path: '/manage/warehouse', component: './Crud' },
          { path: '/manage/requestForm', component: './Crud' },
          { path: '/manage/requestItem', component: './Crud' },
          { path: '/manage/customer', component: './Crud' },
          { path: '/manage/customerLevel', component: './Crud' },
          { path: '/manage/config', component: './Crud' },
          { path: '/manage/message', component: './Crud' },
          { path: '/manage/operateLog', component: './Crud' },
        ],
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
