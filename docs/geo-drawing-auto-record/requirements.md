# Requirements: Get My Location Fix + Auto-Recording Feature

## 1. Scope

Two related changes to `src/fields/TypeGeoDrawing.jsx`:

1. **Bug fix** — "Get My Location" button must pan the map to the user's GPS position.
2. **New feature** — Auto-recording mode: continuously record GPS coordinates at a timed interval.
3. **Mobile fix** — All interaction buttons must stack vertically; manual mode must initialise at the user's GPS position.

---

## 2. Fix: "Get My Location" Button

### 2.1 Root Cause (resolved)

`react-leaflet v4` removed the `whenCreated` prop from `MapContainer`. The codebase was still
using `whenCreated={(map) => { mapRef.current = map; }}`, which silently no-ops on v4 — leaving
`mapRef.current` permanently `null`. Every subsequent `mapRef.current?.flyTo(...)` call was a
silent no-op.

Additionally, the old `ChangeView` child component called `map.setView(centre, zoom)` **directly
in the render body** (not inside a `useEffect`). This meant every React re-render — triggered by
`setIsLocating`, `setCurrentPosition`, `setLivePosition`, etc. — would reset the map view back to
the question's centre coordinate, overriding any `flyTo` that had just been called.

**Fixes applied:**

| Fix | File | Change |
|-----|------|--------|
| `mapRef` acquisition | `GeoDrawingMapHandlers.jsx` | Added `MapRefSetter` — a child component of `MapContainer` that calls `useMap()` synchronously and assigns `mapRef.current = map` during render |
| View-reset eliminated | `TypeGeoDrawing.jsx` | Removed `ChangeView` entirely; `MapContainer`'s `center` prop handles initial positioning in react-leaflet v4 |

### 2.2 Required Behaviour

| Action | Expected Result |
|--------|----------------|
| User clicks "Get My Location" | Browser prompts for location permission (if needed) |
| Permission granted | Map pans and zooms to the user's GPS position (zoom 16) |
| Permission denied | Error modal with descriptive message |
| No point is added automatically | User manually clicks/records after locating themselves |

### 2.3 Functional Requirements

- **FR-LOC-1**: On button click, call `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`.
- **FR-LOC-2**: On success, the Leaflet map must fly to the GPS coordinates at zoom level 16.
- **FR-LOC-3**: The current position marker (manual mode) must move to the GPS coordinates.
- **FR-LOC-4**: No point is added to the trace/shape automatically.
- **FR-LOC-5**: On error, show a `Modal.error` with the browser error message.
- **FR-LOC-6**: While the geolocation request is in flight, the button must show a loading state.

### 2.4 Non-Functional Requirements

- **NFR-LOC-1**: Must work in both `tap` and `manual` edit modes.
- **NFR-LOC-2**: Must not break the existing behaviour of `handleRecordPoint`.
- **NFR-LOC-3**: Must handle the case where `MapContainer` has not mounted yet (e.g., question group not yet active). The optional-chaining `?.` guard on `mapRef.current` covers this.

### 2.5 User Stories

> **US-LOC-1** — As a field surveyor, I want to press "Get My Location" and have the map jump to where I am, so I don't have to scroll manually to find my position before recording.

> **US-LOC-2** — As a mobile user, I want a clear error if location access is denied, so I know why the button didn't work.

---

## 3. Feature: Auto-Recording Mode

### 3.1 Overview

Auto-recording continuously samples the device GPS and appends a new point to the geotrace/geoshape on a fixed time interval, as long as the GPS accuracy meets a configurable threshold.

### 3.2 Functional Requirements

#### Mode Selection

- **FR-AUTO-1**: The mode toggle must include a third option: **"Auto-Record"** alongside "Tap to Add" and "Manual Record".
- **FR-AUTO-2**: Selecting "Auto-Record" mode must show a **settings panel** above the Start button.

#### Settings Panel

- **FR-AUTO-3**: The settings panel must display the recording interval (fixed at 10 seconds; shown as read-only label).
- **FR-AUTO-4**: The settings panel must include an **accuracy threshold** dropdown: `5m`, `10m`, `15m` (default), `20m`.
- **FR-AUTO-5**: Settings are only editable when recording is **not** in progress.
- **FR-AUTO-17**: If the form question JSON includes `extra.geoConfig.accuracyThreshold`, the accuracy dropdown must be **hidden** and replaced with a read-only label: `Accuracy: Xm (configured)`.
- **FR-AUTO-18**: When `extra.geoConfig.accuracyThreshold` is set, the value from JSON is used directly as the threshold; the surveyor cannot change it.

#### Recording Lifecycle

