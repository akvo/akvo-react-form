import React, { useMemo } from 'react';
import { Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';
import GlobalStore from '../lib/store';

const TextField = ({
  id,
  keyform,
  required,
  rules,
  extra,
  dataApiUrl,
  meta_uuid,
  disabled,
  dependency,
  show_repeat_in_question_level,
  repeat,
  dependency_rule,
  group,
}) => {
  const form = Form.useFormInstance();
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);

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
      >
        <TextArea
          row={4}
          disabled={meta_uuid || disabled || disableFieldByDependency}
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

const TypeText = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  requiredSign,
  dataApiUrl,
  meta_uuid,
  show_repeat_in_question_level,
  repeats,
  dependency,
  dependency_rule,
  group,
  disabled = false,
}) => {
  const form = Form.useFormInstance();
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);

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
          <TextField
            id={`${id}-${r}`}
            keyform={keyform}
            required={required}
            rules={rules}
            extra={extra}
            dataApiUrl={dataApiUrl}
            meta_uuid={meta_uuid}
            disabled={disabled}
            show_repeat_in_question_level={show_repeat_in_question_level}
            repeat={r}
            dependency={dependency}
            dependency_rule={dependency_rule}
            group={group}
          />
        ),
      };
    });
  }, [
    hideFields,
    repeats,
    id,
    keyform,
    required,
    rules,
    show_repeat_in_question_level,
    dependency,
    extra,
    dataApiUrl,
    disabled,
    meta_uuid,
    dependency_rule,
    group,
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
        <TextField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          extra={extra}
          dataApiUrl={dataApiUrl}
          meta_uuid={meta_uuid}
          disabled={disabled}
          dependency_rule={dependency_rule}
          group={group}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeText;
