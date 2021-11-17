import React from 'react'
import { Form, Input } from 'antd'

const TypeInput = ({ id, name, keyform, required, rules }) => {
  return (
    <Form.Item
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
    >
      <Input sytle={{ width: '100%' }} />
    </Form.Item>
  )
}

export default TypeInput
