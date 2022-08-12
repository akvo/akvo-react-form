import React from 'react'
import { Form, Input } from 'antd'
import { Extra, FieldLabel } from '../support'

function checkIsPromise(val) {
  if (
    val !== null &&
    typeof val === 'object' &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  ) {
    return true
  }
  return false
}

const fnRegex =
  /^function(?:.+)?(?:\s+)?\((.+)?\)(?:\s+|\n+)?\{(?:\s+|\n+)?((?:.|\n)+)\}$/m
const fnEcmaRegex = /^\((.+)?\)(?:\s+|\n+)?=>(?:\s+|\n+)?((?:.|\n)+)$/m

const getFnMetadata = (fnString) => {
  const fnMetadata = fnRegex.exec(fnString) || fnEcmaRegex.exec(fnString)
  if (fnMetadata.length >= 3) {
    const fn = fnMetadata[2].split(' ')
    return fn[0] === 'return' ? fnMetadata[2] : `return ${fnMetadata[2]}`
  }
  return false
}

const generateFnBody = (fnMetadata, getFieldValue) => {
  if (!fnMetadata) {
    return false
  }
  const fnBody = fnMetadata
    .trim()
    .split(' ')
    .map((f) => {
      f = f.trim()
      const meta = f.match(/#([0-9]*)/)
      if (meta) {
        let val = getFieldValue([meta[1]])
        if (!val) {
          return null
        }
        if (typeof val === 'number') {
          val = Number(val)
        }
        if (typeof val === 'string') {
          val = `"${val}"`
        }
        const fnMatch = f.match(/#([0-9]*|[0-9]*\..+)+/)
        if (fnMatch) {
          val = fnMatch[1] === meta[1] ? val : val + fnMatch[1]
        }
        return val
      }
      const n = f.match(/(^[0-9]*$)/)
      if (n) {
        return Number(n[1])
      }
      return f
    })
  if (fnBody.filter((x) => !x).length) {
    return false
  }
  return fnBody.join(' ')
}

const strToFunction = (fnString, getFieldValue) => {
  const fnMetadata = getFnMetadata(fnString)
  const fnBody = generateFnBody(fnMetadata, getFieldValue)
  return new Function(fnBody)
}

const strMultilineToFunction = (fnString, getFieldValue) => {
  const fnBody = generateFnBody(fnString, getFieldValue)
  return new Function(fnBody)()
}

const TypeAutoField = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  getFieldValue,
  setFieldsValue,
  fn
}) => {
  let automateValue = null
  if (fn?.multiline) {
    automateValue = strMultilineToFunction(fn?.fnString, getFieldValue)
  } else {
    automateValue = strToFunction(fn?.fnString, getFieldValue)
  }
  if (automateValue) {
    if (checkIsPromise(automateValue())) {
      automateValue().then((res) => setFieldsValue({ [id]: res }))
    } else {
      setFieldsValue({ [id]: automateValue() })
    }
  } else {
    setFieldsValue({ [id]: null })
  }
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []
  return (
    <Form.Item
      className='arf-field'
      label={<FieldLabel keyform={keyform} content={name} />}
      tooltip={tooltip?.text}
      required={required}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => <Extra key={exi} {...ex} />)}
      <Form.Item
        className='arf-field-child'
        key={keyform}
        name={id}
        rules={rules}
        required={required}
      >
        <Input
          sytle={{ width: '100%' }}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          disabled={true}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}
export default TypeAutoField
