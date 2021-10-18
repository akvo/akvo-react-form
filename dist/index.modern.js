import React, { useState, useRef, useMemo } from 'react';
import { Row, Col, Input, Form, Card, Button, Radio, Space, Select, Cascader, DatePicker, InputNumber } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import 'antd/dist/antd.css';
import L from 'leaflet';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
  form,
  setValue,
  id,
  center
}) => {
  const [position, setPosition] = useState(center || defaultCenter);
  const markerRef = useRef(null);
  const eventHandlers = useMemo(() => ({
    dragend() {
      const marker = markerRef.current;

      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        setValue(`${newPos.lat}, ${newPos.lng}`);
        form.setFieldsValue({
          [id]: `${newPos.lat}, ${newPos.lng}`
        });
      }
    }

  }), []);
  useMapEvents({
    click(e) {
      const newPos = e.latlng;
      setPosition(newPos);
      setValue(`${newPos.lat}, ${newPos.lng}`);
      form.setFieldsValue({
        [id]: `${newPos.lat}, ${newPos.lng}`
      });
    }

  });
  return /*#__PURE__*/React.createElement(Marker, {
    eventHandlers: eventHandlers,
    position: position,
    ref: markerRef,
    draggable: true
  });
};

const Maps = ({
  form,
  id,
  setValue,
  center
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    span: 24
  }, /*#__PURE__*/React.createElement(Input.Group, {
    compact: true
  }, /*#__PURE__*/React.createElement(Input, {
    addonBefore: "Latitude",
    style: {
      width: '50%'
    }
  }), /*#__PURE__*/React.createElement(Input, {
    className: "site-input-right",
    addonBefore: "Longitude",
    style: {
      width: '50%'
    }
  })))), /*#__PURE__*/React.createElement(Row, null, /*#__PURE__*/React.createElement(Col, {
    span: 24
  }, /*#__PURE__*/React.createElement(MapContainer, {
    center: center || defaultCenter,
    zoom: 13,
    scrollWheelZoom: false,
    style: {
      height: '300px',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(TileLayer, {
    attribution: "\xA9 <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }), /*#__PURE__*/React.createElement(DraggableMarker, {
    form: form,
    setValue: setValue,
    id: id,
    center: center
  })))));
};

const Question = ({
  fields,
  cascade,
  form
}) => {
  const [value, setValue] = useState(null);
  return fields.map((f, key) => /*#__PURE__*/React.createElement(Form.Item, {
    key: key,
    name: f.id,
    label: `${key + 1}. ${f.name}`,
    rules: [{
      required: true
    }]
  }, f.type === 'option' ? f.option.length < 3 ? /*#__PURE__*/React.createElement(Radio.Group, null, /*#__PURE__*/React.createElement(Space, {
    direction: "vertical"
  }, f.option.map((o, io) => /*#__PURE__*/React.createElement(Radio, {
    key: io,
    value: o.name
  }, o.name)))) : /*#__PURE__*/React.createElement(Select, {
    style: {
      width: '100%'
    }
  }, f.option.map((o, io) => /*#__PURE__*/React.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.name))) : f.type === 'multiple_option' ? /*#__PURE__*/React.createElement(Select, {
    mode: "multiple",
    style: {
      width: '100%'
    }
  }, f.option.map((o, io) => /*#__PURE__*/React.createElement(Select.Option, {
    key: io,
    value: o.name
  }, o.name))) : f.type === 'cascade' ? /*#__PURE__*/React.createElement(Cascader, {
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
  }) : f.type === 'geo' ? /*#__PURE__*/React.createElement(Col, null, /*#__PURE__*/React.createElement(Input, {
    value: value,
    disabled: true,
    hidden: true
  }), /*#__PURE__*/React.createElement(Maps, {
    form: form,
    setValue: setValue,
    id: f.id,
    center: f === null || f === void 0 ? void 0 : f.center
  })) : /*#__PURE__*/React.createElement(Input, {
    sytle: {
      width: '100%'
    }
  })));
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
