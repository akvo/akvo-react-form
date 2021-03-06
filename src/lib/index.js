import React from 'react'
import ReactHtmlParser from 'react-html-parser'
import { intersection } from 'lodash'
import * as locale from 'locale-codes'

const getDependencyAncestors = (questions, current, dependencies) => {
  const ids = dependencies.map((x) => x.id)
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency)
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency)
    current = [current, ...dependencies].flatMap((x) => x)
    ancestors.forEach((a) => {
      if (a?.dependency) {
        current = getDependencyAncestors(questions, current, a.dependency)
      }
    })
  }
  return current
}

export const transformForm = (forms) => {
  const questions = forms?.question_group
    .map((x) => {
      return x.question
    })
    .flatMap((x) => x)
    .map((x) => {
      if (x.type === 'option' || x.type === 'multiple_option') {
        return {
          ...x,
          option: x.option.map((o) => ({ ...o, label: o.name }))
        }
      }
      return x
    })

  const transformed = questions.map((x) => {
    if (x?.dependency) {
      return {
        ...x,
        dependency: getDependencyAncestors(
          questions,
          x.dependency,
          x.dependency
        )
      }
    }
    return x
  })

  const languages = forms?.languages?.map((x) => ({
    label: locale.getByTag(x).name,
    value: x
  })) || [{ label: 'English', value: 'en' }]

  return {
    ...forms,
    languages: languages,
    question_group: forms.question_group.map((qg) => {
      let repeat = {}
      let repeats = {}
      if (qg?.repeatable) {
        repeat = { repeat: 1 }
        repeats = { repeats: [0] }
      }
      return {
        ...qg,
        ...repeat,
        ...repeats,
        question: qg.question.map((q) => {
          return transformed.find((t) => t.id === q.id)
        })
      }
    })
  }
}

const translateObject = (obj, name, lang, parse = false) => {
  const html =
    obj?.translations?.find((x) => x.language === lang)?.[name] ||
    obj?.[name] ||
    ''
  if (html.length > 0 && parse) {
    return <div>{ReactHtmlParser(html)}</div>
  }
  return html
}

export const translateForm = (forms, lang) => {
  forms = {
    ...forms,
    name: translateObject(forms, 'name', lang),
    description: translateObject(forms, 'description', lang),
    question_group: forms.question_group.map((qg) => ({
      ...qg,
      name: translateObject(qg, 'name', lang),
      description: translateObject(qg, 'description', lang, true),
      repeatText: translateObject(qg, 'repeatText', lang),
      question: qg.question.map((q) => {
        q = {
          ...q,
          name: translateObject(q, 'name', lang, true),
          tooltip: {
            ...q.tooltip,
            text: translateObject(q.tooltip, 'text', lang, true)
          }
        }
        if (q?.extra?.length) {
          q = {
            ...q,
            extra: q.extra.map((ex) => ({
              ...ex,
              content: translateObject(ex, 'content', lang, true)
            }))
          }
        }
        if (q?.allowOtherText) {
          q = {
            ...q,
            allowOtherText: translateObject(q, 'allowOtherText', lang)
          }
        }
        if (q.type === 'option' || q.type === 'multiple_option') {
          return {
            ...q,
            option: q.option.map((o) => ({
              ...o,
              label: translateObject(o, 'name', lang)
            }))
          }
        }
        return q
      })
    }))
  }
  return forms
}

export const mapRules = ({ rule, type }) => {
  if (type === 'number') {
    return [
      {
        ...rule,
        type: 'number'
      }
    ]
  }
  return [{}]
}

export const validateDependency = (dependency, value) => {
  if (dependency?.options) {
    if (typeof value === 'string') {
      value = [value]
    }
    return intersection(dependency.options, value)?.length > 0
  }
  let valid = false
  if (dependency?.min) {
    valid = value >= dependency.min
  }
  if (dependency?.max) {
    valid = value <= dependency.max
  }
  if (dependency?.equal) {
    valid = value === dependency.equal
  }
  if (dependency?.notEqual) {
    valid = value !== dependency.notEqual && !!value
  }
  return valid
}

export const modifyDependency = ({ question }, { dependency }, repeat) => {
  const questions = question.map((q) => q.id)
  return dependency.map((d) => {
    if (questions.includes(d.id) && repeat) {
      return { ...d, id: `${d.id}-${repeat}` }
    }
    return d
  })
}

export const todayDate = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]
  const date = new Date()
  return `${
    monthNames[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`
}
