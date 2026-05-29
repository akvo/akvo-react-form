/* eslint-disable no-console */
import React from 'react';
import { Polyline, Polygon } from 'react-leaflet';

const GeoGeometry = ({ coordinates, type }) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return null;
  }

  try {
    const positions = coordinates.filter(
      (coord) =>
        Array.isArray(coord) &&
        coord.length === 2 &&
        typeof coord[0] === 'number' &&
        typeof coord[1] === 'number' &&
        !isNaN(coord[0]) &&
        !isNaN(coord[1])
    );

    if (positions.length === 0) {
      return null;
    }

    if (type === 'geoshape') {
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

export default GeoGeometry;
