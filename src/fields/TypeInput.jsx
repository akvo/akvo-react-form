import React from 'react';
import { Form, Input } from 'antd';
import { Extra, FieldLabel } from '../support';
import GlobalStore from '../lib/store';

const TypeInput = ({
  id,
  name,
  keyform,
  required,
  rules,
  meta,
  tooltip,
  addonAfter,
  addonBefore,
  extra,
}) => {
  const extraBefore = extra
    ? extra.filter((ex) => ex.placement === 'before')
    : [];
  const extraAfter = extra
    ? extra.filter((ex) => ex.placement === 'after')
    : [];

  const onChange = (e) => {
    if (meta) {
      GlobalStore.update((gs) => {
        gs.dataPointName = gs.dataPointName.map((g) =>
          g.id === id ? { ...g, value: e.target.value } : g
        );
      });
    }
  };

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={name}
        />
      }
      tooltip={tooltip?.text}
      required={required}
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
        <Input
          sytle={{ width: '100%' }}
          onChange={onChange}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
        />
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
export default TypeInput;
