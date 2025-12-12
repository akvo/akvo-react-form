import React, { useEffect, useMemo, useCallback } from 'react';
import { Form, Cascader } from 'antd';
import flattenDeep from 'lodash/flattenDeep';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import GlobalStore from '../lib/store';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';
import TypeCascadeApi from './TypeCascadeApi';

const CascadeField = ({
  cascade,
  id,
  api,
  keyform,
  required,
  meta,
  rules,
  extra,
  uiText,
  dataApiUrl,
  show_repeat_in_question_level,
  dependency,
  repeat,
  disabled = false,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const formInstance = Form.useFormInstance();
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  const currentValue = formInstance.getFieldValue([id]);

  const combineLabelWithParent = useCallback((cascadeValue, parent) => {
    return cascadeValue?.map((c) => {
      if (c?.children) {
        return combineLabelWithParent(c.children, {
          ...c,
          parent_label: parent?.parent_label
            ? `${parent.parent_label} - ${parent.label}`
            : parent?.label,
          path: parent?.path
            ? `${parent.path}.${c.value}`
            : `${parent.value}.${c.value}`,
        });
      }
      return {
        ...c,
        parent_label: parent?.parent_label
          ? `${parent.parent_label} - ${parent.label}`
          : parent?.label,
        path: parent?.path
          ? `${parent.path}.${c.value}`
          : `${parent.value}.${c.value}`,
      };
    });
  }, []);

  const transformCascade = useCallback(() => {
    const transform = cascade.map((c) => {
      return combineLabelWithParent(c?.children, {
        ...c,
        path: c.value.toString(), // Initialize path with root value
      });
    });
    return flattenDeep(transform);
  }, [cascade, combineLabelWithParent]);

  const updateDataPointName = useCallback(
    (value) => {
      if (cascade && !api && meta) {
        const findLocation = transformCascade().find(
          (t) => t.path === value.join('.')
        );
        const combined = findLocation?.parent_label
          ? `${findLocation.parent_label} - ${findLocation.label}`
          : '';
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: combined,
                }
              : g
          );
        });
      }
    },
    [meta, id, api, cascade, transformCascade]
  );

  useEffect(() => {
    if (currentValue && currentValue?.length) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  const handleChangeCascader = (val) => {
    updateDataPointName(val);
  };

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
      >
        <Cascader
          options={cascade}
          getPopupContainer={(trigger) => trigger.parentNode}
          onFocus={(e) => (e.target.readOnly = true)}
          showSearch
          placeholder={uiText.pleaseSelect}
          onChange={handleChangeCascader}
          disabled={disabled || disableFieldByDependency}
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

const TypeCascade = ({
  cascade,
  id,
  name,
  label,
  form,
  api,
  keyform,
  required,
  meta,
  rules,
  tooltip,
  extra,
  initialValue,
  requiredSign,
  partialRequired,
  uiText,
  dataApiUrl,
  dependency,
  repeats,
  show_repeat_in_question_level,
  dependency_rule,
  group,
  allQuestions = null,
  disabled = false,
}) => {
  const formInstance = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    questionId: id,
    formRef: formInstance,
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
    if (!cascade && api) {
      return [];
    }
    if (!repeats || !show_repeat_in_question_level || hideFields) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <CascadeField
            id={`${id}-${r}`}
            cascade={cascade}
            api={api}
            keyform={keyform}
            required={required}
            meta={meta}
            rules={rules}
            extra={extra}
            uiText={uiText}
            dataApiUrl={dataApiUrl}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            disabled={disabled}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
          />
        ),
      };
    });
  }, [
    hideFields,
    api,
    cascade,
    id,
    keyform,
    repeats,
    required,
    rules,
    uiText,
    show_repeat_in_question_level,
    dependency,
    extra,
    meta,
    dataApiUrl,
    disabled,
    dependency_rule,
    group,
    allQuestions,
  ]);

  if (hideFields) {
    return null;
  }

  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={label || name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        meta={meta}
        rules={rules}
        tooltip={tooltip}
        initialValue={initialValue}
        extra={extra}
        requiredSign={required ? requiredSign : null}
        partialRequired={partialRequired}
        uiText={uiText}
        dataApiUrl={dataApiUrl}
        disabled={disabled}
        show_repeat_in_question_level={show_repeat_in_question_level}
        repeats={repeats}
        dependency={dependency}
      />
    );
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
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView
          id={id}
          dataSource={repeatInputs}
        />
      ) : (
        <CascadeField
          cascade={cascade}
          id={id}
          api={api}
          keyform={keyform}
          required={required}
          meta={meta}
          rules={rules}
          extra={extra}
          uiText={uiText}
          dataApiUrl={dataApiUrl}
          show_repeat_in_question_level={show_repeat_in_question_level}
          disabled={disabled}
          dependency_rule={dependency_rule}
          group={group}
          allQuestions={allQuestions}
        />
      )}
    </Form.Item>
  );
};

export default TypeCascade;
