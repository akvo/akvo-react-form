import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  useMemo,
} from 'react';
import { Form, InputNumber } from 'antd';
import {
  Extra,
  FieldLabel,
  DataApiUrl,
  InputConfirm,
  RepeatTableView,
} from '../support';
import GlobalStore from '../lib/store';
import { InputNumberIcon, InputNumberDecimalIcon } from '../lib/svgIcons';
import { strToFunction } from './TypeAutoField';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const NumberField = ({
  id,
  uiText,
  keyform,
  required,
  rules,
  meta,
  addonAfter,
  addonBefore,
  extra,
  dataApiUrl,
  fieldIcons,
  disabled,
  requiredDoubleEntry,
  value,
  fn,
  show_repeat_in_question_level,
  dependency,
  repeat,
  dependency_rule,
  group,
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [showPrefix, setShowPrefix] = useState(true);
  const [fieldColor, setFieldColor] = useState(null);

  const form = Form.useFormInstance();
  const { getFieldsValue } = form;
  const allValues = getFieldsValue();
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);

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
                  value: typeof value !== 'undefined' ? value.toString() : null,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  const onChange = (value) => {
    setError('');
    setIsValid(true);
    updateDataPointName(value);
  };

  const validateNumber = (v) => {
    if (v && isNaN(v) && (typeof v === 'string' || v instanceof String)) {
      setError('Only numbers are allowed');
      setIsValid(false);
    }
  };

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  useEffect(() => {
    if (typeof fn?.fnColor === 'string') {
      const fnColor = strToFunction(fn.fnColor, allValues, allQuestions, id);
      const fnColorValue = typeof fnColor === 'function' ? fnColor() : null;
      if (fnColorValue !== fieldColor) {
        setFieldColor(fnColorValue);
      }
    }
    /**
     * Legacy support for fnColor as object
     * @deprecated
     */
    if (typeof fn?.fnColor === 'object') {
      const color = fn?.fnColor;
      if (color?.[value]) {
        setFieldColor(color[value]);
      } else {
        setFieldColor(null);
      }
    }
  }, [allQuestions, allValues, fieldColor, value, fn?.fnColor, id]);

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
        key={keyform}
        name={disableFieldByDependency ? null : id}
        rules={rules}
        className="arf-field-child"
        required={!disabled ? required : false}
      >
        <InputNumber
          onBlur={() => {
            validateNumber(numberRef.current.value);
            setShowPrefix(true);
          }}
          onFocus={() => setShowPrefix(false)}
          ref={numberRef}
          inputMode="numeric"
          style={{
            width: '100%',
            backgroundColor: fieldColor || 'white',
            fontWeight: fieldColor ? 'bold' : 'normal',
            color: fieldColor ? '#fff' : '#000',
          }}
          className="arf-field-number"
          onChange={onChange}
          addonAfter={addonAfter}
          prefix={
            fieldIcons &&
            showPrefix &&
            !currentValue && (
              <span>
                {rules?.filter((item) => item.allowDecimal)?.length === 0 ? (
                  <InputNumberIcon />
                ) : (
                  <InputNumberDecimalIcon />
                )}
              </span>
            )
          }
          addonBefore={addonBefore}
          disabled={disabled || disableFieldByDependency}
        />
      </Form.Item>
      {!isValid && (
        <div
          style={{ marginTop: '-10px' }}
          className="ant-form-item-explain-error"
        >
          {error}
        </div>
      )}
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => (
          <Extra
            key={exi}
            id={id}
            {...ex}
          />
        ))}
      {dataApiUrl && <DataApiUrl dataApiUrl={dataApiUrl} />}
      {requiredDoubleEntry && <InputConfirm {...{ uiText, id, required }} />}
    </div>
  );
};

const TypeNumber = ({
  uiText,
  id,
  name,
  label,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  requiredSign,
  dataApiUrl,
  fieldIcons = true,
  disabled = false,
  requiredDoubleEntry = false,
  value,
  fn = {},
  show_repeat_in_question_level,
  repeats,
  dependency,
  dependency_rule,
  group,
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
          <NumberField
            id={`${id}-${r}`}
            uiText={uiText}
            keyform={keyform}
            required={required}
            rules={rules}
            meta={meta}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            extra={extra}
            dataApiUrl={dataApiUrl}
            fieldIcons={fieldIcons}
            disabled={disabled}
            requiredDoubleEntry={requiredDoubleEntry}
            value={value}
            fn={fn}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            dependency_rule={dependency_rule}
            group={group}
          />
        ),
      };
    });
  }, [
    hideFields,
    repeats,
    show_repeat_in_question_level,
    addonAfter,
    addonBefore,
    fieldIcons,
    id,
    keyform,
    required,
    rules,
    uiText,
    dependency,
    extra,
    meta,
    dataApiUrl,
    value,
    disabled,
    requiredDoubleEntry,
    fn,
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
        <NumberField
          id={id}
          uiText={uiText}
          keyform={keyform}
          required={required}
          rules={rules}
          meta={meta}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          extra={extra}
          dataApiUrl={dataApiUrl}
          fieldIcons={fieldIcons}
          disabled={disabled}
          requiredDoubleEntry={requiredDoubleEntry}
          value={value}
          fn={fn}
          dependency_rule={dependency_rule}
          group={group}
        />
      )}
      {/* EOL Show as repeat inputs or not */}
    </Form.Item>
  );
};
export default TypeNumber;
