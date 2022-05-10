import React, { useState, useMemo, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Row, Col, Card, Button, Form, Input, List, Space, Select } from 'antd'
import {
  PlusOutlined,
  MinusOutlined,
  PlusSquareFilled
} from '@ant-design/icons'
import {
  MdRadioButtonChecked,
  MdCheckCircle,
  MdRepeat,
  MdDelete
} from 'react-icons/md'
import 'antd/dist/antd.min.css'
import './styles.module.css'
import moment from 'moment'
import { range, intersection, maxBy, isEmpty, takeRight } from 'lodash'
import {
  TypeOption,
  TypeMultipleOption,
  TypeDate,
  TypeCascade,
  TypeNumber,
  TypeInput,
  TypeText,
  TypeTree,
  TypeGeo
} from './fields'
import {
  transformForm,
  translateForm,
  mapRules,
  validateDependency,
  modifyDependency
} from './lib'
import { ErrorComponent, Print, IFrame } from './support'

export const QuestionFields = ({
  rules,
  cascade,
  tree,
  form,
  index,
  field,
  initialValue
}) => {
  switch (field.type) {
    case 'option':
      return <TypeOption keyform={index} rules={rules} {...field} />
    case 'multiple_option':
      return <TypeMultipleOption keyform={index} rules={rules} {...field} />
    case 'cascade':
      return (
        <TypeCascade
          keyform={index}
          cascade={cascade?.[field?.option]}
          rules={rules}
          form={form}
          initialValue={initialValue}
          {...field}
        />
      )
    case 'tree':
      return (
        <TypeTree
          keyform={index}
          tree={tree?.[field?.option]}
          rules={rules}
          form={form}
          {...field}
        />
      )
    case 'date':
      return <TypeDate keyform={index} rules={rules} {...field} />
    case 'number':
      return <TypeNumber keyform={index} rules={rules} {...field} />
    case 'geo':
      return (
        <TypeGeo
          keyform={index}
          rules={rules}
          form={form}
          initialValue={initialValue}
          {...field}
        />
      )
    case 'text':
      return <TypeText keyform={index} rules={rules} {...field} />
    default:
      return <TypeInput keyform={index} rules={rules} {...field} />
  }
}

export const Question = ({
  group,
  fields,
  tree,
  cascade,
  form,
  current,
  repeat,
  initialValue
}) => {
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
                tree={tree}
                field={field}
                initialValue={
                  initialValue?.find((i) => i.question === field.id)?.value
                }
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
        tree={tree}
        cascade={cascade}
        field={field}
        initialValue={initialValue?.find((i) => i.question === field.id)?.value}
      />
    )
  })
}

export const FieldGroupHeader = ({ group, index, updateRepeat }) => {
  const heading = group.name || `Section ${index + 1}`
  const repeat = group?.repeat
  const repeatText = group?.repeatText || `Number of ${heading}`
  const repeatButtonPlacement = group?.repeatButtonPlacement

  if (!group?.repeatable) {
    return <div className='arf-field-group-header'>{heading}</div>
  }
  return (
    <div className='arf-field-group-header'>
      <Space>
        {heading}
        <MdRepeat />
      </Space>
      {(!repeatButtonPlacement || repeatButtonPlacement === 'top') && (
        <Row align='middle'>
          <Col span={24} className='arf-repeat-input'>
            <div className='arf-field-title'>{repeatText}</div>
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
      )}
    </div>
  )
}

export const BottomGroupButton = ({ group, index, updateRepeat }) => {
  const heading = group.name || 'Section'
  const repeat = group?.repeat
  const repeatText = group?.repeatText || `Add another ${heading}`
  const repeatButtonPlacement = group?.repeatButtonPlacement

  if (!repeatButtonPlacement || repeatButtonPlacement === 'top') {
    return ''
  }

  return (
    <div className='arf-repeat-title arf-field-group-bottom-button'>
      <Button
        block
        type='link'
        onClick={() => updateRepeat(index, repeat + 1, 'add')}
      >
        <PlusSquareFilled />
        {repeatText}
      </Button>
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
  initialValue,
  headStyle,
  showGroup
}) => {
  const isGroupAppear = showGroup.includes(index)
  return (
    <Card
      key={index}
      title={
        isGroupAppear && (
          <FieldGroupHeader
            group={group}
            index={index}
            updateRepeat={updateRepeat}
          />
        )
      }
      className={`arf-field-group ${
        activeGroup !== index && sidebar ? 'arf-hidden' : ''
      }`}
      headStyle={headStyle}
    >
      {group?.description && isGroupAppear ? (
        <div className='arf-description'>{group.description}</div>
      ) : (
        ''
      )}
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && isGroupAppear && (
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
            tree={forms.tree}
            form={form}
            current={current}
            initialValue={initialValue.filter((x) => {
              return (
                r === (x?.repeatIndex ? x.repeatIndex : 0) &&
                group.question.map((g) => g.id).includes(x.question)
              )
            })}
            repeat={r}
          />
        </div>
      ))}
      {isGroupAppear && (
        <BottomGroupButton
          group={group}
          index={index}
          updateRepeat={updateRepeat}
        />
      )}
    </Card>
  )
}

