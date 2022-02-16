import React, { useState, useMemo } from 'react'
import { Row, Col, Card, Button, Form, Input, List, Space } from 'antd'
import { MdRadioButtonChecked, MdCheckCircle, MdRepeat } from 'react-icons/md'
import { PlusOutlined, MinusOutlined } from '@ant-design/icons'
import Maps from './support/Maps'
import 'antd/dist/antd.min.css'
import './styles.module.css'
import intersection from 'lodash/intersection'
import range from 'lodash/range'
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
            tooltip={field?.tooltip?.text}
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

const FieldGroupHeader = ({ group, index, forms, setUpdatedQuestionGroup }) => {
  const heading = group.name || `Section ${index + 1}`
  const repeat = group?.repeat

  const updateRepeat = (value) => {
    const updated = forms.question_group.map((x, xi) => {
      if (xi === index) {
        return { ...x, repeat: value }
      }
      return x
    })
    setUpdatedQuestionGroup(updated)
  }

  if (!group?.repeatable) {
    return <div className='arf-field-group-header'>{heading}</div>
  }
  return (
    <div className='arf-field-group-header'>
      <Space>
        {heading}
        <MdRepeat />
      </Space>
      <Row align='middle'>
        <Col span={24}>
          <Space>
            <div>Number of {heading}</div>
            <Input.Group compact size='small'>
              <Button
                size='small'
                icon={<MinusOutlined />}
                onClick={() => updateRepeat(repeat - 1)}
                disabled={repeat < 2}
              />
              <Input
                size='small'
                style={{ width: '40px', textAlign: 'center' }}
                value={repeat}
                disabled
              />
              <Button
                size='small'
                icon={<PlusOutlined />}
                onClick={() => updateRepeat(repeat + 1)}
              />
            </Input.Group>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

const QuestionGroup = ({
  index,
  group,
  forms,
  setUpdatedQuestionGroup,
  activeGroup,
  form,
  current,
  sidebar
}) => {
  const repeats = range(group?.repeatable ? group.repeat : 1)

  return (
    <Card
      key={index}
      title={
        <FieldGroupHeader
          group={group}
          index={index}
          forms={forms}
          setUpdatedQuestionGroup={setUpdatedQuestionGroup}
        />
      }
      className={`arf-field-group ${
        activeGroup !== index && sidebar ? 'arf-hidden' : ''
      }`}
    >
      {group?.description ? (
        <p className='arf-description'>{group.description}</p>
      ) : (
        ''
      )}
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && (
            <div
              style={{
                margin: '20px -25px',
                padding: '7px 45px',
                background: '#f0f0f0'
              }}
            >
              {group?.name}-{r + 1}
            </div>
          )}
          <Question
            fields={group.question}
            cascade={forms.cascade}
            form={form}
            current={current}
          />
        </div>
      ))}
    </Card>
  )
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
      let repeat = {}
      if (qg?.repeatable) {
        repeat = { repeat: 1 }
      }
      return {
        ...qg,
        ...repeat,
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
  sidebar = true,
  sticky = false
}) => {
  forms = translateForm(forms)
  const [form] = Form.useForm()
  const [current, setCurrent] = useState({})
  const [activeGroup, setActiveGroup] = useState(0)
  const [completeGroup, setCompleteGroup] = useState([])
  const [updatedQuestionGroup, setUpdatedQuestionGroup] = useState([])

  const formsMemo = useMemo(() => {
    if (updatedQuestionGroup?.length) {
      return {
        ...forms,
        question_group: updatedQuestionGroup
      }
    }
    return forms
  }, [forms, updatedQuestionGroup])

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

  const lastGroup = activeGroup + 1 === forms?.question_group.length

  return (
    <Row className='arf-container'>
      <Col
        span={24}
        className={`arf-form-header ${sticky ? 'arf-sticky' : ''}`}
      >
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
        <Col span={6} className={`arf-sidebar ${sticky ? 'arf-sticky' : ''}`}>
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
          name={formsMemo.name}
          scrollToFirstError='true'
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(form, formsMemo.question_group, value, values)
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onCompleteFailed}
          style={style}
        >
          {formsMemo?.question_group.map((g, key) => (
            <QuestionGroup
              key={key}
              index={key}
              group={g}
              forms={formsMemo}
              setUpdatedQuestionGroup={setUpdatedQuestionGroup}
              activeGroup={activeGroup}
              form={form}
              current={current}
              sidebar={sidebar}
            />
          ))}
        </Form>
        {!lastGroup && sidebar && (
          <Col span={24} className='arf-next'>
            <Button
              type='default'
              onClick={() => {
                if (!lastGroup) {
                  setActiveGroup(activeGroup + 1)
                }
              }}
            >
              Next
            </Button>
          </Col>
        )}
      </Col>
    </Row>
  )
}
