import React, { useState } from 'react'
import { Divider, Form, Select, Input, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Extra from '../support/Extra'

const TypeMultipleOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra
}) => {
  const [options, setOptions] = useState(option)
  const [newOption, setNewOption] = useState('')
  const addNewOption = (e) => {
    setOptions([...options, { name: newOption, label: newOption }])
    e.preventDefault()
    setNewOption('')
  }
  const onNewOptionChange = (event) => {
    setNewOption(event.target.value)
  }
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
        <Select
          style={{ width: '100%' }}
          mode='multiple'
          getPopupContainer={(trigger) => trigger.parentNode}
          dropdownRender={(menu) =>
            allowOther ? (
              <div>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div
                  align='center'
                  style={{ padding: '0 8px 4px', width: '100%' }}
                >
                  <Input.Group compact>
                    <Button
                      type='primary'
                      onClick={addNewOption}
                      style={{ whiteSpace: 'nowrap' }}
                      icon={<PlusOutlined />}
                      disabled={!newOption.length}
                    />
                    <Input
                      style={{ width: 'calc(100% - 40px)', textAlign: 'left' }}
                      placeholder={allowOtherText || 'Please enter item'}
                      value={newOption}
                      onChange={onNewOptionChange}
                    />
                  </Input.Group>
                </div>
              </div>
            ) : (
              menu
            )
          }
          allowClear
        >
          {options.map((o, io) => (
            <Select.Option key={io} value={o.name}>
              {o.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}
export default TypeMultipleOption
