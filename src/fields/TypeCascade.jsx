import React, { useState, useEffect, useMemo } from 'react';
import { Row, Col, Form, Cascader, Select } from 'antd';
import axios from 'axios';
import take from 'lodash/take';
import { Extra, FieldLabel } from '../support';
import ds from '../lib/db';
import GlobalStore from '../lib/store';

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
}) => {
  const form = Form.useFormInstance();
  const formConfig = GlobalStore.useState((s) => s.formConfig);
  const { autoSave } = formConfig;
  const [cascade, setCascade] = useState([]);
  const [selected, setSelected] = useState([]);
  const { endpoint, initial, list } = api;

  useEffect(() => {
    if (autoSave?.name && selected.length) {
      ds.value.update({ value: { [id]: selected } });
      GlobalStore.update((s) => {
        s.current = { ...s.current, [id]: selected };
      });
    }
  }, [id, autoSave, selected]);

  useEffect(() => {
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
  }, [id, meta, cascade, selected]);

  useEffect(() => {
    const ep =
      typeof initial !== 'undefined' ? `${endpoint}/${initial}` : `${endpoint}`;
    axios
      .get(ep)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data;
        setCascade([data]);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [endpoint, initial, list]);

  useEffect(() => {
    if (initialValue.length) {
      let calls = [];
      const ep =
        typeof initial !== 'undefined'
          ? `${endpoint}/${initial}`
          : `${endpoint}`;
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
          axios
            .get(`${endpoint}/${id}`)
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
  }, [initialValue, endpoint, initial, list]);

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
    axios
      .get(`${endpoint}/${value}`)
      .then((res) => {
        const data = list ? res.data?.[list] : res.data;
        if (data.length) {
          const prevCascade = take(cascade, index + 1);
          setCascade([...prevCascade, ...[data]]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const isCascadeLoaded = useMemo(() => {
    const status = cascade?.[0]?.name?.toLowerCase() !== 'error';
    if (cascade.length && !status) {
      console.error("Can't load Cascade value, please check your API");
    }
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
          />
        }
        tooltip={tooltip?.text}
        required={required}
      >
        <Form.Item
          className="arf-field-cascade"
          key={keyform}
          name={id}
          rules={rules}
          required={required}
        >
          <Select
            mode="multiple"
            options={[]}
            hidden
          />
        </Form.Item>
        <div className="arf-field-cascade-api">
          {!!extraBefore?.length &&
            extraBefore.map((ex, exi) => (
              <Extra
                key={exi}
                {...ex}
              />
            ))}
          {cascade.map((c, ci) => {
            return (
              <Row
                key={`keyform-cascade-${ci}`}
                className="arf-field-cascade-list"
              >
                <Select
                  className="arf-cascade-api-select"
                  placeholder={`Select Level ${ci + 1}`}
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
                />
              </Row>
            );
          })}
          {!!extraAfter?.length &&
            extraAfter.map((ex, exi) => (
              <Extra
                key={exi}
                {...ex}
              />
            ))}
        </div>
      </Form.Item>
    </Col>
  );
};

const TypeCascade = ({
  cascade,
  id,
  name,
  form,
  api,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  initialValue,
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  if (!cascade && api) {
    return (
      <TypeCascadeApi
        id={id}
        name={name}
        form={form}
        keyform={keyform}
        required={required}
        api={api}
        rules={rules}
        tooltip={tooltip}
        initialValue={initialValue}
        extraBefore={extraBefore}
        extraAfter={extraAfter}
      />
    );
  }
  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
        />
      }
      tooltip={tooltip?.text}
      required={required}
    >
      {!!extraBefore?.length &&
        extraBefore.map((ex, exi) => (
          <Extra
            key={exi}
            {...ex}
          />
        ))}
      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={rules}
        required={required}
      >
        <Cascader
          options={cascade}
          getPopupContainer={(trigger) => trigger.parentNode}
          showSearch
        />
      </Form.Item>
      {!!extraAfter?.length &&
        extraAfter.map((ex, exi) => (
          <Extra
            key={exi}
            {...ex}
          />
        ))}
    </Form.Item>
  );
};

export default TypeCascade;
