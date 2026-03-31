import { Button, Card, Result } from 'antd';
import React from 'react';
import { t } from '@/utils/i18n';

const NoFoundPage: React.FC = () => (
  <Card variant="borderless">
    <Result
      status="404"
      title="404"
      subTitle={t('error.404.subtitle')}
      extra={
        <Button type="primary" onClick={() => (window.location.href = '/')}>
          {t('error.404.backHome')}
        </Button>
      }
    />
  </Card>
);

export default NoFoundPage;
