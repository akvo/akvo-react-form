import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Divider, Form, Select, Input, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import GlobalStore from '../lib/store';
import { isHexColorCode } from '../lib';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const MultipleOptionField = ({
  option,
  id,
  keyform,
  required,
  rules,
  allowOther,
  allowOtherText,
  extra,
  meta,
  uiText,
  dataApiUrl,
  pre,
  disabled,
  is_repeat_identifier,
  dependency,
  show_repeat_in_question_level,
  repeat,
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
  const allValues = form.getFieldsValue();
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);

  const updateDataPointName = useCallback(
    (value) => {
      if (meta) {
        GlobalStore.update((gs) => {
          gs.dataPointName = gs.dataPointName.map((g) =>
            g.id === id
              ? {
                  ...g,
                  value: value.join(' - '),
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  useEffect(() => {
    if (currentValue && currentValue?.length) {
      updateDataPointName(currentValue);
    }
    if (!currentValue && pre) {
      const preItems = Object.keys(pre)
        .map((qn) => {
          const fq = allQuestions.find((q) => q?.name === qn);
          const answer = allValues?.[fq?.id];
          return pre?.[qn]?.[answer] || null;
        })
        .filter((v) => v);
      const flattenedArray = preItems.flat();
      const defaultValues = [...Array.from(new Set(flattenedArray))];

      if (preItems.length === Object.keys(pre).length) {
        form.setFieldsValue({ [id]: defaultValues });
      }
    }
  }, [
    currentValue,
    updateDataPointName,
    allValues,
    allQuestions,
    form,
    pre,
    id,
  ]);

  useEffect(() => {
    setOptions([...option, ...extraOption]);
  }, [option, extraOption]);

  const handleChange = (val) => {
    updateDataPointName(val);
  };

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      formRef: form,
      show_repeat_in_question_level,
      dependency,
      repeat,
    });

  return (
    <div>
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
        name={disableFieldByDependency ? null : id}
        rules={rules}
        required={!disabled ? required : false}
      >
        <Select
          style={{ width: '100%' }}
          mode="multiple"
          showArrow
          getPopupContainer={(trigger) => trigger.parentNode}
          onFocus={(e) => (e.target.readOnly = true)}
          placeholder={uiText.pleaseSelect}
          dropdownRender={(menu) =>
            allowOther ? (
              <div>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '0 8px 4px', width: '100%' }}>
                  <Input.Group compact>
                    <Button
                      type="primary"
                      onClick={addNewOption}
                      style={{ whiteSpace: 'nowrap' }}
                      icon={<PlusOutlined />}
                      disabled={!disabled ? !newOption.length : disabled}
                    />
                    <Input
                      style={{ width: 'calc(100% - 40px)', textAlign: 'left' }}
                      placeholder={allowOtherText || uiText.pleaseEnterItem}
                      value={newOption}
                      onChange={onNewOptionChange}
                      disabled={disabled}
                    />
                  </Input.Group>
                </div>
              </div>
            ) : (
              menu
            )
          }
          allowClear
          onChange={handleChange}
          disabled={
            disabled || is_repeat_identifier || disableFieldByDependency
          }
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
    </div>
  );
};

const TypeMultipleOption = ({
  option,
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  allowOther,
  allowOtherText,
  extra,
  meta,
  requiredSign,
  uiText,
  dataApiUrl,
  pre,
  is_repeat_identifier,
  show_repeat_in_question_level,
  repeats,
  dependency,
  disabled = false,
}) => {
  const form = Form.useFormInstance();

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    formRef: form,
    show_repeat_in_question_level,
    dependency,
    repeats,
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
        is_repeat_identifier: is_repeat_identifier,
        field: (
          <MultipleOptionField
            id={`${id}-${r}`}
            option={option}
            keyform={keyform}
            required={required}
            rules={rules}
            allowOther={allowOther}
            allowOtherText={allowOtherText}
            extra={extra}
            meta={meta}
            uiText={uiText}
            dataApiUrl={dataApiUrl}
            pre={pre}
            disabled={disabled}
            repeat={r}
            is_repeat_identifier={is_repeat_identifier}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
          />
        ),
      };
    });
  }, [
    hideFields,
    id,
    keyform,
    required,
    rules,
    allowOther,
    allowOtherText,
    uiText,
    is_repeat_identifier,
    repeats,
    show_repeat_in_question_level,
    dependency,
    option,
    extra,
    meta,
    disabled,
    dataApiUrl,
    pre,
  ]);

  if (hideFields) {
    return null;
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
      required={!disabled ? required : false}
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView
          id={id}
          dataSource={repeatInputs}
        />
      ) : (
        <MultipleOptionField
          id={id}
          option={option}
          keyform={keyform}
          required={required}
          rules={rules}
          allowOther={allowOther}
          allowOtherText={allowOtherText}
          extra={extra}
          meta={meta}
          uiText={uiText}
          dataApiUrl={dataApiUrl}
          pre={pre}
          disabled={disabled}
          is_repeat_identifier={is_repeat_identifier}
        />
      )}
    </Form.Item>
  );
};
export default TypeMultipleOption;
