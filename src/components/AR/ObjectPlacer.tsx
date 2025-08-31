import React, { useRef, useCallback } from 'react';
import {
  ViroNode,
  Viro3DObject,
  ViroMaterials,
  ViroText,
} from '@reactvision/react-viro';
import { PlacedObject, ObjectUpdatePayload, GestureEvent } from '../../types';
import { UpdateThrottler, getShortId } from '../../utils';
import { 
  MODEL_CONFIG, 
  UI_CONFIG, 
  THROTTLE_INTERVALS, 
  GESTURE_THRESHOLDS,
  AR_STATUS_MESSAGES 
} from '../../constants';

interface ObjectPlacerProps {
  objects: PlacedObject[];
  onDeleteObject: (id: string) => void;
  onUpdateObject?: (id: string, updates: ObjectUpdatePayload) => void;
  scaleMode?: boolean;
  rotateMode?: boolean;
  dragMode?: boolean;
}

const ObjectPlacer: React.FC<ObjectPlacerProps> = ({
  objects,
  onDeleteObject,
  onUpdateObject,
  scaleMode = false,
  rotateMode = false,
  dragMode = false,
}) => {
  // Throttler for gesture updates
  const throttler = useRef(new UpdateThrottler());

  // Create gesture handlers for individual objects
  const createGestureHandlers = useCallback((objectId: string) => {
    const handlePinch = (pinchState: number, scaleFactor: number, source: any) => {
      if (!scaleMode || !throttler.current.shouldUpdate(objectId, THROTTLE_INTERVALS.GESTURE_UPDATE)) {
        return;
      }

      console.log('Pinch detected on object:', objectId, {
        state: pinchState,
        scaleFactor: scaleFactor
      });

      // Only handle ongoing pinch gestures (state 2)
      if (pinchState === 2) {
        const obj = objects.find(o => o.id === objectId);
        if (obj && onUpdateObject) {
          const currentScale = obj.scale[0] || 0.1;
          const newScale = currentScale * scaleFactor;
          const newScaleArray: [number, number, number] = [newScale, newScale, newScale];

          console.log(`Scaling object ${objectId}: ${JSON.stringify(obj.scale)} -> ${JSON.stringify(newScaleArray)}`);
          onUpdateObject(objectId, { scale: newScaleArray });
        }
      }
    };

    const handleRotate = (rotateState: number, rotationFactor: number, source: any) => {
      if (!rotateMode || !throttler.current.shouldUpdate(objectId, THROTTLE_INTERVALS.GESTURE_UPDATE)) {
        return;
      }

      console.log('Rotation detected on object:', objectId, {
        state: rotateState,
        rotationFactor: rotationFactor
      });

      // Only handle ongoing rotation gestures (state 2)
      if (rotateState === 2) {
        const obj = objects.find(o => o.id === objectId);
        if (obj && onUpdateObject) {
          const currentRotation = obj.rotation || [0, 0, 0];

          // Apply rotation primarily around Y-axis (vertical) for better UX
          const newRotation = [
            currentRotation[0] - rotationFactor,
            currentRotation[1] - rotationFactor, // Primary Y-axis rotation
            currentRotation[2] - rotationFactor
          ] as [number, number, number];

          // Only update if there's a meaningful change
          const hasChanged = Math.abs(newRotation[1] - currentRotation[1]) > GESTURE_THRESHOLDS.ROTATION_THRESHOLD;

          if (hasChanged) {
            console.log(`Rotating object ${objectId}: ${JSON.stringify(currentRotation)} -> ${JSON.stringify(newRotation)}`);
            onUpdateObject(objectId, { rotation: newRotation });
          }
        }
      }
    };

    const handleDrag = (newPosition: [number, number, number]) => {
      if (!dragMode || !onUpdateObject) return;
      onUpdateObject(objectId, { position: newPosition });
    };

    const handleClick = () => {
      // Simple tap to delete (only when not in any interaction mode)
      if (!scaleMode && !rotateMode && !dragMode) {
        console.log(`Deleting object: ${objectId}`);
        onDeleteObject(objectId);
      }
    };

    return {
      onPinch: scaleMode ? handlePinch : undefined,
      onRotate: rotateMode ? handleRotate : undefined,
      onDrag: dragMode ? handleDrag : undefined,
      onClick: handleClick,
    };
  }, [objects, onDeleteObject, onUpdateObject, scaleMode, rotateMode, dragMode]);

  const renderObject = useCallback((obj: PlacedObject) => {
    const gestureHandlers = createGestureHandlers(obj.id);

    return (
      <ViroNode key={obj.id} position={[0, 0, 0]} opacity={1.0}>
        <Viro3DObject
          source={MODEL_CONFIG.SOURCE}
          position={obj.position}
          scale={obj.scale}
          rotation={obj.rotation}
          type={MODEL_CONFIG.TYPE}
          onLoadStart={() => console.log(`GLTF loading started for object ${obj.id}`)}
          onLoadEnd={() => console.log(`GLTF loading completed for object ${obj.id}`)}
          onError={(error: any) => console.log(`GLTF loading error for object ${obj.id}:`, error)}
          {...gestureHandlers}
        />
        
        {/* Object label */}
        <ViroText
          text={`Glass ${getShortId(obj.id)}`}
          scale={UI_CONFIG.TEXT_SCALES.OBJECT_LABEL}
          position={[
            obj.position[0] + UI_CONFIG.POSITIONS.OBJECT_LABEL_OFFSET[0],
            obj.position[1] + UI_CONFIG.POSITIONS.OBJECT_LABEL_OFFSET[1],
            obj.position[2] + UI_CONFIG.POSITIONS.OBJECT_LABEL_OFFSET[2],
          ]}
          style={{
            fontFamily: "Arial",
            fontSize: 20,
            color: "#ffffff",
            textAlign: "center",
          }}
        />
      </ViroNode>
    );
  }, [createGestureHandlers]);

  return (
    <>
      {objects.map(renderObject)}

      {/* Show instruction text when no objects are placed */}
      {objects.length === 0 && (
        <ViroText
          text={AR_STATUS_MESSAGES.NO_OBJECTS_INSTRUCTION}
          scale={UI_CONFIG.TEXT_SCALES.INSTRUCTION}
          position={UI_CONFIG.POSITIONS.INSTRUCTION_TEXT}
          style={{
            fontFamily: "Arial",
            fontSize: 24,
            color: "#ffffff",
            textAlign: "center",
          }}
        />
      )}
    </>
  );
};

// Create materials (optional - for future use)
ViroMaterials.createMaterials({
  blue: {
    diffuseColor: "#0000ff",
  },
  red: {
    diffuseColor: "#ff0000",
  },
});

export default ObjectPlacer;