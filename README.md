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

| Type            | Description               |
| --------------- | ------------------------- |
| input           | Input                     |
| number          | InputNumber               |
| cascade         | Cascade Select            |
| text            | TextArea                  |
| date            | Date                      |
| option          | Option                    |
| multiple_select | Multiple Select           |
| tree            | Tree Select               |
| table           | Table (Multiple Question) |
| autofilled      | Autofilled                |

## Example Usage

```jsx
import React from 'react'
import 'akvo-react-form/dist/index.css' /* REQUIRED */
import { Webform } from 'akvo-react-form'
import * as forms from './example.json'

const App = () => {
  const onChange = ({ current, values, progress }) => {
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

| Props                        | Description                                                       | Type                                                                                                                     | Default |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------- |
| **sidebar**                  | Option to show / hide sidebar                                     | Boolean                                                                                                                  | true    |
| **sticky**                   | Sticky header and sidebar (Not support for IE9)                   | Boolean                                                                                                                  | false   |
| **onFinish**                 | Trigger after submitting the form and verifying data successfully | `function(values)`                                                                                                       | -       |
| **onChange**                 | Trigger after field value changed                                 | `function({current,values,progress})`                                                                                    | -       |
| **onCompleteFailed**         | Trigger when submit is clicked with blank required question       | `function(values, errorFields)`                                                                                          | -       |
| **submitButtonSetting**      | Submit Button Setting                                             | Object{loading: Boolean, disabled: Boolean} \| `undefined`                                                               | `{}`    |
| **extraButton**              | Extra Button Next to Submit Button                                | ReactComponent \| `undefined`                                                                                            | -       |
| **initialValue**             | Set value by Form initialization                                  | Array[[Initial Value](<#initial-value-(optional)>)] \| `undefined`                                                       | Array[] |
| **printConfig**              | Support survey print functionality                                | Object{showButton: Boolean, filename: String, hideInputType: Array["field type"], header: ReactComponent} \| `undefined` | -       |
| **downloadSubmissionConfig** | Support download submission to Excel                              | Object{visible: Boolean, filename: String, horizontal: Boolean} \| `undefined`                                           | -       |
| **leftDrawerConfig**         | Show left drawer with custom component                            | Object{visible: Boolean, title: String, Content: ReactComponent} \| `undefined`                                          | -       |
| **autoSave**                 | Enable auto save to IndexedDB                                     | [autoSaveObject](#auto-save-object) \| `undefined`                                                                       | -       |

## Properties

### Translations (optional)

| Props           | Description             | Type            |
| --------------- | ----------------------- | --------------- |
| **Unique{any}** | Object to be translated | Object{any}     |
| **language**    | Language                | Enum[ISO 693-1] |

### Form (Root)

| Props              | Description                               | Type                                                             |
| ------------------ | ----------------------------------------- | ---------------------------------------------------------------- |
| **name**           | Form Name / Title                         | String                                                           |
| **question_group** | List of Question Group                    | Array[[Question Group](#question-group)]                         |
| Unique{_any_}      | Cascade definition, can be any properties | Array[[Cascade](<#cascade-(any)>)]                               |
| **languages**      | List of available languages               | Array[enum[ISO 639-1]] \| `undefined`                            |
| **defaultLanguage**| Default active language                   | Enum[ISO 639-1]] \| `undefined`                                  |
| **translations**   | List of translations                      | Array[[Translations](<#translations-(optional)>)] \| `undefined` |

### Question Group

| Props            | Description                 | Type                                                             |
| ---------------- | --------------------------- | ---------------------------------------------------------------- |
| **name**         | Question Group Name / Title | String                                                           |
| **order**        | Question Group Order        | Integer \| `undefined`                                           |
| **description**  | Question Group Description  | String \| `undefined`                                            |
| **question**     | List of Question            | Array[[Question](#question)]                                     |
| **translations** | List of translations        | Array[[Translations](<#translations-(optional)>)] \| `undefined` |

### Cascade (any)

Cascading select questions are sets of questions whose options depend on the response to a previous question. Cascade object should be pre-defined on the question definition root object itself.

| Props            | Description                | Type                                                             |
| ---------------- | -------------------------- | ---------------------------------------------------------------- |
| **value**        | Cascade Value              | Unique (Integer \| String)                                       |
| **label**        | Cascade Label              | String                                                           |
| **children**     | Children of current object | Array[[Cascade](<#cascade-(any)>)] \| `undefined`                |
| **translations** | List of translations       | Array[[Translations](<#translations-(optional)>)] \| `undefined` |

Example:

```json
{
  "name": "Community Culinary Survey 2021",
  "translations": [
    {
      "name": "Komunitas Kuliner Survey 2021",
      "language": "id"
    }
  ],
  "languages": ["en", "id"],
  "question_group": [
    {
      "name": "Registration",
      "order": 1,
      "translations": [
        {
          "name": "Registrasi",
          "language": "id"
        }
      ],
      "question": [
        {
          "id": 1,
          "name": "Location",
          "order": 1,
          "type": "cascade",
          "option": "administration",
          "required": true,
          "translations": [
            {
              "name": "Lokasi",
              "language": "id"
            }
          ]
        }
      ]
    }
  ],
  "cascade": {
    "administration": [
      {
        "value": 1,
        "label": "Jawa Barat",
        "children": [
          {
            "value": 1,
            "label": "Garut"
          }
        ]
      }
    ]
  }
}
```

#### Using API for Cascade

Cascading select also support for a chain API call for the cascade dropdown list.

| Props        | Description          | Type                                                    |
| ------------ | -------------------- | ------------------------------------------------------- |
| **endpoint** | Cascade API          | String                                                  |
| **initial**  | Initial Parameter    | Integer \| String \| `undefined`                        |
| **list**     | Object name of array | `res.data?.[list] \| res.data` \| String \| `undefined` |

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

| Props    | Description   | Type                       |
| -------- | ------------- | -------------------------- |
| **id**   | Cascade Value | Unique (Integer \| String) |
| **name** | Cascade Label | String                     |

API Example : `https://tech-consultancy.akvo.org/akvo-flow-web-api/cascade/seap/cascade-296940912-v1.sqlite/0`

