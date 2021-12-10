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
| text | TextArea |
| date | Date |
| option | Option |
| multiple_select | Multiple Select |

## API

| Property | Description | Type | Default |
|------|------|------|------ |
| sidebar | Option to show / hide sidebar | Boolean | True |

## Example Usage

```jsx
import React from 'react'
import { Webform } from 'akvo-react-form'
import * as forms from './example.json'

const App = () => {
  const onChange = (d) => {
    console.log('onchange')
  }
  const onFinish = (d) => {
    console.log('onfinish')
  }
  return (
    <div className='full-width'>
      <Webform forms={forms.default} onChange={onChange} onFinish={onFinish} />
    </div>
  )
}

export default App
```

## Rules

Rule should be defined as object, currently we only support min max value for number type of question.

| Rulename | Type |
|------|------ |
| min | number |
| max | number |

Example:

```json
{
    "id": 1
    "name": "rate your hunger on a scale of 5 to 10"
    "order": 1
    "type": "number"
    "required": true
    "rule": {
        "min": 5
        "max": 10
    }
}
```

## Skip Logic

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

## Example Form Structure

Please check the [form definition example](https://github.com/akvo/akvo-react-form/blob/v1.2.4/example/src/example.json) which contains all the current features of akvo-react-form.


## License

AGPL-3.0 © [akvo](https://github.com/akvo)
