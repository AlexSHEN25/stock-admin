import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { getStockList } from '@/services/stock';

export default () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getStockList();
    setData(res.data); // 后端返回 data
  };

  return <Table rowKey="id" dataSource={data} />;
};
