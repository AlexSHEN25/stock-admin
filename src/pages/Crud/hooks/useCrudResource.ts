import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { CrudModule } from '@/config/crudModules';
import { getErrorMessage } from '@/services/http';
import { getSchema, schemaToCrudModule } from '@/services/schema';

export const useCrudResource = () => {
  const { pathname } = useLocation();
  const { resource: resourceParam } = useParams<{ resource: string }>();
  const resource = useMemo(
    () => resourceParam || pathname.split('/').filter(Boolean).pop() || '',
    [resourceParam, pathname],
  );
  const [module, setModule] = useState<CrudModule | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!resource) {
      setModule(undefined);
      setError(undefined);
      return;
    }

    setLoading(true);
    setError(undefined);

    getSchema(resource)
      .then((schema) => {
        if (cancelled) {
          return;
        }
        setModule(schemaToCrudModule(schema));
      })
      .catch((e) => {
        if (cancelled) {
          return;
        }
        setModule(undefined);
        setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resource]);

  return {
    resource,
    module,
    loading,
    error,
  };
};
