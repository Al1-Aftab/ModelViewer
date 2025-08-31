// Application constants

export const DEFAULT_OBJECT_SCALE: [number, number, number] = [0.1, 0.1, 0.1];
export const DEFAULT_OBJECT_ROTATION: [number, number, number] = [0, 0, 0];
export const OBJECT_POSITION_OFFSET = 0.05; // Lift objects above plane

export const THROTTLE_INTERVALS = {
  GESTURE_UPDATE: 100, // ms
  POSITION_UPDATE: 50, // ms
} as const;

export const AR_STATUS_MESSAGES = {
  INITIALIZING: "Initializing AR...",
  READY_WITH_DETECTION: "AR Ready! Look around to detect planes, then tap to place models.",
  READY_NO_DETECTION: "AR Ready! Plane detection is OFF.",
  TRACKING_LIMITED: "Move your device slowly to detect surfaces...",
  TRACKING_UNAVAILABLE: "AR tracking unavailable. Check lighting and move the device.",
  NO_OBJECTS_INSTRUCTION: "Look around to detect planes, then tap to place models!"
} as const;

export const GESTURE_THRESHOLDS = {
  ROTATION_THRESHOLD: 0.01,
  SCALE_THRESHOLD: 0.01,
} as const;

export const PLANE_DETECTION_CONFIG = {
  MIN_HEIGHT: 0.1,
  MIN_WIDTH: 0.1,
  ALIGNMENT: "horizontal" as const,
} as const;

export const PLANE_SCALING_CONFIG = {
  // Scale object to be this percentage of the smallest plane dimension
  SCALE_FACTOR: 0.15,
  // Minimum scale to prevent objects from being too small
  MIN_SCALE: 0.03,
  // Maximum scale to prevent objects from being too large
  MAX_SCALE: 0.4,
  // Whether to enable plane-based scaling (can be toggled for testing)
  ENABLED: true,
} as const;

export const MODEL_CONFIG = {
  GLASS: {
    SOURCE: require('../assets/glass_dirt/scene.gltf'),
    TYPE: "GLTF" as const,
    NAME: "Glass",
    DESCRIPTION: "Glass Model",
  },
  FUTURE_CAR: {
    SOURCE: require('../assets/future_car/scene.gltf'),
    TYPE: "GLTF" as const,
    NAME: "Future Car",
    DESCRIPTION: "Future Car Model",
  },
  AMBIENT_LIGHT_INTENSITY: 500,
} as const;

export const DEFAULT_MODEL_TYPE = 'GLASS' as const;

export const UI_CONFIG = {
  OVERLAY_TOP_MARGIN: 20,
  TOOLS_PANEL_GAP: 8,
  BUTTON_ROW_GAP: 10,
  TEXT_SCALES: {
    STATUS: [0.2, 0.2, 0.2] as [number, number, number],
    OBJECT_LABEL: [0.05, 0.05, 0.05] as [number, number, number],
    INSTRUCTION: [0.15, 0.15, 0.15] as [number, number, number],
  },
  POSITIONS: {
    STATUS_TEXT: [0, 0.5, -1] as [number, number, number],
    INSTRUCTION_TEXT: [0, -0.3, -1] as [number, number, number],
    OBJECT_LABEL_OFFSET: [0, 0.15, 0] as [number, number, number],
  }
} as const;
