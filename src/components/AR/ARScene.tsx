import React from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroText,
} from '@reactvision/react-viro';
import { PlaneDetector, ObjectPlacer } from './';
import { useARTracking, usePlacedObjects } from '../../hooks';
import { ViroAppProps } from '../../types';
import { MODEL_CONFIG, UI_CONFIG } from '../../constants';

interface ARSceneProps {
  onTrackingUpdated?: (state: any, reason: any) => void;
  viroAppProps?: ViroAppProps;
  sceneNavigator?: {
    viroAppProps: ViroAppProps;
  };
}

const ARScene: React.FC<ARSceneProps> = ({ onTrackingUpdated, ...props }) => {
  // Extract app props with proper fallbacks
  const appProps = (props && props.sceneNavigator && props.sceneNavigator.viroAppProps) || 
                   props.viroAppProps || 
                   {} as ViroAppProps;
  
  const {
    planeDetectionMode = false,
    scaleMode = false,
    rotateMode = false,
    dragMode = false,
    selectedModelType = 'GLASS',
    setPlaneDetectionMode,
  } = appProps;

  // Custom hooks for state management
  const { trackingState, handleTrackingUpdate } = useARTracking(planeDetectionMode);
  const { placedObjects, addObject, updateObject, deleteObject } = usePlacedObjects();

  // Handle tracking state changes with parent callback
  const onTrackingUpdate = (state: any, reason: any) => {
    handleTrackingUpdate(state, reason);
    
    if (onTrackingUpdated) {
      onTrackingUpdated(state, reason);
    }
  };

  // Handle plane selection and object placement
  const handlePlaneSelected = (source: any, location: any, hitTestResults: any) => {
    if (!trackingState.isReady) {
      console.log('AR not ready yet, ignoring tap');
      return;
    }

    console.log('Plane selected - source:', source, 'location:', location, 'hitTestResults:', hitTestResults);

    addObject(source, location, hitTestResults, selectedModelType);

    // Auto-disable plane detection after placing an object
    if (setPlaneDetectionMode) {
      console.log('Auto-disabling plane detection after object placement');
      setPlaneDetectionMode(false);
    }
  };

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdate}>
      <ViroAmbientLight color="#ffffff" intensity={MODEL_CONFIG.AMBIENT_LIGHT_INTENSITY} />

      {/* Status text */}
      <ViroText
        text={trackingState.statusText}
        scale={UI_CONFIG.TEXT_SCALES.STATUS}
        position={UI_CONFIG.POSITIONS.STATUS_TEXT}
        style={{
          fontFamily: "Arial",
          fontSize: 30,
          color: "#ffffff",
          textAlign: "center",
        }}
      />

      {/* Only show plane detector and objects when tracking is ready */}
      {trackingState.isReady && (
        <>
          {/* Show plane detector only when enabled */}
          {planeDetectionMode && (
            <PlaneDetector onPlaneSelected={handlePlaneSelected} />
          )}
          
          {/* Always show placed objects */}
          <ObjectPlacer
            objects={placedObjects}
            onDeleteObject={deleteObject}
            onUpdateObject={updateObject}
            scaleMode={scaleMode}
            rotateMode={rotateMode}
            dragMode={dragMode}
          />
        </>
      )}
    </ViroARScene>
  );
};

export default ARScene;

