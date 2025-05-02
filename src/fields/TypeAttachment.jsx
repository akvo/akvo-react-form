import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Space, Upload } from 'antd';
import { MdUpload } from 'react-icons/md';
import { FieldLabel } from '../support';
import MIME_TYPES from '../lib/mime_types';

const TypeAttachment = ({
  id,
  name,
  label,
  keyform,
  required,
  tooltip,
  requiredSign,
  rule,
  rules,
  uiText,
  initialValue = null,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState([initialValue].filter(Boolean));
  const { allowed_file_types: allowedFileTypes } = rule || {};
  const form = Form.useFormInstance();

  useEffect(() => {
    // create a file object from the initialValue if it is a string
    if (typeof initialValue === 'string' && fileList.length === 0) {
      // download the file and create a file object using fetch js
      fetch(initialValue)
        .then((response) => response.blob())
        .then((blob) => {
          const fname = initialValue.split('/').pop();
          // remove the query string from the file name
          const fileName = fname.split('?')[0];
          const fileExtension = fileName.split('.').pop();
          const file = new File([blob], fileName, {
            type: MIME_TYPES?.[fileExtension] || 'application/octet-stream',
          });
          // set the fileList state with the file object
          setFileList([file]);
          // set the form value with the file object
          form.setFieldsValue({
            [id]: file,
          });
        })
        .catch((error) => {
          console.error('Error fetching file:', error);
        });
    }
  }, [initialValue, fileList, form, id]);

  const handleRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = [...fileList];
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const handleBeforeUpload = (file) => {
    const fileType = file.type;
    const allowedMimeTypes = allowedFileTypes?.length
      ? allowedFileTypes.map((type) => MIME_TYPES?.[type] || type)
      : [];
    const isAllowed = allowedMimeTypes.length
      ? allowedMimeTypes.includes(fileType)
      : true;
    if (!isAllowed) {
      const errorMessage = `${uiText.errorFileType} ${allowedFileTypes.join(
        ', '
      )}`;
      Modal.error({
        title: uiText.errorFileTypeTitle,
        content: errorMessage,
        onOk: () => {
          setFileList([]);
        },
      });
      return false;
    }
    setFileList([file]);
    return false;
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={label || name || uiText.uploadFile}
          requiredSign={required ? requiredSign : null}
        />
      }
      tooltip={tooltip?.text}
      required={!disabled ? required : false}
    >
      <Form.Item
        name={id}
        rules={rules}
        tooltip={tooltip?.text}
        required={!disabled ? required : false}
        className="arf-field-attachment"
        getValueFromEvent={(file) => {
          if (file?.fileList?.length) {
            return file.fileList[0].originFileObj;
          }
          return null;
        }}
      >
        <Upload
          onRemove={handleRemove}
          beforeUpload={handleBeforeUpload}
          maxCount={1}
          fileList={fileList}
        >
          <Button>
            <Space>
              <span>
                <MdUpload />
              </span>
              <span>{uiText.uploadFile}</span>
            </Space>
          </Button>
        </Upload>
      </Form.Item>
    </Form.Item>
  );
};

export default TypeAttachment;
