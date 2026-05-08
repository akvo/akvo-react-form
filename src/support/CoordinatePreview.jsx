import React from 'react';

const CoordinatePreview = ({ coordinates, type, showDetails, uiText = {} }) => {
  const t = {
    geoDrawingNoCoordinates: 'No coordinates',
    geoDrawingPoint: 'point',
    geoDrawingPoints: 'points',
    geoDrawingRoute: 'route',
    geoDrawingPolygon: 'polygon',
    ...uiText,
  };

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return (
      <div style={{ marginBottom: 8, color: '#888' }}>
        {t.geoDrawingNoCoordinates}
      </div>
    );
  }

  const count = coordinates.length;
  const typeLabel =
    type === 'geoshape' ? t.geoDrawingPolygon : t.geoDrawingRoute;
  const pointWord = count === 1 ? t.geoDrawingPoint : t.geoDrawingPoints;

  if (!showDetails) {
    return (
      <div style={{ marginBottom: 8, fontSize: '13px', color: '#595959' }}>
        <strong>{count}</strong> {pointWord} ({typeLabel})
      </div>
    );
  }

  const displayPoints = coordinates.slice(0, 3);
  const hasMore = coordinates.length > 4;
  const lastPoint = coordinates[coordinates.length - 1];

  return (
    <div style={{ marginBottom: 12, fontSize: '12px', color: '#595959' }}>
      <div style={{ marginBottom: 4 }}>
        <strong>{count}</strong> {pointWord} ({typeLabel})
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '11px' }}>
        {displayPoints.map((coord, idx) => {
          const [lat, lng] = coord;
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

export default CoordinatePreview;
