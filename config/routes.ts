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
        name: '后台管理',
        icon: 'appstore',
        routes: [
          { path: '/manage', redirect: '/manage/user' },
          { path: '/manage/user', name: '用户管理', component: './Crud' },
          { path: '/manage/role', name: '角色管理', component: './Crud' },
          {
            path: '/manage/permission',
            name: '权限管理',
            component: './Crud',
          },
          { path: '/manage/userRole', name: '用户角色', component: './Crud' },
          {
            path: '/manage/rolePermission',
            name: '角色权限',
            component: './Crud',
          },
          {
            path: '/manage/userToken',
            name: '登录令牌',
            component: './Crud',
          },
          { path: '/manage/config', name: '系统配置', component: './Crud' },
          {
            path: '/manage/operateLog',
            name: '操作日志',
            component: './Crud',
          },
          { path: '/manage/brand', name: '品牌管理', component: './Crud' },
          { path: '/manage/series', name: '系列管理', component: './Crud' },
          { path: '/manage/maker', name: '产地管理', component: './Crud' },
          {
            path: '/manage/goodsType',
            name: '商品类型',
            component: './Crud',
          },
          { path: '/manage/goods', name: '商品管理', component: './Crud' },
          {
            path: '/manage/warehouse',
            name: '仓库管理',
            component: './Crud',
          },
          {
            path: '/manage/customerLevel',
            name: '客户等级',
            component: './Crud',
          },
          { path: '/manage/customer', name: '客户管理', component: './Crud' },
          { path: '/manage/dept', name: '部门管理', component: './Crud' },
          { path: '/manage/stock', name: '库存管理', component: './Crud' },
          {
            path: '/manage/stockRecord',
            name: '库存流水',
            component: './Crud',
          },
          { path: '/manage/stockOrder', name: '出入库单', component: './Crud' },
          {
            path: '/manage/stockOrderItem',
            name: '出入库明细',
            component: './Crud',
          },
          {
            path: '/manage/priceRecord',
            name: '价格记录',
            component: './Crud',
          },
          { path: '/manage/requestForm', name: '请领单', component: './Crud' },
          {
            path: '/manage/requestItem',
            name: '请领明细',
            component: './Crud',
          },
          { path: '/manage/message', name: '消息管理', component: './Crud' },
        ],
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
