import React from 'react'
import { Form, Select } from 'antd'

const TypeMultipleOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip
}) => {
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
      <Select mode='multiple' style={{ width: '100%' }}>
        {option.map((o, io) => (
          <Select.Option key={io} value={o.name}>
            {o.label}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  )
}

export default TypeMultipleOption
