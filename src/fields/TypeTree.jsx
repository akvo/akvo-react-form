import React from 'react';
import { Form, Tag, TreeSelect } from 'antd';
import { cloneDeep } from 'lodash';
import { Extra, FieldLabel, DataApiUrl } from '../support';

const { SHOW_PARENT, SHOW_CHILD } = TreeSelect;

const restructureTree = (parent, data) => {
  if (parent) {
    data.value = `${parent}|${data.value}`;
  }
  if (data?.children) {
    data.children = data.children.map((x) => restructureTree(data.value, x));
  }
  return data;
};

const TypeTree = ({
  tree,
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  checkStrategy = 'parent',
  expandAll = false,
  requiredSign,
  uiText,
  dataApiUrl,
  disabled = false,
}) => {
  const treeData = cloneDeep(tree)?.map((x) => restructureTree(false, x));
  const tProps = {
    treeData,
    treeCheckable: true,
    showCheckedStrategy: checkStrategy === 'parent' ? SHOW_PARENT : SHOW_CHILD,
    treeDefaultExpandAll: expandAll,
    tagRender: (props) => {
      const val = props.value.replace('|', ' - ');
      return (
        <Tag
          key={val}
          className="tag-tree"
          closable
          onClose={props.onClose}
        >
          {val}
        </Tag>
      );
    },
    placeholder: uiText.pleaseSelect,
    style: {
      width: '100%',
    },
  };
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={label || name}
          requiredSign={required ? requiredSign : null}
        />
      }
      tooltip={tooltip?.text}
      required={!disabled ? required : false}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => (
          <Extra
            key={exi}
            id={id}
            {...ex}
          />
        ))}
      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={rules}
        required={!disabled ? required : false}
        tooltip={tooltip?.text}
      >
        <TreeSelect
          onFocus={(e) => (e.target.readOnly = true)}
          getPopupContainer={(trigger) => trigger.parentNode}
          disabled={disabled}
          {...tProps}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => (
          <Extra
            key={exi}
            id={id}
            {...ex}
          />
        ))}
      {dataApiUrl && <DataApiUrl dataApiUrl={dataApiUrl} />}
    </Form.Item>
  );
};

export default TypeTree;
