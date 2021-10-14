import React from 'react'
import {
  Row,
  Col,
  Card,
  Space,
  Button,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  DatePicker
} from 'antd'
import 'antd/dist/antd.css'
import TextArea from 'antd/lib/input/TextArea'

const Question = ({ fields }) => {
  return fields.map((f, key) => (
    <Form.Item key={key} name={f.id} label={f.name}>
      {f.type === 'option' ? (
        <Radio.Group>
          <Space direction='vertical'>
            {f.option.map((o, io) => (
              <Radio key={io} value={o.name}>
                {o.name}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      ) : f.type === 'multipleoption' ? (
        <Select mode='multiple' style={{ width: '100%' }}>
          {f.option.map((o, io) => (
            <Select.Option key={io} value={o.name}>
              {o.name}
            </Select.Option>
          ))}
        </Select>
      ) : f.type === 'date' ? (
        <DatePicker />
      ) : f.type === 'number' ? (
        <InputNumber sytle={{ width: '100%' }} />
      ) : f.type === 'text' ? (
        <TextArea row={4} />
      ) : (
        <Input sytle={{ width: '100%' }} />
      )}
    </Form.Item>
  ))
}

export const Webform = ({ forms, onChange, onFinish }) => {
  if (!forms?.question_group) {
    return 'Error Format'
  }

  const onSubmit = (values) => {
    console.log(values)
  }

  const onValuesChange = (d) => {
    console.log(d)
  }

  return (
    <Form
      layout='vertical'
      name={forms.name}
      onValuesChange={onValuesChange}
      onFinish={onSubmit}
    >
      {forms?.question_group.map((g, key) => {
        return (
          <Card key={key} title={g.name || `Section ${key + 1}`}>
            <Question fields={g.question} />
          </Card>
        )
      })}
      <Row>
        <Col span={24}>
          <Card>
            <Form.Item>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  )
}
