import React, { useState, useRef, useMemo, useEffect } from 'react'
import L from 'leaflet'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap
} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { Row, Col, InputNumber, Form } from 'antd'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon

const defaultCenter = {
  lat: 0,
  lng: 0
}

const DraggableMarker = ({ changePos, position }) => {
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng()
          changePos(newPos)
        }
      }
    }),
    []
  )

  useMapEvents({
    click(e) {
      const newPos = e.latlng
      changePos(newPos)
    }
  })

  if (!position?.lat && !position?.lng) {
    return ''
  }

  return (
    <Marker
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      draggable
    />
  )
}

const MapRef = ({ center }) => {
  const map = useMap()
  map.panTo(center)
  return null
}

const Maps = ({ id, center, initialValue }) => {
  const form = Form.useFormInstance()
  const [position, setPosition] = useState({ lat: null, lng: null })

  const changePos = (newPos) => {
    setPosition(newPos)
    if (newPos?.lat && newPos?.lng) {
      form.setFieldsValue({ [id]: newPos })
    }
  }

  const onChange = (cname, e) => {
    changePos({ ...position, [cname]: parseFloat(e) })
  }

  useEffect(() => {
    if (initialValue?.lat && initialValue.lng) {
      setPosition(initialValue)
    } else {
      setPosition({ lat: null, lng: null })
    }
  }, [initialValue])

  return (
    <div className='arf-field arf-field-map'>
      <Row justify='space-between' style={{ marginBottom: '10px' }}>
        <Col span={12} style={{ paddingRight: '10px' }}>
          <InputNumber
            placeholder='Latitude'
            style={{ width: '100%' }}
            value={position?.lat || null}
            min='-90'
            max='90'
            onChange={(e) => onChange('lat', e)}
          />
        </Col>
        <Col span={12} style={{ paddingLeft: '10px' }}>
          <InputNumber
            placeholder='Longitude'
            className='site-input-right'
            style={{ width: '100%' }}
            value={position?.lng || null}
            min='-180'
            max='180'
            onChange={(e) => onChange('lng', e)}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <MapContainer
            zoom={13}
            scrollWheelZoom={false}
            className='arf-leaflet'
          >
            <MapRef
              center={
                position?.lat && position?.lng
                  ? position
                  : center || defaultCenter
              }
            />
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <DraggableMarker
              form={form}
              id={id}
              changePos={changePos}
              position={position}
            />
          </MapContainer>
        </Col>
      </Row>
    </div>
  )
}

export default Maps
