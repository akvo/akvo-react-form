import React from 'react'
import { Space, Form, Radio, Select } from 'antd'

const TypeOption = ({
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
      {option.length < 3 ? (
        <Radio.Group>
          <Space direction='vertical'>
            {option.map((o, io) => (
              <Radio key={io} value={o.name}>
                {o.name}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      ) : (
        <Select style={{ width: '100%' }} allowClear>
          {option.map((o, io) => (
            <Select.Option key={io} value={o.name}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  )
}

export default TypeOption
