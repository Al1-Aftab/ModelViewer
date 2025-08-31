// Common types for the AR Model Viewer application

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Scale {
  x: number;
  y: number;
  z: number;
}

export interface Transform {
  position: Position;
  rotation: Rotation;
  scale: Scale;
}

export interface PlacedObject {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  type: 'model';
  modelType: 'GLASS' | 'FUTURE_CAR';
  timestamp: number;
}

export interface ARModeState {
  scaleMode: boolean;
  rotateMode: boolean;
  dragMode: boolean;
  planeDetectionMode: boolean;
  selectedModelType: 'GLASS' | 'FUTURE_CAR';
}

export interface ARTrackingState {
  isReady: boolean;
  statusText: string;
}

export interface ViroAppProps extends ARModeState {
  setPlaneDetectionMode: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setSelectedModelType: (modelType: 'GLASS' | 'FUTURE_CAR') => void;
}

export interface PlaneSelectionEvent {
  source: any;
  location: any;
  hitTestResults: any;
}

export interface GestureEvent {
  state: number;
  factor: number;
  source: any;
}

export interface ObjectUpdatePayload {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}
