import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Space, Divider, Form, Radio, Select, Input, Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import GlobalStore from '../lib/store';
import { isHexColorCode } from '../lib';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const OptionField = ({
  id,
  option,
  keyform,
  required,
  rules,
  allowOther,
  allowOtherText,
  extra,
  meta,
  uiText,
  allOptionDropdown,
  dataApiUrl,
  pre,
  disabled,
  is_repeat_identifier,
  show_repeat_in_question_level,
  dependency,
  repeat,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [extraOption, setExtraOption] = useState([]);
  // handle disable allowOther input field for radio button
  const [disableAllowOtherInputField, setDisableAllowOtherInputField] =
    useState(true);
  // handle other option input field on radio group
  const otherOptionDefInputName = `${id}-other-option`;
  const [otherOptionInputName, setOtherOptionInputName] = useState(
    otherOptionDefInputName
  );
  const addNewOption = (e) => {
    setExtraOption([...extraOption, { name: newOption, label: newOption }]);
    e.preventDefault();
    setNewOption('');
  };
  const onNewOptionChange = (event) => {
    const value = event.target.value;
    setNewOption(value);
    if (allowOther && isRadioGroup) {
      form.setFieldsValue({ [id]: value });
    }
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
                  value: value,
                }
              : g
          );
        });
      }
    },
    [meta, id]
  );

  const isRadioGroup = useMemo(() => {
    return options.length <= 3 && !allOptionDropdown;
  }, [options, allOptionDropdown]);

  useEffect(() => {
    if (currentValue || currentValue === 0) {
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
        form.setFieldsValue({ [id]: defaultValues[0] });
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
    // handle other option input value
    if (isRadioGroup) {
      const value = val.target.value;
      // other option not selected
      setDisableAllowOtherInputField(true);
      setOtherOptionInputName(otherOptionDefInputName);
      form.setFieldsValue({ [otherOptionDefInputName]: newOption });
      if (allowOther && value === newOption) {
        // other option selected
        setDisableAllowOtherInputField(false);
        setOtherOptionInputName(id);
      }
      updateDataPointName(value);
      return;
    }
    updateDataPointName(val);
  };

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
        rules={disableAllowOtherInputField && required ? rules : () => {}}
        required={!disabled ? disableAllowOtherInputField && required : false}
      >
        {isRadioGroup ? (
          <Radio.Group
            onChange={handleChange}
            disabled={disabled}
          >
            <Space direction="vertical">
              {options.map((o, io) => (
                <Radio
                  key={io}
                  value={o.value}
                  disabled={disabled}
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
                </Radio>
              ))}
              {allowOther ? (
                <Radio value={newOption}>
                  <Form.Item
                    name={otherOptionInputName}
                    noStyle
                    rules={
                      !disableAllowOtherInputField && required
                        ? rules
                        : () => {}
                    }
                    required={
                      !disabled
                        ? !disableAllowOtherInputField && required
                        : false
                    }
                  >
                    <Input
                      placeholder={
                        allowOtherText || uiText.pleaseTypeOtherOption
                      }
                      value={newOption}
                      onChange={onNewOptionChange}
                      disabled={
                        !disabled
                          ? disableAllowOtherInputField
                          : is_repeat_identifier
                          ? is_repeat_identifier
                          : disabled
                      }
                    />
                  </Form.Item>
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
            placeholder={uiText.pleaseSelect}
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
              ) : (
                menu
              )
            }
            allowClear
            showSearch
            filterOption
            optionFilterProp="children"
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
        )}
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

const TypeOption = ({
  id,
  option,
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
  allOptionDropdown,
  dataApiUrl,
  pre,
  is_repeat_identifier,
  show_repeat_in_question_level,
  repeats,
  dependency,
  disabled = false,
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
        is_repeat_identifier: is_repeat_identifier,
        field: (
          <OptionField
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
            allOptionDropdown={allOptionDropdown}
            dataApiUrl={dataApiUrl}
            pre={pre}
            disabled={disabled}
            is_repeat_identifier={is_repeat_identifier}
            dependency={dependency}
            show_repeat_in_question_level={show_repeat_in_question_level}
            repeat={r}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
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
    extra,
    meta,
    option,
    allOptionDropdown,
    dataApiUrl,
    disabled,
    pre,
    dependency_rule,
    group,
    allQuestions,
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
        <OptionField
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
          allOptionDropdown={allOptionDropdown}
          dataApiUrl={dataApiUrl}
          pre={pre}
          disabled={disabled}
          is_repeat_identifier={is_repeat_identifier}
          dependency_rule={dependency_rule}
          group={group}
          allQuestions={allQuestions}
        />
      )}
    </Form.Item>
  );
};

export default TypeOption;
