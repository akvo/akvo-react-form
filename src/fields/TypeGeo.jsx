import React, { useState } from 'react'
import { Col, Form, Input } from 'antd'
import Maps from './support/Maps'

const TypeGeo = ({ id, form, name, keyform, required, rules, center }) => {
  const [value, setValue] = useState(null)
  return (
    <Col>
      <Form.Item
        key={keyform}
        name={id}
        label={`${keyform + 1}. ${name}`}
        rules={rules}
        required={required}
      >
        <Input value={value} disabled hidden />
      </Form.Item>
      <Maps form={form} setValue={setValue} id={id} center={center} />
    </Col>
  )
}

export default TypeGeo
