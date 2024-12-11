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
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState('');
  const [showPrefix, setShowPrefix] = useState(true);

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
                  value: typeof value !== 'undefined' ? value.toString() : null,
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
          style={{ width: '100%' }}
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
