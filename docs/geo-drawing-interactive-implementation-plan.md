# Implementation Plan: Interactive Geo Drawing for geotrace/geoshape

## Overview
Transform `TypeGeoDrawing.jsx` from display-only to fully interactive, allowing users to create, edit, and manage geographic coordinates through multiple input methods. Supports two question types:
- **geotrace**: Records and visualizes a sequence of points as a polyline (route)
- **geoshape**: Records and visualizes a closed shape as a polygon

## Current State (Baseline)
**File**: `akvo-react-form/src/fields/TypeGeoDrawing.jsx`

**Current capabilities**:
- ✅ Display existing coordinates (read-only preview)
- ✅ Render polylines for geotrace
- ✅ Render polygons for geoshape
- ✅ Auto-fit map bounds to geometry
- ✅ Coordinate count preview

**Limitations**:
- ❌ No user interaction to add/edit points
- ❌ No drawing or recording capabilities
- ❌ No export functionality
- ❌ Disabled state (form integration incomplete)

## Required Input Methods

### MVP Priority 1: Placement by Tapping
**User Story**: As a user, I want to click/tap on the map to add points to my trace/shape.

**Behavior**:
- User clicks anywhere on the Leaflet map
- A numbered marker appears at the clicked location
- Point is appended to the coordinates array
- For geotrace: polyline updates to connect all points in order
- For geoshape: polygon updates; auto-closes visually when >2 points

**UI/UX Requirements**:
- ✅ Numbered markers (1, 2, 3...) showing point order
- ✅ Hover popup showing lat/lng coordinates
- ✅ Click on marker to remove that point
- ✅ Visual feedback on hover (cursor change, marker highlight)
- ✅ Real-time geometry update as points are added/removed

**Technical Implementation**:
- Use Leaflet's `useMapEvents` hook to listen for `click` events
- Prevent event propagation to marker click handlers
- Update form field value via `form.setFieldsValue([id], newPoints)`
- Maintain point order in array

**Data Structure**:
```javascript
// Point format
{
  lat: number,
  lng: number,
  timestamp?: string,  // ISO 8601 format
  accuracy?: number    // meters (for future GPS recording)
}
```

**Callbacks**:
- `onUpdate(points)` - Called on every change (add/remove/edit)
- `onComplete(points)` - Called when user finishes (optional)

### MVP Priority 2: Manual Location Recording
**User Story**: As a user, I want to position a marker and press "Record" to save that location.

**Behavior**:
- Map displays a single draggable "current position" marker (distinct color/icon)
- User drags marker to desired location OR centers map view
- User presses "Record This Point" button to capture position
- Point is added to coordinates array with timestamp
- Current marker remains draggable for next recording

**UI/UX Requirements**:
- ✅ Prominent "Record This Point" button (primary style)
- ✅ Draggable crosshair/marker icon (different from recorded points)
- ✅ Coordinate display for current position
- ✅ Point counter: "Recorded: 5 points"
- ✅ Visual distinction between "current" and "recorded" markers
- ✅ Edit mode toggle: "View Mode" ↔ "Edit Mode"

**Technical Implementation**:
- Use Leaflet `<Marker draggable={true} />` component
- Track current position in local state (separate from recorded points)
- Option: Use map center as alternative to draggable marker
- Button click captures position and appends to form value
- Reset or maintain current position after recording (configurable)

**Interaction Modes**:
1. **View Mode**: Display-only (current behavior, default when `disabled={true}`)
2. **Edit Mode**: All interaction features enabled (when `disabled={false}`)

### Future Feature: Automatic GPS Recording (Deferred)
**User Story**: As a field surveyor, I want to automatically record my path as I walk.

**Behavior** (not implemented in MVP):
- User configures sampling interval and accuracy threshold
- Presses "Start Recording" to begin auto-sampling
- Uses `navigator.geolocation.watchPosition` with `enableHighAccuracy`
- Records points that meet accuracy threshold
- Presses "Stop Recording" to end session
- Option to save or discard session

