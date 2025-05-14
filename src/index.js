import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Row, Col, Button, Form, Space, Select, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import 'antd/dist/antd.min.css';
import './styles.module.css';
import moment from 'moment';
import { range, intersection, isEmpty, takeRight, take, uniq } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import {
  transformForm,
  translateForm,
  todayDate,
  detectMobile,
  generateDataPointName,
  filterFormValues,
  uploadAllAttachments,
} from './lib';
import {
  ErrorComponent,
  Print,
  IFrame,
  MobileFooter,
  Sidebar,
  LeftDrawer,
} from './support';
import ds from './lib/db';
import extras from './lib/extras';
import locale from './locale';
import GlobalStore from './lib/store';
import { QuestionGroup, SavedSubmissionList } from './components';

export const dataStore = ds;
export const SavedSubmission = SavedSubmissionList;
export const DownloadAnswerAsExcel = extras.DownloadAnswerAsExcel;

export const Webform = ({
  forms,
  style,
  formRef = null,
  sidebar = true,
  sticky = false,
  initialValue: initialDataValue = [],
  submitButtonSetting = {},
  extraButton = '',
  printConfig = {
    showButton: false,
    hideInputType: [],
    header: '',
    filename: null,
  },
  customComponent = {},
  onChange = () => {},
  onFinish = () => {},
  onCompleteFailed = () => {},
  leftDrawerConfig = {},
  autoSave = {},
  downloadSubmissionConfig = {},
  fieldIcons = true,
  languagesDropdownSetting = {},
  UIText = {},
  allOptionDropdown = false,
  showSpinner = false,
}) => {
  const originalForms = forms;

  const [form] = Form.useForm();
  const initialValue = GlobalStore.useState((s) => s.initialValue);
  const current = GlobalStore.useState((s) => s.current);
  const dataPointName = GlobalStore.useState((s) => s.dataPointName);
  const [activeGroup, setActiveGroup] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [completeGroup, setCompleteGroup] = useState([]);
  const [showGroup, setShowGroup] = useState([]);
  const [updatedQuestionGroup, setUpdatedQuestionGroup] = useState([]);
  const [showLangDropdown, setShowLangDropdown] = useState(true);
  const [lang, setLang] = useState(forms?.defaultLanguage || 'en');
  const [isPrint, setIsPrint] = useState(false);
  const [isMobile, setIsMobile] = useState(detectMobile());
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

  const originalDocTitle = document.title;

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setIsMobile(detectMobile());
  });

  const uiText = useMemo(() => {
    const UILocale = locale?.[lang] || locale.en;
    const UITextParam = UIText?.[lang] || {};
    return { ...UILocale, ...UITextParam };
  }, [lang, UIText]);

  useEffect(() => {
    if (
      !isEmpty(languagesDropdownSetting) &&
      typeof languagesDropdownSetting?.showLanguageDropdown !== 'undefined'
    ) {
      setShowLangDropdown(languagesDropdownSetting.showLanguageDropdown);
    }
    if (
      !isEmpty(languagesDropdownSetting) &&
      languagesDropdownSetting?.languageDropdownValue
    ) {
      setLang(languagesDropdownSetting.languageDropdownValue);
    }
  }, [languagesDropdownSetting]);

  const formsMemo = useMemo(() => {
    // add fieldIcons to question param
    const updateQuestionParam = forms?.question_group?.map((qg) => {
      const questions = qg?.question?.map((q) => ({
        ...q,
        varName: q?.name,
        fieldIcons: fieldIcons,
      }));
      return {
        ...qg,
        question: questions,
      };
    });
    let formDef = transformForm({
      ...forms,
      question_group: updateQuestionParam,
    });
    if (updatedQuestionGroup.length) {
      const updatedQuestions = updateQuestionParam.flatMap((qg) => qg.question);
      formDef = {
        ...formDef,
        question_group: updatedQuestionGroup.map((qg) => {
          return {
            ...qg,
            question: qg.question.map((q) => {
              const findQ = updatedQuestions.find((u) => u.id === q.id);
              if (findQ) {
                return {
                  ...q,
                  disabled: findQ?.disabled || false,
                };
              }
              return q;
            }),
          };
        }),
      };
    }
    const translated = translateForm(formDef, lang);
    return translated;
  }, [lang, updatedQuestionGroup, forms, fieldIcons]);

  const sidebarProps = useMemo(() => {
    return {
      uiText: uiText,
      sidebar: sidebar,
      showGroup: showGroup,
      activeGroup: activeGroup,
      setActiveGroup: setActiveGroup,
      completeGroup: completeGroup,
      formsMemo: formsMemo?.question_group
        ? formsMemo
        : { ...formsMemo, question_group: [] },
      disabled: loadingInitial,
    };
  }, [
    uiText,
    sidebar,
    showGroup,
    activeGroup,
    completeGroup,
    formsMemo,
    loadingInitial,
  ]);

  useEffect(() => {
    GlobalStore.update((gs) => {
      gs.formConfig = { autoSave: autoSave };
    });
  }, [autoSave]);

  useEffect(() => {
    const meta = forms.question_group
      .filter((qg) => !qg?.repeatable)
      .flatMap((qg) => qg.question.filter((q) => q?.meta))
      .map((q) => ({ id: q.id, type: q.type, value: null }));
    const allQuestions = forms.question_group.reduce((uniqueQuestions, qg) => {
      qg.question.forEach((question) => {
        if (!uniqueQuestions.includes(question)) {
          uniqueQuestions.push(question);
        }
      });
      return uniqueQuestions;
    }, []);
    GlobalStore.update((gs) => {
      gs.dataPointName = meta;
      gs.allQuestions = allQuestions;
    });
  }, [forms]);

  useEffect(() => {
    if (initialDataValue.length) {
      form.resetFields();
      GlobalStore.update((gs) => {
        gs.initialValue = initialDataValue;
      });
    }
  }, [initialDataValue, form]);

  useEffect(() => {
    if (autoSave?.name) {
      ds.getId(autoSave.name)
        .then((d) => {
          ds.get(d.id);
        })
        .catch(() => {
          ds.new(autoSave?.formId || 1, autoSave.name);
        });
    } else {
      ds.disable();
    }
  }, [autoSave]);

  const handleBtnPrint = () => {
    setIsPrint(true);
    setTimeout(() => {
      const print = document.getElementById('arf-print-iframe');
      if (print) {
        const { filename } = printConfig;
        const title = filename || `${formsMemo?.name}_${todayDate()}`;
        // change iframe title
        print.contentDocument.title = title;
        // change document title
        document.title = title;
        print.focus();
        print.contentWindow.print();
      }
      setIsPrint(false);
      document.title = originalDocTitle;
    }, 2500);
  };

  const updateRepeat = (index, value, operation, repeatIndex = null) => {
    const updated = formsMemo.question_group.map((x, xi) => {
      const isRepeatsAvailable = x?.repeats && x?.repeats?.length;
      const repeatNumber = isRepeatsAvailable
        ? x.repeats[x.repeats.length - 1] + 1
        : value - 1;
      let repeats = isRepeatsAvailable ? x.repeats : [0];
      if (xi === index) {
        if (operation === 'add') {
          repeats = [...repeats, repeatNumber];
        }
        if (operation === 'delete') {
          repeats.pop();
        }
        if (operation === 'delete-selected' && repeatIndex !== null) {
          repeats = repeats.filter((r) => r !== repeatIndex);
        }
        return { ...x, repeat: value, repeats: repeats };
      }
      return x;
    });
    setCompleteGroup(
      completeGroup?.filter((c) => c !== `${index}-${value + 1}`)
    );
    setUpdatedQuestionGroup(updated);
  };

  const onComplete = async (values) => {
    if (onFinish) {
      // filter form values
      values = await uploadAllAttachments(values, formsMemo);
      const filteredFormValues = filterFormValues(values, formsMemo);
      const { dpName, dpGeo } = generateDataPointName(dataPointName);
      const refreshForm = () => {
        if (autoSave?.name) {
          ds.getId(autoSave.name).then((d) => {
            form.resetFields();
            ds.status(d.id, 1);
          });
        } else {
          form.resetFields();
        }
      };
      onFinish(
        { ...filteredFormValues, datapoint: { name: dpName, geo: dpGeo } },
        refreshForm
      );
    }
  };

  const onFinishFailed = ({ values, errorFields, outOfDate }) => {
    if (onCompleteFailed) {
      // filter form values
      const filteredFormValues = filterFormValues(values, formsMemo);
      onCompleteFailed({ values: filteredFormValues, errorFields, outOfDate });
    }
  };

  const onSave = () => {
    message.success(uiText.submissionSaved);
    Object.keys(current)
      .filter((x) => current[x])
      .forEach((x) => {
        ds.value.save({
          questionId: x,
          value: current[x],
        });
      });
  };

  const onValuesChange = useCallback(
    (qg, value /*, values */) => {
      // filter form values
      const values = filterFormValues(form.getFieldsValue(), forms);
      const errors = form.getFieldsError();
      const remapErrors = uniq(errors?.map((e) => e.name[0])).filter(
        (e) => !e.toString().includes('other')
      );

      const data = Object.keys(values).map((k) => ({
        id: k.toString(),
        value: values[k],
      }));

      const incomplete = errors.map((e) => e.name[0]);
      const incompleteWithMoreError = errors
        .filter((e) => e.errors.length)
        .map((e) => e.name[0].toString());
      // mark as filled for 0 number input and check if that input has an error
      const filled = data.filter(
        (x) =>
          (x.value || x.value === 0) && !incompleteWithMoreError.includes(x.id)
      );
      const completeQg = qg
        .map((x, ix) => {
          let ids = x.question.filter((q) => !q?.displayOnly).map((q) => q.id);
          // handle repeat group question
          let ixs = [ix];
          if (x?.repeatable) {
            let iter = x?.repeat;
            const suffix = iter > 1 ? `-${iter - 1}` : '';
            do {
              const rids = x.question.map((q) => `${q.id}${suffix}`);
              ids = [...ids, ...rids];
              ixs = [...ixs, `${ix}-${iter}`];
              iter--;
            } while (iter > 0);
          }
          // end of handle repeat group question
          const mandatory = intersection(incomplete, ids)?.map((id) =>
            id.toString()
          );
          const filledMandatory = filled.filter((f) =>
            mandatory.includes(f.id)
          );
          return {
            i: ixs,
            complete: filledMandatory.length === mandatory.length,
          };
        })
        .filter((x) => x.complete);
      setCompleteGroup(completeQg.flatMap((qg) => qg.i));

      const appearQuestion = Object.keys(values).map((x) =>
        parseInt(x.replace('-', ''))
      );
      const appearGroup = forms?.question_group
        ?.map((qg, qgi) => {
          const appear = intersection(
            qg.question.map((q) => q.id),
            appearQuestion
          );
          return { groupIndex: qgi, appearQuestion: appear.length };
        })
        .filter((x) => x.appearQuestion)
        .map((x) => x.groupIndex);
      setShowGroup(appearGroup);

      if (autoSave?.name) {
        ds.value.update({ value: value });
      }

      if (onChange) {
        GlobalStore.update((s) => {
          s.current = values;
        });
        onChange({
          current: value,
          values: values,
          progress: (filled.length / remapErrors.length) * 100,
          filledQIds: filled.map((a) => a.id),
          errorQIds: remapErrors,
        });
      }
    },
    [autoSave, form, forms, onChange]
  );

  useEffect(() => {
    // initial value load: related to src/lib/db.js line 95
    form.resetFields();
    if (initialValue.length) {
      setLoadingInitial(true);
      let values = {};
      const allQuestions =
        forms?.question_group
          ?.map((qg, qgi) =>
            qg.question.map((q) => ({ ...q, groupIndex: qgi }))
          )
          ?.flatMap((q) => q) || [];

      // Calculate repeats based on initialValues pattern
      const groupRepeats = forms?.question_group?.map((qg) => {
        if (qg?.repeatable && initialValue?.length) {
          // Get all questions in this group
          const groupQuestionIds = qg.question.map((q) => q.id);

          // Find all initialValues related to this question group
          const groupInitialValues = initialValue.filter((v) =>
            groupQuestionIds.includes(
              parseInt(v.question.toString().split('-')[0])
            )
          );

          // Extract repeat indices from question IDs like "1-1"
          const repeatIndices = groupInitialValues
            .map((v) => {
              const parts = v.question.toString().split('-');
              return parts.length > 1 ? parseInt(parts[1]) : 0;
            })
            .filter((idx) => !isNaN(idx));

          // If we found repeat indices, create repeats array from 0 to max index
          if (repeatIndices.length > 0) {
            const maxRepeatIndex = Math.max(...repeatIndices);
            const repeats = Array.from(
              { length: maxRepeatIndex + 1 },
              (_, i) => i
            );
            return { ...qg, repeat: maxRepeatIndex + 1, repeats: repeats };
          }
        }
        return qg;
      });
      setUpdatedQuestionGroup(groupRepeats);

      for (const val of initialValue) {
        const question = allQuestions.find((q) => q.id === val.question);
        const objName = val?.repeatIndex
          ? `${val.question}-${val.repeatIndex}`
          : val.question;
        // handle to show also 0 init value from number
        values =
          val?.value || val?.value === 0
            ? {
                ...values,
                [objName]:
                  question?.type !== 'date' ? val.value : moment(val.value),
              }
            : values;
      }
      if (isEmpty(values)) {
        setCompleteGroup([]);
        setLoadingInitial(false);
      } else {
        form.setFieldsValue(values);
        setTimeout(() => {
          onValuesChange(groupRepeats, values[Object.keys(values)[0]], values);
          setLoadingInitial(false);
        }, 1000);
      }
      const appearQuestion = Object.keys(form.getFieldsValue()).map((x) =>
        parseInt(x.replace('-', ''))
      );
      const appearGroup = forms?.question_group
        ?.map((qg, qgi) => {
          const appear = intersection(
            qg.question.map((q) => q.id),
            appearQuestion
          );
          return { groupIndex: qgi, appearQuestion: appear.length };
        })
        .filter((x) => x.appearQuestion)
        .map((x) => x.groupIndex);
      setShowGroup(appearGroup);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  useEffect(() => {
    const appearQuestion = Object.keys(form.getFieldsValue()).map((x) =>
      parseInt(x.replace('-', ''))
    );

    const metaUUIDs = forms?.question_group
      ?.flatMap((qg) => qg.question)
      ?.filter(({ meta_uuid }) => meta_uuid)
      ?.map((q) => ({
        question: q?.id,
        value: uuidv4(),
      }));

    if (metaUUIDs.length && initialValue.length === 0) {
      GlobalStore.update((s) => {
        s.initialValue = metaUUIDs;
      });
    }
    const appearGroup = forms?.question_group
      ?.map((qg, qgi) => {
        const appear = intersection(
          qg.question.map((q) => q.id),
          appearQuestion
        );
        return { groupIndex: qgi, appearQuestion: appear.length };
      })
      .filter((x) => x.appearQuestion)
      .map((x) => x.groupIndex);
    setShowGroup(appearGroup);
  }, [form, forms, initialValue]);

  const firstGroup = take(showGroup);
  const lastGroup = takeRight(showGroup);

  const PrevNextButton = () => {
    return formsMemo?.question_group.map((_, key) => {
      return (
        activeGroup === key && (
          <Col
            span={24}
            key={key}
            className="arf-next"
          >
            <Space>
              <Button
                className="arf-btn-previous"
                type="default"
                disabled={firstGroup?.includes(key)}
                onClick={() => {
                  const prevIndex = showGroup.indexOf(key);
                  setActiveGroup(showGroup[prevIndex - 1]);
                }}
              >
                {uiText.previous}
              </Button>
              <Button
                className="arf-btn-next"
                type="default"
                disabled={lastGroup.includes(key)}
                onClick={() => {
                  const nextIndex = showGroup.indexOf(key);
                  setActiveGroup(showGroup[nextIndex + 1]);
                }}
              >
                {uiText.next}
              </Button>
            </Space>
          </Col>
        )
      );
    });
  };

  const onDownload = () => {
    extras.DownloadAnswerAsExcel({
      question_group: originalForms?.question_group,
      answers: current,
      horizontal: downloadSubmissionConfig?.horizontal,
      filename: downloadSubmissionConfig?.filename,
    });
  };

  if (!formsMemo?.question_group) {
    return 'Error Format';
  }

  return (
    <Row className="arf-container">
      <Col
        span={24}
        className={`arf-form-header ${sticky ? 'arf-sticky' : ''}`}
      >
        <Row align="middle">
          <Col
            span={12}
            className={isMobile ? 'arf-mobile-header-wrapper' : ''}
          >
            <h1>{formsMemo?.name}</h1>
            <p>{generateDataPointName(dataPointName)?.dpName}</p>
          </Col>
          <Col
            span={12}
            align="right"
          >
            <Space>
              {showLangDropdown && (
                <Select
                  options={formsMemo.languages}
                  onChange={setLang}
                  defaultValue={formsMemo?.defaultLanguage || 'en'}
                  style={{ width: isMobile ? 105 : 150, textAlign: 'left' }}
                />
              )}
              {!isMobile && loadingInitial ? (
                <Button
                  type="secondary"
                  loading
                  disabled
                >
                  {uiText.loadingInitialData}
                </Button>
              ) : !isMobile ? (
                [
                  autoSave?.name && (
                    <Button
                      key="save"
                      onClick={onSave}
                    >
                      {autoSave?.buttonText || uiText.save}
                    </Button>
                  ),
                  <Button
                    key="submit"
                    type="primary"
                    htmlType="submit"
                    onClick={() => form.submit()}
                    {...submitButtonSetting}
                  >
                    {uiText.submit}
                  </Button>,
                  downloadSubmissionConfig?.visible && (
                    <Button
                      key="download"
                      type="primary"
                      onClick={onDownload}
                    >
                      {uiText.download}
                    </Button>
                  ),
                ]
              ) : (
                ''
              )}
              {extraButton}
              {printConfig.showButton && (
                <Button
                  ghost
                  type="primary"
                  onClick={handleBtnPrint}
                  loading={isPrint}
                >
                  {uiText.print}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Col>

      {/* Sidebar */}
      {sidebar && !isMobile && (
        <Col
          span={6}
          className={`arf-sidebar ${sticky ? 'arf-sticky' : ''}`}
        >
          <Sidebar {...sidebarProps} />
        </Col>
      )}

      {/* Form */}
      <Col span={sidebar && !isMobile ? 18 : 24}>
        <Spin
          spinning={loadingInitial && showSpinner}
          tip={uiText.loadingInitialData}
          indicator={
            <LoadingOutlined
              style={{
                fontSize: 24,
              }}
              spin
            />
          }
        >
          <Form
            ref={formRef}
            form={form}
            layout="vertical"
            name={formsMemo.name}
            scrollToFirstError="true"
            onValuesChange={(value, values) =>
              setTimeout(() => {
                onValuesChange(formsMemo.question_group, value, values);
              }, 100)
            }
            onFinish={onComplete}
            onFinishFailed={onFinishFailed}
            style={style}
            requiredMark={false}
            disabled={loadingInitial}
          >
            {formsMemo?.question_group?.map((g, key) => {
              const isRepeatable = g?.repeatable;
              const repeats =
                g?.repeats && g?.repeats?.length
                  ? g.repeats
                  : range(isRepeatable ? g.repeat : 1);
              const headStyle =
                sidebar && sticky && isRepeatable
                  ? {
                      backgroundColor: '#fff',
                      position: 'sticky',
                      top: sticky ? '59px' : 0,
                      zIndex: 9999,
                    }
                  : {};
              let QuestionGroupComponent = QuestionGroup;
              if (g?.custom_component) {
                QuestionGroupComponent =
                  customComponent?.[g.custom_component] || ErrorComponent;
              }
              return (
                <QuestionGroupComponent
                  key={key}
                  index={key}
                  group={g}
                  forms={formsMemo}
                  activeGroup={activeGroup}
                  sidebar={sidebar}
                  updateRepeat={updateRepeat}
                  repeats={repeats}
                  headStyle={headStyle}
                  initialValue={initialValue}
                  showGroup={showGroup}
                  uiText={uiText}
                  allOptionDropdown={
                    allOptionDropdown || formsMemo?.allOptionDropdown
                  }
                />
              );
            })}
          </Form>
        </Spin>
        {/* Previous & Next Button */}
        {sidebar && !isMobile && <PrevNextButton />}
      </Col>

      {/* Mobile Footer */}
      {isMobile && (
        <MobileFooter
          sidebarProps={sidebarProps}
          form={form}
          isMobile={isMobile}
          isMobileMenuVisible={isMobileMenuVisible}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
          isSaveFeatureEnabled={false}
          loadingInitial={loadingInitial}
          submitButtonSetting={submitButtonSetting}
          autoSave={autoSave}
          onSave={onSave}
          downloadSubmissionConfig={{
            ...downloadSubmissionConfig,
            onDownload: onDownload,
          }}
          uiText={uiText}
        />
      )}

      {/* Saved submission drawer */}
      {leftDrawerConfig?.visible && <LeftDrawer {...leftDrawerConfig} />}

      {isPrint && (
        <IFrame>
          <Print
            forms={originalForms}
            lang={lang}
            printConfig={printConfig}
          />
        </IFrame>
      )}
    </Row>
  );
};
