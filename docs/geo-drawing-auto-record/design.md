# Design: Get My Location Fix + Auto-Recording

## 1. Architecture Overview

Both features are contained entirely within `src/fields/TypeGeoDrawing.jsx`. Map panning (Get My Location + live tracking) is done imperatively via a `mapRef` — obtained through the `MapRefSetter` child component (react-leaflet v4 pattern).

```mermaid
graph TD
    subgraph TypeGeoDrawing["TypeGeoDrawing (state owner)"]
        STATE["State & Refs\n─────────────────\nmapRef  ← set by MapRefSetter\nlivePosition / livePositionRef\nisAutoRecording\nrecordingConfig\nwatchIdRef\nrecordingIntervalRef"]
        HANDLERS["Event Handlers\n─────────────────\nhandleGetMyLocation()\nstartAutoRecording()\nstopAutoRecording()\nrecordAutoPoint()"]
    end

    subgraph Controls["GeoDrawingControls (UI)"]
        BTN_LOC["Get My Location button"]
        BTN_START["Start Auto-Recording"]
        BTN_STOP["Stop Recording"]
        SETTINGS["Settings Panel\n(accuracy dropdown)"]
        STATUS["Status: Recording... N pts\nGPS accuracy: ~Xm"]
    end

    subgraph MapArea["MapContainer (Leaflet)"]
        MAPREF["MapRefSetter\n(sets mapRef synchronously)"]
        FIT["FitBounds\n(on coordinates change)"]
        GEOM["GeoGeometry\n(polyline / polygon)"]
        MARKERS["RecordedMarkers\n(numbered)"]
        LIVEMARKER["Live Position Marker\n(distinct orange icon)"]
    end

    BTN_LOC -->|"onGetMyLocation()"| HANDLERS
    BTN_START -->|"startAutoRecording()"| HANDLERS
    BTN_STOP -->|"stopAutoRecording()"| HANDLERS
    HANDLERS -->|"mapRef.flyTo()"| MapArea
    HANDLERS -->|"mapRef.setView()"| MapArea
    HANDLERS -->|"updatePoints()"| GEOM
    HANDLERS -->|"updatePoints()"| MARKERS
    STATE -->|"livePosition"| LIVEMARKER
```

---

## 2. State & Ref Design

```mermaid
stateDiagram-v2
    [*] --> Idle : component mounts

    Idle --> Locating : Get My Location clicked
    Locating --> Idle : GPS success → mapRef.flyTo() called
    Locating --> Idle : GPS error → Modal.error

    Idle --> AutoReady : editMode = "auto"
    AutoReady --> Recording : Start Auto-Recording clicked
    Recording --> AutoReady : Stop Recording clicked
    Recording --> Recording : watchPosition fires → livePosition updated
    Recording --> Recording : interval fires → point appended (if accuracy OK)

    AutoReady --> Idle : editMode changed
    Recording --> Idle : component unmounts (cleanup)
```

### State Variables in `TypeGeoDrawing`

| Variable | Type | Purpose |
|----------|------|---------|
| `isLocating` | `boolean` | Loading state for the Get My Location button |
| `livePosition` | `{lat, lng, accuracy} \| null` | Current GPS fix during auto-recording (drives live marker render) |
| `isAutoRecording` | `boolean` | True while auto-recording is active |
| `recordingConfig` | `{interval: number, accuracy: number}` | Settings from panel (interval fixed 10s) |
| `currentPosition` | `{lat, lng} \| null` | Draggable marker position in manual mode |
| `sessionPointCount` | `number` | Points recorded in the current auto-recording session |

### Refs

| Ref | Type | Purpose |
|-----|------|---------|
| `mapRef` | `Leaflet.Map \| null` | Direct Leaflet map instance — set synchronously by `MapRefSetter`. Used for `flyTo()` (Get My Location) and `setView()` (live tracking). |
| `watchIdRef` | `number \| null` | Geolocation watch ID → `clearWatch()` on stop/unmount |
| `recordingIntervalRef` | `number \| null` | setInterval ID → `clearInterval()` on stop/unmount |
| `livePositionRef` | `{lat, lng, accuracy} \| null` | Mirrors `livePosition` state; avoids stale closure in interval callback |

