import React, { useEffect, useCallback, useRef, useState } from 'react';
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
      if (parseFloat(v) % 1 !== 0 && !isNaN(v)) {
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
            showPrefix && <TiSortNumerically style={{ marginRight: '8px' }} />
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
