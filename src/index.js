import React, { useState } from 'react'
import {
  Row,
  Col,
  Card,
  Space,
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  DatePicker,
  Cascader
} from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import 'antd/dist/antd.css'
import './styles.module.css'
import Maps from './custom/Maps'

const mapRules = ({ name, rule, type }) => {
  if (type === 'number') {
    return [{ ...rule, type: 'number' }]
  }
  return [{}]
}

const Question = ({ fields, cascade, form }) => {
  const [value, setValue] = useState(null)
  return fields.map((f, key) => {
    let rules = []
    if (f?.required) {
      rules = [
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(new Error(`${f.name} is required`))
        }
      ]
    }
    if (f.rule) {
      rules = [...rules, ...mapRules(f)]
    }
    return (
      <Form.Item
        key={key}
        name={f.id}
        label={`${key + 1}. ${f.name}`}
        rules={rules}
        required={f?.required}
      >
        {f.type === 'option' ? (
          f.option.length < 3 ? (
            <Radio.Group>
              <Space direction='vertical'>
                {f.option.map((o, io) => (
                  <Radio key={io} value={o.name}>
                    {o.name}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <Select style={{ width: '100%' }}>
              {f.option.map((o, io) => (
                <Select.Option key={io} value={o.name}>
                  {o.name}
                </Select.Option>
              ))}
            </Select>
          )
        ) : f.type === 'multiple_option' ? (
          <Select mode='multiple' style={{ width: '100%' }}>
            {f.option.map((o, io) => (
              <Select.Option key={io} value={o.name}>
                {o.name}
              </Select.Option>
            ))}
          </Select>
        ) : f.type === 'cascade' ? (
          <Cascader options={cascade[f.option]} />
        ) : f.type === 'date' ? (
          <DatePicker style={{ width: '100%' }} />
        ) : f.type === 'number' ? (
          <InputNumber style={{ width: '100%' }} />
        ) : f.type === 'text' ? (
          <TextArea row={4} />
        ) : f.type === 'geo' ? (
          <Col>
            <Input value={value} disabled hidden />
            <Maps
              form={form}
              setValue={setValue}
              id={f.id}
              center={f?.center}
            />
          </Col>
        ) : (
          <Input sytle={{ width: '100%' }} />
        )}
      </Form.Item>
    )
  })
}

export const Webform = ({ forms, onChange, onFinish, style }) => {
  const [form] = Form.useForm()
  if (!forms?.question_group) {
    return 'Error Format'
  }

  const onSubmit = (values) => {
    if (onFinish) {
      onFinish(values)
    } else {
      console.log(values)
    }
  }

  const onValuesChange = (value) => {
    if (onChange) {
      onChange(value)
    }
  }

  return (
    <Form
      form={form}
      layout='vertical'
      name={forms.name}
      onValuesChange={onValuesChange}
      onFinish={onSubmit}
      style={style}
    >
      {forms?.question_group.map((g, key) => {
        return (
          <Card key={key} title={g.name || `Section ${key + 1}`}>
            <Question fields={g.question} cascade={forms.cascade} form={form} />
          </Card>
        )
      })}
      <Row>
        <Col span={24}>
          <Card>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  )
}
