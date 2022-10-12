import React from 'react';
import { Col, Form, Input } from 'antd';
import { TableField, Extra, FieldLabel } from '../support';

const TypeTable = ({
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  columns,
}) => {
  const form = Form.useFormInstance();
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  const setValue = (data) => {
    form.setFieldsValue({ [id]: data });
  };

  return (
    <Col>
      <Form.Item
        className="arf-field"
        label={
          <FieldLabel
            keyform={keyform}
            content={name}
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
          className="arf-field-geo"
          name={id}
          rules={rules}
          required={required}
        >
          <Input disabled />
        </Form.Item>
        <TableField
          columns={columns}
          setValue={setValue}
        />
        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => (
            <Extra
              key={exi}
              {...ex}
            />
          ))}
      </Form.Item>
    </Col>
  );
};

export default TypeTable;
