import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import { Extra, FieldLabel, DataApiUrl } from '../support';
import GlobalStore from '../lib/store';

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

const metaRegex = /#([0-9]+(-[0-9]+)?)/;
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
  const regex =
    // eslint-disable-next-line no-useless-escape
    /\#\d+|#([^#\n]+)#|[(),?;&.'":()+\-*/.]|<=|<|>|>=|!=|==|[||]{2}|=>|\w+| /g;
  return fnString.match(regex);
};

const generateFnBody = (fnMetadata, values, questions) => {
  if (!fnMetadata) {
    return false;
  }

  const fnMetadataTemp = fnToArray(fnMetadata);

  // save defined condition to detect how many condition on fn
  // or save the total of condition inside fn string
  const fnBodyTemp = [];

  // generate the fnBody
  const fnBody = fnMetadataTemp.map((f) => {
    const meta = f.match(metaRegex);
    const metaVar = f.match(metaVarRegex);
    if (meta || metaVar?.[0]) {
      fnBodyTemp.push(f); // save condition
      const metaValue = meta
        ? meta[1]
        : questions.find((q) => q?.name === metaVar[0].slice(1, -1))?.id;
      let val = values?.[metaValue];
      // ignored values (form stardard)
      if (val === 9999 || val === 9998) {
        return null;
      }
      if (typeof val === 'object') {
        if (Array.isArray(val)) {
          val = val.join(',');
        } else {
          if (val?.lat) {
            val = `${val.lat},${val.lng}`;
          } else {
            val = null;
          }
        }
      }
      if (typeof val === 'number') {
        val = Number(val);
      }
      if (typeof val === 'string') {
        val = `"${val}"`;
      }
      const fnMatch = f.match(metaRegex);
      if (fnMatch) {
        val = fnMatch[1] === meta[1] ? val : val + fnMatch[1];
      }
      return val;
    }
    return f;
  });

  // all fn conditions meet, return generated fnBody
  if (!fnBody.filter((x) => x === null || typeof x === 'undefined').length) {
    return fnBody.join('').replace(/(?:^|\s)\.includes/g, " ''.includes");
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

const strToFunction = (fnString, values, questions) => {
  fnString = checkDirty(fnString);
  const fnMetadata = getFnMetadata(fnString);
  const fnBody = fixIncompleteMathOperation(
    generateFnBody(fnMetadata, values, questions)
  );
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
};

const strMultilineToFunction = (fnString, values, questions) => {
  fnString = checkDirty(fnString);
  const fnBody = generateFnBody(fnString, values, questions);
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
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
}) => {
  const form = Form.useFormInstance();
  const { getFieldValue, setFieldsValue } = form;
  const [fieldColor, setFieldColor] = useState(null);
  const allQuestions = GlobalStore.useState((gs) => gs.allQuestions);
  const currentValue = getFieldValue(id?.toString());

  useEffect(() => {
    const unsubscribeValues = GlobalStore.subscribe(async (s) => {
      const automateValue =
        fn?.multiline && allQuestions.length
          ? strMultilineToFunction(fn?.fnString, s.current, allQuestions)
          : strToFunction(fn?.fnString, s.current, allQuestions);

      if (typeof automateValue !== 'function') {
        return;
      }
      try {
        const answer = checkIsPromise(automateValue())
          ? await automateValue()
          : automateValue();

        if (typeof answer !== 'undefined' && answer !== currentValue) {
          setFieldsValue({ [id]: answer });
        }
      } catch {
        setFieldsValue({ [id]: null });
      }
    });

    return () => {
      unsubscribeValues();
    };
  }, [
    allQuestions,
    currentValue,
    fn?.fnString,
    fn?.multiline,
    id,
    setFieldsValue,
  ]);

  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  const value = getFieldValue(id.toString());

  useEffect(() => {
    const color = fn?.fnColor;
    if (color?.[value]) {
      setFieldColor(color[value]);
    } else {
      setFieldColor(null);
    }
  }, [fn, value]);

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
    </Form.Item>
  );
};
export default TypeAutoField;
