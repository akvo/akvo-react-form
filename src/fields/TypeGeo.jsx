import React from 'react';
import { Col, Form, Input } from 'antd';
import { Maps, Extra, FieldLabel, DataApiUrl } from '../support';

// TODO:: Do we need to support repeat in question level here?
const TypeGeo = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  center,
  initialValue,
  extra,
  meta,
  requiredSign,
  uiText,
  dataApiUrl,
  group,
  disabled = false,
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  return (
    <Col>
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
          className="arf-field-geo"
          name={id}
          rules={rules}
          required={!disabled ? required : false}
          noStyle
        >
          <Input
            disabled
            hidden
          />
        </Form.Item>
        <Maps
          id={id}
          center={center}
          initialValue={initialValue}
          meta={meta}
          uiText={uiText}
          disabled={disabled}
          group={group}
        />
        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => (
            <Extra
              key={exi}
              id={id}
              {...ex}
            />
          ))}
        {dataApiUrl && <DataApiUrl dataApiUrl={dataApiUrl} />}
      </Form.Item>
    </Col>
  );
};
export default TypeGeo;
