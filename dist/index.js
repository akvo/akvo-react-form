function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var antd = require('antd');
var L = _interopDefault(require('leaflet'));
var reactLeaflet = require('react-leaflet');
require('leaflet/dist/leaflet.css');
var icon = _interopDefault(require('leaflet/dist/images/marker-icon.png'));
var iconShadow = _interopDefault(require('leaflet/dist/images/marker-shadow.png'));
require('antd/dist/antd.css');
var TextArea = _interopDefault(require('antd/lib/input/TextArea'));

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;
var defaultCenter = {
  lat: 0,
  lng: 0
};

var DraggableMarker = function DraggableMarker(_ref) {
  var changePos = _ref.changePos,
      position = _ref.position;
  var markerRef = React.useRef(null);
  var eventHandlers = React.useMemo(function () {
    return {
      dragend: function dragend() {
        var marker = markerRef.current;

        if (marker != null) {
          var newPos = marker.getLatLng();
          changePos(newPos);
        }
      }
    };
  }, []);
  reactLeaflet.useMapEvents({
    click: function click(e) {
      var newPos = e.latlng;
      changePos(newPos);
    }
  });

  if (!(position !== null && position !== void 0 && position.lat) && !(position !== null && position !== void 0 && position.lng)) {
    return '';
  }

  return /*#__PURE__*/React__default.createElement(reactLeaflet.Marker, {
    eventHandlers: eventHandlers,
    position: position,
    ref: markerRef,
    draggable: true
  });
};

var MapRef = function MapRef(_ref2) {
  var center = _ref2.center;
  var map = reactLeaflet.useMap();
  map.panTo(center);
  return null;
};

var Maps = function Maps(_ref3) {
  var form = _ref3.form,
      id = _ref3.id,
      center = _ref3.center;

  var _useState = React.useState({
    lat: null,
    lng: null
  }),
      position = _useState[0],
      setPosition = _useState[1];

  var changePos = function changePos(newPos) {
    setPosition(newPos);

    if (newPos !== null && newPos !== void 0 && newPos.lat && newPos !== null && newPos !== void 0 && newPos.lng) {
      var _form$setFieldsValue;

      console.log(form);
      form.setFieldsValue((_form$setFieldsValue = {}, _form$setFieldsValue[id] = newPos, _form$setFieldsValue));
    }
  };

  var _onChange = function onChange(cname, e) {
    var _extends2;

    changePos(_extends({}, position, (_extends2 = {}, _extends2[cname] = parseFloat(e), _extends2)));
  };

  return /*#__PURE__*/React__default.createElement("div", null, /*#__PURE__*/React__default.createElement(antd.Row, {
    justify: "space-between",
    style: {
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(antd.Col, {
    span: 12,
    style: {
      paddingRight: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(antd.InputNumber, {
    placeholder: "Latitude",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lat) || null,
    min: "-90",
    max: "90",
    onChange: function onChange(e) {
      return _onChange('lat', e);
    }
  })), /*#__PURE__*/React__default.createElement(antd.Col, {
    span: 12,
    style: {
      paddingLeft: '10px'
    }
  }, /*#__PURE__*/React__default.createElement(antd.InputNumber, {
    placeholder: "Longitude",
    className: "site-input-right",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lng) || null,
    min: "-180",
    max: "180",
    onChange: function onChange(e) {
      return _onChange('lng', e);
    }
  }))), /*#__PURE__*/React__default.createElement(antd.Row, null, /*#__PURE__*/React__default.createElement(antd.Col, {
    span: 24
  }, /*#__PURE__*/React__default.createElement(reactLeaflet.MapContainer, {
    zoom: 13,
    scrollWheelZoom: false,
    style: {
      height: '300px',
      width: '100%'
    }
  }, /*#__PURE__*/React__default.createElement(MapRef, {
    center: position !== null && position !== void 0 && position.lat && position !== null && position !== void 0 && position.lng ? position : center || defaultCenter
  }), /*#__PURE__*/React__default.createElement(reactLeaflet.TileLayer, {
    attribution: "\xA9 <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }), /*#__PURE__*/React__default.createElement(DraggableMarker, {
    form: form,
    id: id,
    changePos: changePos,
    position: position
  })))));
};

var TypeOption = function TypeOption(_ref) {
  var option = _ref.option,
      id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, option.length < 3 ? /*#__PURE__*/React__default.createElement(antd.Radio.Group, null, /*#__PURE__*/React__default.createElement(antd.Space, {
    direction: "vertical"
  }, option.map(function (o, io) {
    return /*#__PURE__*/React__default.createElement(antd.Radio, {
      key: io,
      value: o.name
    }, o.name);
  }))) : /*#__PURE__*/React__default.createElement(antd.Select, {
    style: {
      width: '100%'
    },
    allowClear: true
  }, option.map(function (o, io) {
    return /*#__PURE__*/React__default.createElement(antd.Select.Option, {
      key: io,
      value: o.name
    }, o.name);
  })));
};

var TypeMultipleOption = function TypeMultipleOption(_ref) {
  var option = _ref.option,
      id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(antd.Select, {
    mode: "multiple",
    style: {
      width: '100%'
    }
  }, option.map(function (o, io) {
    return /*#__PURE__*/React__default.createElement(antd.Select.Option, {
      key: io,
      value: o.name
    }, o.name);
  })));
};

