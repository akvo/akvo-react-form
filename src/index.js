import React, { useState } from 'react'
import { Row, Col, Card, Button, Form, Input } from 'antd'
import Maps from './support/Maps'
import 'antd/dist/antd.css'
import './styles.module.css'
import TypeOption from './fields/TypeOption'
import TypeMultipleOption from './fields/TypeMultipleOption'
import TypeDate from './fields/TypeDate'
import TypeCascade from './fields/TypeCascade'
import TypeNumber from './fields/TypeNumber'
import TypeInput from './fields/TypeInput'
import TypeText from './fields/TypeText'

const mapRules = ({ rule, type }) => {
  if (type === 'number') {
    return [{ ...rule, type: 'number' }]
  }
  return [{}]
}

const QuestionFields = ({ rules, cascade, form, index, field }) => {
  switch (field.type) {
    case 'option':
      return <TypeOption keyform={index} rules={rules} {...field} />
    case 'multiple_option':
      return <TypeMultipleOption keyform={index} rules={rules} {...field} />
    case 'cascade':
      return (
        <TypeCascade
          keyform={index}
          cascade={cascade[field.option]}
          rules={rules}
          {...field}
        />
      )
    case 'date':
      return <TypeDate keyform={index} rules={rules} {...field} />
    case 'number':
      return <TypeNumber keyform={index} rules={rules} {...field} />
    case 'text':
      return <TypeText keyform={index} rules={rules} {...field} />
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />
  }
}

const validateDependency = (dependency, value) => {
  if (dependency?.options) {
    return dependency.options.includes(value)
  }
  let valid = false
  if (dependency?.min) {
    valid = value >= dependency.min
  }
  if (dependency?.max) {
    valid = value <= dependency.max
  }
  return valid
}

const Question = ({ fields, cascade, form }) => {
  return fields.map((field, key) => {
    let rules = []
    if (field?.required) {
      rules = [
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(new Error(`${field.name} is required`))
        }
      ]
    }
    if (field?.rule) {
      rules = [...rules, ...mapRules(field)]
    }
    const [value, setValue] = useState(null)
    if (field?.type === 'geo') {
      return (
        <Col key={key}>
          <Form.Item
            name={field.id}
            label={`${key + 1}. ${field.name}`}
            rules={rules}
            required={field?.required}
          >
            <Input value={value} disabled hidden />
          </Form.Item>
          <Maps
            form={form}
            setValue={setValue}
            id={field.id}
            center={field.center}
          />
        </Col>
      )
    }
    if (field?.dependency) {
      return (
        <Form.Item
          noStyle
          key={key}
          shouldUpdate={(prevValues, currentValues) => {
            const update = field.dependency
              .map((x) => prevValues[x.id] !== currentValues[x.id])
              .filter((x) => x === true)
            return update.length
          }}
        >
          {({ getFieldValue }) => {
            const unmatches = field.dependency
              .map((x) => validateDependency(x, getFieldValue(x.id)))
              .filter((x) => x === false)
            return unmatches.length ? null : (
              <QuestionFields
                rules={rules}
                form={form}
                index={key}
                cascade={cascade}
                field={field}
              />
            )
          }}
        </Form.Item>
      )
    }
    return (
      <QuestionFields
        rules={rules}
        form={form}
        key={key}
        index={key}
        cascade={cascade}
        field={field}
      />
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

  const onValuesChange = (fr, value, values) => {
    const all = fr.getFieldsError().length
    const filled = Object.keys(values)
      .map((k) => values[k])
      .filter((x) => x).length
    if (onChange) {
      onChange({
        current: value,
        values: values,
        progress: (filled / all) * 100
      })
    }
  }

  return (
    <Form
      form={form}
      layout='vertical'
      name={forms.name}
      scrollToFirstError='true'
      onValuesChange={(value, values) =>
        setTimeout(() => {
          onValuesChange(form, value, values)
        }, 100)
      }
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
