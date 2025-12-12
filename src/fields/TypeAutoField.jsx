import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Form, Input } from 'antd';
import { Extra, FieldLabel, DataApiUrl, RepeatTableView } from '../support';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const checkIsPromise = (val) => {
  if (
    val !== null &&
    typeof val === 'object' &&
    typeof val.then === 'function' &&
    typeof val.catch === 'function'
  ) {
    return true;
  }
  return false;
};

const metaVarRegex = /#([^#\n]+)#/g;

const fnRegex =
  /^function(?:.+)?(?:\s+)?\((.+)?\)(?:\s+|\n+)?\{(?:\s+|\n+)?((?:.|\n)+)\}$/m;
const fnEcmaRegex = /^\((.+)?\)(?:\s+|\n+)?=>(?:\s+|\n+)?((?:.|\n)+)$/m;
const sanitize = [
  {
    prefix: /return fetch|fetch/g,
    re: /return fetch(\(.+)\} +|fetch(\(.+)\} +/,
    log: 'Fetch is not allowed.',
  },
];

const checkDirty = (fnString) => {
  return sanitize.reduce((prev, sn) => {
    const dirty = prev.match(sn.re);
    if (dirty) {
      return prev
        .replace(sn.prefix, '')
        .replace(dirty[1], `console.error("${sn.log}");`);
    }
    return prev;
  }, fnString);
};

const getFnMetadata = (fnString) => {
  const fnMetadata = fnRegex.exec(fnString) || fnEcmaRegex.exec(fnString);
  if (fnMetadata?.length >= 3) {
    const fn = fnMetadata[2].split(' ');
    return fn[0] === 'return' ? fnMetadata[2] : `return ${fnMetadata[2]}`;
  }
  return `return ${fnString}`;
};

// convert fn string to array
const fnToArray = (fnString) => {
  // First, handle any hex color patterns by replacing them temporarily
  let modifiedString = fnString;
  const hexColors = [];
  const hexColorRegex = /"#[0-9A-Fa-f]{6}"/g;
  let match;
  let index = 0;

  // Extract and replace hex colors with placeholders
  while ((match = hexColorRegex.exec(fnString)) !== null) {
    const placeholder = `__HEX_COLOR_${index}__`;
    hexColors.push({ placeholder, value: match[0] });
    modifiedString = modifiedString.replace(match[0], placeholder);
    index++;
  }

  // Use the standard regex for tokenizing
  const regex =
    // eslint-disable-next-line no-useless-escape
    /#([^#\n]+)#|[(),?;&.'":()+\-*/.!]|<=|<|>|>=|!=|==|[||]{2}|=>|__HEX_COLOR_[0-9]+__|#[0-9A-Fa-f]{6}|\w+| /g;

  // Get tokens
  const tokens = modifiedString.match(regex) || [];

  // Restore hex colors
  return tokens.map((token) => {
    const hexColor = hexColors.find((hc) => hc.placeholder === token);
    return hexColor ? hexColor.value : token;
  });
};

