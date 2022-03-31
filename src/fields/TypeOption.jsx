import React from 'react'
import { Space, Form, Radio, Select } from 'antd'
import Extra from '../support/Extra'

const TypeOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra
}) => {
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
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}
export default TypeOption
