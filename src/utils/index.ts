import { PlacedObject } from '../types';
import { DEFAULT_OBJECT_SCALE, DEFAULT_OBJECT_ROTATION, OBJECT_POSITION_OFFSET, PLANE_SCALING_CONFIG } from '../constants';

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
 * Calculates appropriate object scale based on detected plane dimensions
 */
export const calculateScaleFromPlane = (source: any): [number, number, number] => {
  // Check if plane-based scaling is enabled
  if (!PLANE_SCALING_CONFIG.ENABLED) {
    return DEFAULT_OBJECT_SCALE;
  }
  
  let scaleFactor = DEFAULT_OBJECT_SCALE[0]; // Default scale
  
  try {
    // Try different possible properties where plane dimensions might be stored
    let planeWidth: number | undefined;
    let planeHeight: number | undefined;
    
    // Check various possible properties for plane dimensions
    if (source?.width !== undefined && source?.height !== undefined) {
      planeWidth = source.width;
      planeHeight = source.height;
    } else if (source?.extent?.x !== undefined && source?.extent?.z !== undefined) {
      // Some AR frameworks use extent for dimensions
      planeWidth = source.extent.x;
      planeHeight = source.extent.z;
    } else if (source?.anchor?.extent?.x !== undefined && source?.anchor?.extent?.z !== undefined) {
      planeWidth = source.anchor.extent.x;
      planeHeight = source.anchor.extent.z;
    }
    
    if (planeWidth !== undefined && planeHeight !== undefined) {
      // Calculate scale as percentage of plane size
      const planeDimension = Math.min(planeWidth, planeHeight);
      
      console.log(`Plane dimensions: ${planeWidth} x ${planeHeight}, using dimension: ${planeDimension}`);
      
      // Scale object to be configured percentage of the smallest plane dimension
      scaleFactor = planeDimension * PLANE_SCALING_CONFIG.SCALE_FACTOR;
      
      // Apply constraints to prevent objects that are too small or too large
      scaleFactor = Math.max(
        PLANE_SCALING_CONFIG.MIN_SCALE, 
        Math.min(PLANE_SCALING_CONFIG.MAX_SCALE, scaleFactor)
      );
      
      console.log(`Calculated scale factor: ${scaleFactor}`);
    } else {
      console.log('Could not determine plane dimensions, using default scale');
    }
  } catch (error) {
    console.log('Error calculating plane-based scale:', error);
  }
  
  return [scaleFactor, scaleFactor, scaleFactor];
};

/**
 * Creates a new placed object with default values
 */
export const createPlacedObject = (
  position: [number, number, number], 
  scale?: [number, number, number],
  modelType: 'GLASS' | 'FUTURE_CAR' = 'GLASS'
): PlacedObject => ({
  id: Date.now().toString(),
  position,
  type: 'model',
  modelType,
  rotation: DEFAULT_OBJECT_ROTATION,
  scale: scale || DEFAULT_OBJECT_SCALE,
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
