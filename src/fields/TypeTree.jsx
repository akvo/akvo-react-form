import React from 'react'
import { Form, TreeSelect } from 'antd'
import { cloneDeep } from 'lodash'
import Extra from '../support/Extra'

const { SHOW_PARENT } = TreeSelect

const TypeTree = ({
  tree,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra
}) => {
  const treeData = cloneDeep(tree)
  const tProps = {
    treeData,
    treeCheckable: true,
    showCheckedStrategy: SHOW_PARENT,
    placeholder: 'Please select',
    style: {
      width: '100%'
    }
  }
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : []
  const extraAfter = extra ? extra.filter((ex) => ex.placement === 'after') : []
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
        tooltip={tooltip?.text}
      >
        <TreeSelect
          getPopupContainer={(trigger) => trigger.parentNode}
          {...tProps}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => <Extra key={exi} {...ex} />)}
    </Form.Item>
  )
}

export default TypeTree
