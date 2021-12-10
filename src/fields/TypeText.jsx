import React from 'react'
import { Form } from 'antd'
import TextArea from 'antd/lib/input/TextArea'

const TypeText = ({ id, name, keyform, required, rules }) => {
  return (
    <Form.Item
      className='arf-field'
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
    >
      <TextArea row={4} />
    </Form.Item>
  )
}

export default TypeText
