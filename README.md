# akvo-react-form

> Simple react component for building webforms

[![NPM](https://img.shields.io/npm/v/akvo-react-form.svg)](https://www.npmjs.com/package/akvo-react-form) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save akvo-react-form
```

## Usage

```jsx
import React from 'react'
import { Webform } from 'akvo-react-form'
import * as forms from './example.json'
import 'akvo-react-form/dist/index.css'

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

## License

AGPL-3.0 © [akvo](https://github.com/akvo)
