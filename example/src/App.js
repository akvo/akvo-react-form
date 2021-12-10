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
  const [showSidebar, setShowSidebar] = useState(false)
  const [sticky, setSticky] = useState(false)
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
        <div className='btn-group-toggle'>
          <img
            alt='github'
            src='https://img.shields.io/badge/Github-Akvo React Form-009688?logo=github&style=flat-square'
          />
          <img
            alt='npm'
            src='https://img.shields.io/npm/v/akvo-react-form?style=flat-square'
          />
          <button onClick={() => setShowJson(showJson ? false : true)}>
            {showJson ? '☑ JSON' : '☒ JSON'}
          </button>
          <button onClick={() => setSticky(sticky ? false : true)}>
            {sticky ? '☑ Sticky (px)' : '☒ Sticky (px)'}
          </button>
          <button onClick={() => setShowSidebar(showSidebar ? false : true)}>
            {showSidebar ? '☑ Sidebar' : '☒ Sidebar'}
          </button>
        </div>
        <Webform
          forms={formData}
          onChange={onChange}
          onFinish={onFinish}
          style={{ fontSize: '30px' }}
          sidebar={showSidebar}
          sticky={sticky}
        />
      </div>
      <div className={'half-width json-source' + (!showJson ? ' shrink' : '')}>
        <ReactJson src={formData} theme='monokai' displayDataTypes={false} />
      </div>
    </div>
  )
}

export default App
