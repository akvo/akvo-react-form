import React from 'react'
import { Row, Col, Card, Divider, Space, Checkbox } from 'antd'
import { translateForm } from '../lib'

const Question = ({ question, questionGroups }) => {
  const { name, order, required, tooltip, type, option, dependency } = question

  const renderDependency = () => {
    if (!dependency && !dependency?.length) {
      return ''
    }
    const dependencies = dependency.map((d, di) => {
      const findGroup = questionGroups
        .map((qg) => {
          const findQuestion = qg.question.find((q) => q.id === d.id)
          if (findQuestion) {
            return {
              ...qg,
              question: findQuestion
            }
          }
          return false
        })
        .find((qg) => qg)
      return (
        <div key={`dependency-${d.id}-${di}`}>
          {`Question: ${findGroup.name}: #${
            findGroup.question.order
          } | condition:
          ${
            d?.options?.join(', ') ||
            d?.max ||
            d?.min ||
            d?.equal ||
            d?.notEqual
          }`}
        </div>
      )
    })
    return <div>Dependency: {dependencies}</div>
  }
  const renderIndex = () => `${order}.`
  const renderTitle = () => `${required ? ' * ' : ' '}${name}`
  const renderTooltip = () => {
    if (!tooltip?.text) {
      return ''
    }
    return (
      <Space>
        <div>Tooltip: </div>
        <div>{tooltip.text}</div>
      </Space>
    )
  }
  const renderType = () => (
    <Space>
      <div>Input: </div>
      <div>{type.split('_').join(' ')}</div>
    </Space>
  )
  const renderOptions = () => {
    if (type !== 'option' && type !== 'multiple_option') {
      return ''
    }
    return (
      <div className='arf-question-option'>
        <Checkbox.Group>
          {option.map((o, oi) => (
            <Row key={`option-${oi}`} gutter={[14, 14]}>
              <Col>
                <Checkbox value={o.name}>{o.name}</Checkbox>
              </Col>
            </Row>
          ))}
        </Checkbox.Group>
      </div>
    )
  }

  return (
    <div className='arf-question-container'>
      <div className='arf-question-dependency-wrapper'>
        {renderDependency()}
      </div>
      <Space align='start' size='large' className='arf-question-wrapper'>
        <div>{renderIndex()}</div>
        <div>
          <div className='arf-question-title'>{renderTitle()}</div>
          <div className='arf-question-tooltip'>{renderTooltip()}</div>
          <div className='arf-question-type'>{renderType()}</div>
          {renderOptions()}
        </div>
      </Space>
      <Divider />
    </div>
  )
}

const QuestionGroup = ({ group, questionGroups }) => {
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
            question={q}
            questionGroups={questionGroups}
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
      <Row justify='center' gutter={[24, 24]}>
        {questionGroups.map((qg, qgi) => (
          <QuestionGroup
            key={`question-group-${qgi}`}
            group={qg}
            questionGroups={questionGroups}
          />
        ))}
      </Row>
    </div>
  )
}

export default Print
