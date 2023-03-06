import React, { useState } from 'react';
import { Button, Form, Space } from 'antd';
import axios from 'axios';
import { isEmpty, get } from 'lodash';
import { mapRules, validateDependency, modifyDependency } from '../lib';
import QuestionFields from './QuestionFields.jsx';
import GlobalStore from '../lib/store';

const Question = ({ group, fields, tree, cascade, repeat, initialValue }) => {
  const current = GlobalStore.useState((s) => s.current);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintValue, setHintValue] = useState({});

  fields = fields?.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` };
    }
    return field;
  });
  return fields.map((field, key) => {
    let rules = [
      {
        validator: (_, value) => {
          const requiredErr = `${field.name.props.children[0]} is required`;
          const decimalError =
            'Decimal values are not allowed for this question';
          if (field?.required) {
            if (field?.type === 'number' && !field?.rule?.allowDecimal) {
              return parseFloat(value) % 1 === 0
                ? Promise.resolve()
                : value
                ? Promise.reject(new Error(decimalError))
                : Promise.reject(new Error(requiredErr));
            }
            return value || value === 0
              ? Promise.resolve()
              : Promise.reject(new Error(requiredErr));
          }
          if (field?.type === 'number' && !field?.rule?.allowDecimal) {
            return parseFloat(value) % 1 === 0 || !value
              ? Promise.resolve()
              : Promise.reject(new Error(decimalError));
          }
          return Promise.resolve();
        },
      },
    ];
    if (field?.rule) {
      rules = [...rules, ...mapRules(field)];
    }
    // hint
    let hint = '';
    if (field?.hint) {
      const showHintValue = () => {
        setHintLoading(field.id);
        if (hintValue?.[field.id]) {
          delete hintValue?.[field.id];
        }
        if (field.hint?.endpoint) {
          axios
            .get(field.hint.endpoint)
            .then((res) => {
              let data = [res.data.mean];
              if (field.hint?.path && field.hint?.path?.length) {
                data = field.hint.path.map((p) => get(res.data, p));
              }
              setHintValue({ ...hintValue, [field.id]: data });
            })
            .catch((err) => {
              console.error(err);
            })
            .finally(() => {
              setHintLoading(false);
            });
        }
        if (field.hint?.static && !field.hint?.endpoint) {
          setTimeout(() => {
            setHintLoading(false);
            setHintValue({ ...hintValue, [field.id]: [field.hint.static] });
          }, 500);
        }
      };
      hint = (
        <Form.Item
          className="arf-field"
          style={{ marginTop: -10, paddingTop: 0 }}
        >
          <Space>
            <Button
              type="primary"
              size="small"
              ghost
              onClick={() => showHintValue()}
              loading={hintLoading === field.id}
            >
              {field.hint?.buttonText || 'Validate value'}
            </Button>
            {!isEmpty(hintValue) &&
              hintValue?.[field.id] &&
              hintValue[field.id].join(', ')}
          </Space>
        </Form.Item>
      );
    }
    // eol of hint
    if (field?.dependency) {
      const modifiedDependency = modifyDependency(group, field, repeat);
      return (
        <Form.Item
          noStyle
          key={key}
          shouldUpdate={current}
        >
          {(f) => {
            const unmatches = modifiedDependency
              .map((x) => {
                return validateDependency(x, f.getFieldValue(x.id));
              })
              .filter((x) => x === false);
            return unmatches.length ? null : (
              <div key={`question-${field.id}`}>
                <QuestionFields
                  rules={rules}
                  index={key}
                  cascade={cascade}
                  tree={tree}
                  field={field}
                  initialValue={
                    initialValue?.find((i) => i.question === field.id)?.value
                  }
                />
                {hint}
              </div>
            );
          }}
        </Form.Item>
      );
    }
    return (
      <div key={`question-${field.id}`}>
        <QuestionFields
          rules={rules}
          key={key}
          index={key}
          tree={tree}
          cascade={cascade}
          field={field}
          initialValue={
            initialValue?.find((i) => i.question === field.id)?.value
          }
        />
        {hint}
      </div>
    );
  });
};

export default Question;
