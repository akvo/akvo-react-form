import React, { useState } from 'react';
import { Button, Form, Space } from 'antd';
import axios from 'axios';
import { isEmpty, get } from 'lodash';
import {
  mapRules,
  modifyRuleMessage,
  isDependencySatisfied,
  modifyDependency,
  validateDependency,
} from '../lib';
import QuestionFields from './QuestionFields.jsx';
import GlobalStore from '../lib/store';

const Question = ({
  group,
  fields,
  tree,
  cascade,
  repeat,
  initialValue,
  uiText,
  allOptionDropdown,
}) => {
  const allQuestions = GlobalStore.useState((s) => s.allQuestions);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintValue, setHintValue] = useState({});

  fields = fields?.map((field) => {
    if (repeat) {
      return { ...field, id: `${field.id}-${repeat}` };
    }
    return field;
  });
  return fields.map((field, key) => {
    if (field?.rule) {
      field = {
        ...field,
        rule: modifyRuleMessage(field.rule, uiText),
      };
    }
    let rules = [
      {
        validator: (_, value) => {
          const requiredErr = `${field.name.props.children[0]} ${uiText.errorIsRequired}`;
          if (field?.required) {
            if (field?.type === 'multiple_option' && value) {
              return value.length
                ? Promise.resolve()
                : Promise.reject(new Error(requiredErr));
            }
            if (field?.type === 'number' && !field?.rule?.allowDecimal) {
              return parseFloat(value) % 1 === 0
                ? Promise.resolve()
                : value
                ? Promise.reject(new Error(uiText.errorDecimal))
                : Promise.reject(new Error(requiredErr));
            }
            return value || value === 0
              ? Promise.resolve()
              : Promise.reject(new Error(requiredErr));
          }
          if (field?.type === 'number' && !field?.rule?.allowDecimal) {
            return parseFloat(value) % 1 === 0 || !value
              ? Promise.resolve()
              : Promise.reject(new Error(uiText.errorDecimal));
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
      // handle the dependency
      const modifiedDependency = modifyDependency(group, field, repeat);
      const fieldWithModifiedDeps = {
        ...field,
        dependency: modifiedDependency,
      };

      return (
        <Form.Item
          noStyle
          key={key}
          shouldUpdate={true}
        >
          {(f) => {
            // handle show repeat in question level
            // handle dependency for show repeat in question level
            const show_repeat_in_question_level =
              group?.show_repeat_in_question_level;

            // Build answers object from ALL form values for dependency evaluation
            // This ensures that nested dependencies can access ancestor values
            const allValues = f.getFieldsValue();
            const answers = {};

            // Convert all form values to strings (to match dependency ID format)
            Object.keys(allValues).forEach((key) => {
              answers[String(key)] = allValues[key];
            });

            // Use isDependencySatisfied with recursive ancestor checks
            const dependenciesSatisfied = isDependencySatisfied(
              fieldWithModifiedDeps,
              answers,
              allQuestions || group.question, // Pass all questions for recursive ancestor lookups
              show_repeat_in_question_level
            );

            // handle show repeat in question level
            // handle dependency for show repeat in question level
            {
              /* TODO:: DELETE const show_repeat_in_question_level =
              group?.show_repeat_in_question_level; */
            }
            if (show_repeat_in_question_level) {
              // dependecy for repeat in question level
              {
                /* TODO:: DELETE const matches = modifiedDependency
                .map((x) => {
                  return validateDependency(x, f.getFieldValue(x.id));
                })
                .filter((x) => x === true); */
              }
              return !dependenciesSatisfied ? null : (
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
                    uiText={uiText}
                    allOptionDropdown={allOptionDropdown}
                    group={group}
                    allQuestions={allQuestions}
                  />
                  {hint}
                </div>
              );
            }
            // normal dependency
            return !dependenciesSatisfied ? null : (
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
                  uiText={uiText}
                  allOptionDropdown={allOptionDropdown}
                  group={group}
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
          uiText={uiText}
          allOptionDropdown={allOptionDropdown}
          group={group}
        />
        {hint}
      </div>
    );
  });
};

export default Question;