const handleNumericValue = (val) => {
  const regex = /^"\d+"$|^\d+$/;
  const isNumeric = regex.test(val);
  if (isNumeric) {
    return String(val).trim().replace(/['"]/g, '');
  }
  return val;
};
/**
 * Generates the body of a function based on metadata and input values.
 *
 * @param {string} fnMetadata - The metadata string representing the function logic.
 * @param {object} allValues - An object containing key-value pairs of all input values.
 * @param {array} questions - An array of question objects across all groups questions.
 * @param {number|string} id -  The ID of the current question.
 * @returns {string|boolean} - The generated function body as a string, or `false` if metadata is invalid.
 */
const generateFnBody = (fnMetadata, allValues, questions, id) => {
  if (!fnMetadata) {
    return false;
  }

  let defaultVal = null;
  // Replace variables with numeric placeholders
  let processedString = fnMetadata;
  // Iterate over keys of the values object and replace placeholders with '0'
  Object.keys(allValues).forEach((key) => {
    processedString = processedString.replace(new RegExp(`#${key}#`, 'g'), '0');
  });

  // Check if the processed string matches the regular expression
  const validNumericRegex = /^[\d\s+\-*/().]*$/;
  if (!validNumericRegex.test(processedString)) {
    // update defaultVal into empty string for non numeric equation
    defaultVal = fnMetadata.includes('!') ? String(null) : '';
  }

  const fnMetadataTemp = fnToArray(fnMetadata);

  // save defined condition to detect how many condition on fn
  // or save the total of condition inside fn string
  const fnBodyTemp = [];

  // generate the fnBody
  const fnBody = fnMetadataTemp.map((f) => {
    /**
     * Meta variable should be in the format of #questionName#
     * and should be replaced with the corresponding questionId or questionName
     * #questionName# => questionId
     */
    const metaVar = f.match(metaVarRegex);
    const [, repeatIndex] = `${id}`.split('-');
    const metaName = metaVar?.[0]?.slice(1, -1);
    const metaValue = questions?.find((q) => q?.name === metaName)?.id;
    if (metaValue) {
      fnBodyTemp.push(f); // save condition
      const metaKey =
        repeatIndex && typeof metaValue === 'number'
          ? `${metaValue}-${repeatIndex}`
          : metaValue;
      let val = allValues?.[metaKey];
      // ignored values (form standard)
      if (
        typeof val === 'undefined' ||
        val === null ||
        val === 9999 ||
        val === 9998
      ) {
        return defaultVal;
      }
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          val = val.join(',');
        } else {
          if (val?.lat) {
            val = `${val.lat},${val.lng}`;
          } else {
            val = defaultVal;
          }
        }
      }
      if (typeof val === 'number') {
        val = Number(val);
      }
      if (typeof val === 'string') {
        val = `"${val}"`;
      }
      return val;
    }
    return f;
  });

  // all fn conditions meet, return generated fnBody
  if (!fnBody.filter((x) => x === null || typeof x === 'undefined').length) {
    return fnBody
      .map(handleNumericValue)
      .join('')
      .replace(/(?:^|\s)\.includes/g, " ''.includes");
  }

  // return false if generated fnBody contains null align with fnBodyTemp
  // or meet the total of condition inside fn string
  if (
    fnBody.filter((x) => x === null || typeof x === 'undefined').length ===
    fnBodyTemp.length
  ) {
    return false;
  }

  // remap fnBody if only one fnBody meet the requirements
  const remapedFn = fnBody
    .map(handleNumericValue)
    .join('')
    .replace(/(?:^|\s)\.includes/g, " ''.includes");
  return remapedFn;
};

const fixIncompleteMathOperation = (expression) => {
  // Regular expression to match incomplete math operations
  const incompleteMathRegex = /[+\-*/]\s*$/;

  // Check if the input ends with an incomplete math operation
  if (incompleteMathRegex.test(expression)) {
    // Add a default number (0 in this case) to complete the operation
    const mathExpression = expression?.slice(6)?.trim();
    if (mathExpression?.endsWith('+') || mathExpression?.endsWith('-')) {
      expression += '0';
    }
    if (['*', '/'].includes(mathExpression.slice(-1))) {
      return `return ${mathExpression.slice(0, -1)}`;
    }
  }
  return expression;
};

export const strToFunction = (fnString, allValues, questions, id) => {
  fnString = checkDirty(fnString);
  const fnMetadata = getFnMetadata(fnString);
  const fnBody = fixIncompleteMathOperation(
    generateFnBody(fnMetadata, allValues, questions, id)
  );
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
};

const strMultilineToFunction = (fnString, allValues, questions, id) => {
  fnString = checkDirty(fnString);
  const fnBody = generateFnBody(fnString, allValues, questions, id);
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
};

