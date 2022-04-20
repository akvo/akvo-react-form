import React from 'react'
import { Row, Col, Card, Divider, Space, Checkbox } from 'antd'
import { translateForm } from '../lib'

const Question = ({ question }) => {
  const { qIndex, name: qName, required, tooltip, type, option } = question
  const qtype = type.split('_').join(' ')

  const renderIndex = () => `${qIndex}.`
  const renderTitle = () => `${required ? ' * ' : ' '}${qName}`
  const renderTooltip = () => {
    if (!tooltip?.text) {
      return ''
    }
    return `Tooltip: ${tooltip.text}`
  }
  const renderOptions = () => {
    if (type !== 'option' && type !== 'multiple_option') {
      return ''
    }
    return (
      <Checkbox.Group>
        {option.map((o, oi) => (
          <Row key={`${qIndex}-option-${oi}`}>
            <Col>
              <Checkbox value={o.name}>{o.name}</Checkbox>
            </Col>
          </Row>
        ))}
      </Checkbox.Group>
    )
  }

  return (
    <div className='arf-question-wrapper'>
      <div className='arf-question-dependency'>dependency:</div>
      <div className='arf-question-text'>
        <Space align='start' size='large'>
          <div>{renderIndex()}</div>
          <div>
            {renderTitle()}
            <div>{renderTooltip()}</div>
            <div>Input: {qtype}</div>
            <div>{renderOptions()}</div>
          </div>
        </Space>
      </div>
      <Divider />
    </div>
  )
}

const QuestionGroup = ({ group }) => {
  const {
    name: groupName,
    description: groupDescription,
    question: questions
  } = group
  return (
    <Col span={22}>
      <Card
        title={
          <div className='arf-group-title-wrapper'>
            <h3>{groupName}</h3>
            {groupDescription && (
              <div className='arf-group-description'>
                Description: {groupDescription}
              </div>
            )}
          </div>
        }
      >
        {questions.map((q, qi) => (
          <Question
            key={`question-${qi}`}
            question={{ ...q, qIndex: qi + 1 }}
          />
        ))}
      </Card>
    </Col>
  )
}

const Print = ({ forms, lang }) => {
  forms = translateForm(forms, lang)
  const { name: formName, question_group: questionGroups } = forms

  return (
    <div id='arf-print' className='arf-container'>
      <Row justify='center'>
        <Col span={22}>
          <h2>{formName}</h2>
          <Divider />
        </Col>
      </Row>
      <Row justify='center' gutter={[12, 12]}>
        {questionGroups.map((qg, qgi) => (
          <QuestionGroup key={`question-group-${qgi}`} group={qg} />
        ))}
      </Row>
    </div>
  )
}

export default Print
