import React from 'react';
import { Form, Card, Row, Col, Button, Radio, Space, Select, DatePicker, InputNumber, Input } from 'antd';
import 'antd/dist/antd.css';
import TextArea from 'antd/lib/input/TextArea';

var Question = function Question(_ref) {
  var fields = _ref.fields;
  return fields.map(function (f, key) {
    return /*#__PURE__*/React.createElement(Form.Item, {
      key: key,
      name: f.id,
      label: f.name
    }, f.type === 'option' ? /*#__PURE__*/React.createElement(Radio.Group, null, /*#__PURE__*/React.createElement(Space, {
      direction: "vertical"
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(Radio, {
        key: io,
        value: o.name
      }, o.name);
    }))) : f.type === 'multipleoption' ? /*#__PURE__*/React.createElement(Select, {
      mode: "multiple",
      style: {
        width: '100%'
      }
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(Select.Option, {
        key: io,
        value: o.name
      }, o.name);
    })) : f.type === 'date' ? /*#__PURE__*/React.createElement(DatePicker, null) : f.type === 'number' ? /*#__PURE__*/React.createElement(InputNumber, {
      sytle: {
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
  var forms = _ref2.forms;

  if (!(forms !== null && forms !== void 0 && forms.question_group)) {
    return 'Error Format';
  }

  var onSubmit = function onSubmit(values) {
    console.log(values);
  };

  var onValuesChange = function onValuesChange(d) {
    console.log(d);
  };

  return /*#__PURE__*/React.createElement(Form, {
    layout: "vertical",
    name: forms.name,
    onValuesChange: onValuesChange,
    onFinish: onSubmit
  }, forms === null || forms === void 0 ? void 0 : forms.question_group.map(function (g, key) {
    return /*#__PURE__*/React.createElement(Card, {
      key: key,
      title: g.name || "Section " + (key + 1)
    }, /*#__PURE__*/React.createElement(Question, {
      fields: g.question
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
