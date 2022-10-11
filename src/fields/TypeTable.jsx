import React, { useState } from 'react';
import { Row, Col, Form, Input, Table, Button } from 'antd';
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
  columns = columns.map((x) => {
    return {
      title: x?.label || x.name,
      dataIndex: x.name,
      key: x.name,
      render: () => <Input />,
    };
  });
  columns = [
    ...columns,
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: () => <Button type="link">Delete</Button>,
    },
  ];

  const [dataSource, setDataSource] = useState([]);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  const onMore = () => {
    const defaultSource = columns.reduce(
      (curr, x) => {
        return { ...curr, [x.key]: null };
      },
      { key: dataSource.length + 1 }
    );
    setDataSource([...dataSource, defaultSource]);
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
        <Row
          justify="space-between"
          style={{ marginBottom: '10px' }}
          gutter={[20, 12]}
        >
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={24}
          >
            <Table
              size="small"
              pagination={false}
              dataSource={dataSource}
              columns={columns}
              bordered
            />
          </Col>
          <Col
            xs={24}
            sm={24}
            md={24}
            lg={24}
            xl={24}
          >
            <Button onClick={onMore}>Add More</Button>
          </Col>
        </Row>
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
