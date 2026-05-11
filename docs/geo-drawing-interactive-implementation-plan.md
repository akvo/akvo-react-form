# Implementation Plan: Interactive Geo Drawing for geotrace/geoshape

## Overview
Transform `TypeGeoDrawing.jsx` from display-only to fully interactive, allowing users to create, edit, and manage geographic coordinates through multiple input methods. Supports two question types:
- **geotrace**: Records and visualises a sequence of points as a polyline (route)
- **geoshape**: Records and visualises a closed shape as a polygon

---

## Current State (as of feature/192)

**Capabilities**:
- ✅ Display existing coordinates (read-only preview via `CoordinatePreview`)
- ✅ Render polylines for geotrace (`GeoGeometry`)
- ✅ Render polygons for geoshape (`GeoGeometry`)
- ✅ Auto-fit map bounds to geometry (`FitBounds`)
- ✅ Tap-to-add point interaction
- ✅ Manual record mode (draggable crosshair marker + "Record This Point" button)
- ✅ Auto-record mode (GPS watchPosition + timed interval)
- ✅ Get My Location (map pan + manual-mode marker init)
- ✅ Undo last point / Clear all with confirmation
- ✅ Numbered markers with click-to-remove
- ✅ Form validation (min 2 points for geotrace, min 3 for geoshape)
- ✅ i18n via `uiText` prop (5 locales supported)
- ✅ Mobile-responsive vertical button layout
- ✅ Disabled/read-only mode

---

## Input Methods

### Mode 1: Tap to Add (default)
User taps anywhere on the Leaflet map; a numbered marker appears and the point is appended to the form value.

- Uses `MapClickHandler` (via `useMapEvents`) in `GeoDrawingMapHandlers.jsx`
- Event: Leaflet `click` → `handleMapClick(e)` → `updatePoints([...current, [lat, lng]])`

### Mode 2: Manual Record
A draggable crosshair marker is placed on the map. The user positions it, then clicks "Record This Point".

- On switch to manual mode, `navigator.geolocation.getCurrentPosition` is called first.
  - On success: marker placed at actual GPS position, map flies there.
  - On failure: marker falls back to the question's `center` prop or `{lat:0, lng:0}`.
- `handleRecordPoint()` appends `currentPosition` to the form value.
- Marker `dragend` updates `currentPosition` state.

### Mode 3: Auto-Record
Continuously samples GPS via `watchPosition` and appends a point every 10 seconds when accuracy meets the threshold.

- See `docs/geo-drawing-auto-record/` for full requirements, design, and implementation plan.

---

## Component API (Props)

```javascript
TypeGeoDrawing.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  keyform: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  required: PropTypes.bool,
  rules: PropTypes.array,
  tooltip: PropTypes.object,
  requiredSign: PropTypes.string,
  center: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),  // [lat, lng] or [lng, lat] — auto-detected via |x|>90 check
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number })
  ]),
  group: PropTypes.object,
  type: PropTypes.oneOf(['geotrace', 'geoshape']),
  fieldIcons: PropTypes.bool,
  disabled: PropTypes.bool,
  editMode: PropTypes.oneOf(['tap', 'manual', 'auto']),  // initial mode, default 'tap'
  uiOptions: PropTypes.shape({
    showUndo: PropTypes.bool,
    showClear: PropTypes.bool,
    showModeToggle: PropTypes.bool,
    recordButtonLabel: PropTypes.string,
    showCoordinates: PropTypes.bool,
  }),
  uiText: PropTypes.object,   // i18n overrides
  extra: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
}
```

---

## Data Flow & State Management

### Form Integration
```javascript
const form = Form.useFormInstance();
const currentValue = Form.useWatch(id, form);  // [[lat, lng], ...]

const updatePoints = (newPoints) => {
  form.setFieldsValue({ [id]: newPoints });
};
```

### Coordinate Format
**Important — all coordinates stored and rendered as `[lat, lng]` (Leaflet convention):**

```javascript
// handleMapClick — tap mode
const { lat, lng } = e.latlng;
updatePoints([...(currentValue || []), [lat, lng]]);

// handleRecordPoint — manual mode
const { lat, lng } = currentPosition;
updatePoints([...(currentValue || []), [lat, lng]]);

// startAutoRecording — auto mode
form.setFieldsValue({ [id]: [...currentPoints, [pos.lat, pos.lng]] });
```

