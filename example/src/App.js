import React, { useState } from 'react'
import ReactJson from 'react-json-view'
import { Button } from 'antd'
import {
  Webform,
  DownloadAnswerAsExcel,
  dataStore,
  SavedSubmission
} from 'akvo-react-form'
import * as forms from './example.json'
import * as cascade from './example-cascade.json'
import * as tree_option from './example-tree-select.json'
import * as initial_value from './example-initial-value.json'
// import CustomComponents from './CustomComponents'
import 'akvo-react-form/dist/index.css'

const formData = {
  ...forms.default,
  cascade: { administration: cascade.default },
  tree: { administration: tree_option.default }
}

const formId = 123456
const dataPointName = 'Unnamed Datapoint'

const App = () => {
  const [source, setSource] = useState(formData)
  const [initialValue, setInitialValue] = useState([])
  const [submitDisabled, setSubmitDisabled] = useState(false)
  const [extraButton, setExtraButton] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [showJson, setShowJson] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [showPrintBtn, setShowPrintBtn] = useState(false)
  const [storedValues, setStoredValues] = useState({})
  const [dataPoints, setDataPoints] = useState([])

  const onChange = (value) => {
    setStoredValues(value.values)
  }

  const onDownload = () => {
    DownloadAnswerAsExcel({
      question_group: formData?.question_group,
      answers: storedValues,
      horizontal: true /* default true */
    })
  }

  const onFinish = (values) => {
    console.log(values)
  }

  const onJsonEdit = ({ updated_src }) => {
    setSource(updated_src)
  }

  const onJsonAdd = (value) => {
    console.log(value)
  }

  const onCompleteFailed = (values, errorFields) => {
    console.log(values, errorFields)
  }

  const onShowStoredData = () => {
    const listData = dataStore.list(formId)
    listData.then((x) => {
      setDataPoints(x)
    })
  }

  const onLoadDataPoint = (load) => {
    load()
  }

  const onDeleteDataPoint = (remove) => {
    remove()
      .then((id) => {
        setDataPoints(dataPoints.filter((x) => x.id !== id))
      })
      .catch((err) => {
        console.log(err)
      })
  }

  return (
    <div className='display-container'>
      <div className={showJson ? 'half-width' : 'half-width full'}>
        <div className='btn-group-toggle'>
          <img
            alt='github'
            src='https://img.shields.io/badge/Akvo-React Form-009688?logo=github&style=flat-square'
          />
          <img
            alt='npm'
            src='https://img.shields.io/npm/v/akvo-react-form?logo=npm&style=flat-square'
          />
          <button onClick={() => setShowJson(!showJson)}>
            {showJson ? '☑' : '☒'} JSON
          </button>
          <button
            onClick={() =>
              setInitialValue(initialValue.length ? [] : initial_value.default)
            }
          >
            {initialValue.length ? '☑' : '☒'} Initial Value
          </button>
          <button onClick={() => setSticky(!sticky)}>
            {sticky ? '☑' : '☒'} Sticky (px)
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? '☑' : '☒'} Sidebar
          </button>
          <button onClick={() => setSubmitDisabled(!submitDisabled)}>
            {submitDisabled ? '☑' : '☒'} Submit Disabled
          </button>
          <button onClick={() => setSubmitLoading(!submitLoading)}>
            {submitLoading ? '☑' : '☒'} Submit Loading
          </button>
          <button onClick={() => setExtraButton(!extraButton)}>
            {extraButton ? '☑' : '☒'} Extra Button
          </button>
          <button onClick={() => setShowPrintBtn(!showPrintBtn)}>
            {showPrintBtn ? '☑' : '☒'} Print Button
          </button>
        </div>
        <Webform
          forms={source}
          initialValue={initialValue}
          onChange={onChange}
          onFinish={onFinish}
          onCompleteFailed={onCompleteFailed}
          style={{ fontSize: '30px' }}
          sidebar={showSidebar}
          sticky={sticky}
          submitButtonSetting={{
            loading: submitLoading,
            disabled: submitDisabled
          }}
          extraButton={
            extraButton
              ? [
                  <Button key='download' type='primary' onClick={onDownload}>
                    Download
                  </Button>
                ]
              : ''
          }
          printConfig={{
            showButton: showPrintBtn,
            filename: 'Custom filename from printConfig',
            hideInputType: [
              'cascade',
              'geo',
              'date',
              'input',
              'number',
              'text',
              'option',
              'multiple_option',
              'tree'
            ],
            header: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1.5px solid #000'
                }}
              >
                <img
                  src='https://akvo.org/wp-content/uploads/2019/03/Logo_dot.gif'
                  style={{ marginRight: 12, height: 30 }}
                  alt='logo'
                />
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  Akvo React Form
                </span>
              </div>
            )
          }}
          autoSave={{
            formId: formId,
            name: dataPointName,
            duration: 3000,
            buttonText: 'Save'
          }}
          leftDrawerConfig={{
            visible: true,
            title: 'Saved Submissions',
            content: (
              <SavedSubmission
                dataPoints={dataPoints}
                onLoadDataPoint={onLoadDataPoint}
                onDeleteDataPoint={onDeleteDataPoint}
              />
            ),
            onShowStoredData: onShowStoredData
          }}
          // customComponent={CustomComponents}
        />
      </div>
      <div className={'half-width json-source' + (!showJson ? ' shrink' : '')}>
        <ReactJson
          src={formData}
          theme='monokai'
          displayDataTypes={false}
          onEdit={onJsonEdit}
          onAdd={onJsonAdd}
          indentWidth={2}
        />
      </div>
    </div>
  )
}
export default App
