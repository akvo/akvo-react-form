/* eslint-disable no-console */
import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export const createCurrentPositionIcon = () =>
  L.divIcon({
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

export const createLivePositionIcon = () =>
  L.divIcon({
    className: 'live-position-icon',
    html: `<div style="
      width: 16px;
      height: 16px;
      background: #fa8c16;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(250,140,22,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export const MapClickHandler = ({ editMode, disabled, onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (editMode === 'tap' && !disabled) {
        onMapClick(e);
      }
    },
  });
  return null;
};

export const FitBounds = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        if (coordinates.length === 1) {
          map.setView(coordinates[0], 13);
        } else if (coordinates.length > 1) {
          map.fitBounds(coordinates, { padding: [50, 50] });
        }
      } catch (error) {
        console.warn('Error fitting bounds:', error);
      }
    }
  }, [coordinates, map]);

  return null;
};

export const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};
