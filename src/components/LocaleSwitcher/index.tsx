import { Select } from 'antd';
import { type AppLang, getCurrentLang, setCurrentLang, t } from '@/utils/i18n';

const LocaleSwitcher = () => {
  const currentLang = getCurrentLang();
  const options = [
    { value: 'zh-CN', label: t('right.lang.zh-CN') },
    { value: 'en-US', label: t('right.lang.en-US') },
    { value: 'ja-JP', label: t('right.lang.ja-JP') },
  ];

  return (
    <Select
      size="small"
      value={currentLang}
      options={options}
      style={{ width: 110 }}
      onChange={(lang) => {
        setCurrentLang(lang as AppLang);
        window.location.reload();
      }}
    />
  );
};

export default LocaleSwitcher;
