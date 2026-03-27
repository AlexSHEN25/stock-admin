import { useLocation, useParams } from 'react-router-dom';
import { CRUD_MODULE_MAP } from '@/config/crudModules';

export const useCrudResource = () => {
  const { pathname } = useLocation();
  const { resource: resourceParam } = useParams<{ resource: string }>();
  const resource =
    resourceParam || pathname.split('/').filter(Boolean).pop() || '';
  const module = CRUD_MODULE_MAP[resource];

  return {
    resource,
    module,
  };
};
