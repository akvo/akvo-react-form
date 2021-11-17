import React, { useState, useRef, useMemo } from 'react';
import { Form, Radio, Space, Select, DatePicker, Cascader, InputNumber, Input, Row, Col, Card, Button } from 'antd';
import 'antd/dist/antd.css';
import TextArea from 'antd/lib/input/TextArea';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const TypeOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, option.length < 3 ? /*#__PURE__*/React.createElement(Radio.Group, null, /*#__PURE__*/React.createElement(Space, {
    direction: "vertical"
  }, option.map((o, io) => /*#__PURE__*/React.createElement(Radio, {
    key: io,
    value: o.name
  }, o.name)))) : /*#__PURE__*/React.createElement(Select, {
    style: {
      width: '100%'
    }
  }, option.map((o, io) => /*#__PURE__*/React.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.name))));
};

const TypeMultipleOption = ({
  option,
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(Select, {
    mode: "multiple",
    style: {
      width: '100%'
    }
  }, option.map((o, io) => /*#__PURE__*/React.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.name))));
};

const TypeDate = ({
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(DatePicker, {
    style: {
      width: '100%'
    }
  }));
};

const TypeCascade = ({
  cascade,
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(Cascader, {
    options: cascade
  }));
};

const TypeNumber = ({
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(InputNumber, {
    style: {
      width: '100%'
    }
  }));
};

const TypeInput = ({
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(Input, {
    sytle: {
      width: '100%'
    }
  }));
};

const TypeText = ({
  id,
  name,
  keyform,
  required,
  rules
}) => {
  return /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(TextArea, {
    row: 4
  }));
};

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
});
L.Marker.prototype.options.icon = DefaultIcon;
const defaultCenter = {
  lat: 0,
  lng: 0
};

const DraggableMarker = ({
  changePos,
  position
}) => {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;

      if (marker != null) {
        const newPos = marker.getLatLng();
        changePos(newPos);
      }
    }

  }), []);
  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      changePos(newPos);
    }

  });

  if (!(position !== null && position !== void 0 && position.lat) && !(position !== null && position !== void 0 && position.lng)) {
    return '';
  }

  return /*#__PURE__*/React.createElement(Marker, {
    eventHandlers: eventHandlers,
    position: position,
    ref: markerRef,
    draggable: true
  });
};

const MapRef = ({
  center
}) => {
  const map = useMap();
  map.panTo(center);
  return null;
};

const Maps = ({
  form,
  id,
  setValue,
  center
}) => {
  const [position, setPosition] = useState({
    lat: null,
    lng: null
  });

  const changePos = newPos => {
    setPosition(newPos);

    if (newPos !== null && newPos !== void 0 && newPos.lat && newPos !== null && newPos !== void 0 && newPos.lng) {
      form.setFieldsValue({
        [id]: newPos
      });
    }
  };

  const onChange = (cname, e) => {
    changePos({ ...position,
      [cname]: parseFloat(e)
    });
  };

  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Row, {
    justify: "space-between",
    style: {
      marginBottom: '10px'
    }
  }, /*#__PURE__*/React.createElement(Col, {
    span: 12,
    style: {
      paddingRight: '10px'
    }
  }, /*#__PURE__*/React.createElement(InputNumber, {
    placeholder: "Latitude",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lat) || null,
    min: "-90",
    max: "90",
    onChange: e => onChange('lat', e)
  })), /*#__PURE__*/React.createElement(Col, {
    span: 12,
    style: {
      paddingLeft: '10px'
    }
  }, /*#__PURE__*/React.createElement(InputNumber, {
    placeholder: "Longitude",
    className: "site-input-right",
    style: {
      width: '100%'
    },
    value: (position === null || position === void 0 ? void 0 : position.lng) || null,
    min: "-180",
    max: "180",
    onChange: e => onChange('lng', e)
  }))), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    span: 24
  }, /*#__PURE__*/React.createElement(MapContainer, {
    zoom: 13,
    scrollWheelZoom: false,
    style: {
      height: '300px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(MapRef, {
    center: position !== null && position !== void 0 && position.lat && position !== null && position !== void 0 && position.lng ? position : center || defaultCenter
  }), /*#__PURE__*/React.createElement(TileLayer, {
    attribution: "\xA9 <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }), /*#__PURE__*/React.createElement(DraggableMarker, {
    form: form,
    id: id,
    changePos: changePos,
    position: position
  })))));
};

const TypeGeo = ({
  id,
  form,
  name,
  keyform,
  required,
  rules,
  center
}) => {
  const [value, setValue] = useState(null);
  return /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Form.Item, {
    key: keyform,
    name: id,
    label: `${keyform + 1}. ${name}`,
    rules: rules,
    required: required
  }, /*#__PURE__*/React.createElement(Input, {
    value: value,
    disabled: true,
    hidden: true
  })), /*#__PURE__*/React.createElement(Maps, {
    form: form,
    setValue: setValue,
    id: id,
    center: center
  }));
};

const mapRules = ({
  name,
  rule,
  type
}) => {
  if (type === 'number') {
    return [{ ...rule,
      type: 'number'
    }];
  }

  return [{}];
};

const Question = ({
  fields,
  cascade,
  form
}) => {
  return fields.map((f, key) => {
    let rules = [];

    if (f !== null && f !== void 0 && f.required) {
      rules = [{
        validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error(`${f.name} is required`))
      }];
    }

    if (f.rule) {
      rules = [...rules, ...mapRules(f)];
    }

    return f.type === 'option' ? /*#__PURE__*/React.createElement(TypeOption, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f)) : f.type === 'multiple_option' ? /*#__PURE__*/React.createElement(TypeMultipleOption, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f)) : f.type === 'cascade' ? /*#__PURE__*/React.createElement(TypeCascade, Object.assign({
      key: key,
      keyform: key,
      cascade: cascade[f.option],
      rules: rules
    }, f)) : f.type === 'date' ? /*#__PURE__*/React.createElement(TypeDate, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f)) : f.type === 'number' ? /*#__PURE__*/React.createElement(TypeNumber, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f)) : f.type === 'text' ? /*#__PURE__*/React.createElement(TypeText, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f)) : f.type === 'geo' ? /*#__PURE__*/React.createElement(TypeGeo, Object.assign({
      key: key,
      keyform: key,
      rules: rules,
      form: form
    }, f)) : /*#__PURE__*/React.createElement(TypeInput, Object.assign({
      key: key,
      keyform: key,
      rules: rules
    }, f));
  });
};

const Webform = ({
  forms,
  onChange,
  onFinish,
  style
}) => {
  const [form] = Form.useForm();

  if (!(forms !== null && forms !== void 0 && forms.question_group)) {
    return 'Error Format';
  }

  const onSubmit = values => {
    if (onFinish) {
      onFinish(values);
    } else {
      console.log(values);
    }
  };

  const onValuesChange = value => {
    if (onChange) {
      onChange(value);
    }
  };

  return /*#__PURE__*/React.createElement(Form, {
    form: form,
    layout: "vertical",
    name: forms.name,
    onValuesChange: onValuesChange,
    onFinish: onSubmit,
    style: style
  }, forms === null || forms === void 0 ? void 0 : forms.question_group.map((g, key) => {
    return /*#__PURE__*/React.createElement(Card, {
      key: key,
      title: g.name || `Section ${key + 1}`
    }, /*#__PURE__*/React.createElement(Question, {
      fields: g.question,
      cascade: forms.cascade,
      form: form
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
