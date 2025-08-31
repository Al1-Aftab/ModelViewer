import { useState } from 'react';
import { ARModeState } from '../types';
import { DEFAULT_MODEL_TYPE } from '../constants';

/**
 * Custom hook for managing AR interaction modes
 */
export const useARModes = () => {
  const [scaleMode, setScaleMode] = useState<boolean>(false);
  const [rotateMode, setRotateMode] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [planeDetectionMode, setPlaneDetectionMode] = useState<boolean>(true);
  const [selectedModelType, setSelectedModelType] = useState<'GLASS' | 'FUTURE_CAR'>(DEFAULT_MODEL_TYPE);

  const modes: ARModeState = {
    scaleMode,
    rotateMode,
    dragMode,
    planeDetectionMode,
    selectedModelType,
  };

  const toggleScaleMode = () => setScaleMode(prev => !prev);
  const toggleRotateMode = () => setRotateMode(prev => !prev);
  const toggleDragMode = () => setDragMode(prev => !prev);
  const togglePlaneDetection = () => setPlaneDetectionMode(prev => !prev);

  const resetModes = () => {
    setScaleMode(false);
    setRotateMode(false);
    setDragMode(false);
  };

  return {
    modes,
    toggleScaleMode,
    toggleRotateMode,
    toggleDragMode,
    togglePlaneDetection,
    resetModes,
    setPlaneDetectionMode,
    setSelectedModelType,
  };
};
