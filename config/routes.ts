export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/',
    routes: [
      {
        path: '/',
        redirect: '/stock',
      },
      {
        path: '/stock',
        name: '库存管理',
        component: './Stock',
      },
    ],
  },
  {
    component: '404',
    layout: false,
    path: './*',
  },
];
