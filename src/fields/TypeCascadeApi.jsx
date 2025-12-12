import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Form, Select } from 'antd';
import axios from 'axios';
import take from 'lodash/take';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import ds from '../lib/db';
import GlobalStore from '../lib/store';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const correctUrl = (url) => {
  if (!url.includes('?')) {
    const firstAmp = url.indexOf('&');
    if (firstAmp !== -1) {
      url = url.substring(0, firstAmp) + '?' + url.substring(firstAmp + 1);
    }
  }
  return url;
};

const CascadeApiField = ({
  id,
  api,
  keyform,
  required,
  meta,
  rules,
  extra,
  initialValue,
  dataApiUrl,
  partialRequired,
  uiText,
  disabled,
  repeat,
  dependency,
  show_repeat_in_question_level,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();
  const formConfig = GlobalStore.useState((s) => s.formConfig);
  const { autoSave } = formConfig;
  const [cascade, setCascade] = useState([]);
  const [selected, setSelected] = useState([]);
  const { endpoint, initial, list, query_params } = api;

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  useEffect(() => {
    if (autoSave?.name && selected.length) {
      ds.value.update({ value: { [id]: selected } });
      GlobalStore.update((s) => {
        s.current = { ...s.current, [id]: selected };
      });
    }
    if (cascade.length && selected.length && meta) {
      const combined = cascade
        .flatMap((c) => c)
        .filter((c) => selected.includes(c.id))
        .map((c) => c.name);
      GlobalStore.update((gs) => {
        gs.dataPointName = gs.dataPointName.map((g) =>
          g.id === id
            ? {
                ...g,
                value: combined.join(' - '),
              }
            : g
        );
      });
    }
  }, [id, meta, autoSave, cascade, selected]);

  useEffect(() => {
    let ep =
      typeof initial !== 'undefined' ? `${endpoint}/${initial}` : `${endpoint}`;
    if (query_params) {
      ep = correctUrl(`${ep}${query_params}`);
    }
    axios.get(ep).then((res) => {
      const data = list ? res.data?.[list] : res.data;
      setCascade([data]);
    });
  }, [endpoint, initial, list, query_params]);

  useEffect(() => {
    if (initialValue.length) {
      let calls = [];
      let ep =
        typeof initial !== 'undefined'
          ? `${endpoint}/${initial}`
          : `${endpoint}`;
      if (query_params) {
        ep = `${ep}${query_params}`;
      }
      ep = correctUrl(ep);
      const initCall = new Promise((resolve, reject) => {
        axios
          .get(ep)
          .then((res) => {
            const data = list ? res.data?.[list] : res.data;
            resolve(data);
          })
          .catch((err) => {
            reject(err);
          });
      });
      calls = [initCall];
      for (const id of initialValue) {
        const call = new Promise((resolve, reject) => {
          let ep = `${endpoint}/${id}`;
          if (query_params) {
            ep = `${ep}${query_params}`;
          }
          ep = correctUrl(ep);
          axios
            .get(ep)
            .then((res) => {
              const data = list ? res.data?.[list] : res.data;
              resolve(data);
            })
            .catch((err) => {
              reject(err);
            });
        });
        calls = [...calls, call];
      }
      Promise.all(calls).then((values) => {
        setCascade(values.filter((v) => v.length));
        setSelected(initialValue);
      });
    }
  }, [initialValue, endpoint, initial, list, query_params]);

  const handleChange = (value, index) => {
    if (!index) {
      setSelected([value]);
      form.setFieldsValue({ [id]: [value] });
    } else {
      const prevValue = take(selected, index);
      const result = [...prevValue, value];
      setSelected(result);
      form.setFieldsValue({ [id]: result });
    }
    let ep = `${endpoint}/${value}`;
    if (query_params) {
      ep = `${ep}${query_params}`;
    }
    ep = correctUrl(ep);
    axios.get(ep).then((res) => {
      const data = list ? res.data?.[list] : res.data;
      if (data.length) {
        const prevCascade = take(cascade, index + 1);
        setCascade([...prevCascade, ...[data]]);
      }
    });
  };

  const isCascadeLoaded = useMemo(() => {
    const status = cascade?.[0]?.name?.toLowerCase() !== 'error';
    // if (cascade.length && !status) {
    //   console.error("Can't load Cascade value, please check your API");
    // }
    return status;
  }, [cascade]);

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      questionId: id,
      formRef: form,
      show_repeat_in_question_level,
      dependency_rule,
      dependency,
      repeat,
      group,
      allQuestions,
      isDisableFieldByDependency: true,
    });

  return (
    <div>
      <Form.Item
        className="arf-field-cascade"
        key={keyform}
        name={disableFieldByDependency ? null : id}
        rules={required && partialRequired ? rules : () => {}}
        required={!disabled ? required && partialRequired : false}
        noStyle
      >
        <Select
          mode="multiple"
          options={[]}
          hidden
          disabled={disabled}
        />
      </Form.Item>
      <div className="arf-field-cascade-api">
        {!!extraBefore?.length &&
          extraBefore.map((ex, exi) => (
            <Extra
              key={exi}
              id={id}
              {...ex}
            />
          ))}
        {cascade.map((c, ci) => {
          return (
            <Row
              key={`keyform-cascade-${ci}`}
              className="arf-field-cascade-list"
            >
              <Form.Item
                name={[id, ci]}
                noStyle
                rules={required && !partialRequired ? rules : () => {}}
                required={!disabled ? required && !partialRequired : false}
              >
                <Select
                  className="arf-cascade-api-select"
                  placeholder={`${uiText.selectLevel} ${ci + 1}`}
                  onFocus={(e) => (e.target.readOnly = true)}
                  getPopupContainer={(trigger) => trigger.parentNode}
                  onChange={(e) => handleChange(e, ci)}
                  options={
                    isCascadeLoaded
                      ? c.map((v) => ({ label: v.name, value: v.id }))
                      : []
                  }
                  value={selected?.[ci] || null}
                  allowClear
                  showSearch
                  filterOption
                  optionFilterProp="label"
                  disabled={disabled || disableFieldByDependency}
                />
              </Form.Item>
            </Row>
          );
        })}
        {!!extraAfter?.length &&
          extraAfter.map((ex, exi) => (
            <Extra
              key={exi}
              id={id}
              {...ex}
            />
          ))}
        {dataApiUrl && <DataApiUrl dataApiUrl={dataApiUrl} />}
      </div>
    </div>
  );
};

