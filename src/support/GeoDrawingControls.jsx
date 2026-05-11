import React from 'react';
import { Button, Space, Select } from 'antd';
import { MdMyLocation } from 'react-icons/md';

const GeoDrawingControls = ({
  editMode,
  onEditModeChange,
  pointCount,
  onUndo,
  onClear,
  onRecord,
  disabled,
  currentPosition,
  uiOptions = {},
  onGetMyLocation,
  isLocating,
  recordingConfig,
  onConfigChange,
  isAutoRecording,
  sessionPointCount,
  livePosition,
  onStartRecording,
  onStopRecording,
  lockedAccuracy,
  uiText = {},
}) => {
  const t = {
    geoDrawingMode: 'Mode',
    geoDrawingActions: 'Actions',
    geoDrawingTapToAdd: 'Tap to Add',
    geoDrawingManualRecord: 'Manual Record',
    geoDrawingAutoRecord: 'Auto-Record',
    geoDrawingClickToAdd: 'Click on the map to add points',
    geoDrawingDragMarker: 'Drag the red marker, then press Record',
    geoDrawingPressStart: 'Press Start to begin recording your path',
    geoDrawingWalkRoute: 'Walk your route — points are saved every 10 seconds',
    geoDrawingUndoLast: 'Undo Last',
    geoDrawingClearAll: 'Clear All',
    geoDrawingGetLocation: 'Get My Location',
    geoDrawingAutoSettings: 'Auto-Recording Settings',
    geoDrawingIntervalLabel: 'Interval',
    geoDrawingIntervalValue: '10 seconds (fixed)',
    geoDrawingAccuracyLabel: 'Accuracy threshold',
    geoDrawingConfigured: 'configured',
    geoDrawingStartRecording: 'Start Auto-Recording',
    geoDrawingStopRecording: 'Stop Recording',
    geoDrawingRecording: 'Recording...',
    geoDrawingGpsAccuracy: 'GPS accuracy',
    geoDrawingRecordPoint: 'Record This Point',
    geoDrawingPoints: 'points',
    ...uiText,
  };

  const {
    showUndo = true,
    showClear = true,
    showModeToggle = true,
    recordButtonLabel,
  } = uiOptions;

  if (disabled) {
    return null;
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <Space
        direction="vertical"
        size="small"
        style={{ width: '100%' }}
      >
        {/* Info text */}
        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
          {editMode === 'tap' && t.geoDrawingClickToAdd}
          {editMode === 'manual' && t.geoDrawingDragMarker}
          {editMode === 'auto' && !isAutoRecording && t.geoDrawingPressStart}
          {editMode === 'auto' && isAutoRecording && t.geoDrawingWalkRoute}
        </div>

        {showModeToggle && (
          <Space
            direction="vertical"
            size="small"
          >
            <span style={{ fontSize: '12px', color: '#595959' }}>
              {t.geoDrawingMode}:
            </span>
            <Space
              direction="vertical"
              size="small"
              style={{ width: '100%' }}
            >
              <Button
                size="small"
                type={editMode === 'tap' ? 'primary' : 'default'}
                onClick={() => onEditModeChange('tap')}
                disabled={isAutoRecording}
                block
              >
                {t.geoDrawingTapToAdd}
              </Button>
              <Button
                size="small"
                type={editMode === 'manual' ? 'primary' : 'default'}
                onClick={() => onEditModeChange('manual')}
                disabled={isAutoRecording}
                block
              >
                {t.geoDrawingManualRecord}
              </Button>
              <Button
                size="small"
                type={editMode === 'auto' ? 'primary' : 'default'}
                onClick={() => onEditModeChange('auto')}
                disabled={isAutoRecording}
                block
              >
                {t.geoDrawingAutoRecord}
              </Button>
            </Space>

            {/* Auto-record settings panel (shown when in auto mode and not recording) */}
            {editMode === 'auto' && !isAutoRecording && (
              <div
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: 6,
                  padding: '8px 12px',
                  background: '#fafafa',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  {t.geoDrawingAutoSettings}
                </div>
                <Space
                  direction="vertical"
                  size={4}
                >
                  <div>
                    {t.geoDrawingIntervalLabel}:{' '}
                    <strong>{t.geoDrawingIntervalValue}</strong>
                  </div>
                  <Space size="small">
                    <span>{t.geoDrawingAccuracyLabel}:</span>
                    {lockedAccuracy !== null ? (
                      <span style={{ fontWeight: 600 }}>
                        {lockedAccuracy}m ({t.geoDrawingConfigured})
                      </span>
                    ) : (
                      <Select
                        size="small"
                        value={recordingConfig?.accuracy}
                        onChange={(val) =>
                          onConfigChange({ ...recordingConfig, accuracy: val })
                        }
                        style={{ width: 70 }}
                        options={[
                          { value: 5, label: '5m' },
                          { value: 10, label: '10m' },
                          { value: 15, label: '15m' },
                          { value: 20, label: '20m' },
                        ]}
                      />
                    )}
                  </Space>
                </Space>
              </div>
            )}

            <span style={{ fontSize: '12px', color: '#595959' }}>
              {t.geoDrawingActions}:
            </span>
            <Space
              direction="vertical"
              size="small"
              style={{ width: '100%' }}
            >
              {editMode === 'manual' && (
                <Button
                  type="primary"
                  size="small"
                  onClick={onRecord}
                  disabled={!currentPosition}
                  block
                >
                  {recordButtonLabel || t.geoDrawingRecordPoint}
                </Button>
              )}

              {/* Auto-record start/stop + live status */}
              {editMode === 'auto' &&
                (isAutoRecording ? (
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: '100%' }}
                  >
                    <div style={{ fontSize: '12px', color: '#595959' }}>
                      <span style={{ color: '#ff4d4f' }}>●</span>{' '}
                      {t.geoDrawingRecording}{' '}
                      <strong>{sessionPointCount}</strong> {t.geoDrawingPoints}
                    </div>
                    {livePosition && (
                      <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                        {t.geoDrawingGpsAccuracy}: ~
                        {Math.round(livePosition.accuracy)}m
                      </div>
                    )}
                    <Button
                      size="small"
                      danger
                      onClick={onStopRecording}
                      block
                    >
                      {t.geoDrawingStopRecording}
                    </Button>
                  </Space>
                ) : (
                  <Button
                    size="small"
                    type="primary"
                    onClick={onStartRecording}
                    block
                  >
                    {t.geoDrawingStartRecording}
                  </Button>
                ))}

              {showUndo && (
                <Button
                  size="small"
                  onClick={onUndo}
                  disabled={pointCount === 0}
                  block
                >
                  {t.geoDrawingUndoLast}
                </Button>
              )}

              {showClear && (
                <Button
                  size="small"
                  danger
                  onClick={onClear}
                  disabled={pointCount === 0}
                  block
                >
                  {t.geoDrawingClearAll}
                </Button>
              )}

              <Button
                size="small"
                loading={isLocating}
                onClick={onGetMyLocation}
                block
              >
                <Space size="small">
                  <MdMyLocation />
                  <span>{t.geoDrawingGetLocation}</span>
                </Space>
              </Button>
            </Space>
          </Space>
        )}
      </Space>
    </div>
  );
};

export default GeoDrawingControls;
