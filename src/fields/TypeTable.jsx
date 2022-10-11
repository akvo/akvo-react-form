import React, { useState } from 'react';
import { Col, Form, Input, Table } from 'antd';
import { Extra, FieldLabel } from '../support';

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
  const dataSource = useState([]);
  columns = columns.map((x) => {
    return {
      title: x?.label || x.name,
      dataIndex: x.name,
      key: x.name,
    };
  });

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
        <Table
          size="small"
          pagination={false}
          dataSource={dataSource}
          columns={columns}
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
