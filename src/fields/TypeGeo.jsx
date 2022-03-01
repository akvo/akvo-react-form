import React from 'react'
import { Col, Form, Input } from 'antd'
import Maps from '../support/Maps'

const TypeGeo = ({
  id,
  name,
  form,
  keyform,
  required,
  rules,
  tooltip,
  center
}) => {
  return (
    <Col>
      <Form.Item
        className='arf-field'
        name={id}
        label={`${keyform + 1}. ${name}`}
        rules={rules}
        required={required}
        tooltip={tooltip?.text}
      >
        <Input disabled hidden />
      </Form.Item>
      <Maps form={form} id={id} center={center} />
    </Col>
  )
}
export default TypeGeo
