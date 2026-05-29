# Implementation Plan: Geo Drawing Preview for geotrace/geoshape

> **Status: ARCHIVED — superseded by the interactive implementation plan.**
> All items below were completed as the baseline (display-only) phase before interactive drawing was added.

## Overview
Update `TypeGeoDrawing.jsx` to display coordinate previews and render map geometry (polylines for geotrace, polygons for geoshape) using react-leaflet.

## Completed Deliverables

| Item | Component | Status |
|------|-----------|--------|
| Coordinate preview text | `src/support/CoordinatePreview.jsx` | ✅ |
| Polyline rendering (geotrace) | `src/support/GeoGeometry.jsx` | ✅ |
| Polygon rendering (geoshape) | `src/support/GeoGeometry.jsx` | ✅ |
| Auto-fit map bounds | `src/support/GeoDrawingMapHandlers.jsx` (`FitBounds`) | ✅ |
| Numbered recorded-point markers | `src/support/RecordedMarkers.jsx` | ✅ |
| Error/edge-case handling | All support components | ✅ |

## Coordinate Format (actual)

- **Storage / form value**: `[[lat, lng], [lat, lng], ...]` — Leaflet order (latitude first).
- **React-Leaflet rendering**: `[lat, lng]` — matches storage format directly; no conversion needed.

> Note: earlier drafts of this plan and the interactive plan mentioned GeoJSON `[lng, lat]` order.
> The live implementation uses `[lat, lng]` throughout. See `handleMapClick` and `handleRecordPoint`
> in `TypeGeoDrawing.jsx` for the canonical source of truth.

## Visual Styles

**Polyline (geotrace)**: color `#3388ff`, weight 3, opacity 0.8

**Polygon (geoshape)**: fill `#3388ff` at 30 % opacity, border weight 2

## Key Files

- `src/fields/TypeGeoDrawing.jsx` — main component
- `src/support/GeoGeometry.jsx` — polyline / polygon renderer
- `src/support/RecordedMarkers.jsx` — numbered marker list
- `src/support/CoordinatePreview.jsx` — coordinate summary bar
- `src/support/GeoDrawingMapHandlers.jsx` — `FitBounds`, `MapClickHandler`, `MapRefSetter`
