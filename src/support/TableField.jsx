import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Table,
  Typography,
} from 'antd';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TableField = ({ columns }) => {
  const originColumns = columns.map((x) => {
    return {
      title: x?.label || x.name,
      dataIndex: x.name,
      key: x.name,
      editable: true,
    };
  });

  const editingColumn = {
    title: 'operation',
    dataIndex: 'operation',
    render: (_, record) => {
      const editable = isEditing(record);
      return editable ? (
        <span>
          <Button
            onClick={() => save(record.key)}
            size="small"
            style={{
              marginRight: 8,
            }}
          >
            Save
          </Button>
          <Popconfirm
            title="Sure to cancel?"
            onConfirm={cancel}
          >
            <Button
              type="danger"
              size="small"
            >
              Cancel
            </Button>
          </Popconfirm>
        </span>
      ) : (
        <Button
          disabled={editingKey !== ''}
          onClick={() => edit(record)}
          size="small"
        >
          Edit
        </Button>
      );
    },
  };

  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    const defaultField = originColumns.reduce((curr, x) => {
      return { ...curr, [x.key]: '' };
    }, {});

    form.setFieldsValue({
      ...defaultField,
      ...record,
    });
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const more = () => {
    const defaultSource = originColumns.reduce(
      (curr, x) => {
        return { ...curr, [x.key]: ' - ' };
      },
      { key: (data.length + 1).toString() }
    );
    setData([...data, defaultSource]);
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const mergedColumns = [...originColumns, editingColumn].map((col) => {
    if (!col?.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
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
        <Form
          form={form}
          component={false}
        >
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            dataSource={data}
            columns={mergedColumns}
            rowClassName="editable-row"
            size="small"
            pagination={false}
            bordered
          />
        </Form>
      </Col>
      <Col
        xs={24}
        sm={24}
        md={24}
        lg={24}
        xl={24}
      >
        <Button onClick={more}>Add More</Button>
      </Col>
    </Row>
  );
};

export default TableField;
