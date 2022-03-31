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
        label={`${keyform + 1}. ${name}`}
        tooltip={tooltip?.text}
      >
        <Form.Item
          className='arf-field-geo'
          name={id}
          rules={rules}
          required={required}
        >
          <Input disabled hidden />
        </Form.Item>
        <Maps form={form} id={id} center={center} />
      </Form.Item>
    </Col>
  )
}
export default TypeGeo
