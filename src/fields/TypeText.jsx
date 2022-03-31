import React from 'react'
import { Form } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import Extra from '../support/Extra'

const TypeText = ({ id, name, keyform, required, rules, tooltip, extra }) => {
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
        <TextArea row={4} />
      </Form.Item>
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}
export default TypeText
