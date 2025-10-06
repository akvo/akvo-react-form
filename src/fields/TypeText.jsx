import React, { useMemo } from 'react';
import { Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

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
}) => {
  const form = Form.useFormInstance();

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      formRef: form,
      show_repeat_in_question_level,
      dependency,
      repeat,
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
  disabled = false,
}) => {
  const form = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    formRef: form,
    show_repeat_in_question_level,
    dependency,
    repeats,
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
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeText;
