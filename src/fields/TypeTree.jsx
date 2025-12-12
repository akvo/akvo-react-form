import React, { useMemo } from 'react';
import { Form, Tag, TreeSelect } from 'antd';
import { cloneDeep } from 'lodash';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

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

const TreeField = ({
  id,
  tree,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  checkStrategy,
  expandAll,
  uiText,
  dataApiUrl,
  disabled,
  show_repeat_in_question_level,
  dependency,
  repeat,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();
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

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      questionId: id,
      formRef: form,
      show_repeat_in_question_level,
      dependency_rule,
      dependency,
      repeat,
      group,
      allQuestions,
      isDisableFieldByDependency: true,
    });

  return (
    <div>
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
        name={disableFieldByDependency ? null : id}
        rules={rules}
        required={!disabled ? required : false}
        tooltip={tooltip?.text}
      >
        <TreeSelect
          onFocus={(e) => (e.target.readOnly = true)}
          getPopupContainer={(trigger) => trigger.parentNode}
          disabled={disabled || disableFieldByDependency}
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
    </div>
  );
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
  show_repeat_in_question_level,
  repeats,
  dependency,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    questionId: id,
    formRef: form,
    show_repeat_in_question_level,
    dependency_rule,
    dependency,
    repeats,
    group,
    allQuestions,
  });
  // eol show/hide fields

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level || hideFields) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <TreeField
            id={`${id}-${r}`}
            tree={tree}
            keyform={keyform}
            required={required}
            rules={rules}
            tooltip={tooltip}
            extra={extra}
            checkStrategy={checkStrategy}
            expandAll={expandAll}
            uiText={uiText}
            dataApiUrl={dataApiUrl}
            disabled={disabled}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
          />
        ),
      };
    });
  }, [
    hideFields,
    id,
    keyform,
    repeats,
    required,
    rules,
    tooltip,
    show_repeat_in_question_level,
    dependency,
    tree,
    extra,
    checkStrategy,
    uiText,
    expandAll,
    dataApiUrl,
    disabled,
    dependency_rule,
    group,
    allQuestions,
  ]);

  if (hideFields) {
    return null;
  }

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
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView
          id={id}
          dataSource={repeatInputs}
        />
      ) : (
        <TreeField
          id={id}
          tree={tree}
          keyform={keyform}
          required={required}
          rules={rules}
          tooltip={tooltip}
          extra={extra}
          checkStrategy={checkStrategy}
          expandAll={expandAll}
          uiText={uiText}
          dataApiUrl={dataApiUrl}
          disabled={disabled}
          dependency_rule={dependency_rule}
          group={group}
          allQuestions={allQuestions}
        />
      )}
    </Form.Item>
  );
};

export default TypeTree;