- **FR-AUTO-6**: A `[Start Auto-Recording]` primary button starts the session.
- **FR-AUTO-7**: On start, the browser must request `getCurrentPosition` first to verify permission before activating `watchPosition`.
- **FR-AUTO-8**: Once started, a `[Stop Recording]` danger button replaces the start button.
- **FR-AUTO-9**: Every 10 seconds, if the latest GPS fix has accuracy ≤ threshold, append the coordinate as `[lat, lng]` to the form value.
- **FR-AUTO-10**: If the GPS fix accuracy exceeds the threshold, the point is **skipped** silently (no error shown).
- **FR-AUTO-11**: On stop, `clearWatch` and `clearInterval` are called. Recorded points remain in the form value.

#### Live Map Tracking

- **FR-AUTO-12**: During recording, the map must **follow** the user's real-time GPS position (pan on each new fix).
- **FR-AUTO-13**: A **live position indicator** (distinct orange icon, different from numbered recorded-point markers) must appear on the map at the current GPS position.
- **FR-AUTO-14**: The live indicator must update as the GPS position changes.

#### Status Display

- **FR-AUTO-15**: While recording, display a status line: `"Recording... N points"` where N is the count of recorded points in this session.
- **FR-AUTO-16**: Accuracy of the current GPS fix must be shown in real time: `"GPS accuracy: ~Xm"`.

### 3.3 Non-Functional Requirements

- **NFR-AUTO-1**: `watchPosition` and `setInterval` handles must be stored in `useRef` to avoid stale closures and ensure cleanup on unmount.
- **NFR-AUTO-2**: Component must clean up all geolocation watchers and intervals when it unmounts.
- **NFR-AUTO-3**: Auto-recording must be disabled (button hidden/greyed) when `disabled={true}` prop is set.
- **NFR-AUTO-4**: Auto-recording must not conflict with tap or manual mode point additions; all modes share the same `currentValue` array.
- **NFR-AUTO-5**: Must degrade gracefully if `navigator.geolocation` is unavailable (show informative message).

### 3.4 User Stories

> **US-AUTO-1** — As a field surveyor walking a route, I want to press Start and have my path automatically recorded every 10 seconds, so I don't have to tap the map while walking.

> **US-AUTO-2** — As a surveyor in a poor-signal area, I want GPS points with accuracy worse than my threshold to be skipped, so my trace doesn't have wild inaccurate jumps.

> **US-AUTO-3** — As a form designer, I want to set the accuracy threshold per form, so different surveys can have different quality requirements.

> **US-AUTO-4** — As a surveyor, I want the map to follow my position while I walk, so I can see my progress without manually scrolling the map.

---

## 4. Mobile Responsiveness Fix

### 4.1 Problem
On narrow screens all action buttons rendered in a single horizontal row, causing overflow and making some buttons unreachable or clipped.

### 4.2 Requirements
- **FR-MOB-1**: All mode-toggle buttons (Tap to Add / Manual Record / Auto-Record) must stack vertically with full width.
- **FR-MOB-2**: All action buttons (Record This Point / Start/Stop Auto-Recording / Undo Last / Clear All / Get My Location) must stack vertically with full width.
- **FR-MOB-3**: When switching to Manual Record mode, the component must call `getCurrentPosition` first and place the draggable marker at the user's actual GPS position. Falling back to the question `center` prop only if geolocation fails or is unavailable.

---

## 5. Out of Scope

- Minimum distance filter between consecutive points (deferred).
- Configurable interval options (only 10 seconds in this release).
- Snap-to-road or path smoothing.
- Offline map tile caching.
- Exporting the recorded session separately from the form value.
- Compass / heading display.

---

## 6. Acceptance Criteria

### Fix: Get My Location

- ✅ Clicking the button pans the map to the user's GPS location at zoom 16.
- ✅ No point is added to the form value automatically.
- ✅ An error modal appears if geolocation fails or is denied.
- ✅ The button shows a spinner/loading state while the position is being fetched.
- ✅ `handleRecordPoint` is unmodified and still works correctly in manual mode.

### Feature: Auto-Recording

- ✅ "Auto-Record" tab appears in the mode toggle.
- ✅ Settings panel shows interval (10s label) and accuracy threshold dropdown (when not JSON-configured).
- ✅ When `extra.geoConfig.accuracyThreshold` is set in JSON, dropdown is replaced with a read-only label.
- ✅ Start button begins recording; map starts following the user.
- ✅ Points are appended every 10 seconds when accuracy meets threshold.
- ✅ Points below accuracy threshold are silently skipped.
- ✅ Stop button ends recording; points remain in form value.
- ✅ Live position indicator appears and moves on the map during recording.
- ✅ `"Recording... N points"` and `"GPS accuracy: ~Xm"` are shown during recording.
- ✅ All watchers/intervals are cleaned up on unmount.
- ✅ Feature is hidden when `disabled={true}`.

### Mobile Fixes

- ✅ All buttons stack vertically with full width on narrow screens.
- ✅ Manual mode places the draggable marker at the user's GPS position on mode switch.
- ✅ Map does not snap back to question centre after any state update.
