import React from 'react';
import {
	ViroNode,
	Viro3DObject,
	ViroMaterials,
	ViroText,
} from '@reactvision/react-viro';

interface PlacedObject {
	id: string;
	position: [number, number, number];
	rotation: [number, number, number];
	scale: [number, number, number];
	type: 'cube' | 'sphere' | 'model';
}

interface ObjectPlacerProps {
	objects: PlacedObject[];
	onDeleteObject: (id: string) => void;
	onUpdateObject?: (id: string, updates: Partial<PlacedObject>) => void;
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

	// Track last update times to prevent too frequent updates (anti-jitter)
	const lastUpdateTimes = React.useRef<{ [key: string]: number }>({});

	// Throttle function to prevent excessive updates
	const shouldUpdate = (objectId: string, minInterval: number = 50): boolean => {
		const now = Date.now();
		const lastUpdate = lastUpdateTimes.current[objectId] || 0;
		if (now - lastUpdate >= minInterval) {
			lastUpdateTimes.current[objectId] = now;
			return true;
		}
		return false;
	};

	// Create individual gesture handlers for each object to avoid conflicts
	const createPinchHandler = (objectId: string) => {
		return (pinchState: any, scaleFactor: number, source: any) => {
			if (!scaleMode || !shouldUpdate(objectId, 100)) return; // Throttle to max 10 updates/sec

			console.log('Pinch detected on object:', objectId, {
				state: pinchState,
				scaleFactor: scaleFactor
			});

			// Only handle ongoing pinch gestures (state 2)
			if (pinchState === 2) {
				const obj = objects.find(o => o.id === objectId);
				if (obj && onUpdateObject) {
					let currentScale = obj.scale[0] || 0.1;
					let currentScaleArray = obj.scale || [0.1, 0.1, 0.1];

					// More stable scaling calculation

					let newScale = currentScale * scaleFactor;

					// Only update if there's a meaningful change
					let newScaleArray: [number, number, number] = [newScale, newScale, newScale];
					const hasChanged = true;

					if (hasChanged) {
						console.log(`Scaling object ${objectId}: ${JSON.stringify(currentScaleArray)} -> ${JSON.stringify(newScaleArray)}`);
						onUpdateObject(objectId, { scale: newScaleArray });
					}
				}
			}
		};
	};

	const createRotateHandler = (objectId: string) => {
		return (rotateState: any, rotationFactor: number, source: any) => {
			if (!rotateMode || !shouldUpdate(objectId, 100)) return; // Throttle to max 10 updates/sec

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
					const threshold = 0.01;
					const hasChanged = Math.abs(newRotation[1] - currentRotation[1]) > threshold;

					if (hasChanged) {
						console.log(`Rotating object ${objectId}: ${JSON.stringify(currentRotation)} -> ${JSON.stringify(newRotation)}`);
						onUpdateObject(objectId, { rotation: newRotation });
					}
				}
			}
		};
	};

	const createDragHandler = (objectId: string) => {
		return (newPosition: [number, number, number]) => {
			if (!dragMode || !onUpdateObject) return;
			onUpdateObject(objectId, { position: newPosition });
		};
	};

	const renderObject = (obj: PlacedObject) => {
		// Create unique handlers for this specific object
		const pinchHandler = createPinchHandler(obj.id);
		const rotateHandler = createRotateHandler(obj.id);
		const dragHandler = createDragHandler(obj.id);

		return (
			<Viro3DObject
				source={require('../../assets/glass_dirt/scene.gltf')}
				position={obj.position}
				scale={obj.scale}
				rotation={obj.rotation}
				type="GLTF"
				onLoadStart={() => console.log(`GLTF loading started for object ${obj.id}`)}
				onLoadEnd={() => console.log(`GLTF loading completed for object ${obj.id}`)}
				onError={(error: any) => console.log(`GLTF loading error for object ${obj.id}:`, error)}
				// Simple tap to delete (only when not in any interaction mode)
				onClick={!scaleMode && !rotateMode && !dragMode ? () => {
					console.log(`Deleting object: ${obj.id}`);
					onDeleteObject(obj.id);
				} : undefined}
				// Gesture handlers - each object gets its own isolated handlers
				onPinch={scaleMode ? pinchHandler : undefined}
				onRotate={rotateMode ? rotateHandler : undefined}
				onDrag={dragMode ? dragHandler : undefined}
			/>
		);
	};

	return (
		<>
			{objects.map((obj) => (
				<ViroNode
					key={obj.id}
					position={[0, 0, 0]}
					// Isolate each object to prevent gesture interference
					opacity={1.0}
				>
					{renderObject(obj)}
					{/* Optional: Add a label above each object */}
					<ViroText
						text={`Glass ${obj.id.slice(-4)}`} // Show last 4 chars of ID
						scale={[0.05, 0.05, 0.05]}
						position={[obj.position[0], obj.position[1] + 0.15, obj.position[2]]}
						style={{
							fontFamily: "Arial",
							fontSize: 20,
							color: "#ffffff",
							textAlign: "center",
						}}
					/>
				</ViroNode>
			))}

			{/* Show instruction text when no objects are placed */}
			{objects.length === 0 && (
				<ViroText
					text="Look around to detect planes, then tap to place glass models!"
					scale={[0.15, 0.15, 0.15]}
					position={[0, -0.3, -1]}
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

// Create materials (though not used in this simplified version)
ViroMaterials.createMaterials({
	blue: {
		diffuseColor: "#0000ff",
	},
	red: {
		diffuseColor: "#ff0000",
	},
});

export default ObjectPlacer;