const TypeCascadeApi = ({
  id,
  name,
  api,
  keyform,
  required,
  meta,
  rules,
  tooltip,
  extra,
  initialValue = [],
  requiredSign,
  dataApiUrl,
  partialRequired = false,
  uiText,
  disabled = false,
  show_repeat_in_question_level,
  repeats,
  dependency,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    questionId: id,
    formRef: form,
    show_repeat_in_question_level,
    dependency_rule,
    dependency,
    repeats,
    group,
    allQuestions,
  });
  // eol show/hide fields

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level || hideFields) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <CascadeApiField
            id={`${id}-${r}`}
            api={api}
            keyform={keyform}
            required={required}
            meta={meta}
            rules={rules}
            extra={extra}
            initialValue={initialValue}
            dataApiUrl={dataApiUrl}
            partialRequired={partialRequired}
            uiText={uiText}
            disabled={disabled}
            repeat={r}
            dependency={dependency}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
          />
        ),
      };
    });
  }, [
    hideFields,
    api,
    keyform,
    required,
    meta,
    rules,
    extra,
    initialValue,
    dataApiUrl,
    partialRequired,
    uiText,
    disabled,
    dependency,
    show_repeat_in_question_level,
    id,
    repeats,
    dependency_rule,
    group,
    allQuestions,
  ]);

  if (hideFields) {
    return null;
  }

  return (
    <Col>
      <Form.Item
        className="arf-field"
        label={
          <FieldLabel
            keyform={keyform}
            content={name}
            requiredSign={required ? requiredSign : null}
          />
        }
        tooltip={tooltip?.text}
        required={!disabled ? required : false}
      >
        {/* Show as repeat inputs or not */}
        {show_repeat_in_question_level ? (
          <RepeatTableView
            id={id}
            dataSource={repeatInputs}
          />
        ) : (
          <CascadeApiField
            id={id}
            api={api}
            keyform={keyform}
            required={required}
            meta={meta}
            rules={rules}
            extra={extra}
            initialValue={initialValue}
            dataApiUrl={dataApiUrl}
            partialRequired={partialRequired}
            uiText={uiText}
            disabled={disabled}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
          />
        )}
      </Form.Item>
    </Col>
  );
};

export default TypeCascadeApi;