**Configuration Options**:
- Interval: 5s, 10s, 30s, 60s
- Accuracy threshold: 5m, 10m, 15m, 20m
- Min distance filter: Don't record if <5m from last point

**Data Recorded**:
```javascript
{
  lat: number,
  lng: number,
  timestamp: string,  // ISO 8601
  accuracy: number    // meters from GPS
}
```

**Implementation Status**:
- ⏸️ Stub/placeholder API only
- 🔮 Full implementation deferred post-MVP
- 📝 Design documented for future reference

## Component API (Props)

```javascript
TypeGeoDrawing.propTypes = {
  // Existing props
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  keyform: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  required: PropTypes.bool,
  rules: PropTypes.array,
  tooltip: PropTypes.object,
  requiredSign: PropTypes.string,
  center: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),  // [lng, lat]
    PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number })
  ]),
  group: PropTypes.object,
  type: PropTypes.oneOf(['geotrace', 'geoshape']),  // Required!
  fieldIcons: PropTypes.bool,
  disabled: PropTypes.bool,  // Controls edit mode

  // New props for interactive features
  editMode: PropTypes.oneOf(['tap', 'manual', 'auto']),  // Default: 'tap'
  allowAutoRecording: PropTypes.bool,  // Default: false (MVP)
  onUpdate: PropTypes.func,  // (points: Point[]) => void
  onComplete: PropTypes.func,  // (points: Point[]) => void
  uiOptions: PropTypes.shape({
    showUndo: PropTypes.bool,         // Default: true
    showClear: PropTypes.bool,        // Default: true
    showModeToggle: PropTypes.bool,   // Default: true
    recordButtonLabel: PropTypes.string,  // Default: "Record This Point"
    showCoordinates: PropTypes.bool   // Default: true
  }),
  exportFormat: PropTypes.oneOf(['array', 'geojson']),  // Default: 'array'
}
```

## Data Flow & State Management

### Form Integration
```javascript
// Read current value from form
const form = Form.useFormInstance();
const currentValue = form.getFieldValue([id]);  // [[lng, lat], ...]

// Update form value
const updatePoints = (newPoints) => {
  form.setFieldsValue({ [id]: newPoints });
  onUpdate?.(newPoints);  // Optional callback
};
```

### Internal State (React)
```javascript
const [editMode, setEditMode] = useState('tap');  // 'tap' | 'manual' | 'auto'
const [isEditing, setIsEditing] = useState(!disabled);
const [currentPosition, setCurrentPosition] = useState(null);  // For manual mode
const [isRecording, setIsRecording] = useState(false);  // For auto mode
const [recordingConfig, setRecordingConfig] = useState({
  interval: 10,      // seconds
  accuracy: 10,      // meters
  minDistance: 5     // meters
});
```

### Coordinate Format Handling
**Important**: Maintain consistency with existing data formats:
- **Storage format** (form values): `[[lng, lat], [lng, lat], ...]` (GeoJSON standard)
- **Leaflet rendering**: `[lat, lng]` order (requires conversion)
- **Display format**: User-friendly "lat, lng" strings

```javascript
// Convert for Leaflet rendering
const toLeafletFormat = (points) => points.map(([lng, lat]) => [lat, lng]);

// Convert back to storage format
const toStorageFormat = (leafletPoints) => leafletPoints.map(([lat, lng]) => [lng, lat]);

// Format for display
const formatCoordinate = ([lng, lat]) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
```

## UI Components Breakdown

### 1. Control Panel Component
```javascript
<GeoDrawingControls
  editMode={editMode}
  onEditModeChange={setEditMode}
  pointCount={currentValue?.length || 0}
  type={type}
  onUndo={handleUndo}
  onClear={handleClear}
  onRecord={handleRecordPoint}  // Manual mode
  onToggleRecording={handleToggleRecording}  // Auto mode
  isRecording={isRecording}
  disabled={disabled}
  uiOptions={uiOptions}
/>
```

**Layout**:
- Mode selector: [Tap] [Manual] [Auto*]  (*disabled in MVP)
- Point counter: "5 points (route)"
- Action buttons: [Undo] [Clear All] [Record This Point] (context-aware)
- Auto mode controls: [Start Recording] [Stop & Save] (hidden in MVP)

