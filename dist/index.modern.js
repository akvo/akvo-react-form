import React from 'react';
import { Form, Card, Row, Col, Button, Radio, Space, Select, Cascader, DatePicker, InputNumber, Input } from 'antd';
import 'antd/dist/antd.css';
import TextArea from 'antd/lib/input/TextArea';

var Question = function Question(_ref) {
  var fields = _ref.fields,
      cascade = _ref.cascade;
  return fields.map(function (f, key) {
    return /*#__PURE__*/React.createElement(Form.Item, {
      key: key,
      name: f.id,
      label: key + 1 + ". " + f.name,
      rules: [{
        required: true
      }]
    }, f.type === 'option' ? f.option.length < 3 ? /*#__PURE__*/React.createElement(Radio.Group, null, /*#__PURE__*/React.createElement(Space, {
      direction: "vertical"
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(Radio, {
        key: io,
        value: o.name
      }, o.name);
    }))) : /*#__PURE__*/React.createElement(Select, {
      style: {
        width: '100%'
      }
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(Select.Option, {
        key: io,
        value: o.name
      }, o.name);
    })) : f.type === 'multiple_option' ? /*#__PURE__*/React.createElement(Select, {
      mode: "multiple",
      style: {
        width: '100%'
      }
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(Select.Option, {
        key: io,
        value: o.name
      }, o.name);
    })) : f.type === 'cascade' ? /*#__PURE__*/React.createElement(Cascader, {
      options: cascade[f.option]
    }) : f.type === 'date' ? /*#__PURE__*/React.createElement(DatePicker, {
      style: {
        width: '100%'
      }
    }) : f.type === 'number' ? /*#__PURE__*/React.createElement(InputNumber, {
      style: {
        width: '100%'
      }
    }) : f.type === 'text' ? /*#__PURE__*/React.createElement(TextArea, {
      row: 4
    }) : /*#__PURE__*/React.createElement(Input, {
      sytle: {
        width: '100%'
      }
    }));
  });
};

var Webform = function Webform(_ref2) {
  var forms = _ref2.forms,
      onChange = _ref2.onChange,
      onFinish = _ref2.onFinish,
      style = _ref2.style;

  if (!(forms !== null && forms !== void 0 && forms.question_group)) {
    return 'Error Format';
  }

  var onSubmit = function onSubmit(values) {
    if (onFinish) {
      onFinish(values);
    } else {
      console.log(values);
    }
  };

  var onValuesChange = function onValuesChange(value) {
    if (onChange) {
      onChange(value);
    }
  };

  return /*#__PURE__*/React.createElement(Form, {
    layout: "vertical",
    name: forms.name,
    onValuesChange: onValuesChange,
    onFinish: onSubmit,
    style: style
  }, forms === null || forms === void 0 ? void 0 : forms.question_group.map(function (g, key) {
    return /*#__PURE__*/React.createElement(Card, {
      key: key,
      title: g.name || "Section " + (key + 1)
    }, /*#__PURE__*/React.createElement(Question, {
      fields: g.question,
      cascade: forms.cascade
    }));
  }), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    span: 24
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Form.Item, null, /*#__PURE__*/React.createElement(Button, {
    type: "primary",
    htmlType: "submit"
  }, "Submit"))))));
};

export { Webform };
//# sourceMappingURL=index.modern.js.map
