# Akvo React Form

Simple react component for building webforms. [View Demo](https://akvo.github.io/akvo-react-form/)


[![Build Status](https://akvo.semaphoreci.com/badges/akvo-react-form/branches/main.svg?style=shields)](https://akvo.semaphoreci.com/projects/akvo-react-form) [![Repo Size](https://img.shields.io/github/repo-size/akvo/akvo-react-form)](https://img.shields.io/github/repo-size/akvo/akvo-react-form) [![GitHub release](https://img.shields.io/github/release/akvo/akvo-react-form.svg)](https://GitHub.com/akvo/akvo-react-form/releases/) [![NPM](https://img.shields.io/npm/v/akvo-react-form.svg)](https://www.npmjs.com/package/akvo-react-form) [![Npm package total downloads](https://badgen.net/npm/dt/akvo-react-form)](https://npmjs.com/package/akvo-react-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![GitHub license](https://img.shields.io/github/license/akvo/akvo-react-form.svg)](https://github.com/akvo/akvo-react-form/blob/main/LICENSE)

## Install

#### Using NPM

```bash
npm install --save akvo-react-form
```
#### Using Yarn
```bash
yarn add akvo-react-form
```

## Supported Field Type

| Type | Description |
|------|------ |
| input | Input |
| number | InputNumber |
| cascade | Cascade Select |
| text | TextArea |
| date | Date |
| option | Option |
| multiple_select | Multiple Select |

## Example Usage

```jsx
import React from 'react'
import 'akvo-react-form/dist/index.css' /* REQUIRED */
import { Webform } from 'akvo-react-form'
import * as forms from './example.json'

const App = () => {
  const onChange = ({current, values, progress}) => {
    console.log(progress)
  }
  const onFinish = (values) => {
    console.log(values)
  }
  return (
    <div className='full-width'>
      <Webform forms={forms.default} onChange={onChange} onFinish={onFinish} />
    </div>
  )
}

export default App
```

## API

### Webform

| Props | Description | Type | Default |
|------|------|------|------ |
| **sidebar** | Option to show / hide sidebar | Boolean | true |
| **sticky** | Sticky header and sidebar (Not support for IE9) | Boolean | false |
| **onFinish** | Trigger after submitting the form and verifying data successfully | `function(values)` | - |
| **onChange** | Trigger after field value changed | `function({current,values,progress})` | - |

## Properties

### Form (Root)

| Props | Description | Type |
|------|------|------|
| **name** | Form Name / Title | String |
| **question_group** |  List of Question Group | Array[[Question Group](#question-group)] |
| Unique{*any*}| Cascade definition, can be any properties | Array[[Cascade](#cascade-(any))]|

### Question Group

| Props | Description | Type |
|------|------|------|
| **name** | Question Group Name / Title | String |
| **order** |  Question Group Order | Integer \| `undefined` |
| **description** |  Question Group Description | String \| `undefined` |
| **question** |  List of Question | Array[[Question](#question)] |

### Cascade (any)

Cascading select questions are sets of questions whose options depend on the response to a previous question. Cascade object should be pre-defined on the question definition root object itself.

| Props | Description | Type |
|------|------|------|
| **value** | Cascade Value | Unique (Integer \| String) |
| **label** | Cascade Label | String |
| **children** | Children of current object | Array[[Cascade](#cascade-(any))] \| `undefined` |

Example:

```json
{
  "name": "Community Culinary Survey 2021",
  "question_group": [{
      "name": "Registration",
      "order": 1,
      "question": [{
          "id": 1,
          "name": "Location",
          "order": 1,
          "type": "cascade",
          "option": "administration",
          "required": true
       }]
  }],
  "cascade": {
      "administration": [{
          "value":1,
          "label": "Jawa Barat",
          "children": [{
              "value":1,
              "label": "Garut",
          }]
      }]
  }
}
```

#### Using API for Cascade

Cascading select also support for a chain API call for the cascade dropdown list.

| Props | Description | Type |
|------|------|------|
| **endpoint** | Cascade API | String |
| **initial** | Initial Parameter | Integer \| String \| `undefined` |
| **list** | Object name of array, if `false` it will use the response without finding the object name. Example: `res.data?.[list] || res.data` | String \| `undefined` |

Example:
```json
  "name": "Community Culinary Survey 2021",
  "question_group": [{
      "name": "Registration",
      "order": 1,
      "question": [{
          "id": 1,
          "name": "Location",
          "order": 1,
          "type": "cascade",
          "api": {
            "endpoint": "https://tech-consultancy.akvo.org/akvo-flow-web-api/cascade/seap/cascade-296940912-v1.sqlite/",
            "initial": 0,
            "list": false
          },
          "required": true
       }]
  }]
```

| Props | Description | Type |
|------|------|------|
| **id** | Cascade Value | Unique (Integer \| String) |
| **name** | Cascade Label | String |

API Example : `https://tech-consultancy.akvo.org/akvo-flow-web-api/cascade/seap/cascade-296940912-v1.sqlite/0`
```json
[{
    "code": "ACEH",
    "id": 47,
    "name": "ACEH",
    "parent": 0
},{
    "code": "BALI",
    "id": 128,
    "name": "BALI",
    "parent": 0
}]
```


### Question

| Props | Description | Type |
|------|------|------|
| **id** | Question ID | Unique (Integer \| String) |
| **order** |  Question Order | Integer \| `undefined` |
| **tooltip** |  Question Tooltip | String \| `undefined` |
| **type** |  Question Type | `number` \| `input` \| `text` \| `option` \| `multiple_option` \| `cascade` |
| **option** |  List of Question | Array[[Option](#option)] \| String (cascade object name, only for 'cascade' type) \| `undefined` |
| **dependency** | List of Question Dependency | Array[[Dependency](#dependency-(skip-logic))] \| `undefined` |
| **rule** | Question [rule](#rule) to be validated (Only for 'number' type of question) | {min: Integer, max: Integer} |

### Rule

Rule should be defined as object, currently we only support min max value for number type of question.

| Props | Type |
|------|------ |
| min | Integer \| `undefined` |
| max | Integer \| `undefined` |

Example:

```json
{
  "id": 1,
  "name": "rate your hunger on a scale of 5 to 10",
  "order": 1,
  "type": "number"
  "required": true,
  "tooltip": {"text": "Information Text"},
  "rule": {"min": 5,"max": 10}
}
```


### Dependency (Skip Logic)

If question has dependency, question will be hidden by default. The question will only shows when dependency question values matches with the dependency rules.

| Props | Description | Type |
|------|------|------|
| **id** | Question ID | Integer \| String |
| **options** |  List of dependency options to be validated, for 'option' type of the dependency question | Array[String] \| `undefined` |
| **min** |  Minimum dependency value to be validate, for 'number' type of the dependency question | Array[String] \| `undefined` |
| **max** |  Maximum dependency value to be validate, for 'number' type of the dependency question | Array[String] \| `undefined` |

Example:

```json
{
  "id": 11,
  "name": "Where do you usually order Rendang from ?",
  "dependency": [{
      "id": 9,
      "options": ["Yes"]
    },{
      "id": 10,
      "min": 8
  }],
  "order": 5,
  "type": "option",
  "option": [{
      "name": "Pagi Sore",
      "order": 1
    },{
      "name": "Any Rendang Restaurant",
      "order": 2
  }],
  "required": true
}
```


### Option

Option is valid only for `option` type of question

| Props | Description | Type |
|------|------|------|
| **name** | Option Name / Label | String |
| **order** |  Question Group Order | Integer \| `undefined` |


## Example Form Structure

Please check the **[Form Definition Example](https://github.com/akvo/akvo-react-form/blob/v1.2.5/example/src/example.json)** which contains all the current features of akvo-react-form.


## License

AGPL-3.0 © [akvo](https://github.com/akvo)
