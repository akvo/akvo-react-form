import React, { useEffect, useRef, useState } from 'react';
import { Form, Button, Space, Image } from 'antd';
import SignatureCanvas from 'react-signature-canvas';
import { MdCheck, MdClear } from 'react-icons/md';
import { FieldLabel } from '../support';

const TypeSignature = ({
  id,
  name,
  label,
  keyform,
  required,
  tooltip,
  requiredSign,
  rules,
  uiText,
  initialValue = null,
  disabled = false,
}) => {
  const sigCanvas = useRef(null);
  const [trimmedDataURL, setTrimmedDataURL] = useState(initialValue);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const form = Form.useFormInstance();
  // Disable the "Apply" button if there is already a signature (trimmedDataURL is truthy)
  // or if the signature canvas is empty (isEmpty is true).
  const applyButtonDisabled = trimmedDataURL || isEmpty ? true : false;

  const onClear = () => {
    form.setFieldsValue({
      [id]: null,
    });
    setTrimmedDataURL(null);
    setIsEmpty(true);
    // Clear the signature canvas
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const onApply = () => {
    try {
      const dataURL = sigCanvas.current.toDataURL('image/png');
      form.setFieldsValue({
        [id]: dataURL,
      });
      setTrimmedDataURL(dataURL);
    } catch (error) {
      console.error('Error getting trimmed canvas:', error);
    }
  };

  useEffect(() => {
    if (initialValue && !trimmedDataURL && isFirstLoad) {
      setIsFirstLoad(false);
      setIsEmpty(false);
      setTrimmedDataURL(initialValue);
    }
  }, [trimmedDataURL, isFirstLoad, initialValue]);

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
        className="arf-field-signature"
      >
        {trimmedDataURL ? (
          <Image
            src={trimmedDataURL}
            alt="signature"
            preview={false}
            className="arf-signature-image"
          />
        ) : (
          <SignatureCanvas
            canvasProps={{
              width: 480,
              height: 200,
              style: {
                border: '1px solid #6a6a6a',
                borderRadius: '2px',
                backgroundColor: '#fff',
                boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
              },
            }}
            ref={sigCanvas}
            onEnd={() => {
              setIsEmpty(sigCanvas.current.isEmpty());
            }}
          />
        )}
      </Form.Item>
      <Space>
        <Button onClick={onClear}>
          <Space>
            <span>
              <MdClear />
            </span>
            <span>{uiText.clear}</span>
          </Space>
        </Button>
        <Button
          onClick={onApply}
          disabled={applyButtonDisabled}
          type="primary"
          className="arf-apply-signature"
        >
          <Space
            align="center"
            justify="center"
          >
            <span>
              <MdCheck />
            </span>
            <span>{uiText.applySignature}</span>
          </Space>
        </Button>
      </Space>
    </Form.Item>
  );
};

export default TypeSignature;
