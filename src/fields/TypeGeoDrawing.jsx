/* eslint-disable no-console */
import React, { useEffect, useMemo } from 'react';
import { Form } from 'antd';
import {
  MapContainer,
  TileLayer,
  useMap,
  Polyline,
  Polygon,
  CircleMarker,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FieldLabel } from '../support';
import GlobalStore from '../lib/store';

// Component to auto-fit map bounds to show all geometry
const FitBounds = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        // Fit bounds to show all coordinates
        const bounds = coordinates;
        if (bounds.length === 1) {
          // Single point: center and zoom
          map.setView(bounds[0], 13);
        } else if (bounds.length > 1) {
          // Multiple points: fit bounds with padding
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.warn('Error fitting bounds:', error);
      }
    }
  }, [coordinates, map]);

  return null;
};

// Component to render geometry (polyline or polygon)
const GeoGeometry = ({ coordinates, type }) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }

  try {
    // Filter out invalid coordinates
    const positions = coordinates.filter((coord) => {
      // Each coord should be an array of two numbers [lat, lng]
      return (
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === 'number' &&
        typeof coord[1] === 'number' &&
        !isNaN(coord[0]) &&
        !isNaN(coord[1])
      );
    });

    if (positions.length === 0) {
      return null;
    }

    if (type === 'geoshape') {
      // Render polygon with fill for geoshape
      return (
        <Polygon
          positions={positions}
          pathOptions={{
            color: '#3388ff',
            weight: 2,
            fillColor: '#3388ff',
            fillOpacity: 0.3,
          }}
        />
      );
    }

    // Render polyline with markers for geotrace (default)
    return (
      <div>
        <Polyline
          positions={positions}
          pathOptions={{
            color: '#3388ff',
            weight: 3,
            opacity: 0.8,
          }}
        />
        {/* Add circle markers at each point */}
        {positions.map((position, index) => (
          <CircleMarker
            key={index}
            center={position}
            radius={5}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: '#3388ff',
              fillOpacity: 1,
            }}
          />
        ))}
      </div>
    );
  } catch (error) {
    console.warn('Error rendering geometry:', error);
    return null;
  }
};

// Component to display coordinate preview text
const CoordinatePreview = ({ coordinates, type }) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return <div style={{ marginBottom: 8, color: '#888' }}>No coordinates</div>;
  }

  const count = coordinates.length;
  const typeLabel = type === 'geoshape' ? 'polygon' : 'route';

  return (
    <div style={{ marginBottom: 8, fontSize: '13px', color: '#595959' }}>
      <strong>{count}</strong> {count === 1 ? 'point' : 'points'} ({typeLabel})
    </div>
  );
};

const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const TypeGeoDrawing = ({
  id,
  name,
  label,
  keyform,
  required,
  rules,
  tooltip,
  requiredSign,
  center,
  group,
  type = 'geotrace',
  fieldIcons = true,
  disabled = false,
}) => {
  const activeGroup = GlobalStore.useState((s) => s.activeGroup);

  const form = Form.useFormInstance();
  const currentValue = form.getFieldValue([id]);

  // Calculate map center: use coordinates if available, otherwise use center prop or default
  const mapCenter = useMemo(() => {
    if (
      currentValue &&
      Array.isArray(currentValue) &&
      currentValue.length > 0
    ) {
      // Use first coordinate from current value
      const [lat, lng] = currentValue[0];
      if (typeof lng === 'number' && typeof lat === 'number') {
        return { lat, lng };
      }
    }

    // Use provided center prop if available
    if (center) {
      if (Array.isArray(center) && center.length === 2) {
        const [lat, lng] = center;
        return { lat, lng };
      }
      // Ensure center has numeric lat and lng to avoid accessing undefined
      if (typeof center.lat === 'number' && typeof center.lng === 'number') {
        return center;
      }
    }

    return defaultCenter;
  }, [currentValue, center]);

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={label || name}
          requiredSign={required ? requiredSign : null}
          fieldIcons={fieldIcons}
        />
      }
      tooltip={tooltip?.text}
      required={!disabled ? required : false}
    >
      <Form.Item
        className="arf-field-child"
        key={keyform}
        name={id}
        rules={rules}
        required={!disabled ? required : false}
      >
        {/* Coordinate preview text */}
        <CoordinatePreview
          coordinates={currentValue}
          type={type}
        />
        {group?.order && group?.order - 1 === activeGroup && (
          <MapContainer
            center={mapCenter}
            zoom={13}
            scrollWheelZoom={false}
            className="arf-leaflet"
          >
            {/* Only use ChangeView if no coordinates (initial state) */}
            {(!currentValue || currentValue.length === 0) && (
              <ChangeView
                center={mapCenter}
                zoom={13}
              />
            )}

            {/* Tile layer */}
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Render geometry if coordinates exist */}
            {currentValue && currentValue.length > 0 && (
              <div>
                <GeoGeometry
                  coordinates={currentValue}
                  type={type}
                />
                <FitBounds coordinates={currentValue} />
              </div>
            )}
          </MapContainer>
        )}
      </Form.Item>
    </Form.Item>
  );
};

export default TypeGeoDrawing;
