import React, { useState, useEffect } from 'react'
import { Divider, Form, Select, Input, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Extra, FieldLabel } from '../support'

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
  const [options, setOptions] = useState([])
  const [newOption, setNewOption] = useState('')
  const [extraOption, setExtraOption] = useState([])
  const addNewOption = (e) => {
    setExtraOption([...extraOption, { name: newOption, label: newOption }])
    e.preventDefault()
    setNewOption('')
  }
  const onNewOptionChange = (event) => {
    setNewOption(event.target.value)
  }
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []

  useEffect(() => {
    setOptions([...option, ...extraOption])
  }, [option, extraOption])

  return (
    <Form.Item
      className='arf-field'
      label={<FieldLabel keyform={keyform} content={name} />}
      tooltip={tooltip?.text}
      required={required}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} {...ex} />)}
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
          showArrow
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
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}
export default TypeMultipleOption
