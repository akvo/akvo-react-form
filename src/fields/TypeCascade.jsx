import React from 'react'
import { Form, Cascader } from 'antd'

const TypeCascade = ({ cascade, id, name, keyform, required, rules }) => {
  return (
    <Form.Item
      className='arf-field'
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
    >
      <Cascader options={cascade} />
    </Form.Item>
  )
}

export default TypeCascade
