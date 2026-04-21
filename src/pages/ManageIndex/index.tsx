import { PageContainer } from '@ant-design/pro-components';
import { Spin } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listSchemas } from '@/services/schema';

export default () => {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    listSchemas()
      .then((schemas) => {
        if (cancelled) {
          return;
        }
        const first = schemas?.[0]?.resource;
        if (first) {
          navigate(`/manage/${first}`, { replace: true });
          return;
        }
        navigate('/404', { replace: true });
      })
      .catch(() => {
        if (!cancelled) {
          navigate('/404', { replace: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <PageContainer>
      <Spin />
    </PageContainer>
  );
};
