import React from 'react';
import { Col, Form, Input } from 'antd';
import { Maps, Extra, FieldLabel, DataApiUrl } from '../support';

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
        required={required}
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
          required={required}
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