```json
[
  {
    "code": "ACEH",
    "id": 47,
    "name": "ACEH",
    "parent": 0
  },
  {
    "code": "BALI",
    "id": 128,
    "name": "BALI",
    "parent": 0
  }
]
```

### Question

| Props              | Description                                                                                                                                                        | Type                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **id**             | Question ID                                                                                                                                                        | Unique (Integer \| String)                                                                            |
| **order**          | Question Order                                                                                                                                                     | Integer \| `undefined`                                                                                |
| **tooltip**        | Question Tooltip                                                                                                                                                   | String \| `undefined`                                                                                 |
| **type**           | Question Type                                                                                                                                                      | `number` \| `input` \| `text` \| `option` \| `multiple_option` \| `cascade` \| `tree` \| `autofilled` \| `table` |
| **option**         | List of Option (for option type of question ) | Array[[Option](#option)] \| String (cascade object name, only for 'cascade' type) \| `undefined`      |
| **columns**        | Columns of table (for table type question) question                                                                                                                           | Array[[Columns](#columns)] \| `undefined`                                                |
| **dependency**     | List of Question Dependency                                                                                                                                        | Array[[Dependency](<#dependency-(skip-logic)>)] \| `undefined`                                        |
| **rule**           | Question [rule](#rule) to be validated (Only for 'number' type of question)                                                                                        | {min: Integer, max: Integer}                                                                          |
| **translations**   | List of translations                                                                                                                                               | Array[[Translations](<#translations-(optional)>)] \| `undefined`                                      |
| **extra**          | Extra Component                                                                                                                                                    | Array[[ExtraComponent](#extra-component)] \| `undefined`                                              |
| **addonBefore**    | Addon before Field (only support for number and input type of question)                                                                                            | ReactComponent \| String \| `undefined`                                                               |
| **addonAfter**     | Addon before Field (only support for number and input type of question)                                                                                            | ReactComponent \| String \| `undefined`                                                               |
| **allowOther**     | Allow other field (support for option and multiple_option type of question)                                                                                        | Boolean \| `undefined`                                                                                |
| **allowOtherText** | Text Replacement for allow other field (support for option and multiple_option type of question)                                                                   | String \| `undefined`                                                                                 |
| **checkStrategy**  | The way show selected item in box when question type is **tree**. Default: show checked treeNodes (just show parent treeNode), "children": show only children node | `parent` \| `children` \| `undefined`                                                                 |
| **expandAll**      | Whether to expand all treeNodes by default. Default: `false`                                                                                                       | Boolean \| `undefined`                                                                                |
| **fn**             | Function for autofilled type of question                                                                                                                           | [Autofilled Object](#autofilled-object) \| `undefined`                                                |

#### Extra Component

| Props            | Description                       | Type                                                             |
| ---------------- | --------------------------------- | ---------------------------------------------------------------- |
| **content**      | Content of the Extra Component    | ReactComponent \| String                                         |
| **placement**    | Placement for the Extra Component | `before` \| `after`                                              |
| **translations** | List of translations              | Array[[Translations](<#translations-(optional)>)] \| `undefined` |

### Rule

Rule should be defined as object, currently we only support min max value for number type of question.

| Props | Type                   |
| ----- | ---------------------- |
| **min**   | Integer \| `undefined` |
| **max**   | Integer \| `undefined` |
| **allowDecimal** | Boolean \| `undefined` |

Example:

```json
{
  "id": 1,
  "name": "Weight",
  "order": 1,
  "type": "number"
  "required": true,
  "tooltip": {"text": "Information Text"},
  "rule": {"min": 5,"max": 10},
  "addonAfter": "Kilograms"
  "translations": [{
      "name": "Berat Badan",
      "language": "id"
      }
   ],
   "extra": [{
       "placement": "before",
       "content": "Extra Component before the question",
       "translations": [{
           "content": "Komponen Tambahan sebelum pertanyaan ini",
           "language": "id"
        }]
    }]
}
```

### Dependency (Skip Logic)

If question has dependency, question will be hidden by default. The question will only shows when dependency question values matches with the dependency rules.

| Props        | Description                                                                              | Type                             |
| ------------ | ---------------------------------------------------------------------------------------- | -------------------------------- |
| **id**       | Question ID                                                                              | Integer \| String                |
| **options**  | List of dependency options to be validated, for 'option' type of the dependency question | Array[String] \| `undefined`     |
| **min**      | Minimum dependency value to be validate, for 'number' type of the dependency question    | Array[String] \| `undefined`     |
| **max**      | Maximum dependency value to be validate, for 'number' type of the dependency question    | Array[String] \| `undefined`     |
| **equal**    | Dependent answer is equal to                                                             | Integer \| String \| `undefined` |
| **notEqual** | Dependent answer is not blank and not equal to                                           | Integer \| String \| `undefined` |

Example:

```json
{
  "id": 11,
  "name": "Where do you usually order Rendang from ?",
  "dependency": [
    {
      "id": 9,
      "options": ["Yes"]
    },
    {
      "id": 10,
      "min": 8
    }
  ],
  "order": 5,
  "type": "option",
  "option": [
    {
      "name": "Pagi Sore",
      "order": 1
    },
    {
      "name": "Any Rendang Restaurant",
      "order": 2,
      "translations": [
        {
          "name": "Restoran Rendang Manapun",
          "language": "id"
        }
      ]
    }
  ],
  "required": true,
  "translations": [
    {
      "name": "Dimana anda biasanya membeli Rendang?",
      "language": "id"
    }
  ]
}
```

### Option

Option is valid only for `option` type of question

| Props            | Description          | Type                                                             |
| ---------------- | -------------------- | ---------------------------------------------------------------- |
| **name**             | Option Name / Label  | String                                                           |
| **order**            | Question Group Order | Integer \| `undefined`                                           |
| **translations**     | List of translations | Array[[Translations](<#translations-(optional)>)] \| `undefined` |

### Columns

Columns is valid only for `table` type of question

| Props            | Description                  | Type                                                             |
| ---------------- | ---------------------------- | ---------------------------------------------------------------- |
| **name**             | Column / Question object key | String                                                           |
| **type**             | Column / Question Type       | `number` \| `input` \| `text` \| `option` \| `multiple_option` \| `cascade` \| `tree` \| `autofilled` \| `table` |
| **label**            | Column / Question Label      | String                                                           |
| **option**           | Option value                 | Array[[Option](#option)] \| `undefined`                          |

### Initial Value (optional)

| Props           | Description                                         | Type                                                                            |
| --------------- | --------------------------------------------------- | ------------------------------------------------------------------------------- |
| **question**    | Question ID                                         | Unique (Integer \| String)                                                      |
| **value**       | Value of the Question                               | String \| Integer \| Object{lat,lng} \| Array[Integer \| String] \| Date Format |
| **repeatIndex** | Repeat Index in Repeated Question Group. Default: 0 | Integer \| `undefined`                                                          |

Example: **[Initial Value Example](https://github.com/akvo/akvo-react-form/blob/main/example/src/example-initial-value.json)**

### Autofilled Object

| Props         | Description                         | Type                |
| ------------- | ----------------------------------- | ------------------- |
| **fnString**  | String of function                  | String              |
| **multiline** | Wether function is multiline or not | Bool \| `undefined` |

Example for fnString:

```javascript
function () { return #1 / #2 }
```

OR

```javascript
() => { return #1.includes("Test") ? #2 / #3 : 0 }
```

Prefix **#N** is use to indicate the value of **question id N**. Note that we don't use [javascript eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) to overcome the security issue, the function will be sanitized before it's executed.

### Auto Save Object

| Props          | Description                 | Type                  |
| -------------- | --------------------------- | --------------------- |
| **formId**     | Required                    | Integer               |
| **name**       | Name for datapoint          | String \| `undefined` |
| **buttonText** | Custom text for save button | String \| `undefined` |

Auto save object require `formId` when it's enabled. This will filter list of saved data for particular `formId`. To show the list of saved datapoint we can use **dataStore**.

Example:

```jsx
import React, { useState, useEffect } from 'react'
import { dataStore } from 'akvo-react-form'

const DataList = () => {
  const [datapoint, setDatapoint] = useState([])

  useEffect(() => {
    const listData = dataStore.list(formId)
    listData.then((x) => {
      setDatapoint(x)
    })
  }, [])

  return (
    <table>{dataPoints.map((x, xi) => (
      <tr key={xi}>
        <td>
          {xi + 1}. {x.name}
        </td>
        <td>
            <button onClick={x.load}>
              Load
            </button>
            <button onClick={x.remove}>
              Delete
            </button>
          </Space>
        </td>
      </tr>
    ))}
  </table>)
}
```

## Example Form Structure

Please check the **[Form Definition Example](https://github.com/akvo/akvo-react-form/blob/main/example/src/example.json)** which contains all the current features of akvo-react-form.

## License

AGPL-3.0 © [akvo](https://github.com/akvo)
