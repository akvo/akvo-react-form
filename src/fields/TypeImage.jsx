import React, { useCallback, useEffect, useState } from 'react';
import { Col, Form, Input, Upload } from 'antd';
import { FieldLabel } from '../support';
import GlobalStore from '../lib/store';
import DraggerText from '../support/DraggerText';
import ImagePreview from '../support/ImagePreview';

const { Dragger } = Upload;

const FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const TypeImage = ({
  id,
  name,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  requiredSign,
  initialValue = null,
  action = null,
  limit = 2,
}) => {
  const defaultList = initialValue
    ? [
        {
          uid: '1',
          status: 'done',
          name: initialValue,
          url: initialValue,
        },
      ]
    : [];
  const [fileList, setFileList] = useState(defaultList);
  const [preview, setPreview] = useState(null);
  const form = Form.useFormInstance();
  const currentValue = form.getFieldValue([id]);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id ? { ...g, value: value } : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);
  return (
    <Col>
      <Form.Item
        className="arf-field"
        label={
          <FieldLabel
            keyform={keyform}
            content={name}
            requiredSign={required ? requiredSign : null}
          />
        }
        tooltip={tooltip?.text}
        required={required}
      >
        <Form.Item
          className="arf-field-image"
          name={id}
          rules={rules}
          required={required}
          noStyle
        >
          <Input
            disabled
            hidden
          />
        </Form.Item>
        <Dragger
          name={id}
          multiple={false}
          action={action}
          listType="picture"
          fileList={fileList}
          beforeUpload={(file) => {
            const fileMB = file.size / (1024 * 1024);
            const validate = fileMB <= limit && FILE_TYPES.includes(file.type);
            if (validate) {
              setFileList([
                {
                  ...file,
                  name: file.name,
                  url: URL.createObjectURL(file),
                },
              ]);
            }
            if (!validate) {
              setFileList([]);
            }
            return validate;
          }}
          onChange={({ file: { status, name: fileName, originFileObj } }) => {
            if (fileList.length && action) {
              setFileList([
                {
                  ...fileList[0],
                  status,
                },
              ]);
            }
            if (status === 'success') {
              updateDataPointName(fileName);
            }

            if (status !== 'error' && originFileObj) {
              updateDataPointName(originFileObj);
            }
          }}
          onPreview={({ url }) => setPreview(url)}
        >
          <DraggerText limit={limit} />
        </Dragger>
        <ImagePreview
          visible={preview}
          src={preview}
          onChange={setPreview}
        />
      </Form.Item>
    </Col>
  );
};
export default TypeImage;
