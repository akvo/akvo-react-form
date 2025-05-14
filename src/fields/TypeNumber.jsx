import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  Fragment,
} from 'react';
import { Form, InputNumber } from 'antd';
import { Extra, FieldLabel, DataApiUrl, InputConfirm } from '../support';
import GlobalStore from '../lib/store';
import { InputNumberIcon, InputNumberDecimalIcon } from '../lib/svgIcons';
import { strToFunction } from './TypeAutoField';

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
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [showPrefix, setShowPrefix] = useState(true);
  const [fieldColor, setFieldColor] = useState(null);

  const form = Form.useFormInstance();
  const { getFieldsValue } = form;
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);
  const allValues = getFieldsValue();

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
      const fnColor = strToFunction(fn.fnColor, allValues, allQuestions);
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
  }, [allQuestions, allValues, fieldColor, value, fn?.fnColor]);

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
        key={keyform}
        name={id}
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
              <>
                {rules?.filter((item) => item.allowDecimal)?.length === 0 ? (
                  <InputNumberIcon />
                ) : (
                  <InputNumberDecimalIcon />
                )}
              </>
            )
          }
          addonBefore={addonBefore}
          disabled={disabled}
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
    </Form.Item>
  );
};
export default TypeNumber;
