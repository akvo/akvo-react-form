import React from 'react'
import { Form, InputNumber } from 'antd'
import { Extra, FieldLabel } from '../support'

const TypeNumber = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []
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
        key={keyform}
        name={id}
        rules={rules}
        className='arf-field-child'
        required={required}
      >
        <InputNumber
          style={{ width: '100%' }}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}
export default TypeNumber
