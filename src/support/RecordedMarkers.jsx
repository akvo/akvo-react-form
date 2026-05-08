import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { Modal } from 'antd';
import L from 'leaflet';

export const createDotIcon = () =>
  L.divIcon({
    className: 'geo-point-icon',
    html: `<div style="
      width: 10px;
      height: 10px;
      background: #3388ff;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

const RecordedMarkers = ({
  coordinates,
  onRemovePoint,
  disabled,
  uiText = {},
}) => {
  const t = {
    geoDrawingRemoveTitle: 'Remove this point?',
    geoDrawingRemoveContent: 'Remove point',
    geoDrawingPointLabel: 'Point',
    ...uiText,
  };

  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  return (
    <div>
      {coordinates.map((coord, index) => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          return null;
        }
        const [lat, lng] = coord;
        return (
          <Marker
            key={index}
            position={[lat, lng]}
            icon={createDotIcon()}
            eventHandlers={{
              click: () => {
                if (!disabled) {
                  Modal.confirm({
                    title: t.geoDrawingRemoveTitle,
                    content: `${t.geoDrawingRemoveContent} ${index + 1}?`,
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
                <strong>
                  {t.geoDrawingPointLabel} {index + 1}
                </strong>
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

export default RecordedMarkers;
