import React from 'react'
import { Form, Input } from 'antd'

const TypeInput = ({ id, name, keyform, required, rules, tooltip }) => {
  return (
    <Form.Item
      className='arf-field'
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
      tooltip={tooltip?.text}
    >
      <Input sytle={{ width: '100%' }} />
    </Form.Item>
  )
}

export default TypeInput
