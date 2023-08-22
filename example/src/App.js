import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import ReactJson from 'react-json-view';
import { Webform, SavedSubmission } from 'akvo-react-form';
import { Button, Input } from 'antd';
import * as forms from './rtmis-poc.json';
import * as cascade from './rtmis-poc-cascade.json';
import * as household from './rtmis-poc-household.json';
import * as tree_option from './example-tree-select.json';
import * as initial_value from './rtmis-example-initial-value.json';
// import CustomComponents from './CustomComponents'
import 'akvo-react-form/dist/index.css';

const { TextArea } = Input;

const formData = {
  ...forms.default,
  cascade: { administration: cascade.default, household: household.default },
  tree: { administration: tree_option.default },
};

const formId = 123456;

const generateRandomId = () => {
  const id = Math.random().toString(36).slice(-5);
  return `Datapoint-${id}`;
};

const App = () => {
  const initialId = generateRandomId();
  const [dataPointName, setDataPointName] = useState(initialId);
  const [source, setSource] = useState(formData);
  const [initialValue, setInitialValue] = useState([]);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [extraButton, setExtraButton] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sticky, setSticky] = useState(false);
  const [showPrintBtn, setShowPrintBtn] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(true);
  const [langDropdownValue, setLangDropdownValue] = useState('en');
  const webformRef = useRef();
  const [comment, setComment] = useState({});

  const renderCommentDefValue = useCallback(() => {
    if (!initialValue?.length) {
      return;
    }
    // add comment default value after dom loaded
    const commentDefValues = {
      28: 'Lorem ipsum repeat 1',
      '28-1': 'Lorem ipsum repeat 2',
    };
    // get parent extra component node by name
    const extraElName = `arf-extra-content`;
    const els = document.getElementsByName(extraElName);
    // iterate over extra component dom
    els.forEach((el) => {
      // get arf qid from extra component parent
      // filter element if arf qid definend in def comment values
      const arfQid = el.getAttribute('arf_qid');
      if (!arfQid || !commentDefValues?.[arfQid]) {
        return;
      }
      const childs = el.childNodes;
      if (!childs?.length || !childs?.[0]?.childNodes?.length) {
        return;
      }
      childs[0].childNodes.forEach((cel) => {
        // check text area
        const textArea = cel.getAttribute('name') === 'text-area';
        if (!textArea) {
          return;
        }
        cel.value = commentDefValues?.[arfQid];
      });
    });
  }, [initialValue]);

  // event listener
  window.addEventListener('DOMContentLoaded', renderCommentDefValue);
  useEffect(() => {
    setTimeout(() => {
      renderCommentDefValue();
    }, 100);
  }, [renderCommentDefValue]);

  const onChange = (value) => {
    console.info(value);
  };

  const onChangeComment = useCallback(
    (val) => {
      const arfQid =
        val.currentTarget.parentNode.parentNode.getAttribute('arf_qid');
      const updatedComment = {
        ...comment,
        [arfQid]: val.target.value,
      };
      setTimeout(() => {
        setComment(updatedComment);
        console.info('commentValue', updatedComment);
      }, 2500);
    },
    [comment]
  );

  const onDeleteComment = useCallback(
    (curr) => {
      const elTarget = curr.currentTarget;
      const arfQid = elTarget.parentNode.parentNode.getAttribute('arf_qid');
      delete comment?.[arfQid];
      // clear text area value
      const els = elTarget.parentNode.childNodes;
      els.forEach((el) => {
        const textarea = el.getAttribute('name');
        if (textarea !== 'text-area') {
          return;
        }
        el.value = '';
      });
      setTimeout(() => {
        console.info(`Comment ${arfQid} deleted`, comment);
      }, 1000);
    },
    [comment]
  );

  const onFinish = (values, refreshForm) => {
    console.info(values);
    const newId = generateRandomId();
    setDataPointName(newId);
    refreshForm();
  };

  const onJsonEdit = ({ updated_src }) => {
    setSource(updated_src);
  };

  const onJsonAdd = (value) => {
    console.info(value);
  };

  const onCompleteFailed = ({ values, errorFields }) => {
    console.info(values, errorFields);
  };

  const formSources = useMemo(() => {
    if (!source || !source?.question_group) {
      return {};
    }
    return {
      ...source,
      question_group: source.question_group.map((qg) => {
        const question = qg.question.map((q) => {
          if (q.id !== 28) {
            return q;
          }
          // Add extra comment component example to qid 28
          return {
            ...q,
            extra: [
              {
                placement: 'after',
                content: (
                  <div>
                    <Button
                      name="delete-button"
                      size="small"
                      onClick={onDeleteComment}
                    >
                      Delete Comment
                    </Button>
                    <TextArea
                      name="text-area"
                      rows={3}
                      placeholder="Comment"
                      onChange={onChangeComment}
                    />
                  </div>
                ),
              },
            ],
          };
        });
        return {
          ...qg,
          question: question,
        };
      }),
    };
  }, [source, onChangeComment, onDeleteComment]);

  return (
    <div className="display-container">
      <div className={showJson ? 'half-width' : 'half-width full'}>
        <div className="btn-group-toggle">
          <img
            alt="github"
            src="https://img.shields.io/badge/Akvo-React Form-009688?logo=github&style=flat-square"
          />
          <img
            alt="npm"
            src="https://img.shields.io/npm/v/akvo-react-form?logo=npm&style=flat-square"
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
          <button onClick={() => setShowLangDropdown(!showLangDropdown)}>
            {showLangDropdown ? '☑' : '☒'} Languages Dropdown
          </button>
          {!showLangDropdown && (
            <select onChange={(e) => setLangDropdownValue(e.target.value)}>
              <option
                id="lang-en"
                value="en"
              >
                EN
              </option>
              <option
                id="lang-id"
                value="id"
              >
                ID
              </option>
            </select>
          )}
        </div>
        <Webform
          formRef={webformRef}
          forms={formSources}
          initialValue={initialValue}
          onChange={onChange}
          onFinish={onFinish}
          onCompleteFailed={onCompleteFailed}
          style={{ fontSize: '30px' }}
          sidebar={showSidebar}
          sticky={sticky}
          languagesDropdownSetting={{
            showLanguageDropdown: showLangDropdown,
            languageDropdownValue: langDropdownValue,
          }}
          submitButtonSetting={{
            loading: submitLoading,
            disabled: submitDisabled,
          }}
          extraButton={
            extraButton
              ? [
                  <Button
                    key="clear-btn"
                    type="danger"
                    onClick={() => webformRef.current.resetFields()}
                  >
                    Clear
                  </Button>,
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
              'tree',
            ],
            header: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1.5px solid #000',
                }}
              >
                <img
                  src="https://akvo.org/wp-content/uploads/2019/03/Logo_dot.gif"
                  style={{ marginRight: 12, height: 30 }}
                  alt="logo"
                />
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
                  Akvo React Form
                </span>
              </div>
            ),
          }}
          downloadSubmissionConfig={{
            visible: true,
            filename: 'Download Submission filename',
            horizontal: true /* default true */,
          }}
          autoSave={{
            formId: formId,
            name: dataPointName,
            buttonText: 'Save',
          }}
          leftDrawerConfig={{
            visible: true,
            title: 'Saved Submissions',
            content: <SavedSubmission formId={formId} />,
          }}
          UIText={{
            id: {
              addAnother: 'Tambahkan Lainnya',
              formOverview: 'Ringkasan Formulir',
            },
          }}
          // customComponent={CustomComponents}
        />
      </div>
      <div className={'half-width json-source' + (!showJson ? ' shrink' : '')}>
        <ReactJson
          src={formData}
          theme="monokai"
          displayDataTypes={false}
          onEdit={onJsonEdit}
          onAdd={onJsonAdd}
          indentWidth={2}
        />
      </div>
    </div>
  );
};
export default App;
