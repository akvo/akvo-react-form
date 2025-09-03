import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col, Form, Cascader, Select } from 'antd';
import axios from 'axios';
import take from 'lodash/take';
import flattenDeep from 'lodash/flattenDeep';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import ds from '../lib/db';
import GlobalStore from '../lib/store';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';
import TypeCascadeApi from './TypeCascadeApi';

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
