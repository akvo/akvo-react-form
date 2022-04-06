import React from 'react'
import { Form, DatePicker } from 'antd'
import Extra from '../support/Extra'

const TypeDate = ({ id, name, keyform, required, rules, tooltip, extra }) => {
  return (
    <Form.Item
      className='arf-field'
      label={`${keyform + 1}. ${name}`}
      tooltip={tooltip?.text}
    >
      {extra?.placement === 'before' && <Extra {...extra} />}
      <Form.Item
        className='arf-field-child'
        key={keyform}
        name={id}
        rules={rules}
        required={required}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}
export default TypeDate