---

## 3. Map Ref Pattern (react-leaflet v4)

### Problem with the old approach

`react-leaflet v4` removed the `whenCreated` prop. The old code:
```jsx
<MapContainer whenCreated={(map) => { mapRef.current = map; }} ...>
```
silently no-ops — `mapRef.current` stays `null` forever.

### Solution: `MapRefSetter` child component

```javascript
// src/support/GeoDrawingMapHandlers.jsx
export const MapRefSetter = ({ mapRef }) => {
  const map = useMap();   // synchronous — returns map instance immediately
  mapRef.current = map;  // set during render, before any effects or interactions
  return null;
};
```

Placed as the **first child** of `MapContainer`:
```jsx
<MapContainer center={mapCenter} zoom={13} ...>
  <MapRefSetter mapRef={mapRef} />
  <TileLayer ... />
  ...
</MapContainer>
```

### Why `ChangeView` was removed

The old `ChangeView` component called `map.setView(centre, zoom)` **directly in its render body**
(not inside a `useEffect`). This meant every React re-render — `setIsLocating`, `setCurrentPosition`,
`setLivePosition`, etc. — would fire `map.setView(questionCentre)` and override any `flyTo` that
had just run. The map always snapped back to Fiji (the question's `center` prop).

Fix: remove `ChangeView` from `TypeGeoDrawing`. `MapContainer`'s `center` prop is initial-only in
react-leaflet v4, so the map is positioned correctly at mount and never overridden again.

---

## 4. Data Flow: Get My Location Fix

```mermaid
sequenceDiagram
    participant User
    participant Button as Get My Location Button
    participant Handler as handleGetMyLocation()
    participant GeoAPI as navigator.geolocation
    participant State as TypeGeoDrawing State
    participant MapRef as mapRef.current
    participant Map as Leaflet Map

    User->>Button: click
    Button->>Handler: onGetMyLocation()
    Handler->>State: setIsLocating(true)
    Handler->>GeoAPI: getCurrentPosition(enableHighAccuracy)
    GeoAPI-->>Handler: success {latitude, longitude}
    Handler->>MapRef: mapRef.current.flyTo([lat, lng], 16)
    MapRef->>Map: flyTo animation
    Map-->>User: map pans and zooms to actual position
    Handler->>State: setIsLocating(false)

    alt Permission denied or error
        GeoAPI-->>Handler: error
        Handler->>State: setIsLocating(false)
        Handler->>User: Modal.error(message)
    end
```

---

## 5. Data Flow: Auto-Recording

```mermaid
sequenceDiagram
    participant User
    participant Controls as GeoDrawingControls
    participant Handler as startAutoRecording()
    participant GeoAPI as navigator.geolocation
    participant Interval as setInterval(10s)
    participant LiveRef as livePositionRef
    participant State as TypeGeoDrawing State
    participant MapRef as mapRef.current
    participant Map as Leaflet Map
    participant Form as Ant Design Form

    User->>Controls: click [Start Auto-Recording]
    Controls->>Handler: startAutoRecording()
    Handler->>GeoAPI: getCurrentPosition (permission check)

    alt Permission denied
        GeoAPI-->>Handler: error
        Handler->>User: Modal.error
    end

    GeoAPI-->>Handler: success
    Handler->>State: setIsAutoRecording(true)
    Handler->>GeoAPI: watchPosition(callback, error, {enableHighAccuracy})
    Handler->>Interval: setInterval(recordAutoPoint, 10000)

    loop Every GPS fix
        GeoAPI-->>Handler: position update
        Handler->>LiveRef: livePositionRef.current = {lat, lng, accuracy}
        Handler->>State: setLivePosition({lat, lng, accuracy})
        Handler->>MapRef: mapRef.current.setView([lat, lng])
        MapRef->>Map: pan (no zoom change)
        Map-->>User: map follows user position
    end

    loop Every 10 seconds
        Interval->>LiveRef: read livePositionRef.current
        alt accuracy <= threshold
            LiveRef-->>Form: form.setFieldsValue append [lat, lng]
            State->>State: setSessionPointCount(n + 1)
        else accuracy > threshold
            Note over Interval: skip point silently
        end
    end

    User->>Controls: click [Stop Recording]
    Controls->>Handler: stopAutoRecording()
    Handler->>GeoAPI: clearWatch(watchIdRef.current)
    Handler->>Interval: clearInterval(recordingIntervalRef.current)
    Handler->>State: setIsAutoRecording(false)
    Handler->>State: setLivePosition(null)
```

---

## 6. Manual Mode: GPS Initialisation

When the user switches to Manual Record mode, the draggable marker must appear at their actual
GPS position, not at the question's `center` prop (which may be a faraway place like Fiji).

```javascript
useEffect(() => {
  if (editMode !== 'manual' || currentPosition) return;

  const fallbackPos = /* center prop or {lat:0,lng:0} */;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentPosition(p);
        mapRef.current?.flyTo([p.lat, p.lng], 16);
      },
      () => setCurrentPosition(fallbackPos),
      { enableHighAccuracy: false, timeout: 5000 }
    );
  } else {
    setCurrentPosition(fallbackPos);
  }
}, [editMode, currentPosition, center]);
```

`enableHighAccuracy: false` and a 5-second timeout give a fast coarse fix — sufficient to place
the marker in the correct city while the device acquires a better signal.

---

## 7. UI Layout (implemented)

### Mode Toggle — vertical on all screen sizes

```
[ Tap to Add        ]   ← full-width button
[ Manual Record     ]
[ Auto-Record       ]
```

### Auto-Record Panel (not recording)

```
┌─────────────────────────────────────────────────┐
│  Auto-Recording Settings                        │
│  Interval:   10 seconds (fixed)                 │
│  Accuracy:   [15m ▼]  (5m / 10m / 15m / 20m)   │
│                                                 │
│  [ Start Auto-Recording  ]  ← full-width        │
└─────────────────────────────────────────────────┘
```

**With `extra.geoConfig.accuracyThreshold` set:**
```
│  Accuracy:   10m (configured)    ← read-only
```

### Auto-Record Panel (recording)

```
┌─────────────────────────────────────────────────┐
│  ● Recording...  7 points                       │
│  GPS accuracy: ~8m                              │
│                                                 │
│  [ Stop Recording          ]  ← danger, full-w  │
└─────────────────────────────────────────────────┘
```

---

## 8. Coordinate Format

Storage format is `[[lat, lng], ...]` (Leaflet convention — latitude first).
All handlers store and read in this format consistently.

```mermaid
flowchart LR
    GPS["GPS {latitude, longitude}"] --> A["[latitude, longitude]"]
    A --> B["[...currentValue, [lat, lng]]"]
    B --> C["form.setFieldsValue({id: newPoints})"]
```

> Do **not** apply a `[lng, lat]` → `[lat, lng]` conversion. The components (`GeoGeometry`,
> `FitBounds`, `RecordedMarkers`) all consume the stored format directly without swapping axes.

---

## 9. Cleanup Contract

```mermaid
flowchart TD
    A[stopAutoRecording called] --> B[clearWatch watchIdRef.current]
    A --> C[clearInterval recordingIntervalRef.current]
    A --> D[setIsAutoRecording false]
    A --> E[setLivePosition null]
    B --> F[watchIdRef.current = null]
    C --> G[recordingIntervalRef.current = null]

    H[useEffect cleanup / unmount] --> A
    I[Stop button clicked] --> A
```

`stopAutoRecording` is wrapped in `useCallback` with no changing dependencies, making it safe to
include in `useEffect` dependency arrays and ensuring a stable reference across renders.
