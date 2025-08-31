import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PlacedObject, ObjectUpdatePayload } from '../types';
import { extractPositionFromPlaneEvent, createPlacedObject, calculateScaleFromPlane } from '../utils';

/**
 * Custom hook for managing placed objects in AR scene
 */
export const usePlacedObjects = () => {
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);

  const addObject = useCallback((
    source: any, 
    location: any, 
    hitTestResults: any, 
    modelType: 'GLASS' | 'FUTURE_CAR' = 'GLASS'
  ) => {
    const position = extractPositionFromPlaneEvent(source, location, hitTestResults);
    
    // Calculate scale based on detected plane size
    const planeBasedScale = calculateScaleFromPlane(source);
    
    const newObject = createPlacedObject(position, planeBasedScale, modelType);
    
    console.log('Placing', modelType, 'model at position:', position, 'with scale:', planeBasedScale);
    Alert.alert(
      `${modelType === 'GLASS' ? 'Glass' : 'Future Car'} Model Placed!`, 
      `New ${modelType.toLowerCase().replace('_', ' ')} model at position: ${JSON.stringify(position)}\nScale: ${JSON.stringify(planeBasedScale)}`
    );

    setPlacedObjects(prev => [...prev, newObject]);
    return newObject;
  }, []);

  const updateObject = useCallback((id: string, updates: ObjectUpdatePayload) => {
    setPlacedObjects(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, ...updates } : obj
      )
    );
  }, []);

  const deleteObject = useCallback((id: string) => {
    console.log(`Deleting object: ${id}`);
    setPlacedObjects(prev => prev.filter(obj => obj.id !== id));
  }, []);

  const clearAllObjects = useCallback(() => {
    setPlacedObjects([]);
  }, []);

  return {
    placedObjects,
    addObject,
    updateObject,
    deleteObject,
    clearAllObjects,
  };
};
