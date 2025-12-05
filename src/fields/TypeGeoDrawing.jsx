/* eslint-disable no-console */
import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Space, Modal, Tooltip } from 'antd';
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Polyline,
  Polygon,
  Marker,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FieldLabel } from '../support';
import GlobalStore from '../lib/store';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Create custom numbered marker icon
const createNumberedIcon = (number) => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `<div style="
      background-color: #3388ff;
      color: white;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Create custom current position icon (crosshair)
const createCurrentPositionIcon = () => {
  return L.divIcon({
    className: 'custom-current-position-icon',
    html: `<div style="
      width: 24px;
      height: 24px;
      position: relative;
    ">
      <div style="
        position: absolute;
        left: 50%;
        top: 0;
        width: 2px;
        height: 100%;
        background-color: #ff4d4f;
        transform: translateX(-50%);
      "></div>
      <div style="
        position: absolute;
        left: 0;
        top: 50%;
        width: 100%;
        height: 2px;
        background-color: #ff4d4f;
        transform: translateY(-50%);
      "></div>
      <div style="
        position: absolute;
        left: 50%;
        top: 50%;
        width: 8px;
        height: 8px;
        background-color: #ff4d4f;
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to handle map clicks in tap mode
const MapClickHandler = ({ editMode, disabled, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (editMode === 'tap' && !disabled) {
        onMapClick(e);
      }
    },
  });
  return null;
};