var TypeDate = function TypeDate(_ref) {
  var id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(antd.DatePicker, {
    style: {
      width: '100%'
    }
  }));
};

var TypeCascade = function TypeCascade(_ref) {
  var cascade = _ref.cascade,
      id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(antd.Cascader, {
    options: cascade
  }));
};

var TypeNumber = function TypeNumber(_ref) {
  var id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(antd.InputNumber, {
    style: {
      width: '100%'
    }
  }));
};

var TypeInput = function TypeInput(_ref) {
  var id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(antd.Input, {
    sytle: {
      width: '100%'
    }
  }));
};

var TypeText = function TypeText(_ref) {
  var id = _ref.id,
      name = _ref.name,
      keyform = _ref.keyform,
      required = _ref.required,
      rules = _ref.rules;
  return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
    key: keyform,
    name: id,
    label: keyform + 1 + ". " + name,
    rules: rules,
    required: required
  }, /*#__PURE__*/React__default.createElement(TextArea, {
    row: 4
  }));
};

var mapRules = function mapRules(_ref) {
  var rule = _ref.rule,
      type = _ref.type;

  if (type === 'number') {
    return [_extends({}, rule, {
      type: 'number'
    })];
  }

  return [{}];
};

var QuestionFields = function QuestionFields(_ref2) {
  var rules = _ref2.rules,
      cascade = _ref2.cascade,
      index = _ref2.index,
      field = _ref2.field;

  switch (field.type) {
    case 'option':
      return /*#__PURE__*/React__default.createElement(TypeOption, _extends({
        keyform: index,
        rules: rules
      }, field));

    case 'multiple_option':
      return /*#__PURE__*/React__default.createElement(TypeMultipleOption, _extends({
        keyform: index,
        rules: rules
      }, field));

    case 'cascade':
      return /*#__PURE__*/React__default.createElement(TypeCascade, _extends({
        keyform: index,
        cascade: cascade[field.option],
        rules: rules
      }, field));

    case 'date':
      return /*#__PURE__*/React__default.createElement(TypeDate, _extends({
        keyform: index,
        rules: rules
      }, field));

    case 'number':
      return /*#__PURE__*/React__default.createElement(TypeNumber, _extends({
        keyform: index,
        rules: rules
      }, field));

    case 'text':
      return /*#__PURE__*/React__default.createElement(TypeText, _extends({
        keyform: index,
        rules: rules
      }, field));

    default:
      return /*#__PURE__*/React__default.createElement(TypeInput, _extends({
        keyform: index,
        rules: rules
      }, field));
  }
};

var validateDependency = function validateDependency(dependency, value) {
  if (dependency !== null && dependency !== void 0 && dependency.options) {
    return dependency.options.includes(value);
  }

  var valid = false;

  if (dependency !== null && dependency !== void 0 && dependency.min) {
    valid = value >= dependency.min;
  }

  if (dependency !== null && dependency !== void 0 && dependency.max) {
    valid = value <= dependency.max;
  }

  return valid;
};

