import React from 'react';
import { Form, Input } from 'antd';

const InputConfirm = ({
  uiText,
  id,
  required,
  hiddenString = false,
  ...props
}) => {
  return (
    <Form.Item
      name={`confirm_${id}`}
      dependencies={[id]}
      rules={[
        {
          required,
          message: uiText?.errorConfirmRequired,
        },
        ({ getFieldValue }) => ({
          // eslint-disable-next-line space-before-function-paren
          validator(_, value) {
            if (!value || getFieldValue(id) === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error(uiText?.errorConfirmMismatch));
          },
        }),
      ]}
    >
      <Input
        sytle={{ width: '100%' }}
        type={hiddenString ? 'password' : 'text'}
        placeholder={uiText?.inputConfirmPlaceholder}
        {...props}
      />
    </Form.Item>
  );
};

export default InputConfirm;
