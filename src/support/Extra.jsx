import React from 'react';
import { Col } from 'antd';

const Extra = ({ content, placement }) => {
  return <Col className={`arf-extra-${placement}`}>{content}</Col>;
};

export default Extra;
