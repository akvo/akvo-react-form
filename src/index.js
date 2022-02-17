import React, { useState, useMemo } from 'react'
import { Row, Col, Card, Button, Form, Input, List, Space, Table } from 'antd'
import {
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
  MdDelete
} from 'react-icons/md'
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

export const AkvoReactCard = Card
export const AkvoReactTable = Table

const mapRules = ({ rule, type }) => {
  if (type === 'number') {
    return [{ ...rule, type: 'number' }]
  }
  return [{}]
}

export const QuestionFields = ({ rules, cascade, form, index, field }) => {
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

const modifyDependency = ({ question }, { dependency }, repeat) => {
  const questions = question.map((q) => q.id)
  return dependency.map((d) => {
    if (questions.includes(d.id) && repeat) {
      return { ...d, id: `${d.id}-${repeat}` }
    }
    return d
  })
}

export const Question = ({ group, fields, cascade, form, current, repeat }) => {
  fields = fields.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` }
    }
    return field
  })
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
      const modifiedDependency = modifyDependency(group, field, repeat)
      return (
        <Form.Item noStyle key={key} shouldUpdate={current}>
          {(f) => {
            const unmatches = modifiedDependency
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

export const FieldGroupHeader = ({ group, index, updateRepeat }) => {
  const heading = group.name || `Section ${index + 1}`
  const repeat = group?.repeat
  const repeatText = group?.repeat_text

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
        <Col span={24} className='arf-repeat-input'>
          <div className='arf-field-title'>
            {repeatText ? repeatText : `Number of ${heading}`}
          </div>
          <Input.Group compact size='small' className='arf-field'>
            <Button
              size='small'
              icon={<MinusOutlined />}
              onClick={() => updateRepeat(index, repeat - 1, 'delete')}
              disabled={repeat < 2}
              className={repeat < 2 ? 'arf-disabled' : ''}
            />
            <Input
              style={{
                width: '40px',
                textAlign: 'center',
                backgroundColor: '#fff',
                border: 'none',
                color: '#6a6a6a',
                padding: '2.5px',
                fontWeight: 'bold'
              }}
              value={repeat}
              disabled
            />
            <Button
              size='small'
              icon={<PlusOutlined />}
              onClick={() => updateRepeat(index, repeat + 1, 'add')}
            />
          </Input.Group>
        </Col>
      </Row>
    </div>
  )
}

export const DeleteSelectedRepeatButton = ({
  index,
  group,
  repeat,
  updateRepeat
}) => {
  if (group?.repeat <= 1) {
    return ''
  }
  return (
    <Button
      type='link'
      className='arf-repeat-delete-btn'
      icon={<MdDelete className='arf-icon' />}
      onClick={() =>
        updateRepeat(index, group?.repeat - 1, 'delete-selected', repeat)
      }
    />
  )
}

export const RepeatTitle = ({ index, group, repeat, updateRepeat }) => {
  return (
    <div className='arf-repeat-title'>
      <Row justify='space-between' align='middle'>
        <Col span={20} align='start'>
          {group?.name}-{repeat + 1}
        </Col>
        <Col span={4} align='end'>
          <DeleteSelectedRepeatButton
            index={index}
            group={group}
            repeat={repeat}
            updateRepeat={updateRepeat}
          />
        </Col>
      </Row>
    </div>
  )
}

export const QuestionGroup = ({
  index,
  group,
  forms,
  activeGroup,
  form,
  current,
  sidebar,
  updateRepeat,
  repeats,
  headStyle
}) => {
  return (
    <Card
      key={index}
      title={
        <FieldGroupHeader
          group={group}
          index={index}
          updateRepeat={updateRepeat}
        />
      }
      className={`arf-field-group ${
        activeGroup !== index && sidebar ? 'arf-hidden' : ''
      }`}
      headStyle={headStyle}
    >
      {group?.description ? (
        <p className='arf-description'>{group.description}</p>
      ) : (
        ''
      )}
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && (
            <RepeatTitle
              index={index}
              group={group}
              repeat={r}
              updateRepeat={updateRepeat}
            />
          )}
          <Question
            group={group}
            fields={group.question}
            cascade={forms.cascade}
            form={form}
            current={current}
            repeat={r}
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
      let repeats = {}
      if (qg?.repeatable) {
        repeat = { repeat: 1 }
        repeats = { repeats: [0] }
      }
      return {
        ...qg,
        ...repeat,
        ...repeats,
        question: qg.question.map((q) => {
          return transformed.find((t) => t.id === q.id)
        })
      }
    })
  }
}

export const Webform = ({
  forms,
  customComponent = {},
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

  if (!formsMemo?.question_group) {
    return 'Error Format'
  }

  const updateRepeat = (index, value, operation, repeatIndex = null) => {
    const updated = formsMemo.question_group.map((x, xi) => {
      const isRepeatsAvailable = x?.repeats && x?.repeats?.length
      const repeatNumber = isRepeatsAvailable
        ? x.repeats[x.repeats.length - 1] + 1
        : value - 1
      let repeats = isRepeatsAvailable ? x.repeats : [0]
      if (xi === index) {
        if (operation === 'add') {
          repeats = [...repeats, repeatNumber]
        }
        if (operation === 'delete') {
          repeats.pop()
        }
        if (operation === 'delete-selected' && repeatIndex !== null) {
          repeats = repeats.filter((r) => r !== repeatIndex)
        }
        return { ...x, repeat: value, repeats: repeats }
      }
      return x
    })
    setCompleteGroup(
      completeGroup?.filter((c) => c !== `${index}-${value + 1}`)
    )
    setUpdatedQuestionGroup(updated)
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
      .map((k) => ({ id: k.toString(), value: values[k] }))
      .filter((x) => x.value)
    const incomplete = errors.map((e) => e.name[0])
    const completeQg = qg
      .map((x, ix) => {
        let ids = x.question.map((q) => q.id)
        // handle repeat group question
        let ixs = [ix]
        if (x?.repeatable) {
          let iter = x?.repeat
          const suffix = iter > 1 ? `-${iter - 1}` : ''
          do {
            const rids = x.question.map((q) => `${q.id}${suffix}`)
            ids = [...ids, ...rids]
            ixs = [...ixs, `${ix}-${iter}`]
            iter--
          } while (iter > 0)
        }
        // end of handle repeat group question
        const mandatory = intersection(incomplete, ids)?.map((id) =>
          id.toString()
        )
        const filledMandatory = filled.filter((f) => mandatory.includes(f.id))
        return {
          i: ixs,
          complete: filledMandatory.length === mandatory.length
        }
      })
      .filter((x) => x.complete)
    setCompleteGroup(completeQg.flatMap((qg) => qg.i))
    if (onChange) {
      setCurrent(values)
      onChange({
        current: value,
        values: values,
        progress: (filled.length / errors.length) * 100
      })
    }
  }

  const lastGroup = activeGroup + 1 === formsMemo?.question_group.length

  return (
    <Row className='arf-container'>
      <Col
        span={24}
        className={`arf-form-header ${sticky ? 'arf-sticky' : ''}`}
      >
        <Row align='middle'>
          <Col span={20}>
            <h1>{formsMemo?.name}</h1>
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
            dataSource={formsMemo?.question_group}
            renderItem={(item, key) => (
              <List.Item
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`arf-sidebar-list ${
                  activeGroup === key ? 'arf-active' : ''
                } ${
                  completeGroup.includes(
                    item?.repeatable ? `${key}-${item?.repeat}` : key
                  )
                    ? 'arf-complete'
                    : ''
                }`}
              >
                {completeGroup.includes(
                  item?.repeatable ? `${key}-${item?.repeat}` : key
                ) ? (
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
          {formsMemo?.question_group.map((g, key) => {
            const isRepeatable = g?.repeatable
            const repeats =
              g?.repeats && g?.repeats?.length
                ? g.repeats
                : range(isRepeatable ? g.repeat : 1)
            const headStyle =
              sidebar && isRepeatable
                ? {
                    backgroundColor: '#fff',
                    position: 'sticky',
                    top: sticky ? '59px' : 0,
                    zIndex: 9999
                  }
                : {}
            let QuestionGroupComponent = QuestionGroup
            if (g?.custom_component) {
              QuestionGroupComponent = customComponent?.[
                g.custom_component
              ] || <div>Custom component not found</div>
            }
            return (
              <QuestionGroupComponent
                key={key}
                index={key}
                group={g}
                forms={formsMemo}
                activeGroup={activeGroup}
                form={form}
                current={current}
                sidebar={sidebar}
                updateRepeat={updateRepeat}
                repeats={repeats}
                headStyle={headStyle}
              />
            )
          })}
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
