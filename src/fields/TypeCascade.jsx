import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Cascader, Select } from 'antd'
import axios from 'axios'
import take from 'lodash/take'

const TypeCascadeApi = ({
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip
}) => {
  const [cascade, setCascade] = useState([])
  const [selected, setSelected] = useState([])
  const { endpoint, initial, list } = api

  useEffect(() => {
    const ep = initial !== undefined ? `${endpoint}/${initial}` : `${endpoint}`
    axios
      .get(ep)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data
        setCascade([data])
      })
      .catch((err) => {
        console.error(err)
      })
  }, [])

  const handleChange = (value, index) => {
    if (!index) {
      setSelected([value])
      form.setFieldsValue({ [id]: [value] })
    } else {
      const prevValue = take(selected, index)
      const result = [...prevValue, value]
      setSelected(result)
      form.setFieldsValue({ [id]: result })
    }
    axios
      .get(`${endpoint}/${value}`)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data
        if (data.length) {
          const prevCascade = take(cascade, index + 1)
          setCascade([...prevCascade, ...[data]])
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <Col>
      <Form.Item
        className='arf-field'
        label={`${keyform + 1}. ${name}`}
        tooltip={tooltip?.text}
      >
        <Form.Item
          className='arf-field-cascade'
          key={keyform}
          name={id}
          rules={rules}
          required={required}
        >
          <Select mode='multiple' options={[]} hidden />
        </Form.Item>
        <div className='arf-field-cascade-api'>
          {cascade.map((c, ci) => (
            <Row
              key={`keyform-cascade-${ci}`}
              className='arf-field-cascade-list'
            >
              <Select
                className='arf-cascade-api-select'
                placeholder={`Select Level ${ci + 1}`}
                onChange={(e) => handleChange(e, ci)}
                options={c.map((v) => ({ label: v.name, value: v.id }))}
                value={selected?.[ci] || null}
              />
            </Row>
          ))}
        </div>
      </Form.Item>
    </Col>
  )
}

const TypeCascade = ({
  cascade,
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip
}) => {
  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        rules={rules}
        tooltip={tooltip}
      />
    )
  }
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
      <Cascader options={cascade} />
    </Form.Item>
  )
}

export default TypeCascade
