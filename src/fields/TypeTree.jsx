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
  return (
    <Form.Item
      className='arf-field'
      label={`${keyform + 1}. ${name}`}
      tooltip={tooltip?.text}
    >
      {extra?.placement === 'before' && <Extra {...extra} />}
      <Form.Item
        className='arf-field-child'
        key={keyform}
        name={id}
        rules={rules}
        required={required}
        tooltip={tooltip?.text}
      >
        <TreeSelect {...tProps} />
      </Form.Item>
      {extra?.placement === 'after' && <Extra {...extra} />}
    </Form.Item>
  )
}

export default TypeTree