// Component to auto-fit map bounds to show all geometry
const FitBounds = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        // Coordinates are already in Leaflet format [lat, lng]
        if (coordinates.length === 1) {
          // Single point: center and zoom
          map.setView(coordinates[0], 13);
        } else if (coordinates.length > 1) {
          // Multiple points: fit bounds with padding
          map.fitBounds(coordinates, { padding: [50, 50] });
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
    // Filter coordinates (already in Leaflet format [lat, lng])
    const positions = coordinates.filter((coord) => {
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

    // Render polyline for geotrace
    return (
      <Polyline
        positions={positions}
        pathOptions={{
          color: '#3388ff',
          weight: 3,
          opacity: 0.8,
        }}
      />
    );
  } catch (error) {
    console.warn('Error rendering geometry:', error);
    return null;
  }
};

// Component to render numbered markers for recorded points
const RecordedMarkers = ({ coordinates, onRemovePoint, disabled }) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  return (
    <div>
      {coordinates.map((coord, index) => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          return null;
        }

        const [lat, lng] = coord; // Already in Leaflet format

        return (
          <Marker
            key={index}
            position={[lat, lng]}
            icon={createNumberedIcon(index + 1)}
            eventHandlers={{
              click: () => {
                if (!disabled) {
                  Modal.confirm({
                    title: 'Remove this point?',
                    content: `Remove point ${index + 1}?`,
                    onOk: () => onRemovePoint(index),
                  });
                }
              },
            }}
          >
            <Tooltip
              permanent={false}
              direction="top"
            >
              <div style={{ fontSize: '12px' }}>
                <strong>Point {index + 1}</strong>
                <br />
                {lat.toFixed(6)}, {lng.toFixed(6)}
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </div>
  );
};

// Component to display coordinate preview text
const CoordinatePreview = ({ coordinates, type, showDetails }) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return <div style={{ marginBottom: 8, color: '#888' }}>No coordinates</div>;
  }

  const count = coordinates.length;
  const typeLabel = type === 'geoshape' ? 'polygon' : 'route';

  if (!showDetails) {
    return (
      <div style={{ marginBottom: 8, fontSize: '13px', color: '#595959' }}>
        <strong>{count}</strong> {count === 1 ? 'point' : 'points'} ({typeLabel}
        )
      </div>
    );
  }

  // Show first 3 and last point
  const displayPoints = coordinates.slice(0, 3);
  const hasMore = coordinates.length > 4;
  const lastPoint = coordinates[coordinates.length - 1];

  return (
    <div style={{ marginBottom: 12, fontSize: '12px', color: '#595959' }}>
      <div style={{ marginBottom: 4 }}>
        <strong>{count}</strong> {count === 1 ? 'point' : 'points'} ({typeLabel}
        )
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
        {displayPoints.map((coord, idx) => {
          const [lat, lng] = coord; // [lat, lng] format
          return (
            <div key={idx}>
              {idx + 1}. {lat.toFixed(6)}, {lng.toFixed(6)}
            </div>
          );
        })}
        {hasMore && <div>...</div>}
        {hasMore && lastPoint && (
          <div>
            {count}. {lastPoint[0].toFixed(6)}, {lastPoint[1].toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );
};

// Control panel component
const GeoDrawingControls = ({
  editMode,
  onEditModeChange,
  pointCount,
  // type,
  onUndo,
  onClear,
  onRecord,
  disabled,
  currentPosition,
  uiOptions = {},
}) => {
  const {
    showUndo = true,
    showClear = true,
    showModeToggle = true,
    recordButtonLabel = 'Record This Point',
  } = uiOptions;

  if (disabled) {
    return null;
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <Space
        direction="vertical"
        size="small"
        style={{ width: '100%' }}
      >
        {/* Info text */}
        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
          {editMode === 'tap' && 'Click on the map to add points'}
          {editMode === 'manual' && 'Drag the red marker, then press Record'}
        </div>
        {/* Mode toggle */}
        {showModeToggle && (
          <Space size="small">
            <span style={{ fontSize: '12px', color: '#595959' }}>Mode:</span>
            <Button
              size="small"
              type={editMode === 'tap' ? 'primary' : 'default'}
              onClick={() => onEditModeChange('tap')}
            >
              Tap to Add
            </Button>
            <Button
              size="small"
              type={editMode === 'manual' ? 'primary' : 'default'}
              onClick={() => onEditModeChange('manual')}
            >
              Manual Record
            </Button>
            {/* Action buttons */}
            {editMode === 'manual' && (
              <Button
                type="primary"
                size="small"
                onClick={onRecord}
                disabled={!currentPosition}
              >
                {recordButtonLabel}
              </Button>
            )}

            {showUndo && (
              <Button
                size="small"
                onClick={onUndo}
                disabled={pointCount === 0}
              >
                Undo Last
              </Button>
            )}

            {showClear && (
              <Button
                size="small"
                danger
                onClick={onClear}
                disabled={pointCount === 0}
              >
                Clear All
              </Button>
            )}
          </Space>
        )}
      </Space>
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
  editMode: initialEditMode = 'tap',
  uiOptions = {},
}) => {
  const activeGroup = GlobalStore.useState((s) => s.activeGroup);

  const form = Form.useFormInstance();
  const currentValue = Form.useWatch(id, form);

  // Local state
  const [editMode, setEditMode] = useState(initialEditMode);
  const [currentPosition, setCurrentPosition] = useState(null);

  // Initialize current position to map center
  useEffect(() => {
    if (editMode === 'manual' && !currentPosition) {
      // Set initial current position to center or default
      const initialPos = center
        ? Array.isArray(center)
          ? Math.abs(center[0]) > 90
            ? { lat: center[1], lng: center[0] } // [lng, lat] format
            : { lat: center[0], lng: center[1] } // [lat, lng] format
          : center
        : defaultCenter;
      setCurrentPosition(initialPos);
    }
  }, [editMode, currentPosition, center]);

  // Calculate map center
  const mapCenter = useMemo(() => {
    if (
      currentValue &&
      Array.isArray(currentValue) &&
      currentValue.length > 0
    ) {
      const [lat, lng] = currentValue[0]; // [lat, lng] format
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng };
      }
    }

    if (center) {
      if (Array.isArray(center) && center.length === 2) {
        // Center can be [lng, lat] or [lat, lng] - need to determine based on values
        // If first value is > 90 or < -90, it's likely longitude, so swap
        const [first, second] = center;
        if (Math.abs(first) > 90) {
          // first is longitude, second is latitude
          return { lat: second, lng: first };
        }
        // first is latitude, second is longitude
        return { lat: first, lng: second };
      }
      if (typeof center.lat === 'number' && typeof center.lng === 'number') {
        return center;
      }
    }

    return defaultCenter;
  }, [currentValue, center]);

  // Update form value helper
  const updatePoints = (newPoints) => {
    form.setFieldsValue({ [id]: newPoints });
  };

  // Event handlers
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const newPoint = [lat, lng]; // Storage format: [lat, lng]
    const updatedPoints = [...(currentValue || []), newPoint];
    updatePoints(updatedPoints);
  };

  const handleRecordPoint = () => {
    if (!currentPosition) {
      return;
    }

    const { lat, lng } = currentPosition;
    const newPoint = [lat, lng]; // Storage format: [lat, lng]
    const updatedPoints = [...(currentValue || []), newPoint];
    updatePoints(updatedPoints);
  };

  const handleRemovePoint = (index) => {
    const updatedPoints = currentValue.filter((_, i) => i !== index);
    updatePoints(updatedPoints);
  };

  const handleUndo = () => {
    if (!currentValue?.length) {
      return;
    }
    const updatedPoints = currentValue.slice(0, -1);
    updatePoints(updatedPoints);
  };

  const handleClear = () => {
    if (!currentValue?.length) {
      return;
    }

    if (currentValue.length > 3) {
      Modal.confirm({
        title: 'Clear all points?',
        content: `This will remove all ${currentValue.length} points. Continue?`,
        okText: 'Clear',
        okType: 'danger',
        onOk: () => updatePoints([]),
      });
    } else {
      updatePoints([]);
    }
  };

  // Validation rules
  const geoDrawingRules = [
    ...(rules || []),
    {
      validator: (_, value) => {
        if (!required && (!value || value.length === 0)) {
          return Promise.resolve();
        }

        if (!value || value.length === 0) {
          return Promise.reject(
            new Error(
              type === 'geotrace'
                ? 'Please add at least 2 points for a route'
                : 'Please add at least 3 points for a polygon'
            )
          );
        }

        if (type === 'geotrace' && value.length < 2) {
          return Promise.reject(
            new Error('A route requires at least 2 points')
          );
        }

        if (type === 'geoshape' && value.length < 3) {
          return Promise.reject(
            new Error('A polygon requires at least 3 points')
          );
        }

        return Promise.resolve();
      },
    },
  ];

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
        rules={!disabled ? geoDrawingRules : []}
        required={!disabled ? required : false}
      >
        {/* Coordinate preview */}
        <CoordinatePreview
          coordinates={currentValue}
          type={type}
          showDetails={uiOptions.showCoordinates}
        />
        <div className="arf-geo-drawing-container">
          <div className="arf-geo-drawing-controls">
            {/* Control panel */}
            <GeoDrawingControls
              editMode={editMode}
              onEditModeChange={setEditMode}
              pointCount={currentValue?.length || 0}
              type={type}
              onUndo={handleUndo}
              onClear={handleClear}
              onRecord={handleRecordPoint}
              disabled={disabled}
              currentPosition={currentPosition}
              uiOptions={uiOptions}
            />
          </div>
          {/* Map */}
          {group?.order && group?.order - 1 === activeGroup && (
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              className="arf-leaflet"
              style={{ height: '400px', width: '100%' }}
            >
              {/* Change view only if no coordinates */}
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

              {/* Map click handler for tap mode */}
              <MapClickHandler
                editMode={editMode}
                disabled={disabled}
                onMapClick={handleMapClick}
              />

              {/* Current position marker (manual mode) */}
              {editMode === 'manual' && !disabled && currentPosition && (
                <Marker
                  position={[currentPosition.lat, currentPosition.lng]}
                  icon={createCurrentPositionIcon()}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      setCurrentPosition({ lat, lng });
                    },
                  }}
                >
                  <Tooltip
                    permanent={false}
                    direction="top"
                  >
                    <div style={{ fontSize: '12px' }}>
                      <strong>Current Position</strong>
                      <br />
                      {currentPosition.lat.toFixed(6)},{' '}
                      {currentPosition.lng.toFixed(6)}
                    </div>
                  </Tooltip>
                </Marker>
              )}

              {/* Render geometry */}
              {currentValue && currentValue.length > 0 && (
                <div>
                  <GeoGeometry
                    coordinates={currentValue}
                    type={type}
                  />
                  <RecordedMarkers
                    coordinates={currentValue}
                    onRemovePoint={handleRemovePoint}
                    disabled={disabled}
                  />
                  <FitBounds coordinates={currentValue} />
                </div>
              )}
            </MapContainer>
          )}
        </div>
      </Form.Item>
    </Form.Item>
  );
};

export default TypeGeoDrawing;
