function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));
var antd = require('antd');
require('antd/dist/antd.css');
var TextArea = _interopDefault(require('antd/lib/input/TextArea'));

var Question = function Question(_ref) {
  var fields = _ref.fields,
      cascade = _ref.cascade;
  return fields.map(function (f, key) {
    return /*#__PURE__*/React.createElement(antd.Form.Item, {
      key: key,
      name: f.id,
      label: key + 1 + ". " + f.name
    }, f.type === 'option' ? /*#__PURE__*/React.createElement(antd.Radio.Group, null, /*#__PURE__*/React.createElement(antd.Space, {
      direction: "vertical"
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(antd.Radio, {
        key: io,
        value: o.name
      }, o.name);
    }))) : f.type === 'multipleoption' ? /*#__PURE__*/React.createElement(antd.Select, {
      mode: "multiple",
      style: {
        width: '100%'
      }
    }, f.option.map(function (o, io) {
      return /*#__PURE__*/React.createElement(antd.Select.Option, {
        key: io,
        value: o.name
      }, o.name);
    })) : f.type === 'cascade' ? /*#__PURE__*/React.createElement(antd.Cascader, {
      options: cascade[f.option]
    }) : f.type === 'date' ? /*#__PURE__*/React.createElement(antd.DatePicker, null) : f.type === 'number' ? /*#__PURE__*/React.createElement(antd.InputNumber, {
      sytle: {
        width: '100%'
      }
    }) : f.type === 'text' ? /*#__PURE__*/React.createElement(TextArea, {
      row: 4
    }) : /*#__PURE__*/React.createElement(antd.Input, {
      sytle: {
        width: '100%'
      }
    }));
  });
};

var Webform = function Webform(_ref2) {
  var forms = _ref2.forms,
      onChange = _ref2.onChange,
      onFinish = _ref2.onFinish;

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

  return /*#__PURE__*/React.createElement(antd.Form, {
    layout: "vertical",
    name: forms.name,
    onValuesChange: onValuesChange,
    onFinish: onSubmit
  }, forms === null || forms === void 0 ? void 0 : forms.question_group.map(function (g, key) {
    return /*#__PURE__*/React.createElement(antd.Card, {
      key: key,
      title: g.name || "Section " + (key + 1)
    }, /*#__PURE__*/React.createElement(Question, {
      fields: g.question,
      cascade: forms.cascade
    }));
  }), /*#__PURE__*/React.createElement(antd.Row, null, /*#__PURE__*/React.createElement(antd.Col, {
    span: 24
  }, /*#__PURE__*/React.createElement(antd.Card, null, /*#__PURE__*/React.createElement(antd.Form.Item, null, /*#__PURE__*/React.createElement(antd.Button, {
    type: "primary",
    htmlType: "submit"
  }, "Submit"))))));
};

exports.Webform = Webform;
//# sourceMappingURL=index.js.map
