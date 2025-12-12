import React, { useEffect, useCallback, useMemo } from 'react';
import { Form, DatePicker } from 'antd';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import GlobalStore from '../lib/store';
import moment from 'moment';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const DateField = ({
  id,
  keyform,
  required,
  rules,
  extra,
  meta,
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
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  const currentValue = form.getFieldValue([id]);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: moment(value).format('YYYY-MM-DD'),
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  const handleDatePickerChange = (val) => {
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
        <DatePicker
          getPopupContainer={(trigger) => trigger.parentNode}
          placeholder={uiText.selectDate}
          format="YYYY-MM-DD"
          onFocus={(e) => (e.target.readOnly = true)}
          style={{ width: '100%' }}
          onChange={handleDatePickerChange}
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

const TypeDate = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  meta,
  requiredSign,
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
          <DateField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            extra={extra}
            meta={meta}
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
        <DateField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          extra={extra}
          meta={meta}
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
export default TypeDate;