const AutoField = ({
  id,
  keyform,
  required,
  rules,
  addonAfter,
  addonBefore,
  fn,
  show_repeat_in_question_level,
  dependency,
  repeat,
  extra,
  dataApiUrl,
  dependency_rule,
  group,
  allQuestions = null,
}) => {
  const form = Form.useFormInstance();
  const { getFieldValue, setFieldsValue, getFieldsValue } = form;
  const [fieldColor, setFieldColor] = useState(null);
  const allValues = getFieldsValue();
  const currentValue = getFieldValue(`${id}`);

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

  let automateValue = null;
  if (fn?.multiline && allQuestions.length) {
    automateValue = strMultilineToFunction(
      fn?.fnString,
      allValues,
      allQuestions,
      id
    );
  }
  if (!fn?.multiline && allQuestions.length) {
    automateValue = strToFunction(fn?.fnString, allValues, allQuestions, id);
  }

  const handleAutomateValue = useCallback(async () => {
    try {
      const answer = checkIsPromise(automateValue())
        ? await automateValue()
        : automateValue();

      if (typeof answer !== 'undefined' && answer !== currentValue) {
        setFieldsValue({ [id]: answer });
        /**
         * Legacy support for fnColor
         * @deprecated
         * @description check if fnColor is an object
         * and if the answer is in the object
         * if the answer is not equal to fieldColor
         * set the fieldColor to the answer
         * @type {string}
         */
        if (typeof fn?.fnColor === 'object') {
          if (fn?.fnColor?.[answer] !== fieldColor) {
            setFieldColor(fn.fnColor[answer]);
          }
        }
      }
    } catch {
      setFieldsValue({ [id]: null });
    }
  }, [
    automateValue,
    setFieldsValue,
    currentValue,
    fieldColor,
    fn?.fnColor,
    id,
  ]);

  useEffect(() => {
    handleAutomateValue();
  }, [handleAutomateValue]);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  useEffect(() => {
    if (typeof fn?.fnColor === 'string') {
      const fnColor = strToFunction(fn.fnColor, allValues, allQuestions, id);
      const fnColorValue = typeof fnColor === 'function' ? fnColor() : null;
      if (fnColorValue !== fieldColor) {
        setFieldColor(fnColorValue);
      }
    }
  }, [allQuestions, allValues, fieldColor, fn?.fnColor, id]);

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
        required={required}
      >
        <Input
          style={{
            width: '100%',
            backgroundColor: fieldColor || '#f5f5f5',
            fontWeight: fieldColor ? 'bold' : 'normal',
            color: fieldColor ? '#fff' : '#000',
          }}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          disabled
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
    </div>
  );
};

const TypeAutoField = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
  fn,
  requiredSign,
  dataApiUrl,
  dependency,
  show_repeat_in_question_level,
  repeats,
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
          <AutoField
            id={`${id}-${r}`}
            repeat={r}
            keyform={keyform}
            required={required}
            rules={rules}
            addonAfter={addonAfter}
            addonBefore={addonBefore}
            fn={fn}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            extra={extra}
            dataApiUrl={dataApiUrl}
            dependency_rule={dependency_rule}
            group={group}
            allQuestions={allQuestions}
          />
        ),
      };
    });
  }, [
    hideFields,
    addonAfter,
    addonBefore,
    id,
    keyform,
    required,
    rules,
    repeats,
    fn,
    show_repeat_in_question_level,
    dependency,
    extra,
    dataApiUrl,
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
      required={required}
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView
          id={id}
          dataSource={repeatInputs}
        />
      ) : (
        <AutoField
          id={id}
          keyform={keyform}
          required={required}
          rules={rules}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          fn={fn}
          show_repeat_in_question_level={show_repeat_in_question_level}
          extra={extra}
          dataApiUrl={dataApiUrl}
          dependency_rule={dependency_rule}
          group={group}
          allQuestions={allQuestions}
        />
      )}
    </Form.Item>
  );
};
export default TypeAutoField;
