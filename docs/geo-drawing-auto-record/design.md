# Design: Get My Location Fix + Auto-Recording

## 1. Architecture Overview

Both features are contained entirely within `src/fields/TypeGeoDrawing.jsx`. Map panning (Get My Location + live tracking) is done imperatively via a `mapRef` — no extra components inside `MapContainer` are needed for either operation.

```mermaid
graph TD
    subgraph TypeGeoDrawing["TypeGeoDrawing (state owner)"]
        STATE["State & Refs\n─────────────────\nmapRef\nlivePosition / livePositionRef\nisAutoRecording\nrecordingConfig\nwatchIdRef\nrecordingIntervalRef"]
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
        FIT["FitBounds\n(on coordinates change)"]
        GEOM["GeoGeometry\n(polyline / polygon)"]
        MARKERS["RecordedMarkers\n(numbered)"]
        LIVEMARKER["Live Position Marker\n(distinct icon)"]
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

### State Variables Added to `TypeGeoDrawing`

| Variable | Type | Purpose |
|----------|------|---------|
| `isLocating` | `boolean` | Loading state for the Get My Location button |
| `livePosition` | `{lat, lng, accuracy} \| null` | Current GPS fix during auto-recording (drives live marker render) |
| `isAutoRecording` | `boolean` | True while auto-recording is active |
| `recordingConfig` | `{interval: number, accuracy: number}` | Settings from panel (interval fixed 10s) |

### Refs Added

| Ref | Type | Purpose |
|-----|------|---------|
| `mapRef` | `Leaflet.Map \| null` | Direct Leaflet map instance — used for `flyTo()` (Get My Location) and `setView()` (live tracking). Replaces the need for `FlyTo` and `LiveTracker` components. |
| `watchIdRef` | `number \| null` | Geolocation watch ID → `clearWatch()` on stop/unmount |
| `recordingIntervalRef` | `number \| null` | setInterval ID → `clearInterval()` on stop/unmount |
| `livePositionRef` | `{lat, lng, accuracy} \| null` | Mirrors `livePosition` state; avoids stale closure in interval callback |

---

## 3. Data Flow: Get My Location Fix

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
    Map-->>User: map pans and zooms
    Handler->>State: setIsLocating(false)

    alt Permission denied or error
        GeoAPI-->>Handler: error
        Handler->>State: setIsLocating(false)
        Handler->>User: Modal.error(message)
    end
```

---

## 4. Data Flow: Auto-Recording

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
            State->>State: update status count
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

## 5. Inner Component Design

### 5.1 Map Ref Pattern

`FlyTo` and `LiveTracker` are **not** separate components. Both operations are called imperatively via `mapRef.current`, which holds the Leaflet map instance obtained through `MapContainer`'s `whenCreated` callback.

```mermaid
flowchart TD
    A["MapContainer\nwhenCreated={map => mapRef.current = map}"] --> B["mapRef.current\n(Leaflet Map instance)"]
    B --> C["handleGetMyLocation()\n→ mapRef.current.flyTo([lat, lng], 16)"]
    B --> D["watchPosition callback\n→ mapRef.current.setView([lat, lng])"]
```

| Operation | Called from | Method |
|-----------|------------|--------|
| Get My Location pan | `handleGetMyLocation()` handler | `mapRef.current.flyTo([lat, lng], 16)` |
| Live tracking pan | `watchPosition` callback inside `startAutoRecording()` | `mapRef.current.setView([lat, lng])` |

**Why this is simpler than components**: both operations are one-liners triggered by existing event callbacks — there is no React state change driving them, so a reactive component would add indirection without benefit.

### 5.2 Live Position Marker

A new orange marker rendered inside `MapContainer` when `livePosition` is set and `isAutoRecording` is true. Uses a distinct icon (pulsing orange dot) to visually separate it from numbered recorded-point markers (blue circles).

```javascript
// Icon: orange circle with white border
const createLivePositionIcon = () => L.divIcon({
  className: 'live-position-icon',
  html: `<div style="
    width: 16px; height: 16px;
    background: #fa8c16;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(250,140,22,0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
```

---

## 6. UI Layout

### Mode Toggle (updated)

```
Mode:
[ Tap to Add ]  [ Manual Record ]  [ Auto-Record ]
```

### Auto-Record Panel (when auto mode selected, not recording)

**Without JSON config** — surveyor can adjust threshold:
```
┌─────────────────────────────────────────────────┐
│  Auto-Recording Settings                        │
│  ─────────────────────────────────────────────  │
│  Interval:   10 seconds (fixed)                 │
│  Accuracy:   [15m ▼]  (5m / 10m / 15m / 20m)   │
│                                                 │
│  [ Start Auto-Recording ]                       │
└─────────────────────────────────────────────────┘
```

**With `extra.geoConfig.accuracyThreshold` in form JSON** — threshold locked:
```
┌─────────────────────────────────────────────────┐
│  Auto-Recording Settings                        │
│  ─────────────────────────────────────────────  │
│  Interval:   10 seconds (fixed)                 │
│  Accuracy:   10m (configured)                   │
│                                                 │
│  [ Start Auto-Recording ]                       │
└─────────────────────────────────────────────────┘
```

### Auto-Record Panel (while recording)

```
┌─────────────────────────────────────────────────┐
│  ● Recording...  7 points                       │
│  GPS accuracy: ~8m                              │
│                                                 │
│  [ Stop Recording ]  (danger button)            │
└─────────────────────────────────────────────────┘
```

---

## 7. Coordinate Format (unchanged)

Storage format remains `[[lat, lng], ...]` (existing convention in this component). Auto-recorded points use the same format.

```mermaid
flowchart LR
    GPS["GPS {latitude, longitude}"] --> A["[latitude, longitude]"]
    A --> B["[...currentValue, [lat, lng]]"]
    B --> C["form.setFieldsValue({id: newPoints})"]
```

---

## 8. Cleanup Contract

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

All cleanup paths call the same `stopAutoRecording` function to ensure consistency.
