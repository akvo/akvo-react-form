import React from 'react'
import { translateForm } from '../lib'

const style = {
  container: {
    fontFamily: 'sans-serif',
    background: '#fff'
  },
  titleWrapper: {},
  title: {
    textAlign: 'center',
    fontSize: 20
  },
  contentWrapper: {
    marginTop: 24
  },
  questionGroupWrapper: {
    width: '100%',
    marginBottom: 24
  },
  questionGroupDetailWrapper: {
    width: '100%',
    padding: 15,
    background: '#EFEFEF',
    borderBottom: '1px solid #777777',
    pageBreakInside: 'avoid'
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
    padding: 12,
    border: '1px solid #777777',
    marginTop: 8,
    marginBottom: 11,
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

const Question = ({ form, last, question, questionGroups }) => {
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
  const renderTree = (child = false) => {
    if (type !== 'tree') {
      return ''
    }
    const treeData = !child ? form.tree[option] : child
    const marginPadding = !child
      ? { margin: 0, padding: 0 }
      : { margin: 0, paddingLeft: '1em' }
    const render = treeData.map((td, tdi) => {
      const { title, children } = td
      return (
        <ul
          key={`${title}-${tdi}`}
          style={{
            listStyleType: 'none',
            lineHeight: '23px',
            ...marginPadding
          }}
        >
          <li>
            <input type='checkbox' />
            <label style={{ marginLeft: 5 }}>{title}</label>
            {children ? renderTree(children) : ''}
          </li>
        </ul>
      )
    })
    return render
  }

  const border = !last ? { borderBottom: '1px solid #000' } : {}
  return (
    <table style={style.questionWrapper}>
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
              {renderTree()}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

const QuestionGroup = ({ form, group, questionGroups }) => {
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
                form={form}
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
            form={forms}
            group={qg}
            questionGroups={questionGroups}
          />
        ))}
      </div>
    </div>
  )
}

export default Print
