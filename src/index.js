import React from 'react'
import { Row, Col, Card, Button, Form } from 'antd'
import 'antd/dist/antd.css'
import './styles.module.css'
import TypeOption from './fields/TypeOption'
import TypeMultipleOption from './fields/TypeMultipleOption'
import TypeDate from './fields/TypeDate'
import TypeCascade from './fields/TypeCascade'
import TypeNumber from './fields/TypeNumber'
import TypeInput from './fields/TypeInput'
import TypeText from './fields/TypeText'
import TypeGeo from './fields/TypeGeo'

const mapRules = ({ name, rule, type }) => {
  if (type === 'number') {
    return [{ ...rule, type: 'number' }]
  }
  return [{}]
}

const Question = ({ fields, cascade, form }) => {
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
    return f.type === 'option' ? (
      <TypeOption key={key} keyform={key} rules={rules} {...f} />
    ) : f.type === 'multiple_option' ? (
      <TypeMultipleOption key={key} keyform={key} rules={rules} {...f} />
    ) : f.type === 'cascade' ? (
      <TypeCascade
        key={key}
        keyform={key}
        cascade={cascade[f.option]}
        rules={rules}
        {...f}
      />
    ) : f.type === 'date' ? (
      <TypeDate key={key} keyform={key} rules={rules} {...f} />
    ) : f.type === 'number' ? (
      <TypeNumber key={key} keyform={key} rules={rules} {...f} />
    ) : f.type === 'text' ? (
      <TypeText key={key} keyform={key} rules={rules} {...f} />
    ) : f.type === 'geo' ? (
      <TypeGeo key={key} keyform={key} rules={rules} form={form} {...f} />
    ) : (
      <TypeInput key={key} keyform={key} rules={rules} {...f} />
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