> Earlier design drafts mentioned GeoJSON `[lng, lat]` order. The live code uses `[lat, lng]`
> throughout — do not add a `toLeafletFormat` conversion; it would double-swap the coordinates.

### Map Ref Pattern (react-leaflet v4)

`whenCreated` was removed in react-leaflet v4. The map instance is obtained via a child
component that uses `useMap()` synchronously:

```javascript
// src/support/GeoDrawingMapHandlers.jsx
export const MapRefSetter = ({ mapRef }) => {
  const map = useMap();
  mapRef.current = map;   // synchronous — ref is set before any interaction
  return null;
};
```

Placed as the first child of `MapContainer` in `TypeGeoDrawing.jsx`.

**`ChangeView` has been removed from `TypeGeoDrawing`.**
In react-leaflet v4, `MapContainer`'s `center` prop is initial-only. Calling `map.setView()`
on every re-render (old `ChangeView` behaviour) fought against `flyTo` and caused the map to
snap back to the question's centre after every state update. The fix: rely on
`MapContainer center={mapCenter}` for initial position; use `mapRef.current.flyTo()` /
`mapRef.current.setView()` for all programmatic navigation thereafter.

---

## Implementation Phases

### Phase 1: MVP Foundation ✅
- Add edit mode state management
- Implement tap-to-add functionality
- Add numbered markers with click-to-remove
- Implement Undo and Clear controls
- Add form validation for min points

### Phase 2: Manual Recording Mode ✅
- Add draggable current-position marker
- Implement "Record This Point" button
- Add mode toggle UI (Tap / Manual / Auto)
- Coordinate display for current position

### Phase 3: Polish & Export ✅
- Coordinate preview enhancements
- Confirmation dialogs (clear >3 points)
- Visual polish (icons, colours, hover states)
- Component extraction into `src/support/`

### Phase 4: Auto-Recording ✅ (previously marked deferred — now complete)
- GPS permission handling
- `watchPosition` + `setInterval` implementation
- Accuracy filtering (configurable threshold; lockable via `extra.geoConfig.accuracyThreshold`)
- Session management UI (Start / Stop, live status, live position marker)
- Cleanup on unmount (`useCallback`-stable `stopAutoRecording`)

### Phase 5: Mobile Fixes ✅
- Buttons changed to vertical layout (`direction="vertical"`, `block` prop)
- Manual mode now initialises marker at actual GPS position (falls back to `center` prop)
- `mapRef` acquisition fixed for react-leaflet v4 (`MapRefSetter` replaces `whenCreated`)
- `ChangeView` removed — root cause of map snapping back to question centre

### Phase 6: Tests
- Unit tests (T1–T9) — pending
- Integration tests in example app — pending

### Phase 7: Docs ✅ (this update)
- Docs updated to reflect all phases including mobile fixes

### Phase 8: i18n ✅
- Locale keys added to all 5 locale JSON files
- `uiText` prop wired through `TypeGeoDrawing` → `GeoDrawingControls` → `RecordedMarkers` → `CoordinatePreview`

---

## Files Modified / Created

| File | Role |
|------|------|
| `src/fields/TypeGeoDrawing.jsx` | Main component — state, handlers, MapContainer |
| `src/support/GeoDrawingControls.jsx` | All UI controls (mode toggle, action buttons, settings panel) |
| `src/support/GeoDrawingMapHandlers.jsx` | `MapRefSetter`, `MapClickHandler`, `FitBounds`, `ChangeView`, icons |
| `src/support/GeoGeometry.jsx` | Polyline / polygon renderer |
| `src/support/RecordedMarkers.jsx` | Numbered marker list with click-to-remove |
| `src/support/CoordinatePreview.jsx` | Coordinate summary bar |
| `example/src/example.json` | geotrace + geoshape example questions added (group order 13) |
| `src/locales/*.json` (×5) | i18n keys for all geo-drawing UI text |

---

## Known Limitations

1. No offline tile caching — requires internet for map tiles
2. GPS accuracy depends on device hardware — manual mode is more reliable indoors
3. `<1000 points` performance target — very long auto-recorded traces may lag
4. Browser geolocation requires a secure context (HTTPS / localhost)
5. No minimum-distance filter between consecutive auto-recorded points (deferred)
