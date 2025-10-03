import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Form, Input } from 'antd';
import {
  Extra,
  FieldLabel,
  DataApiUrl,
  InputConfirm,
  EyeSuffix,
  RepeatTableView,
} from '../support';
import GlobalStore from '../lib/store';
import { InputFieldIcon } from '../lib/svgIcons';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const InputField = ({
  uiText,
  id,
  keyform,
  required,
  rules,
  meta,
  meta_uuid,
  addonAfter,
  addonBefore,
  extra,
  show_repeat_in_question_level,
  is_repeat_identifier,
  dataApiUrl,
  repeat,
  dependency,
  fieldIcons = true,
  disabled = false,
  hiddenString = false,
  requiredDoubleEntry = false,
}) => {
  const form = Form.useFormInstance();
  const [showPrefix, setShowPrefix] = useState(true);
  const [showString, setShowString] = useState(hiddenString);
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
            g.id === id ? { ...g, value: value } : g
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

  const onChange = (e) => {
    updateDataPointName(e.target.value);
  };

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
        name={disableFieldByDependency ? '' : id}
        rules={rules}
        required={!disabled ? required : false}
      >
        <Input
          sytle={{ width: '100%' }}
          onBlur={() => {
            setShowPrefix(true);
          }}
          onFocus={() => setShowPrefix(false)}
          onChange={onChange}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          prefix={
            fieldIcons && showPrefix && !currentValue && <InputFieldIcon />
          }
          disabled={
            meta_uuid ||
            disabled ||
            is_repeat_identifier ||
            disableFieldByDependency
          }
          type={showString ? 'password' : 'text'}
          suffix={
            <EyeSuffix {...{ showString, setShowString, hiddenString }} />
          }
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
      {requiredDoubleEntry && (
        <InputConfirm {...{ uiText, id, required, hiddenString }} />
      )}
    </div>
  );
};

const TypeInput = ({
  uiText,
  id,
  name,
  label,
  keyform,
  required,
  rules,
  rule,
  meta,
  meta_uuid,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  requiredSign,
  show_repeat_in_question_level,
  repeats,
  is_repeat_identifier,
  dataApiUrl,
  dependency,
  fieldIcons = true,
  disabled = false,
  hiddenString = false,
  requiredDoubleEntry = false,
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
        is_repeat_identifier: is_repeat_identifier,
        field: (
          <InputField
            id={`${id}-${r}`}
            repeat={r}
            uiText={uiText}
            name={name}
            label={label}
            keyform={keyform}
            required={required}
            rules={rules}
            rule={rule}
            meta={meta}
            meta_uuid={meta_uuid}
            tooltip={tooltip}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            extra={extra}
            requiredSign={requiredSign}
            show_repeat_in_question_level={show_repeat_in_question_level}
            repeats={repeats}
            is_repeat_identifier={is_repeat_identifier}
            dataApiUrl={dataApiUrl}
            fieldIcons={fieldIcons}
            disabled={disabled}
            hiddenString={hiddenString}
            requiredDoubleEntry={requiredDoubleEntry}
            dependency={dependency}
          />
        ),
      };
    });
  }, [
    hideFields,
    uiText,
    id,
    name,
    label,
    keyform,
    required,
    rules,
    rule,
    meta,
    meta_uuid,
    tooltip,
    addonAfter,
    addonBefore,
    extra,
    requiredSign,
    show_repeat_in_question_level,
    repeats,
    is_repeat_identifier,
    dataApiUrl,
    fieldIcons,
    disabled,
    hiddenString,
    requiredDoubleEntry,
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
          fieldIcons={fieldIcons}
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
        <InputField
          id={id}
          uiText={uiText}
          name={name}
          label={label}
          keyform={keyform}
          required={required}
          rules={rules}
          rule={rule}
          meta={meta}
          meta_uuid={meta_uuid}
          tooltip={tooltip}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          extra={extra}
          requiredSign={requiredSign}
          show_repeat_in_question_level={show_repeat_in_question_level}
          repeats={repeats}
          is_repeat_identifier={is_repeat_identifier}
          dataApiUrl={dataApiUrl}
          fieldIcons={fieldIcons}
          disabled={disabled}
          hiddenString={hiddenString}
          requiredDoubleEntry={requiredDoubleEntry}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeInput;
