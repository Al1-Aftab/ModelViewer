import { PlacedObject, PlaneSelectionEvent } from '../types';
import { DEFAULT_OBJECT_SCALE, DEFAULT_OBJECT_ROTATION, OBJECT_POSITION_OFFSET } from '../constants';

/**
 * Extracts position from plane selection event
 */
export const extractPositionFromPlaneEvent = (
  source: any,
  location: any,
  hitTestResults: any
): [number, number, number] => {
  let position: [number, number, number] = [0, -0.2, -1]; // fallback

  if (source && Array.isArray(source.position) && source.position.length === 3) {
    position = source.position as [number, number, number];
  } else if (source && Array.isArray(source.center) && source.center.length === 3) {
    position = source.center as [number, number, number];
  } else if (location && Array.isArray(location.position) && location.position.length === 3) {
    position = location.position as [number, number, number];
  } else if (hitTestResults && hitTestResults.length > 0) {
    const hitResult = hitTestResults[0];
    if (hitResult && hitResult.transform && Array.isArray(hitResult.transform.position)) {
      position = hitResult.transform.position as [number, number, number];
    }
  }

  // Lift object slightly above the plane to avoid Z-fighting
  return [position[0], position[1] + OBJECT_POSITION_OFFSET, position[2]];
};

/**
 * Creates a new placed object with default values
 */
export const createPlacedObject = (position: [number, number, number]): PlacedObject => ({
  id: Date.now().toString(),
  position,
  type: 'model',
  rotation: DEFAULT_OBJECT_ROTATION,
  scale: DEFAULT_OBJECT_SCALE,
  timestamp: Date.now(),
});

/**
 * Throttle utility to prevent excessive updates
 */
export class UpdateThrottler {
  private lastUpdateTimes: { [key: string]: number } = {};

  shouldUpdate(key: string, minInterval: number = 50): boolean {
    const now = Date.now();
    const lastUpdate = this.lastUpdateTimes[key] || 0;
    if (now - lastUpdate >= minInterval) {
      this.lastUpdateTimes[key] = now;
      return true;
    }
    return false;
  }

  reset(key?: string): void {
    if (key) {
      delete this.lastUpdateTimes[key];
    } else {
      this.lastUpdateTimes = {};
    }
  }
}

/**
 * Validates if a position array is valid
 */
export const isValidPosition = (position: any): position is [number, number, number] => {
  return Array.isArray(position) && 
         position.length === 3 && 
         position.every(coord => typeof coord === 'number' && !isNaN(coord));
};

/**
 * Validates if a scale/rotation array is valid
 */
export const isValidTransform = (transform: any): transform is [number, number, number] => {
  return Array.isArray(transform) && 
         transform.length === 3 && 
         transform.every(value => typeof value === 'number' && !isNaN(value));
};

/**
 * Calculates the distance between two 3D points
 */
export const calculateDistance = (
  point1: [number, number, number], 
  point2: [number, number, number]
): number => {
  const dx = point1[0] - point2[0];
  const dy = point1[1] - point2[1];
  const dz = point1[2] - point2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

/**
 * Generates a short ID from a full ID for display purposes
 */
export const getShortId = (id: string, length: number = 4): string => {
  return id.slice(-length);
};
