import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { PlacedObject, ObjectUpdatePayload, PlaneSelectionEvent } from '../types';
import { extractPositionFromPlaneEvent, createPlacedObject } from '../utils';

/**
 * Custom hook for managing placed objects in AR scene
 */
export const usePlacedObjects = () => {
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);

  const addObject = useCallback((source: any, location: any, hitTestResults: any) => {
    const position = extractPositionFromPlaneEvent(source, location, hitTestResults);
    const newObject = createPlacedObject(position);
    
    console.log('Placing glass model at position:', position);
    Alert.alert(
      'Glass Model Placed!', 
      `New glass model at position: ${JSON.stringify(position)}`
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
