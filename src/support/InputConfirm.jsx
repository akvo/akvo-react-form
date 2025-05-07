import React, { useState } from 'react';
import { Form, Input } from 'antd';
import EyeSuffix from './EyeSuffix';

const InputConfirm = ({
  uiText,
  id,
  required,
  hiddenString = false,
  ...props
}) => {
  const [showString, setShowString] = useState(hiddenString);

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
        type={showString ? 'password' : 'text'}
        placeholder={uiText?.inputConfirmPlaceholder}
        suffix={<EyeSuffix {...{ showString, setShowString, hiddenString }} />}
        {...props}
      />
    </Form.Item>
  );
};

export default InputConfirm;
