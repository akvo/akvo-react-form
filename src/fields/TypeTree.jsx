import React from 'react'
import { Form, TreeSelect } from 'antd'
import { cloneDeep } from 'lodash'

const { SHOW_PARENT } = TreeSelect

const TypeTree = ({ tree, id, name, keyform, required, rules, tooltip }) => {
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
      key={keyform}
      name={id}
      label={`${keyform + 1}. ${name}`}
      rules={rules}
      required={required}
      tooltip={tooltip?.text}
    >
      <TreeSelect {...tProps} />
    </Form.Item>
  )
}

export default TypeTree
