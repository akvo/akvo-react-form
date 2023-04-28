import React from 'react';
import { Col } from 'antd';

const Extra = ({ id, content, placement }) => {
  const qid = String(id)?.split('-')?.[0] || id;
  return (
    <Col
      name={`arf-extra-content-${qid}`}
      arf_qid={id}
      className={`arf-extra-${placement}`}
    >
      {content}
    </Col>
  );
};

export default Extra;
