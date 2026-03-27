import { Button, Card, Result } from 'antd';
import React from 'react';

const NoFoundPage: React.FC = () => (
  <Card variant="borderless">
    <Result
      status="404"
      title="404"
      subTitle="页面不存在"
      extra={
        <Button type="primary" onClick={() => (window.location.href = '/')}>
          返回首页
        </Button>
      }
    />
  </Card>
);

export default NoFoundPage;
