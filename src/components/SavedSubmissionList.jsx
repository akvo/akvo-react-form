import React from 'react'
import { Row, Col, Space, Button } from 'antd'

const SavedSubmissionList = ({
  dataPoints,
  onLoadDataPoint,
  onDeleteDataPoint
}) => {
  return (
    <Row gutter={[16, 16]}>
      {dataPoints.map((x, xi) => (
        <Col span={24} key={xi}>
          <Row>
            <Col span={16}>
              {xi + 1}. {x.name}
            </Col>
            <Col span={8} align='right'>
              <Space>
                <Button size='small' onClick={() => onLoadDataPoint(x.load)}>
                  Load
                </Button>
                <Button
                  size='small'
                  onClick={() => onDeleteDataPoint(x.remove)}
                  type='danger'
                >
                  Delete
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  )
}

export default SavedSubmissionList
