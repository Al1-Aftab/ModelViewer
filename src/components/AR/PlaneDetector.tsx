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
    console.log('Plane tapped - Full source object:', source);
    console.log('Plane tapped - Location:', location);
    console.log('Plane tapped - Hit test results:', hitTestResults);
    
    // Log specific plane properties if available
    if (source) {
      console.log('Plane dimensions - width:', source.width, 'height:', source.height);
      console.log('Plane center:', source.center);
      console.log('Plane anchor:', source.anchor);
      console.log('Plane extent:', source.extent);
    }
    
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

