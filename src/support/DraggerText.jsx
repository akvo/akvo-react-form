import React from 'react';
import { InboxOutlined } from '@ant-design/icons';

const DraggerText = ({ limit = 2 }) => {
  return (
    <React.Fragment>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint">{`Only JPEG, JPG and PNG with max size of ${limit} MB.`}</p>
    </React.Fragment>
  );
};

export default DraggerText;
