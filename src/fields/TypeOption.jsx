import React, { useState, useEffect, useCallback } from 'react';
import { Space, Divider, Form, Radio, Select, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Extra, FieldLabel } from '../support';
import GlobalStore from '../lib/store';

const TypeOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra,
  meta,
  coreMandatory = false,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [extraOption, setExtraOption] = useState([]);
  const addNewOption = (e) => {
    setExtraOption([...extraOption, { name: newOption, label: newOption }]);
    e.preventDefault();
    setNewOption('');
  };
  const onNewOptionChange = (event) => {
    setNewOption(event.target.value);
  };
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];
  const currentValue = form.getFieldValue([id]);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: value,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue || currentValue === 0) {
      updateDataPointName(currentValue);
    }
  }, [currentValue, updateDataPointName]);

  useEffect(() => {
    setOptions([...option, ...extraOption]);
  }, [option, extraOption]);

  const handleChange = (val) => {
    updateDataPointName(val);
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
          coreMandatory={coreMandatory}
        />
      }
      tooltip={tooltip?.text}
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
        {options.length < 3 ? (
          <Radio.Group onChange={handleChange}>
            <Space direction="vertical">
              {options.map((o, io) => (
                <Radio
                  key={io}
                  value={o.name}
                >
                  {o.label}
                </Radio>
              ))}
              {allowOther ? (
                <Radio
                  value={newOption}
                  disabled={!newOption?.length}
                >
                  <Input
                    placeholder={allowOtherText || 'Please Type Other Option'}
                    value={newOption}
                    onChange={onNewOptionChange}
                  />
                </Radio>
              ) : (
                ''
              )}
            </Space>
          </Radio.Group>
        ) : (
          <Select
            style={{ width: '100%' }}
            getPopupContainer={(trigger) => trigger.parentNode}
            onFocus={(e) => (e.target.readOnly = true)}
            dropdownRender={(menu) =>
              allowOther ? (
                <div>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Input.Group compact>
                    <Button
                      type="primary"
                      onClick={addNewOption}
                      style={{ whiteSpace: 'nowrap' }}
                      icon={<PlusOutlined />}
                      disabled={!newOption.length}
                    />
                    <Input
                      style={{ width: 'calc(100% - 40px)', textAlign: 'left' }}
                      placeholder={allowOtherText || 'Please enter item'}
                      value={newOption}
                      onChange={onNewOptionChange}
                    />
                  </Input.Group>
                </div>
              ) : (
                menu
              )
            }
            allowClear
            showSearch
            filterOption
            optionFilterProp="children"
            onChange={handleChange}
          >
            {options.map((o, io) => (
              <Select.Option
                key={io}
                value={o.name}
              >
                {o.label}
              </Select.Option>
            ))}
          </Select>
        )}
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
export default TypeOption;
