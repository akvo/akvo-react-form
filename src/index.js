import React, { useState } from 'react'
import { Row, Col, Card, Button, Form, Input, List } from 'antd'
import { MdRadioButtonChecked, MdCheckCircle } from 'react-icons/md'
import Maps from './support/Maps'
import 'antd/dist/antd.css'
import './styles.module.css'
import intersection from 'lodash/intersection'
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
    if (typeof value === 'string') {
      value = [value]
    }
    return intersection(dependency.options, value)?.length > 0
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

const Question = ({ fields, cascade, form, current }) => {
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
            className='arf-field'
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
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = field.dependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.id))
              })
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

const getDependencyAncestors = (questions, current, dependencies) => {
  const ids = dependencies.map((x) => x.id)
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency)
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency)
    current = [current, ...dependencies].flatMap((x) => x)
    ancestors.forEach((a) => {
      if (a?.dependency) {
        current = getDependencyAncestors(questions, current, a.dependency)
      }
    })
  }
  return current
}

const translateForm = (forms) => {
  const questions = forms?.question_group
    .map((x) => x.question)
    .flatMap((x) => x)

  const transformed = questions.map((x) => {
    if (x?.dependency) {
      return {
        ...x,
        dependency: getDependencyAncestors(
          questions,
          x.dependency,
          x.dependency
        )
      }
    }
    return x
  })

  return {
    ...forms,
    question_group: forms.question_group.map((qg) => {
      return {
        ...qg,
        question: qg.question.map((q) => {
          return transformed.find((t) => t.id === q.id)
        })
      }
    })
  }
}

export const Webform = ({
  forms,
  onChange,
  onFinish,
  style,
  sidebar = true
}) => {
  forms = translateForm(forms)
  const [form] = Form.useForm()
  const [current, setCurrent] = useState({})
  const [activeGroup, setActiveGroup] = useState(0)
  const [completeGroup, setCompleteGroup] = useState([])
  if (!forms?.question_group) {
    return 'Error Format'
  }

  const onComplete = (values) => {
    if (onFinish) {
      onFinish(values)
    }
  }

  const onCompleteFailed = (values, errorFields) => {
    console.log(values, errorFields)
  }

  const onValuesChange = (fr, qg, value, values) => {
    const errors = fr.getFieldsError()
    const filled = Object.keys(values)
      .map((k) => ({ id: parseInt(k), value: values[k] }))
      .filter((x) => x.value)
    const incomplete = errors.map((e) => e.name[0])
    const completeQg = qg
      .map((x, ix) => {
        const ids = x.question.map((q) => q.id)
        const mandatory = intersection(incomplete, ids)
        const filledMandatory = filled.filter((f) => mandatory.includes(f.id))
        return { i: ix, complete: filledMandatory.length === mandatory.length }
      })
      .filter((x) => x.complete)
    setCompleteGroup(completeQg.map((qg) => qg.i))
    if (onChange) {
      setCurrent(values)
      onChange({
        current: value,
        values: values,
        progress: (filled.length / errors.length) * 100
      })
    }
  }

  return (
    <Row className='arf-container'>
      <Col span={24} className='arf-form-header'>
        <Row align='middle'>
          <Col span={20}>
            <h1>{forms?.name}</h1>
          </Col>
          <Col span={4}>
            <Button
              type='primary'
              htmlType='submit'
              onClick={() => form.submit()}
            >
              Submit
            </Button>
          </Col>
        </Row>
      </Col>
      {sidebar && (
        <Col span={6}>
          <List
            bordered={false}
            header={<div className='arf-sidebar-header'>form overview</div>}
            dataSource={forms?.question_group}
            renderItem={(item, key) => (
              <List.Item
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`arf-sidebar-list ${
                  activeGroup === key ? 'arf-active' : ''
                } ${completeGroup.includes(key) ? 'arf-complete' : ''}`}
              >
                {completeGroup.includes(key) ? (
                  <MdCheckCircle className='arf-icon' />
                ) : (
                  <MdRadioButtonChecked className='arf-icon' />
                )}
                {item?.name || `Section ${key + 1}`}
              </List.Item>
            )}
          />
        </Col>
      )}
      <Col span={sidebar ? 18 : 24}>
        <Form
          form={form}
          layout='vertical'
          name={forms.name}
          scrollToFirstError='true'
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(form, forms.question_group, value, values)
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onCompleteFailed}
          style={style}
        >
          {forms?.question_group.map((g, key) => {
            return (
              <Card
                key={key}
                title={
                  <div className='arf-field-group-header'>
                    {g.name || `Section ${key + 1}`}
                  </div>
                }
                className={`arf-field-group ${
                  activeGroup !== key && sidebar ? 'arf-hidden' : ''
                }`}
              >
                <Question
                  fields={g.question}
                  cascade={forms.cascade}
                  form={form}
                  current={current}
                />
              </Card>
            )
          })}
          <Row>
            <Col span={24}>
              <Card>
                <Form.Item className='arf-submit arf-bottom'>
                  <Button type='primary' htmlType='submit'>
                    Submit
                  </Button>
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Form>
      </Col>
    </Row>
  )
}
