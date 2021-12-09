import React from 'react'
import { Form, InputNumber } from 'antd'

const TypeNumber = ({ id, name, keyform, required, rules }) => {
  return (
    <Form.Item
      className='arf-field'
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
    >
      <InputNumber style={{ width: '100%' }} />
    </Form.Item>
  )
}

export default TypeNumber