### 2. Interactive Map Component
```javascript
<InteractiveMapContainer
  center={mapCenter}
  zoom={13}
  editMode={editMode}
  isEditing={isEditing}
  onMapClick={handleMapClick}  // Tap mode
  currentPosition={currentPosition}
  onCurrentPositionChange={setCurrentPosition}  // Manual mode
>
  <TileLayer url="..." />

  {/* Recorded points */}
  <RecordedMarkers
    points={currentValue}
    type={type}
    onRemovePoint={handleRemovePoint}
  />

  {/* Geometry */}
  <GeoGeometry
    coordinates={currentValue}
    type={type}
  />

  {/* Current position marker (manual mode) */}
  {editMode === 'manual' && (
    <CurrentPositionMarker
      position={currentPosition}
      onDragEnd={setCurrentPosition}
    />
  )}

  {/* Auto-fit bounds */}
  <FitBounds coordinates={currentValue} />
</InteractiveMapContainer>
```

### 3. Marker Components

**RecordedMarkers**: Numbered markers for recorded points
- DivIcon with number label (1, 2, 3...)
- Blue color, white number
- Hover: Show lat/lng popup
- Click: Remove point (with confirmation if >3 points)

**CurrentPositionMarker**: Draggable marker for manual recording
- Crosshair or pin icon, distinct color (red/orange)
- Always draggable in manual mode
- Shows coordinates on drag

### 4. Coordinate Display
```javascript
<CoordinatePreview
  coordinates={currentValue}
  type={type}
  showDetails={uiOptions.showCoordinates}
/>
```

**Display formats**:
- Compact: "5 points (route)" or "7 points (polygon)"
- Expanded: List first 3 and last point with coordinates
- Toggle to show full list

## Event Handlers

### Map Click (Tap Mode)
```javascript
const handleMapClick = (e) => {
  if (editMode !== 'tap' || disabled) return;

  const { lat, lng } = e.latlng;
  const newPoint = [lng, lat];  // Storage format
  const updatedPoints = [...(currentValue || []), newPoint];

  updatePoints(updatedPoints);
};
```

### Record Point (Manual Mode)
```javascript
const handleRecordPoint = () => {
  if (!currentPosition || disabled) return;

  const { lat, lng } = currentPosition;
  const newPoint = [lng, lat];
  const updatedPoints = [...(currentValue || []), newPoint];

  updatePoints(updatedPoints);
  // Option: Reset currentPosition or keep it
};
```

### Remove Point
```javascript
const handleRemovePoint = (index) => {
  if (disabled) return;

  const updatedPoints = currentValue.filter((_, i) => i !== index);
  updatePoints(updatedPoints);
};
```

### Undo Last Point
```javascript
const handleUndo = () => {
  if (!currentValue?.length || disabled) return;

  const updatedPoints = currentValue.slice(0, -1);
  updatePoints(updatedPoints);
};
```

### Clear All
```javascript
const handleClear = () => {
  if (disabled) return;

  // Show confirmation if >3 points
  if (currentValue?.length > 3) {
    Modal.confirm({
      title: 'Clear all points?',
      content: 'This will remove all recorded points. Continue?',
      onOk: () => updatePoints([])
    });
  } else {
    updatePoints([]);
  }
};
```

### Auto Recording (Stub for Future)
```javascript
const handleToggleRecording = () => {
  // Placeholder implementation
  console.warn('Auto recording not yet implemented');

  // Future implementation:
  // if (isRecording) {
  //   stopGPSRecording();
  // } else {
  //   startGPSRecording(recordingConfig);
  // }
};
```

## Export Functionality

### GeoJSON Export
```javascript
const exportAsGeoJSON = (points, type) => {
  if (type === 'geotrace') {
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: points  // [[lng, lat], ...]
      },
      properties: {
        pointCount: points.length,
        createdAt: new Date().toISOString()
      }
    };
  }

  if (type === 'geoshape') {
    // Ensure polygon is closed
    const coordinates = [...points];
    if (coordinates.length > 0 &&
        (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
         coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]  // Note: outer array for polygon rings
      },
      properties: {
        pointCount: points.length,
        createdAt: new Date().toISOString()
      }
    };
  }
};
```