const IFrame = ({ children }) => {
  const [iframeBody, setIframeBody] = useState(null)

  const handleLoad = (event) => {
    const iframe = event.target
    if (iframe?.contentDocument) {
      const head = iframe.contentDocument.head
      if (head) {
        let css = '@page {'
        css += 'size: 210mm 297mm; margin: 15mm;'
        css += '}'
        const style = document.createElement('style')
        style.type = 'text/css'
        style.media = 'print'
        if (style.styleSheet) {
          style.styleSheet.cssText = css
        } else {
          style.appendChild(document.createTextNode(css))
        }
        head.appendChild(style)
      }
      setIframeBody(iframe.contentDocument.body)
    }
  }

  return (
    <iframe
      id='arf-print-iframe'
      title={Math.random()}
      width={0}
      height={0}
      frameBorder={0}
      onLoad={handleLoad}
    >
      {iframeBody && ReactDOM.createPortal(children, iframeBody)}
    </iframe>
  )
}

export const Webform = ({
  forms,
  style,
  sidebar = true,
  sticky = false,
  initialValue = [],
  submitButtonSetting = {},
  extraButton = '',
  printConfig = {
    showButton: false,
    hideInputType: [],
    header: ''
  },
  customComponent = {},
  onChange = () => {},
  onFinish = () => {},
  onCompleteFailed = () => {}
}) => {
  const originalForms = forms
  forms = transformForm(forms)
  const [form] = Form.useForm()
  const [current, setCurrent] = useState({})
  const [activeGroup, setActiveGroup] = useState(0)
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [completeGroup, setCompleteGroup] = useState([])
  const [showGroup, setShowGroup] = useState([])
  const [updatedQuestionGroup, setUpdatedQuestionGroup] = useState([])
  const [lang, setLang] = useState(forms?.defaultLanguage || 'en')
  const [isPrint, setIsPrint] = useState(false)

  const formsMemo = useMemo(() => {
    if (updatedQuestionGroup?.length) {
      forms = {
        ...forms,
        question_group: updatedQuestionGroup
      }
    }
    const translated = translateForm(forms, lang)
    return translated
  }, [lang, forms, updatedQuestionGroup])

  if (!formsMemo?.question_group) {
    return 'Error Format'
  }

  const handleBtnPrint = () => {
    setIsPrint(true)
    setTimeout(() => {
      const print = document.getElementById('arf-print-iframe')
      if (print) {
        print.focus()
        print.contentWindow.print()
      }
      setIsPrint(false)
    }, 2500)
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

  const onValuesChange = (fr, qg, value, values) => {
    const errors = fr.getFieldsError()
    const data = Object.keys(values).map((k) => ({
      id: k.toString(),
      value: values[k]
    }))

    const filled = data.filter((x) => x.value)
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

    const appearQuestion = Object.keys(fr.getFieldsValue()).map((x) =>
      parseInt(x.replace('-', ''))
    )
    const appearGroup = forms?.question_group
      ?.map((qg, qgi) => {
        const appear = intersection(
          qg.question.map((q) => q.id),
          appearQuestion
        )
        return { groupIndex: qgi, appearQuestion: appear.length }
      })
      .filter((x) => x.appearQuestion)
      .map((x) => x.groupIndex)
    setShowGroup(appearGroup)

    if (onChange) {
      setCurrent(values)
      onChange({
        current: value,
        values: values,
        progress: (filled.length / errors.length) * 100
      })
    }
  }

  useEffect(() => {
    setLoadingInitial(true)
    let values = {}
    const allQuestions =
      forms?.question_group
        ?.map((qg, qgi) => qg.question.map((q) => ({ ...q, groupIndex: qgi })))
        ?.flatMap((q) => q) || []
    const groupRepeats = forms?.question_group?.map((qg) => {
      const q = initialValue.filter((i) =>
        qg.question.map((q) => q.id).includes(i.question)
      )
      const rep = maxBy(q, 'repeatIndex')?.repeatIndex
      if (rep) {
        return { ...qg, repeat: rep + 1, repeats: range(rep + 1) }
      }
      return qg
    })
    setUpdatedQuestionGroup(groupRepeats)

    for (const val of initialValue) {
      const question = allQuestions.find((q) => q.id === val.question)
      const objName = val?.repeatIndex
        ? `${val.question}-${val.repeatIndex}`
        : val.question
      values = val?.value
        ? {
            ...values,
            [objName]: question?.type !== 'date' ? val.value : moment(val.value)
          }
        : values
    }
    if (isEmpty(values)) {
      form.resetFields()
      setCompleteGroup([])
      setLoadingInitial(false)
    } else {
      form.setFieldsValue(values)
      setTimeout(() => {
        onValuesChange(
          form,
          groupRepeats,
          values[Object.keys(values)[0]],
          values
        )
        setLoadingInitial(false)
      }, 1000)
    }
    const appearQuestion = Object.keys(form.getFieldsValue()).map((x) =>
      parseInt(x.replace('-', ''))
    )
    const appearGroup = forms?.question_group
      ?.map((qg, qgi) => {
        const appear = intersection(
          qg.question.map((q) => q.id),
          appearQuestion
        )
        return { groupIndex: qgi, appearQuestion: appear.length }
      })
      .filter((x) => x.appearQuestion)
      .map((x) => x.groupIndex)
    setShowGroup(appearGroup)
  }, [initialValue])

  const lastGroup = takeRight(showGroup)

  return (
    <Row className='arf-container'>
      <Col
        span={24}
        className={`arf-form-header ${sticky ? 'arf-sticky' : ''}`}
      >
        <Row align='middle'>
          <Col span={12}>
            <h1>{formsMemo?.name}</h1>
          </Col>
          <Col span={12} align='right'>
            <Space>
              <Select
                options={formsMemo.languages}
                onChange={setLang}
                defaultValue={formsMemo?.defaultLanguage || 'en'}
                style={{ width: 150, textAlign: 'left' }}
              />
              {loadingInitial ? (
                <Button type='secondary' loading disabled>
                  Loading Initial Data
                </Button>
              ) : (
                <Button
                  type='primary'
                  htmlType='submit'
                  onClick={() => form.submit()}
                  {...submitButtonSetting}
                >
                  Submit
                </Button>
              )}
              {extraButton}
              {printConfig.showButton && (
                <Button
                  ghost
                  type='primary'
                  onClick={handleBtnPrint}
                  loading={isPrint}
                >
                  Print
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Col>
      {sidebar && (
        <Col span={6} className={`arf-sidebar ${sticky ? 'arf-sticky' : ''}`}>
          <List
            bordered={false}
            header={<div className='arf-sidebar-header'>form overview</div>}
            dataSource={formsMemo?.question_group?.map((qg, qgi) => ({
              ...qg,
              appear: showGroup.includes(qgi)
            }))}
            renderItem={(item, key) =>
              item.appear && (
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
              )
            }
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
              sidebar && sticky && isRepeatable
                ? {
                    backgroundColor: '#fff',
                    position: 'sticky',
                    top: sticky ? '59px' : 0,
                    zIndex: 9999
                  }
                : {}
            let QuestionGroupComponent = QuestionGroup
            if (g?.custom_component) {
              QuestionGroupComponent =
                customComponent?.[g.custom_component] || ErrorComponent
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
                initialValue={initialValue}
                showGroup={showGroup}
              />
            )
          })}
        </Form>
        {sidebar &&
          formsMemo?.question_group.map(
            (_, key) =>
              activeGroup === key &&
              !lastGroup.includes(key) && (
                <Col span={24} key={key} className='arf-next'>
                  <Button
                    type='default'
                    onClick={() => {
                      const nextIndex = showGroup.indexOf(key)
                      setActiveGroup(showGroup[nextIndex + 1])
                    }}
                  >
                    Next
                  </Button>
                </Col>
              )
          )}
      </Col>
      {isPrint && (
        <IFrame>
          <Print forms={originalForms} lang={lang} printConfig={printConfig} />
        </IFrame>
      )}
    </Row>
  )
}
