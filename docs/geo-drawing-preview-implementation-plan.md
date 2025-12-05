# Implementation Plan: Geo Drawing Preview for geotrace/geoshape

## Overview
Update `TypeGeoDrawing.jsx` to display coordinate previews and render map geometry (polylines for geotrace, polygons for geoshape) using react-leaflet.

## Current State Analysis

**File**: `akvo-react-form/src/fields/TypeGeoDrawing.jsx`

**Current limitations**:
- Only renders empty map container with tile layer
- No coordinate preview text
- No polyline/polygon rendering
- Doesn't access or display form field value
- No handling for undefined/empty coordinates

**Data format from exploration**:
- Value format: `[[lat, lng], [lat, lng], ...]`
- Accessed via: `form.getFieldValue([id])`
- Example values found in `example-initial-value.json` lines 274-313

## Implementation Steps

### 1. Add Coordinate Preview Component
**Location**: Inside the Form.Item, above the MapContainer

**Implementation**:
- Read `currentValue` from form (already exists on line 38)
- Display preview text:
  - If `currentValue` exists and has coordinates: show formatted lat/lng preview
  - If `undefined` or empty array: show "No coordinates"
- Format: "Coordinates: [count] points" or first/last coordinates for context

### 2. Import Required Leaflet Components
**Location**: Top of file (line 4-5 area)

**Add imports**:
```javascript
import { Polyline, Polygon, CircleMarker } from 'react-leaflet';
```

### 3. Create Geometry Rendering Component
**Location**: New component inside TypeGeoDrawing.jsx, before main component

**Component**: `GeoGeometry`
- Props: `coordinates`, `type`
- Renders:
  - For `geotrace`: Polyline with CircleMarker at each point
  - For `geoshape`: Polygon with filled area
  - Returns `null` if coordinates invalid/empty

### 4. Integrate Geometry Rendering into MapContainer
**Location**: Inside MapContainer (after TileLayer, around line 78)

**Changes**:
- Add conditional rendering of `<GeoGeometry />` when `currentValue` exists
- Auto-fit map bounds to show all coordinates using `useMap().fitBounds()`
- Handle empty state gracefully

### 5. Update Map Center Logic
**Location**: Line 66, 72 (center prop)

**Enhancement**:
- If `currentValue` has coordinates, calculate center from coordinate bounds
- Fallback to `center` prop or `defaultCenter`
- Ensures map shows the drawn geometry on load

### 6. Handle Invalid Data Cases
**Defensive checks**:
- Validate `currentValue` is array before processing
- Check each coordinate is `[lat, lng]` pair with valid numbers
- Catch any errors in coordinate conversion
- Prevent crashes from malformed data

### 7. Add Visual Styling
**Polyline styling** (geotrace):
- Color: Blue (#3388ff)
- Weight: 3
- Opacity: 0.8

**CircleMarker styling** (geotrace points):
- Radius: 5
- Color: White border with blue fill
- Makes endpoints/waypoints visible

**Polygon styling** (geoshape):
- Fill color: Blue with 30% opacity
- Border: Blue, weight 2
- Clearly shows enclosed area

## Critical Files to Modify

1. **`akvo-react-form/src/fields/TypeGeoDrawing.jsx`** - Main implementation

## Implementation Pattern Reference

**Similar pattern in TypeGeo.jsx** (`akvo-react-form/src/support/Maps.jsx`):
- Lines 260-283: MapContainer structure
- Lines 35-72: Custom marker component pattern
- Line 38: Form value access pattern

## Data Flow

1. Form stores value as `[[lat, lng], ...]` array
2. Component reads via `form.getFieldValue([id])`
3. Preview displays coordinate count/summary
4. Polyline/Polygon renders on map
5. Map auto-centers to show geometry

## Edge Cases Handled

- `undefined` value → "No coordinates" preview, empty map
- Empty array `[]` → "No coordinates" preview, empty map
- Single point → Show point with appropriate zoom
- Invalid coordinate format → Skip invalid points, log warning
- Component re-render on value change → useEffect or direct render from currentValue

## Testing Scenarios

1. **Geotrace with valid coordinates**: Should show polyline with dots at each point
2. **Geoshape with valid coordinates**: Should show filled polygon
3. **Undefined value**: Should show "No coordinates" text, empty map
4. **Empty array**: Same as undefined
5. **Single point**: Should show single marker/point
6. **Prop updates**: Geometry should update when form value changes

## Notes

- No new dependencies needed (react-leaflet already imported)
- Follows existing patterns from TypeGeo.jsx
- Minimal changes to maintain simplicity
- Focus on display/preview (not drawing/editing functionality)
