/* eslint-disable no-console */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Select, Tag } from 'antd';
import axios from 'axios';
import { FieldLabel, RepeatTableView } from '../support';
import GlobalStore from '../lib/store';
import {
  isHexColorCode,
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const EntityField = ({
  id,
  keyform,
  required,
  rules,
  uiText,
  api,
  meta,
  parentId,
  disabled,
  show_repeat_in_question_level,
  dependency,
  repeat,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [previous, setPrevious] = useState(null);
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [currentParent, setCurrentParent] = useState(null);
  const [preload, setPreload] = useState(true);
  const current = GlobalStore.useState((s) => s.current);
  const currentValue = form.getFieldValue([id]);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: value,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  const handleOnChange = (val) => {
    const findOption = options.find((o) => o?.value === val);
    updateDataPointName(findOption?.label || '');
  };

  const prevParentAnswer = useMemo(() => {
    const findParent = allQuestions?.find((q) => q?.id === parentId);
    return current?.[findParent?.id]?.slice(-1)?.[0] || null;
  }, [allQuestions, current, parentId]);

  const fetchOptions = useCallback(async () => {
    if (prevParentAnswer !== currentParent) {
      if (currentValue) {
        setPrevious(currentValue);
      }
      updateDataPointName('');
      form.setFieldsValue({ [id]: null });
      setPreload(true);
      setCurrentParent(prevParentAnswer);
    }
    if (currentParent && preload && api?.endpoint) {
      setPreload(false);
      try {
        const { data } = await axios.get(`${api.endpoint}${currentParent}`);
        const _options = data?.map((d) => ({ value: d?.id, label: d?.name }));
        const findByPrevious = _options.find(
          (o) => o?.value === previous || o?.label === previous
        );
        if (findByPrevious) {
          updateDataPointName(findByPrevious.label);
          if (disabled) {
            setIsDisabled(false);
          }
          setPrevious(null);
          form.setFieldsValue({ [id]: findByPrevious.value });
          if (disabled !== isDisabled) {
            setIsDisabled(disabled);
          }
        }
        setOptions(_options);
      } catch {
        setOptions([]);
      }
    }
  }, [
    prevParentAnswer,
    currentParent,
    preload,
    currentValue,
    form,
    previous,
    isDisabled,
    id,
    api.endpoint,
    disabled,
    updateDataPointName,
  ]);

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

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return (
    <Form.Item
      className="arf-field-child"
      key={keyform}
      name={disableFieldByDependency ? null : id}
      rules={required ? rules : () => {}}
      required={!disabled ? required : false}
    >
      <Select
        style={{ width: '100%' }}
        getPopupContainer={(trigger) => trigger.parentNode}
        onFocus={(e) => (e.target.readOnly = true)}
        placeholder={uiText.pleaseSelect}
        onChange={handleOnChange}
        allowClear
        showSearch
        filterOption
        optionFilterProp="children"
        disabled={disabled || disableFieldByDependency}
      >
        {options.map((o, io) => (
          <Select.Option
            key={io}
            value={o.value}
          >
            {o?.color && isHexColorCode(o.color) ? (
              <Tag
                color={o.color}
                style={{ fontSize: 14, fontWeight: 600 }}
              >
                {o.label}
              </Tag>
            ) : (
              o.label
            )}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
};

const TypeEntity = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  requiredSign,
  uiText,
  api,
  show_repeat_in_question_level,
  repeats,
  dependency,
  dependency_rule,
  group,
  allQuestions = null,
  meta = false,
  parentId = null,
  disabled = false,
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
          <EntityField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            uiText={uiText}
            api={api}
            meta={meta}
            parentId={parentId}
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
    uiText,
    show_repeat_in_question_level,
    dependency,
    meta,
    disabled,
    api,
    parentId,
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
        <EntityField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          uiText={uiText}
          api={api}
          meta={meta}
          parentId={parentId}
          disabled={disabled}
          dependency_rule={dependency_rule}
          group={group}
          allQuestions={allQuestions}
        />
      )}
    </Form.Item>
  );
};

export default TypeEntity;
