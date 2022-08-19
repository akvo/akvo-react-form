import React, { useState, useMemo, useEffect } from 'react'
import { Row, Col, Card, Button, Form, Input, Space, Select } from 'antd'
import {
  PlusOutlined,
  MinusOutlined,
  PlusSquareFilled
} from '@ant-design/icons'
import { MdRepeat, MdDelete } from 'react-icons/md'
import 'antd/dist/antd.min.css'
import './styles.module.css'
import moment from 'moment'
import {
  range,
  intersection,
  maxBy,
  isEmpty,
  takeRight,
  take,
  get,
  orderBy,
  chain,
  groupBy
} from 'lodash'
import {
  TypeOption,
  TypeMultipleOption,
  TypeDate,
  TypeCascade,
  TypeNumber,
  TypeInput,
  TypeText,
  TypeTree,
  TypeGeo,
  TypeAutoField
} from './fields'
import {
  transformForm,
  translateForm,
  mapRules,
  validateDependency,
  modifyDependency,
  todayDate,
  detectMobile
} from './lib'
import { ErrorComponent, Print, IFrame, MobileFooter, Sidebar } from './support'
import axios from 'axios'
import { Excel } from 'antd-table-saveas-excel'

export const DownloadAnswerAsExcel = ({
  question_group: questionGroup,
  answers,
  horizontal = true,
  filename
}) => {
  let columns = []
  if (horizontal) {
    columns = orderBy(questionGroup, 'order').map((qg) => {
      const childrens = qg?.question
        ? orderBy(qg.question, 'order').map((q) => {
            return {
              title: q.name,
              dataIndex: q.id,
              key: q.id
            }
          })
        : []
      return {
        title: qg.name,
        children: childrens
      }
    })
  }
  if (!horizontal) {
    columns = [
      {
        title: 'Question',
        dataIndex: 'question',
        key: 'question',
        render: (text, row) => {
          if (row?.isGroup) {
            return {
              children: text,
              props: {
                colSpan: 3
              }
            }
          }
          return text
        }
      },
      {
        title: 'Repeat Index',
        dataIndex: 'repeatIndex',
        key: 'repeatIndex'
      },
      {
        title: 'Answer',
        dataIndex: 'answer',
        key: 'answer'
      }
    ]
  }

  let questions = []
  if (horizontal) {
    questions = questionGroup.flatMap((qg) => {
      const qs = qg.question.map((q) => ({
        ...q,
        repeatable: qg.repeatable || false
      }))
      return qs
    })
  }
  if (!horizontal) {
    questions = []
    orderBy(questionGroup, 'order').forEach((qg) => {
      questions.push({
        id: qg.id,
        name: qg.name,
        isGroup: true
      })
      orderBy(qg.question, 'order').forEach((q) => {
        questions.push({ ...q, repeatable: qg.repeatable || false })
      })
    })
  }

  const metadata = []
  const transformAnswers = Object.keys(answers).map((key) => {
    const q = questions.find((q) => q.id === parseInt(key))
    let val = answers?.[key]
    let qid = q.id
    let repeatIndex = 0
    if (q.repeatable) {
      const splitted = key.split('-')
      if (splitted.length === 2) {
        qid = parseInt(splitted[0])
        repeatIndex = parseInt(splitted[1])
      }
    }
    if (['input', 'text'].includes(q.type)) {
      val = val ? val.trim() : val
    }
    if (q.type === 'geo') {
      val = `${val?.lat} | ${val?.lng}`
    }
    if (q.type === 'date' && val) {
      val = val.format('DD/MM/YYYY')
    }
    if (
      ['option', 'multiple_option', 'cascade'].includes(q.type) &&
      Array.isArray(val)
    ) {
      val = val.join(' | ')
    }
    if (q.type === 'tree' && Array.isArray(val)) {
      val = val.join(' - ')
    }
    if (q.type === 'number') {
      val = Number(val)
    }
    if (q.type === 'autofield') {
      val = val !== 0 ? val : ''
    }
    if (q?.meta) {
      metadata.push(val)
    }
    return {
      id: qid,
      repeatIndex: repeatIndex,
      value: val || ''
    }
  })

  let dataSource = []
  if (horizontal) {
    dataSource = chain(groupBy(transformAnswers, 'repeatIndex'))
      .map((value) =>
        value.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.id]: curr.value
          }),
          {}
        )
      )
      .value()
  }
  if (!horizontal) {
    dataSource = questions.flatMap((q) => {
      const answer = transformAnswers.filter((a) => a.id === q.id)
      const res = {
        question: q.name,
        isGroup: q?.isGroup || false
      }
      if (answer.length) {
        return answer.map((a) => ({
          ...res,
          repeatIndex: a.repeatIndex,
          answer: a.value
        }))
      }
      return res
    })
  }

  const defaultFilename = `data-${moment().format('DD-MM-YYYY')}`
  const saveAsFilename = `${
    filename || metadata.length
      ? metadata.map((md) => String(md).trim()).join('-')
      : defaultFilename
  }.xlsx`

  const excel = new Excel()
  excel
    .addSheet('data')
    .addColumns(columns)
    .addDataSource(dataSource, {
      str2Percent: true,
      str2num: true
    })
    .saveAs(saveAsFilename)
}

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
    case 'autofield':
      return (
        <TypeAutoField
          keyform={index}
          rules={rules}
          getFieldValue={form.getFieldValue}
          setFieldsValue={form.setFieldsValue}
          {...field}
        />
      )
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
  const [hintLoading, setHintLoading] = useState(false)
  const [hintValue, setHintValue] = useState({})

  fields = fields.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` }
    }
    return field
  })
  return fields.map((field, key) => {
    let rules = [
      {
        validator: (_, value) => {
          const requiredErr = `${field.name.props.children[0]} is required`
          const decimalError =
            'Decimal values are not allowed for this question'
          if (field?.required) {
            if (field?.type === 'number' && !field?.rule?.allowDecimal) {
              return parseFloat(value) % 1 === 0
                ? Promise.resolve()
                : value
                ? Promise.reject(new Error(decimalError))
                : Promise.reject(new Error(requiredErr))
            }
            return value || value === 0
              ? Promise.resolve()
              : Promise.reject(new Error(requiredErr))
          }
          if (field?.type === 'number' && !field?.rule?.allowDecimal) {
            return parseFloat(value) % 1 === 0 || !value
              ? Promise.resolve()
              : Promise.reject(new Error(decimalError))
          }
          return Promise.resolve()
        }
      }
    ]
    if (field?.rule) {
      rules = [...rules, ...mapRules(field)]
    }
    // hint
    let hint = ''
    if (field?.hint) {
      const showHintValue = () => {
        setHintLoading(field.id)
        if (hintValue?.[field.id]) {
          delete hintValue?.[field.id]
        }
        if (field.hint?.endpoint) {
          axios
            .get(field.hint.endpoint)
            .then((res) => {
              let data = [res.data.mean]
              if (field.hint?.path && field.hint?.path?.length) {
                data = field.hint.path.map((p) => get(res.data, p))
              }
              setHintValue({ ...hintValue, [field.id]: data })
            })
            .catch((err) => {
              console.error(err)
            })
            .finally(() => {
              setHintLoading(false)
            })
        }
        if (field.hint?.static && !field.hint?.endpoint) {
          setTimeout(() => {
            setHintLoading(false)
            setHintValue({ ...hintValue, [field.id]: [field.hint.static] })
          }, 500)
        }
      }
      hint = (
        <Form.Item
          className='arf-field'
          style={{ marginTop: -10, paddingTop: 0 }}
        >
          <Space>
            <Button
              type='primary'
              size='small'
              ghost
              onClick={() => showHintValue()}
              loading={hintLoading === field.id}
            >
              {field.hint?.buttonText || 'Validate value'}
            </Button>
            {!isEmpty(hintValue) &&
              hintValue?.[field.id] &&
              hintValue[field.id].join(', ')}
          </Space>
        </Form.Item>
      )
    }
    // eol of hint
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
              <div key={`question-${field.id}`}>
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
                {hint}
              </div>
            )
          }}
        </Form.Item>
      )
    }
    return (
      <div key={`question-${field.id}`}>
        <QuestionFields
          rules={rules}
          form={form}
          key={key}
          index={key}
          tree={tree}
          cascade={cascade}
          field={field}
          initialValue={
            initialValue?.find((i) => i.question === field.id)?.value
          }
        />
        {hint}
      </div>
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
    header: '',
    filename: null
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
  const [isMobile, setIsMobile] = useState(detectMobile())
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false)
  const originalDocTitle = document.title

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setIsMobile(detectMobile())
  })

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

  const sidebarProps = useMemo(() => {
    return {
      formsMemo: formsMemo,
      showGroup: showGroup,
      activeGroup: activeGroup,
      setActiveGroup: setActiveGroup,
      completeGroup: completeGroup
    }
  }, [sticky, formsMemo, showGroup])

  const handleBtnPrint = () => {
    setIsPrint(true)
    setTimeout(() => {
      const print = document.getElementById('arf-print-iframe')
      if (print) {
        const { filename } = printConfig
        const title = filename || `${formsMemo?.name}_${todayDate()}`
        // change iframe title
        print.contentDocument.title = title
        // change document title
        document.title = title
        print.focus()
        print.contentWindow.print()
      }
      setIsPrint(false)
      document.title = originalDocTitle
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

  const onValuesChange = (fr, qg, value /*, values */) => {
    const values = fr.getFieldsValue()
    const errors = fr.getFieldsError()
    const data = Object.keys(values).map((k) => ({
      id: k.toString(),
      value: values[k]
    }))

    const incomplete = errors.map((e) => e.name[0])
    const incompleteWithMoreError = errors
      .filter((e) => e.errors.length)
      .map((e) => e.name[0])
    // mark as filled for 0 number input and check if that input has an error
    const filled = data.filter(
      (x) =>
        (x.value || x.value === 0) &&
        !incompleteWithMoreError.includes(parseInt(x.id))
    )
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
    if (initialValue.length) {
      setLoadingInitial(true)
      let values = {}
      const allQuestions =
        forms?.question_group
          ?.map((qg, qgi) =>
            qg.question.map((q) => ({ ...q, groupIndex: qgi }))
          )
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
        // handle to show also 0 init value from number
        values =
          val?.value || val?.value === 0
            ? {
                ...values,
                [objName]:
                  question?.type !== 'date' ? val.value : moment(val.value)
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
    }
  }, [initialValue])

  useEffect(() => {
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
  }, [])

  const firstGroup = take(showGroup)
  const lastGroup = takeRight(showGroup)

  const PrevNextButton = () => {
    return formsMemo?.question_group.map((_, key) => {
      return (
        activeGroup === key && (
          <Col span={24} key={key} className='arf-next'>
            <Space>
              <Button
                className='arf-btn-previous'
                type='default'
                disabled={firstGroup?.includes(key)}
                onClick={() => {
                  const prevIndex = showGroup.indexOf(key)
                  setActiveGroup(showGroup[prevIndex - 1])
                }}
              >
                Previous
              </Button>
              <Button
                className='arf-btn-next'
                type='default'
                disabled={lastGroup.includes(key)}
                onClick={() => {
                  const nextIndex = showGroup.indexOf(key)
                  setActiveGroup(showGroup[nextIndex + 1])
                }}
              >
                Next
              </Button>
            </Space>
          </Col>
        )
      )
    })
  }

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

      {/* Sidebar */}
      {sidebar && !isMobile && (
        <Col span={6} className={`arf-sidebar ${sticky ? 'arf-sticky' : ''}`}>
          <Sidebar {...sidebarProps} />
        </Col>
      )}

      {/* Form */}
      <Col span={sidebar && !isMobile ? 18 : 24}>
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

        {/* Previous & Next Button */}
        {sidebar && !isMobile && <PrevNextButton />}
      </Col>

      {/* Mobile Footer */}
      {sidebar && isMobile && (
        <MobileFooter
          form={form}
          isMobile={isMobile}
          isMobileMenuVisible={isMobileMenuVisible}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
          sidebarProps={sidebarProps}
          isSaveFeatureEnabled={false}
        />
      )}

      {isPrint && (
        <IFrame>
          <Print forms={originalForms} lang={lang} printConfig={printConfig} />
        </IFrame>
      )}
    </Row>
  )
}
