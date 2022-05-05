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
    width: '100%',
    border: '1px solid #000',
    marginBottom: 24
    // pageBreakAfter: 'auto'
  },
  questionGroupDetailWrapper: {
    width: '100%',
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
    width: '100%',
    padding: 12
    // pageBreakBefore: 'auto',
    // pageBreakInside: 'avoid'
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
  questionTitle: {
    margin: 0,
    lineHeight: '23px'
  },
  questionTooltip: {
    margin: 0,
    lineHeight: '23px'
  },
  questionType: {
    margin: 0,
    lineHeight: '23px'
  },
  questionOptionWrapper: {
    margin: 0,
    lineHeight: '23px'
  }
}

const Question = ({ last, question, questionGroups }) => {
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
        <li key={`dependency-${d.id}-${di}`}>
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
        </li>
      )
    })
    return (
      <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
        Dependency: {dependencies}
      </ul>
    )
  }
  const renderIndex = () => `${order}.`
  const renderTitle = () => (
    <li style={style.questionTitle}>{`${required ? ' * ' : ' '}${name}`}</li>
  )
  const renderTooltip = () =>
    tooltip?.text ? (
      <li style={style.questionTooltip}>Tooltip: {tooltip.text}</li>
    ) : (
      ''
    )
  const renderType = () => (
    <li style={style.questionType}>{`Input: ${type.split('_').join(' ')}`}</li>
  )
  const renderOptions = () => {
    if (type !== 'option' && type !== 'multiple_option') {
      return ''
    }
    return option.map((o, oi) => (
      <li key={`${type}-${oi}`} style={style.questionOptionWrapper}>
        <input type='checkbox' />
        <label style={{ marginLeft: 5 }}>{o.name}</label>
      </li>
    ))
  }

  const border = !last ? { borderBottom: '1px solid #000' } : {}
  return (
    <table style={{ ...style.questionWrapper, ...border }}>
      <tbody>
        <tr colSpan={2}>
          <td style={style.questionDependencyWrapper}>{renderDependency()}</td>
        </tr>
        <tr style={style.questionParentWrapper}>
          <td style={style.questionIndex}>{renderIndex()}</td>
          <td style={style.questionDetailWrapper}>
            <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
              {renderTitle()}
              {renderTooltip()}
              {renderType()}
              {renderOptions()}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const QuestionGroup = ({ group, questionGroups }) => {
  const {
    name: groupName,
    description: groupDescription,
    question: questions
  } = group
  return (
    <table style={style.questionGroupWrapper}>
      <tbody>
        <tr>
          <td style={style.questionGroupDetailWrapper}>
            <h3 style={style.questionGroupTitle}>{groupName}</h3>
            {groupDescription && (
              <span style={style.questionGroupDescription}>
                Description: {groupDescription}
              </span>
            )}
          </td>
        </tr>
        <tr>
          <td>
            {questions.map((q, qi) => (
              <Question
                key={`question-${qi}`}
                last={qi === questions.length - 1}
                question={q}
                questionGroups={questionGroups}
              />
            ))}
          </td>
        </tr>
      </tbody>
    </table>
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
