import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import {
  Extra,
  FieldLabel,
  DataApiUrl,
  InputConfirm,
  EyeSuffix,
} from '../support';
import GlobalStore from '../lib/store';
import { InputFieldIcon } from '../lib/svgIcons';

const TypeInput = ({
  uiText,
  id,
  name,
  label,
  keyform,
  required,
  rules,
  meta,
  meta_uuid,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  requiredSign,
  dataApiUrl,
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
        name={id}
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
          disabled={meta_uuid || disabled}
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
    </Form.Item>
  );
};
export default TypeInput;
