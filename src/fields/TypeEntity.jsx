import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Select, Tag } from 'antd';
import axios from 'axios';
import { Extra, FieldLabel, DataApiUrl } from '../support';
import GlobalStore from '../lib/store';
import { isHexColorCode } from '../lib';

const TypeEntity = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  extra,
  meta,
  requiredSign,
  uiText,
  dataApiUrl,
  source,
  disabled = false,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [previous, setPrevious] = useState(null);
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);
  const current = GlobalStore.useState((s) => s.current);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  const currentValue = form.getFieldValue([id]);

  const prevAdmAnswer = useMemo(() => {
    const findParent = allQuestions?.find(
      (q) => q?.source?.file === source?.cascade_parent
    );
    return current?.[findParent?.id]?.slice(-1)?.[0] || null;
  }, [allQuestions, source, current]);

  const fetchOptions = useCallback(async () => {
    if (prevAdmAnswer && source?.endpoint) {
      try {
        const { data } = await axios.get(`${source.endpoint}${prevAdmAnswer}`);
        const _options = data?.map((d) => ({ value: d?.id, label: d?.name }));
        setOptions(_options);
      } catch {
        setOptions([]);
      }
    }
  }, [prevAdmAnswer, source]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const resetOptions = useCallback(() => {
    const optionIDs = options?.map((o) => o?.value) || [];
    if (currentValue && prevAdmAnswer && !optionIDs.includes(currentValue)) {
      setPrevious(currentValue);
      form.setFieldsValue({ [id]: null });
    }

    if (!currentValue && optionIDs.includes(previous)) {
      setPrevious(null);
      form.setFieldsValue({ [id]: previous });
    }
  }, [currentValue, options, form, prevAdmAnswer, previous, id]);

  useEffect(() => {
    resetOptions();
  }, [resetOptions]);

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
      required={!disabled ? required : false}
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
        rules={required ? rules : () => {}}
        required={!disabled ? required : false}
      >
        <Select
          style={{ width: '100%' }}
          getPopupContainer={(trigger) => trigger.parentNode}
          onFocus={(e) => (e.target.readOnly = true)}
          placeholder={uiText.pleaseSelect}
          allowClear
          showSearch
          filterOption
          optionFilterProp="children"
          disabled={disabled}
        >
          {options.map((o, io) => (
            <Select.Option
              key={io}
              value={o.value}
            >
              {o?.color && isHexColorCode(o.color) ? (
                <Tag
                  color={o.color}
                  style={{ fontSize: 14, fontWeight: 600 }}
                >
                  {o.label}
                </Tag>
              ) : (
                o.label
              )}
            </Select.Option>
          ))}
        </Select>
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

export default TypeEntity;
