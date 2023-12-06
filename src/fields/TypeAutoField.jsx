import React, { useEffect, useState } from 'react';
import { Form, Input } from 'antd';
import { Extra, FieldLabel, DataApiUrl } from '../support';

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
  if (fnMetadata.length >= 3) {
    const fn = fnMetadata[2].split(' ');
    return fn[0] === 'return' ? fnMetadata[2] : `return ${fnMetadata[2]}`;
  }
  return false;
};

// convert fn string to array
const fnToArray = (fnString) => {
  const regex = /\#\d+|[(),?;&.'":]|\w+| /g;
  return fnString.match(regex);
};

const generateFnBody = (fnMetadata, getFieldValue) => {
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
    if (meta) {
      fnBodyTemp.push(f); // save condition
      let val = getFieldValue([meta[1]]);
      // ignored values (form stardard)
      if (val === 9999 || val === 9998) {
        return null;
      }
      if (!val) {
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
    const n = f.match(metaRegex);
    if (n) {
      return n[1];
    }
    return f;
  });

  // all fn conditions meet, return generated fnBody
  if (!fnBody.filter((x) => !x).length) {
    return fnBody.join('');
  }

  // return false if generated fnBody contains null align with fnBodyTemp
  // or meet the total of condition inside fn string
  if (fnBody.filter((x) => !x).length === fnBodyTemp.length) {
    return false;
  }

  // remap fnBody if only one fnBody meet the requirements
  const remapedFn = fnBody
    .map((x, xi) => {
      if (!x) {
        const f = fnMetadataTemp[xi];
        const splitF = f.split('.');
        if (splitF.length) {
          splitF[0] = `"${splitF[0]}"`;
        }
        return splitF.join('.');
      }
      return x;
    })
    .join(' ');
  return remapedFn;
};

const strToFunction = (fnString, getFieldValue) => {
  fnString = checkDirty(fnString);
  const fnMetadata = getFnMetadata(fnString);
  const fnBody = generateFnBody(fnMetadata, getFieldValue);
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
};

const strMultilineToFunction = (fnString, getFieldValue) => {
  fnString = checkDirty(fnString);
  const fnBody = generateFnBody(fnString, getFieldValue);
  try {
    return new Function(fnBody);
  } catch (error) {
    return false;
  }
};

const TypeAutoField = ({
  id,
  name,
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
  let automateValue = null;
  if (fn?.multiline) {
    automateValue = strMultilineToFunction(fn?.fnString, getFieldValue);
  } else {
    automateValue = strToFunction(fn?.fnString, getFieldValue);
  }

  useEffect(() => {
    if (automateValue) {
      if (checkIsPromise(automateValue())) {
        automateValue().then((res) => {
          setFieldsValue({ [id]: res });
        });
      } else {
        setFieldsValue({ [id]: automateValue() });
      }
    } else {
      setFieldsValue({ [id]: null });
    }
  }, [automateValue, id, setFieldsValue, fn]);

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
          content={name}
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
