import React from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

const EyeSuffix = ({ showString, setShowString, hiddenString }) =>
  hiddenString ? (
    <span
      role="button"
      aria-label="toggle show/hidden text"
      tabIndex={0}
      onClick={() => setShowString(!showString)}
      style={{ cursor: 'pointer', opacity: '.5' }}
    >
      {showString ? <EyeInvisibleOutlined /> : <EyeOutlined />}
    </span>
  ) : null;

export default EyeSuffix;
