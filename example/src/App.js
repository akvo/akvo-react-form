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