### Export Button
```javascript
<Button onClick={handleExport}>
  Export as GeoJSON
</Button>

const handleExport = () => {
  if (!currentValue?.length) return;

  const geoJSON = exportAsGeoJSON(currentValue, type);
  const blob = new Blob([JSON.stringify(geoJSON, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${type}-${Date.now()}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
};
```

## Validation & Error Handling

### Point Validation
```javascript
const isValidPoint = (point) => {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    typeof point[0] === 'number' &&
    typeof point[1] === 'number' &&
    !isNaN(point[0]) &&
    !isNaN(point[1]) &&
    point[0] >= -180 && point[0] <= 180 &&  // lng
    point[1] >= -90 && point[1] <= 90        // lat
  );
};
```

### Form Validation Rules
```javascript
// Add to TypeGeoDrawing validation
const geoDrawingRules = [
  {
    validator: (_, value) => {
      if (!required && (!value || value.length === 0)) {
        return Promise.resolve();
      }

      if (type === 'geotrace' && value.length < 2) {
        return Promise.reject('A route requires at least 2 points');
      }

      if (type === 'geoshape' && value.length < 3) {
        return Promise.reject('A polygon requires at least 3 points');
      }

      const allValid = value.every(isValidPoint);
      if (!allValid) {
        return Promise.reject('Invalid coordinates detected');
      }

      return Promise.resolve();
    }
  }
];
```

### Error Boundary
```javascript
<ErrorBoundary fallback={<div>Error rendering map. Please refresh.</div>}>
  <InteractiveMapContainer {...props} />
</ErrorBoundary>
```

## Accessibility Considerations

- Keyboard navigation for buttons
- Screen reader announcements for point additions/removals
- ARIA labels for map controls
- Focus management when switching modes
- Alt text for custom icons

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

```javascript
describe('TypeGeoDrawing Interactive', () => {
  it('should add point on map click in tap mode', () => {
    // Test map click adds point to form value
  });

  it('should record point on button click in manual mode', () => {
    // Test record button captures current position
  });

  it('should remove point when marker clicked', () => {
    // Test marker click removes point
  });

  it('should undo last point', () => {
    // Test undo button removes last point
  });

  it('should clear all points with confirmation', () => {
    // Test clear button shows modal and clears
  });

  it('should validate minimum points for geotrace', () => {
    // Test form validation requires ≥2 points
  });

  it('should validate minimum points for geoshape', () => {
    // Test form validation requires ≥3 points
  });

  it('should export valid GeoJSON for geotrace', () => {
    // Test LineString format
  });

  it('should export valid GeoJSON for geoshape with closed polygon', () => {
    // Test Polygon format with auto-closing
  });

  it('should show auto-recording stub message', () => {
    // Test future feature placeholder
  });
});
```

### Integration Tests (Example App)

**Test Scenarios**:
1. Create a geotrace with 5 points via tap mode
2. Create a geoshape with 4 points via manual mode
3. Edit existing geotrace by removing middle point
4. Undo and redo operations
5. Clear all and restart
6. Export GeoJSON and verify format
7. Form validation on submit with insufficient points
8. Load existing coordinates and edit them

**Test Data** (add to `example/src/example-initial-value.json`):
```json
{
  "id": 41,
  "value": [
    [-7.3912967, 109.4652897],
    [-7.3911063, 109.465008],
    [-7.3910358, 109.4651967]
  ]
}
```

## Implementation Phases

### Phase 1: MVP Foundation (Priority)
1. ✅ Add edit mode state management
2. ✅ Implement tap-to-add functionality
3. ✅ Add numbered markers with click-to-remove
4. ✅ Implement Undo and Clear controls
5. ✅ Add form validation for min points

**Estimated complexity**: Medium
**Critical path**: Yes

