import React, { useState, useEffect } from 'react'
import { Row, Col, Form, Cascader, Select } from 'antd'
import axios from 'axios'
import take from 'lodash/take'
import Extra from '../support/Extra'

const TypeCascadeApi = ({
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip,
  extraBefore,
  extraAfter,
  initialValue = []
}) => {
  const [cascade, setCascade] = useState([])
  const [selected, setSelected] = useState([])
  const { endpoint, initial, list } = api

  useEffect(() => {
    if (!initialValue.length) {
      const ep =
        initial !== undefined ? `${endpoint}/${initial}` : `${endpoint}`
      axios
        .get(ep)
        .then((res) => {
          const data = list ? res.data?.[list] : res.data
          setCascade([data])
        })
        .catch((err) => {
          console.error(err)
        })
    } else {
      let calls = []
      const ep =
        initial !== undefined ? `${endpoint}/${initial}` : `${endpoint}`
      const initCall = new Promise((resolve, reject) => {
        axios
          .get(ep)
          .then((res) => {
            const data = list ? res.data?.[list] : res.data
            resolve(data)
          })
          .catch((err) => {
            reject(err)
          })
      })
      calls = [initCall]
      for (const id of take(initialValue, initialValue.length - 1)) {
        const call = new Promise((resolve, reject) => {
          axios
            .get(`${endpoint}/${id}`)
            .then((res) => {
              const data = list ? res.data?.[list] : res.data
              resolve(data)
            })
            .catch((err) => {
              reject(err)
            })
        })
        calls = [...calls, call]
      }
      Promise.all(calls).then((values) => {
        setCascade(values)
        setSelected(initialValue)
      })
    }
  }, [])

  const handleChange = (value, index) => {
    if (!index) {
      setSelected([value])
      form.setFieldsValue({ [id]: [value] })
    } else {
      const prevValue = take(selected, index)
      const result = [...prevValue, value]
      setSelected(result)
      form.setFieldsValue({ [id]: result })
    }
    axios
      .get(`${endpoint}/${value}`)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data
        if (data.length) {
          const prevCascade = take(cascade, index + 1)
          setCascade([...prevCascade, ...[data]])
        }
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <Col>
      <Form.Item
        className='arf-field'
        label={`${keyform + 1}. ${name}`}
        tooltip={tooltip?.text}
      >
        <Form.Item
          className='arf-field-cascade'
          key={keyform}
          name={id}
          rules={rules}
          required={required}
        >
          <Select mode='multiple' options={[]} hidden />
        </Form.Item>
        <div className='arf-field-cascade-api'>
          {!!extraBefore?.length &&
            extraBefore.map((ex, exi) => <Extra key={exi} {...ex} />)}
          {cascade.map((c, ci) => {
            return (
              <Row
                key={`keyform-cascade-${ci}`}
                className='arf-field-cascade-list'
              >
                <Select
                  className='arf-cascade-api-select'
                  placeholder={`Select Level ${ci + 1}`}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  onChange={(e) => handleChange(e, ci)}
                  options={c.map((v) => ({ label: v.name, value: v.id }))}
                  value={selected?.[ci] || null}
                />
              </Row>
            )
          })}
          {!!extraAfter?.length &&
            extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
        </div>
      </Form.Item>
    </Col>
  )
}

const TypeCascade = ({
  cascade,
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  initialValue
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []
  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        rules={rules}
        tooltip={tooltip}
        initialValue={initialValue}
        extraBefore={extraBefore}
        extraAfter={extraAfter}
      />
    )
  }
  return (
    <Form.Item
      className='arf-field'
      label={`${keyform + 1}. ${name}`}
      tooltip={tooltip?.text}
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
        <Cascader
          options={cascade}
          getPopupContainer={(trigger) => trigger.parentNode}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}

export default TypeCascade
