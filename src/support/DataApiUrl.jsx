import React, { useEffect, useState } from 'react';
import { Row, Col, Tag } from 'antd';
import axios from 'axios';

const DataApiUrl = ({ dataApiUrl }) => {
  const [apiValue, setApiValue] = useState(null);

  useEffect(() => {
    if (apiValue === null) {
      axios.get(dataApiUrl).then((res) => {
        setApiValue(res.data);
      });
    }
  }, [apiValue, dataApiUrl]);

  return (
    <Row>
      <Col span={24}>
        {apiValue
          ? Object.keys(apiValue).map((k) => (
              <Tag key={k}>
                {k}
                {': '}
                <b>{apiValue[k]}</b>
              </Tag>
            ))
          : 'Loading'}
      </Col>
    </Row>
  );
};

export default DataApiUrl;