var Question = function Question(_ref3) {
  var fields = _ref3.fields,
      cascade = _ref3.cascade,
      form = _ref3.form;
  return fields.map(function (field, key) {
    var rules = [];

    if (field !== null && field !== void 0 && field.required) {
      rules = [{
        validator: function validator(_, value) {
          return value ? Promise.resolve() : Promise.reject(new Error(field.name + " is required"));
        }
      }];
    }

    if (field !== null && field !== void 0 && field.rule) {
      rules = [].concat(rules, mapRules(field));
    }

    var _useState = React.useState(null),
        value = _useState[0],
        setValue = _useState[1];

    if ((field === null || field === void 0 ? void 0 : field.type) === 'geo') {
      return /*#__PURE__*/React__default.createElement(antd.Col, {
        key: key
      }, /*#__PURE__*/React__default.createElement(antd.Form.Item, {
        name: field.id,
        label: key + 1 + ". " + field.name,
        rules: rules,
        required: field === null || field === void 0 ? void 0 : field.required
      }, /*#__PURE__*/React__default.createElement(antd.Input, {
        value: value,
        disabled: true,
        hidden: true
      })), /*#__PURE__*/React__default.createElement(Maps, {
        form: form,
        setValue: setValue,
        id: field.id,
        center: field.center
      }));
    }

    if (field !== null && field !== void 0 && field.dependency) {
      return /*#__PURE__*/React__default.createElement(antd.Form.Item, {
        noStyle: true,
        key: key,
        shouldUpdate: function shouldUpdate(prevValues, currentValues) {
          var update = field.dependency.map(function (x) {
            return prevValues[x.id] !== currentValues[x.id];
          }).filter(function (x) {
            return x === true;
          });
          return update.length;
        }
      }, function (_ref4) {
        var getFieldValue = _ref4.getFieldValue;
        var unmatches = field.dependency.map(function (x) {
          return validateDependency(x, getFieldValue(x.id));
        }).filter(function (x) {
          return x === false;
        });
        return unmatches.length ? null : /*#__PURE__*/React__default.createElement(QuestionFields, {
          rules: rules,
          form: form,
          index: key,
          cascade: cascade,
          field: field
        });
      });
    }

    return /*#__PURE__*/React__default.createElement(QuestionFields, {
      rules: rules,
      form: form,
      key: key,
      index: key,
      cascade: cascade,
      field: field
    });
  });
};

var Webform = function Webform(_ref5) {
  var forms = _ref5.forms,
      onChange = _ref5.onChange,
      onFinish = _ref5.onFinish,
      style = _ref5.style;

  var _Form$useForm = antd.Form.useForm(),
      form = _Form$useForm[0];

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

  var _onValuesChange = function onValuesChange(fr, value, values) {
    var all = fr.getFieldsError().length;
    var filled = Object.keys(values).map(function (k) {
      return values[k];
    }).filter(function (x) {
      return x;
    }).length;

    if (onChange) {
      onChange({
        current: value,
        values: values,
        progress: filled / all * 100
      });
    }
  };

  return /*#__PURE__*/React__default.createElement(antd.Form, {
    form: form,
    layout: "vertical",
    name: forms.name,
    scrollToFirstError: "true",
    onValuesChange: function onValuesChange(value, values) {
      return setTimeout(function () {
        _onValuesChange(form, value, values);
      }, 100);
    },
    onFinish: onSubmit,
    style: style
  }, forms === null || forms === void 0 ? void 0 : forms.question_group.map(function (g, key) {
    return /*#__PURE__*/React__default.createElement(antd.Card, {
      key: key,
      title: g.name || "Section " + (key + 1)
    }, /*#__PURE__*/React__default.createElement(Question, {
      fields: g.question,
      cascade: forms.cascade,
      form: form
    }));
  }), /*#__PURE__*/React__default.createElement(antd.Row, null, /*#__PURE__*/React__default.createElement(antd.Col, {
    span: 24
  }, /*#__PURE__*/React__default.createElement(antd.Card, null, /*#__PURE__*/React__default.createElement(antd.Form.Item, null, /*#__PURE__*/React__default.createElement(antd.Button, {
    type: "primary",
    htmlType: "submit"
  }, "Submit"))))));
};

exports.Webform = Webform;
//# sourceMappingURL=index.js.map
