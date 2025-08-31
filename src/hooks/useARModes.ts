import { useState } from 'react';
import { ARModeState } from '../types';

/**
 * Custom hook for managing AR interaction modes
 */
export const useARModes = () => {
  const [scaleMode, setScaleMode] = useState<boolean>(false);
  const [rotateMode, setRotateMode] = useState<boolean>(false);
  const [dragMode, setDragMode] = useState<boolean>(false);
  const [planeDetectionMode, setPlaneDetectionMode] = useState<boolean>(true);

  const modes: ARModeState = {
    scaleMode,
    rotateMode,
    dragMode,
    planeDetectionMode,
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
  };
};
