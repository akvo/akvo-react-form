import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import { Webform } from 'akvo-react-form'
import * as forms from './example.json'
import * as cascade from './example-cascade.json'
import 'akvo-react-form/dist/index.css'

const formData = {
  ...forms.default,
  cascade: { administration: cascade.default }
}

const App = () => {
  const [showJson, setShowJson] = useState(false)
  const onChange = (value) => {
    console.log(value)
  }
  const onFinish = (values) => {
    const data = Object.keys(values).map((v) => {
      if (values[v]) {
        return { question: parseInt(v), value: values[v] }
      }
      return false
    })
    console.log(data.filter((x) => x))
  }
  return (
    <div className='display-container'>
      <div className={showJson ? 'half-width' : 'half-width full'}>
        <button
          className='button-hide-show'
          onClick={() => setShowJson(showJson ? false : true)}
        >
          {showJson ? '▶' : '◀'}
        </button>
        <Webform
          forms={formData}
          onChange={onChange}
          onFinish={onFinish}
          style={{ fontSize: '30px' }}
        />
      </div>
      <div className={'half-width json-source' + (!showJson ? ' shrink' : '')}>
        <ReactJson src={formData} theme='monokai' displayDataTypes={false} />
      </div>
    </div>
  )
}

export default App
