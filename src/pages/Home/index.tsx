import { Card, Col, Row, Typography } from 'antd';
import { t } from '@/utils/i18n';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  return (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card>
          <Title level={3} style={{ marginBottom: 8 }}>
            {t('home.welcomeTitle')}
          </Title>
          <Paragraph style={{ marginBottom: 0 }}>
            {t('home.welcomeDesc')}
          </Paragraph>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title={t('home.card.basic')}>{t('home.card.basicDesc')}</Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title={t('home.card.business')}>
          {t('home.card.businessDesc')}
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card title={t('home.card.system')}>{t('home.card.systemDesc')}</Card>
      </Col>
    </Row>
  );
};

export default HomePage;
