import React from 'react'
import { Form, DatePicker } from 'antd'
import { Extra, FieldLabel } from '../support'

const TypeDate = ({ id, name, keyform, required, rules, tooltip, extra }) => {
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
        className='arf-field-child'
        key={keyform}
        name={id}
        rules={rules}
        required={required}
      >
        <DatePicker
          getPopupContainer={(trigger) => trigger.parentNode}
          format='YYYY-MM-DD'
          style={{ width: '100%' }}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}
export default TypeDate
