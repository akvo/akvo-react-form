import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Form, Cascader, Select } from 'antd';
import axios from 'axios';
import take from 'lodash/take';
import flattenDeep from 'lodash/flattenDeep';
import { Extra, FieldLabel, DataApiUrl } from '../support';
import ds from '../lib/db';
import GlobalStore from '../lib/store';

const correctUrl = (url) => {
  if (!url.includes('?')) {
    const firstAmp = url.indexOf('&');
    if (firstAmp !== -1) {
      url = url.substring(0, firstAmp) + '?' + url.substring(firstAmp + 1);
    }
  }
  return url;
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
  extraBefore,
  extraAfter,
  initialValue = [],
  requiredSign,
  dataApiUrl,
  partialRequired = false,
  uiText,
  disabled = false,
}) => {
  const form = Form.useFormInstance();
  const formConfig = GlobalStore.useState((s) => s.formConfig);
  const { autoSave } = formConfig;
  const [cascade, setCascade] = useState([]);
  const [selected, setSelected] = useState([]);
  const { endpoint, initial, list, query_params } = api;

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
        <Form.Item
          className="arf-field-cascade"
          key={keyform}
          name={id}
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
                    disabled={disabled}
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
      </Form.Item>
    </Col>
  );
};

const TypeCascade = ({
  cascade,
  id,
  name,
  label,
  form,
  api,
  keyform,
  required,
  meta,
  rules,
  tooltip,
  extra,
  initialValue,
  requiredSign,
  partialRequired,
  uiText,
  dataApiUrl,
  disabled = false,
}) => {
  const formInstance = Form.useFormInstance();
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  const currentValue = formInstance.getFieldValue([id]);

  const combineLabelWithParent = useCallback((cascadeValue, parent) => {
    return cascadeValue?.map((c) => {
      if (c?.children) {
        return combineLabelWithParent(c.children, {
          ...c,
          parent_label: parent?.parent_label
            ? `${parent.parent_label} - ${parent.label}`
            : parent?.label,
          path: parent?.path
            ? `${parent.path}.${c.value}`
            : `${parent.value}.${c.value}`,
        });
      }
      return {
        ...c,
        parent_label: parent?.parent_label
          ? `${parent.parent_label} - ${parent.label}`
          : parent?.label,
        path: parent?.path
          ? `${parent.path}.${c.value}`
          : `${parent.value}.${c.value}`,
      };
    });
  }, []);

  const transformCascade = useCallback(() => {
    const transform = cascade.map((c) => {
      return combineLabelWithParent(c?.children, {
        ...c,
        path: c.value.toString(), // Initialize path with root value
      });
    });
    return flattenDeep(transform);
  }, [cascade, combineLabelWithParent]);

  const updateDataPointName = useCallback(
    (value) => {
      if (cascade && !api && meta) {
        const findLocation = transformCascade().find(
          (t) => t.path === value.join('.')
        );
        const combined = findLocation?.parent_label
          ? `${findLocation.parent_label} - ${findLocation.label}`
          : '';
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: combined,
                }
              : g
          );
        });
      }
    },
    [meta, id, api, cascade, transformCascade]
  );

  useEffect(() => {
    if (currentValue && currentValue?.length) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  const handleChangeCascader = (val) => {
    updateDataPointName(val);
  };

  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={label || name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        meta={meta}
        rules={rules}
        tooltip={tooltip}
        initialValue={initialValue}
        extraBefore={extraBefore}
        extraAfter={extraAfter}
        requiredSign={required ? requiredSign : null}
        partialRequired={partialRequired}
        uiText={uiText}
        dataApiUrl={dataApiUrl}
        disabled={disabled}
      />
    );
  }
  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={label || name}
          requiredSign={required ? requiredSign : null}
        />
      }
      tooltip={tooltip?.text}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => (
          <Extra
            key={exi}
            id={id}
            {...ex}
          />
        ))}
      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={rules}
        required={!disabled ? required : false}
      >
        <Cascader
          options={cascade}
          getPopupContainer={(trigger) => trigger.parentNode}
          onFocus={(e) => (e.target.readOnly = true)}
          showSearch
          placeholder={uiText.pleaseSelect}
          onChange={handleChangeCascader}
          disabled={disabled}
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => (
          <Extra
            key={exi}
            id={id}
            {...ex}
          />
        ))}
      {dataApiUrl && <DataApiUrl dataApiUrl={dataApiUrl} />}
    </Form.Item>
  );
};

export default TypeCascade;
