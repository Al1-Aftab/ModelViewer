import React from 'react';
import { ViroARPlaneSelector } from '@reactvision/react-viro';
import { PlaneSelectionEvent } from '../../types';
import { PLANE_DETECTION_CONFIG } from '../../constants';

interface PlaneDetectorProps {
  onPlaneSelected?: (source: any, location: any, hitTestResults: any) => void;
}

const PlaneDetector: React.FC<PlaneDetectorProps> = ({ onPlaneSelected }) => {
  // Handle tap on detected plane
  const handlePlaneClick = (source: any, location: any, hitTestResults: any) => {
    console.log('Plane tapped:', { source, location, hitTestResults });
    
    if (onPlaneSelected) {
      onPlaneSelected(source, location, hitTestResults);
    }
  };

  return (
    <ViroARPlaneSelector
      onPlaneSelected={handlePlaneClick}
      minHeight={PLANE_DETECTION_CONFIG.MIN_HEIGHT}
      minWidth={PLANE_DETECTION_CONFIG.MIN_WIDTH}
      alignment={PLANE_DETECTION_CONFIG.ALIGNMENT}
    />
  );
};

export default PlaneDetector;

