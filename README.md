# akvo-react-form

> Simple react component for building webforms

[![NPM](https://img.shields.io/npm/v/akvo-react-form.svg)](https://www.npmjs.com/package/akvo-react-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

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
## Example Form Structure
```json
{
  "name": "HH",
  "question_group": [
    {
      "name": "Registration",
      "order": 1,
      "question": [
        {
          "id": 1,
          "name": "Location",
          "order": 1,
          "type": "cascade",
          "option": "administration"
        },
        {
          "id": 2,
          "name": "Name",
          "order": 2,
          "type": "input"
        },
        {
          "id": 3,
          "name": "Birthdate",
          "order": 3,
          "type": "date"
        },
        {
          "id": 4,
          "name": "Gender",
          "order": 4,
          "type": "option",
          "option": [
            {
              "name": "Male",
              "order": 1
            },
            {
              "name": "Female",
              "order": 2
            },
            {
              "name": "Other",
              "order": 3
            }
          ]
        }
      ]
    },
    {
      "name": "Other Question",
      "order": 2,
      "question": [
        {
          "id": 4,
          "name": "Favorite Food",
          "order": 1,
          "type": "multiple_option",
          "option": [
            {
              "name": "Asian",
              "order": 1
            },
            {
              "name": "Western",
              "order": 2
            },
            {
              "name": "Vegetarian",
              "order": 3
            }
          ]
        },
        {
          "id": 5,
          "name": "Comment",
          "order": 2,
          "type": "text"
        },
        {
          "id": 5,
          "name": "Do you know beef rendang?",
          "order": 2,
          "type": "option",
          "option": [
            {
              "name": "Yes",
              "order": 1
            },
            {
              "name": "No",
              "order": 2
            }
          ]
        }
      ]
    }
  ],
  "cascade": {
      "administration": [{
        "value": 1,
        "label": "Jawa Barat",
        "children": [{
            "value": 1,
            "label": "Bandung"
        }, {
            "value": 2,
            "label": "Bogor"
        }, {
            "value": 3,
            "label": "Garut"
        }, {
            "value": 4,
            "label": "Sukabumi"
        }, {
            "value": 5,
            "label": "Cianjur"
        }, {
            "value": 6,
            "label": "Sumedang"
        }]
      },{
        "value": 1,
        "label": "Yogyakarta",
        "children": [{
            "value": 1,
            "label": "D.I Yogyakarta"
        }, {
            "value": 2,
            "label": "Sleman"
        }, {
            "value": 3,
            "label": "Bantul"
        }, {
            "value": 4,
            "label": "Kulon Progo"
        }, {
            "value": 5,
            "label": "Gunung Kidul"
        }]
      }]
  }
}
```

## License

AGPL-3.0 © [akvo](https://github.com/akvo)
