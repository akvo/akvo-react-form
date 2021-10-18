import React, { useState, useRef, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import { Row, Col, Input } from 'antd'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow
})

L.Marker.prototype.options.icon = DefaultIcon

const defaultCenter = {
  lat: 0,
  lng: 0
}

const DraggableMarker = ({ form, setValue, id, center }) => {
  const [position, setPosition] = useState(center || defaultCenter)
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          const newPos = marker.getLatLng()
          setPosition(newPos)
          setValue(`${newPos.lat}, ${newPos.lng}`)
          form.setFieldsValue({ [id]: `${newPos.lat}, ${newPos.lng}` })
        }
      }
    }),
    []
  )

  useMapEvents({
    click(e) {
      const newPos = e.latlng
      setPosition(newPos)
      setValue(`${newPos.lat}, ${newPos.lng}`)
      form.setFieldsValue({ [id]: `${newPos.lat}, ${newPos.lng}` })
    }
  })

  return (
    <Marker
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      draggable
    />
  )
}

const Maps = ({ form, id, setValue, center }) => {
  return (
    <div>
      <Row>
        <Col span={24}>
          <Input.Group compact>
            <Input addonBefore='Latitude' style={{ width: '50%' }} />
            <Input
              className='site-input-right'
              addonBefore='Longitude'
              style={{ width: '50%' }}
            />
          </Input.Group>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <MapContainer
            center={center || defaultCenter}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <DraggableMarker
              form={form}
              setValue={setValue}
              id={id}
              center={center}
            />
          </MapContainer>
        </Col>
      </Row>
    </div>
  )
}

export default Maps
