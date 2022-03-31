import React from 'react'
import { Form, InputNumber } from 'antd'
import Extra from '../support/Extra'

const TypeNumber = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra
}) => {
  return (
    <Form.Item
      className='arf-field'
      label={`${keyform + 1}. ${name}`}
      tooltip={tooltip?.text}
    >
      {extra?.placement === 'before' && <Extra {...extra} />}
      <Form.Item
        key={keyform}
        name={id}
        rules={rules}
        className='arf-field-child'
        required={required}
      >
        <InputNumber
          style={{ width: '100%' }}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
        />
      </Form.Item>
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}
export default TypeNumber
