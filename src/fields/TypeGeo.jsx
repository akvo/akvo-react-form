import React from 'react'
import { Col, Form, Input } from 'antd'
import { Maps, Extra, FieldLabel } from '../support'

const TypeGeo = ({
  id,
  name,
  form,
  keyform,
  required,
  rules,
  tooltip,
  center,
  initialValue,
  extra
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []

  return (
    <Col>
      <Form.Item
        className='arf-field'
        label={<FieldLabel keyform={keyform} content={name} />}
        tooltip={tooltip?.text}
        required={required}
      >
        {!!extraBefore?.length &&
          extraBefore.map((ex, exi) => <Extra key={exi} {...ex} />)}
        <Form.Item
          className='arf-field-geo'
          name={id}
          rules={rules}
          required={required}
        >
          <Input disabled hidden />
        </Form.Item>
        <Maps form={form} id={id} center={center} initialValue={initialValue} />
        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
      </Form.Item>
    </Col>
  )
}
export default TypeGeo
