import React from 'react'
import { Form, DatePicker } from 'antd'

const TypeDate = ({ id, name, keyform, required, rules }) => {
  return (
    <Form.Item
      className='arf-field'
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
    >
      <DatePicker style={{ width: '100%' }} />
    </Form.Item>
  )
}

export default TypeDate