### Phase 2: Manual Recording Mode
1. ✅ Add draggable current position marker
2. ✅ Implement "Record This Point" button
3. ✅ Add mode toggle UI (Tap ↔ Manual)
4. ✅ Coordinate display for current position

**Estimated complexity**: Medium
**Dependencies**: Phase 1

### Phase 3: Polish & Export
1. ✅ GeoJSON export functionality
2. ✅ Coordinate preview enhancements
3. ✅ Confirmation dialogs
4. ✅ Accessibility improvements
5. ✅ Visual polish (icons, colors, hover states)

**Estimated complexity**: Low-Medium
**Dependencies**: Phase 1-2

### Phase 4: Auto-Recording (Future)
1. ⏸️ GPS permission handling
2. ⏸️ watchPosition implementation
3. ⏸️ Accuracy filtering
4. ⏸️ Session management UI
5. ⏸️ Auto-save interim points

**Estimated complexity**: High
**Status**: Deferred post-MVP

## Files to Modify/Create

### Modify
1. **`src/fields/TypeGeoDrawing.jsx`** - Main implementation (300+ lines expected)

### Create (Optional - if components get large)
2. **`src/components/GeoDrawingControls.jsx`** - Control panel component
3. **`src/components/InteractiveMap.jsx`** - Map interaction logic
4. **`src/support/GeoUtils.js`** - Coordinate conversion/validation utilities

### Update
5. **`example/src/example.json`** - Add geotrace/geoshape examples with editable: true
6. **`example/src/example-initial-value.json`** - Add test coordinates
7. **`README.md`** - Document new interactive features and props

## Backward Compatibility

**Ensure existing behavior preserved**:
- Display-only mode when `disabled={true}` (current behavior)
- Existing coordinate format compatible (`[[lng, lat], ...]`)
- No breaking changes to prop API
- GeoJSON export optional (doesn't affect form submission)

**Migration path**:
- Existing forms continue to work without changes
- New interactive features opt-in via `disabled={false}`
- Default behavior remains display-only for safety

## Known Limitations & Trade-offs

1. **No offline tile caching**: Requires internet for map tiles
2. **GPS accuracy**: Depends on device hardware (manual mode more reliable)
3. **Mobile UX**: Tap targets may be small on mobile (needs testing)
4. **Performance**: Large polylines (>1000 points) may lag
5. **Browser support**: Geolocation API not available in all contexts (e.g., HTTP)

## Future Enhancements (Post-MVP)

- Snap-to-road functionality (using routing API)
- Edit individual points by dragging markers
- Import GeoJSON files
- Multi-trace/shape support
- Offline map tile caching
- Compass/heading display for auto-recording
- Route statistics (distance, area, duration)
- Custom marker icons per point
- Drawing tools (circle, rectangle helpers)

## Success Criteria

**MVP Complete When**:
- ✅ User can create geotrace by tapping map
- ✅ User can create geoshape by tapping map
- ✅ User can use manual recording mode with draggable marker
- ✅ Undo and Clear functions work reliably
- ✅ Form validation enforces minimum points
- ✅ Visual feedback clear and intuitive
- ✅ GeoJSON export produces valid output
- ✅ Integration tests pass in example app
- ✅ Existing display-only behavior preserved

**Definition of Done**:
- Code reviewed and tested
- Unit tests covering core functionality
- Integration tested in example app
- Documentation updated (README, prop descriptions)
- Backward compatible with existing forms
- Performance acceptable (no lag with <100 points)

---

## Quick Reference

**Coordinate Formats**:
- Storage: `[[lng, lat], ...]` (GeoJSON)
- Leaflet: `[lat, lng]` (reversed)
- Display: `"lat, lng"` (user-friendly)

**Minimum Points**:
- geotrace: 2 points (line)
- geoshape: 3 points (polygon)

**Edit Modes**:
- `tap`: Click map to add points
- `manual`: Drag marker + Record button
- `auto`: GPS auto-sampling (future)

**Key Props**:
- `type`: 'geotrace' | 'geoshape'
- `disabled`: true = view-only, false = editable
- `onUpdate`: Callback on every change
- `editMode`: 'tap' | 'manual' | 'auto'
