/* eslint-disable no-console */
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Form, Modal } from 'antd';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FieldLabel } from '../support';
import GlobalStore from '../lib/store';
import GeoGeometry from '../support/GeoGeometry';
import RecordedMarkers from '../support/RecordedMarkers';
import CoordinatePreview from '../support/CoordinatePreview';
import GeoDrawingControls from '../support/GeoDrawingControls';
import {
  FitBounds,
  MapClickHandler,
  ChangeView,
  createCurrentPositionIcon,
  createLivePositionIcon,
} from '../support/GeoDrawingMapHandlers';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const defaultCenter = { lat: 0, lng: 0 };

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
  extra,
  uiText = {},
}) => {
  const activeGroup = GlobalStore.useState((s) => s.activeGroup);
  const form = Form.useFormInstance();
  const currentValue = Form.useWatch(id, form);

  // Map ref for imperative flyTo / setView
  const mapRef = useRef(null);

  // Get My Location loading state
  const [isLocating, setIsLocating] = useState(false);

  // Edit mode / draggable marker position
  const [editMode, setEditMode] = useState(initialEditMode);
  const [currentPosition, setCurrentPosition] = useState(null);

  // i18n — fallback to English so the component works without a locale provider
  const t = {
    geoDrawingNotSupported: 'Geolocation not supported',
    geoDrawingBrowserUnsupported: 'Your browser does not support geolocation.',
    geoDrawingLocationError: 'Error getting location',
    geoDrawingUnableToRetrieve: 'Unable to retrieve your location.',
    geoDrawingPermissionRequired: 'Location permission required',
    geoDrawingPermissionMsg:
      'Please allow location access to use auto-recording.',
    geoDrawingClearTitle: 'Clear all points?',
    geoDrawingClearContentPrefix: 'This will remove all',
    geoDrawingClearContentSuffix: 'points. Continue?',
    geoDrawingMinRoutePoints: 'Please add at least 2 points for a route',
    geoDrawingMinPolygonPoints: 'Please add at least 3 points for a polygon',
    geoDrawingRouteMin: 'A route requires at least 2 points',
    geoDrawingPolygonMin: 'A polygon requires at least 3 points',
    clear: 'Clear',
    ...uiText,
  };

  // Auto-recording: JSON config takes precedence over dropdown
  const lockedAccuracy = extra?.geoConfig?.accuracyThreshold ?? null;
  const [livePosition, setLivePosition] = useState(null);
  const [isAutoRecording, setIsAutoRecording] = useState(false);
  const [recordingConfig, setRecordingConfig] = useState({
    interval: 10,
    accuracy: lockedAccuracy ?? 15,
  });
  const [sessionPointCount, setSessionPointCount] = useState(0);

  // Refs to avoid stale closures in watchPosition / setInterval callbacks
  const livePositionRef = useRef(null);
  const watchIdRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // Initialise draggable marker position when switching to manual mode
  useEffect(() => {
    if (editMode === 'manual' && !currentPosition) {
      const initialPos = center
        ? Array.isArray(center)
          ? Math.abs(center[0]) > 90
            ? { lat: center[1], lng: center[0] }
            : { lat: center[0], lng: center[1] }
          : center
        : defaultCenter;
      setCurrentPosition(initialPos);
    }
  }, [editMode, currentPosition, center]);

  const mapCenter = useMemo(() => {
    if (
      currentValue &&
      Array.isArray(currentValue) &&
      currentValue.length > 0
    ) {
      const [lat, lng] = currentValue[0];
      if (typeof lat === 'number' && typeof lng === 'number') {
        return { lat, lng };
      }
    }
    if (center) {
      if (Array.isArray(center) && center.length === 2) {
        const [first, second] = center;
        return Math.abs(first) > 90
          ? { lat: second, lng: first }
          : { lat: first, lng: second };
      }
      if (typeof center.lat === 'number' && typeof center.lng === 'number') {
        return center;
      }
    }
    return defaultCenter;
  }, [currentValue, center]);

  const updatePoints = (newPoints) => {
    form.setFieldsValue({ [id]: newPoints });
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    updatePoints([...(currentValue || []), [lat, lng]]);
  };

  const handleRecordPoint = () => {
    if (!currentPosition) {
      return;
    }
    const { lat, lng } = currentPosition;
    updatePoints([...(currentValue || []), [lat, lng]]);
  };

  const handleRemovePoint = (index) => {
    updatePoints(currentValue.filter((_, i) => i !== index));
  };

  const handleUndo = () => {
    if (!currentValue?.length) {
      return;
    }
    updatePoints(currentValue.slice(0, -1));
  };

  const handleClear = () => {
    if (!currentValue?.length) {
      return;
    }
    if (currentValue.length > 3) {
      Modal.confirm({
        title: t.geoDrawingClearTitle,
        content: `${t.geoDrawingClearContentPrefix} ${currentValue.length} ${t.geoDrawingClearContentSuffix}`,
        okText: t.clear,
        okType: 'danger',
        onOk: () => updatePoints([]),
      });
    } else {
      updatePoints([]);
    }
  };

  const handleGetMyLocation = () => {
    if (!navigator.geolocation) {
      Modal.error({
        title: t.geoDrawingNotSupported,
        content: t.geoDrawingBrowserUnsupported,
      });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current?.flyTo([latitude, longitude], 16);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        Modal.error({
          title: t.geoDrawingLocationError,
          content: err.message || t.geoDrawingUnableToRetrieve,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // stopAutoRecording is stable (all deps are refs or state setters) — safe to list in useEffect deps
  const stopAutoRecording = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (recordingIntervalRef.current !== null) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    livePositionRef.current = null;
    setIsAutoRecording(false);
    setLivePosition(null);
  }, []);

  // Subscribe / unsubscribe pattern — cleanup on unmount without eslint suppression
  useEffect(() => {
    return stopAutoRecording;
  }, [stopAutoRecording]);

  const startAutoRecording = () => {
    if (!navigator.geolocation) {
      Modal.error({
        title: t.geoDrawingNotSupported,
        content: t.geoDrawingBrowserUnsupported,
      });
      return;
    }
    // Verify permission first with a one-shot call before activating watchPosition
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsAutoRecording(true);
        setSessionPointCount(0);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            const fix = { lat: latitude, lng: longitude, accuracy };
            livePositionRef.current = fix;
            setLivePosition(fix);
            mapRef.current?.setView([latitude, longitude]);
          },
          (err) => {
            console.warn('GPS watch error:', err.message);
          },
          { enableHighAccuracy: true, maximumAge: 5000 }
        );

        recordingIntervalRef.current = setInterval(() => {
          const pos = livePositionRef.current;
          if (!pos) {
            return;
          }
          if (pos.accuracy > recordingConfig.accuracy) {
            return;
          }
          const currentPoints = form.getFieldValue(id) || [];
          form.setFieldsValue({ [id]: [...currentPoints, [pos.lat, pos.lng]] });
          setSessionPointCount((n) => n + 1);
        }, recordingConfig.interval * 1000);
      },
      (err) => {
        Modal.error({
          title: t.geoDrawingPermissionRequired,
          content: err.message || t.geoDrawingPermissionMsg,
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
                ? t.geoDrawingMinRoutePoints
                : t.geoDrawingMinPolygonPoints
            )
          );
        }
        if (type === 'geotrace' && value.length < 2) {
          return Promise.reject(new Error(t.geoDrawingRouteMin));
        }
        if (type === 'geoshape' && value.length < 3) {
          return Promise.reject(new Error(t.geoDrawingPolygonMin));
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
        <CoordinatePreview
          coordinates={currentValue}
          type={type}
          showDetails={uiOptions.showCoordinates}
          uiText={uiText}
        />
        <div className="arf-geo-drawing-container">
          <div className="arf-geo-drawing-controls">
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
              onGetMyLocation={handleGetMyLocation}
              isLocating={isLocating}
              recordingConfig={recordingConfig}
              onConfigChange={setRecordingConfig}
              isAutoRecording={isAutoRecording}
              sessionPointCount={sessionPointCount}
              livePosition={livePosition}
              onStartRecording={startAutoRecording}
              onStopRecording={stopAutoRecording}
              lockedAccuracy={lockedAccuracy}
              uiText={uiText}
            />
          </div>
          {group?.order && group?.order - 1 === activeGroup && (
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={false}
              className="arf-leaflet"
              style={{ height: '400px', width: '100%' }}
              whenCreated={(map) => {
                mapRef.current = map;
              }}
            >
              {(!currentValue || currentValue.length === 0) && (
                <ChangeView
                  center={mapCenter}
                  zoom={13}
                />
              )}
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler
                editMode={editMode}
                disabled={disabled}
                onMapClick={handleMapClick}
              />
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
                    uiText={uiText}
                  />
                  <FitBounds coordinates={currentValue} />
                </div>
              )}
              {isAutoRecording && livePosition && (
                <Marker
                  position={[livePosition.lat, livePosition.lng]}
                  icon={createLivePositionIcon()}
                >
                  <Tooltip
                    permanent={false}
                    direction="top"
                  >
                    <div style={{ fontSize: '12px' }}>
                      <strong>Current GPS</strong>
                      <br />
                      Accuracy: ~{Math.round(livePosition.accuracy)}m
                    </div>
                  </Tooltip>
                </Marker>
              )}
            </MapContainer>
          )}
        </div>
      </Form.Item>
    </Form.Item>
  );
};

export default TypeGeoDrawing;
