import React from 'react'
import { translateForm } from '../lib'

const style = {
  container: {
    fontFamily: 'sans-serif',
    padding: 24,
    background: '#fff'
  },
  titleWrapper: {
    borderBottom: '1px solid #000'
  },
  title: {
    textAlign: 'center',
    fontSize: 20
  },
  contentWrapper: {
    marginTop: 24
  },
  questionGroupWrapper: {
    border: '1px solid #000',
    marginBottom: 20,
    pageBreakAfter: 'auto'
  },
  questionGroupDetailWrapper: {
    padding: 12,
    background: '#EFEFEF',
    borderBottom: '1px solid #000'
  },
  questionGroupTitle: {
    margin: 0
  },
  questionGroupDescription: {
    marginTop: 12,
    lineHeight: '23px'
  },
  questionWrapper: {
    padding: 12,
    borderBottom: '1px solid #000',
    pageBreakBefore: 'auto',
    pageBreakInside: 'avoid'
  },
  questionParentWrapper: {
    display: 'flex',
    flexDirection: 'row'
  },
  questionDependencyWrapper: {
    marginBottom: 6,
    lineHeight: '23px'
  },
  questionIndex: {
    width: '3%',
    lineHeight: '23px'
  },
  questionDetailWrapper: {
    width: '97%'
  },
  questionTitle: { lineHeight: '23px' },
  questionTooltip: { lineHeight: '23px' },
  questionType: { lineHeight: '23px' },
  questionOptionWrapper: { lineHeight: '23px' }
}

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
  const renderTooltip = () =>
    tooltip?.text ? <span>Tooltip: {tooltip.text}</span> : ''
  const renderType = () => `Input: ${type.split('_').join(' ')}`

  const renderOptions = () => {
    if (type !== 'option' && type !== 'multiple_option') {
      return ''
    }
    return option.map((o, oi) => (
      <div key={`${type}-${oi}`} style={style.questionOptionWrapper}>
        <input type='checkbox' />
        <label>{o.name}</label>
      </div>
    ))
  }

  return (
    <div style={style.questionWrapper}>
      <div style={style.questionDependencyWrapper}>{renderDependency()}</div>
      <div style={style.questionParentWrapper}>
        <div style={style.questionIndex}>{renderIndex()}</div>
        <div style={style.questionDetailWrapper}>
          <div style={style.questionTitle}>{renderTitle()}</div>
          <div style={style.questionTooltip}>{renderTooltip()}</div>
          <div style={style.questionType}>{renderType()}</div>
          {renderOptions()}
        </div>
      </div>
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
    <div style={style.questionGroupWrapper}>
      <div style={style.questionGroupDetailWrapper}>
        <h3 style={style.questionGroupTitle}>{groupName}</h3>
        {groupDescription && (
          <div style={style.questionGroupDescription}>
            Description: {groupDescription}
          </div>
        )}
      </div>
      {questions.map((q, qi) => (
        <Question
          key={`question-${qi}`}
          question={q}
          questionGroups={questionGroups}
        />
      ))}
    </div>
  )
}

const Print = ({ forms, lang }) => {
  forms = translateForm(forms, lang)
  const { name: formName, question_group: questionGroups } = forms

  return (
    <div id='arf-print' style={style.container}>
      <div style={style.titleWrapper}>
        <h2 style={style.title}>{formName}</h2>
      </div>
      <div style={style.contentWrapper}>
        {questionGroups.map((qg, qgi) => (
          <QuestionGroup
            key={`question-group-${qgi}`}
            group={qg}
            questionGroups={questionGroups}
          />
        ))}
      </div>
    </div>
  )
}

export default Print
