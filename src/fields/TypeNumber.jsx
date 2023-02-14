import React, { useEffect, useCallback, useRef, useState } from 'react';
import { Form, InputNumber } from 'antd';
import { Extra, FieldLabel } from '../support';
import GlobalStore from '../lib/store';

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
}) => {
  const numberRef = useRef();
  const [isValid, setIsValid] = useState(true);

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
    setIsValid(true);
    updateDataPointName(value);
  };

  const validateNumber = (v) => {
    if (v && isNaN(v) && (typeof v === 'string' || v instanceof String)) {
      setIsValid(false);
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
          ref={numberRef}
          inputMode="numeric"
          style={{ width: '100%' }}
          onChange={onChange}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
        />
        {!isValid && (
          <div className="ant-form-item-explain-error">Only number allowed</div>
        )}
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
