import React, {
  useEffect,
  useCallback,
  useRef,
  useState,
  Fragment,
} from 'react';
import { Form, InputNumber } from 'antd';
import { Extra, FieldLabel } from '../support';
import GlobalStore from '../lib/store';
import { TiSortNumerically } from 'react-icons/ti';

const TypeNumber = ({
  id,
  name,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  coreMandatory = false,
  fieldIcons = true,
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
    if (rules?.filter((item) => item.allowDecimal)?.length === 0) {
      if (v && parseFloat(v) % 1 !== 0 && !isNaN(v)) {
        setError('Decimal values are not allowed for this question');
        setIsValid(false);
      }
    }
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
          coreMandatory={coreMandatory}
        />
      }
      tooltip={tooltip?.text}
      required={required}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => (
          <Extra
            key={exi}
            {...ex}
          />
        ))}
      <Form.Item
        key={keyform}
        name={id}
        rules={rules}
        className="arf-field-child"
        required={required}
      >
        <InputNumber
          onBlur={() => validateNumber(numberRef.current.value)}
          onFocus={() => setShowPrefix(false)}
          ref={numberRef}
          inputMode="numeric"
          style={{ width: '100%' }}
          onChange={onChange}
          addonAfter={addonAfter}
          prefix={
            fieldIcons &&
            showPrefix && (
              <>
                {rules?.filter((item) => item.allowDecimal)?.length === 0 ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                  >
                    <path
                      fill="currentColor"
                      d="M26 12h-4v2h4v2h-3v2h3v2h-4v2h4a2.003 2.003 0 0 0 2-2v-6a2.002 2.002 0 0 0-2-2zm-7 10h-6v-4a2.002 2.002 0 0 1 2-2h2v-2h-4v-2h4a2.002 2.002 0 0 1 2 2v2a2.002 2.002 0 0 1-2 2h-2v2h4zM8 20v-8H6v1H4v2h2v5H4v2h6v-2H8z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                  >
                    <path
                      fill="currentColor"
                      d="M21 15h2v2h-2z"
                    />
                    <path
                      fill="currentColor"
                      d="M24 23h-4a2.002 2.002 0 0 1-2-2V11a2.002 2.002 0 0 1 2-2h4a2.002 2.002 0 0 1 2 2v10a2.003 2.003 0 0 1-2 2zm-4-12v10h4V11zm-9 4h2v2h-2z"
                    />
                    <path
                      fill="currentColor"
                      d="M14 23h-4a2.002 2.002 0 0 1-2-2V11a2.002 2.002 0 0 1 2-2h4a2.002 2.002 0 0 1 2 2v10a2.003 2.003 0 0 1-2 2zm-4-12v10h4V11zM4 21h2v2H4z"
                    />
                  </svg>
                )}
              </>
            )
          }
          addonBefore={addonBefore}
        />
        {!isValid && <div className="ant-form-item-explain-error">{error}</div>}
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => (
          <Extra
            key={exi}
            {...ex}
          />
        ))}
    </Form.Item>
  );
};
export default TypeNumber;
