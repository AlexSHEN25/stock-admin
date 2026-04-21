import ContentTopBar from '@/components/ContentTopBar';
import { listSchemas } from '@/services/schema';
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

type SchemaMenuItem = {
  resource: string;
  name: string;
  group?: string;
};

const buildManageMenuGroups = (schemas: SchemaMenuItem[]) => {
  const root: Array<Record<string, any>> = [];

  const findOrCreateGroupNode = (
    nodes: Array<Record<string, any>>,
    name: string,
  ) => {
    const existing = nodes.find(
      (node) => node.name === name && Array.isArray(node.children),
    );
    if (existing) {
      return existing;
    }
    const created = { name, children: [] as Array<Record<string, any>> };
    nodes.push(created);
    return created;
  };

  schemas.forEach((schema) => {
    const segments = (schema.group || 'Default')
      .split('/')
      .map((s) => s.trim())
      .filter(Boolean);
    let cursor = root;

    segments.forEach((segment) => {
      const groupNode = findOrCreateGroupNode(cursor, segment);
      cursor = groupNode.children as Array<Record<string, any>>;
    });

    const leafPath = `/manage/${schema.resource}`;
    const exists = cursor.some((node) => node.path === leafPath);
    if (!exists) {
      cursor.push({
        path: leafPath,
        name: schema.name || schema.resource,
      });
    }
  });

  return root;
};

export async function getInitialState() {
  initTheme();
  localStorage.setItem('umi_locale', 'ja-JP');
  localStorage.setItem('locale', 'ja-JP');

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'ユーザー';

  if (!token && !isLoginPage()) {
    redirectToLogin();
  }

  let schemaMenu: any[] = [];
  if (token) {
    try {
      const schemas = await listSchemas();
      schemaMenu = buildManageMenuGroups(schemas || []);
    } catch (_e) {
      schemaMenu = [];
    }
  }

  return {
    username,
    currentUser: token ? { name: username } : undefined,
    schemaMenu,
  };
}

export const layout = ({ initialState }: { initialState?: any }) => {
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
        children: initialState?.schemaMenu || [],
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
