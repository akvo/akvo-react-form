import React from 'react'
import { Form, Input } from 'antd'
import { Extra, FieldLabel } from '../support'

const fnRegex =
  /^function(?:.+)?(?:\s+)?\((.+)?\)(?:\s+|\n+)?\{(?:\s+|\n+)?((?:.|\n)+)\}$/m
function strToFunction(fnString, getFieldValue) {
  const fnMetadata = fnRegex.exec(fnString)
  const fnBody = fnMetadata[2]
    .trim()
    .split(' ')
    .map((f) => {
      f = f.trim()
      const meta = f.match(/#([0-9]*)/)
      if (meta) {
        return getFieldValue([meta[1]])
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
  return new Function(fnBody.join(' '))
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
  const automateValue = strToFunction(fn, getFieldValue)
  if (automateValue) {
    setFieldsValue({ [id]: automateValue() })
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