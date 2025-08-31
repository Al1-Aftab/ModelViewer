import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
	ViroARScene,
	ViroAmbientLight,
	ViroText,
	ViroTrackingStateConstants
} from '@reactvision/react-viro';
import PlaneDetector from './PlaneDetector';
import ObjectPlacer from './ObjectPlacer';

interface ARSceneProps {
	onTrackingUpdated?: (state: any, reason: any) => void;
}

const ARScene: React.FC<ARSceneProps> = ({ onTrackingUpdated, ...props }: any) => {
	// Get plane detection setting from App.tsx
	const appProps = (props && props.sceneNavigator && props.sceneNavigator.viroAppProps) || props.viroAppProps || {};
	const planeDetectionMode: boolean = appProps.planeDetectionMode !== false; // default true
	const scaleMode: boolean = !!appProps.scaleMode;
	const rotateMode: boolean = !!appProps.rotateMode;
	const dragMode: boolean = !!appProps.dragMode;
	const setPlaneDetectionMode = appProps.setPlaneDetectionMode; // Function to disable plane detection
	
	const [placedObjects, setPlacedObjects] = useState<any[]>([]);
	const [statusText, setStatusText] = useState("Initializing AR...");
	const [trackingReady, setTrackingReady] = useState(false);

	// Handle tracking state changes
	const handleTrackingUpdate = (state: any, reason: any) => {
		console.log("AR Tracking Update:", state, reason);

		if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
			setTrackingReady(true);
			setStatusText(planeDetectionMode ? 
				"AR Ready! Look around to detect planes, then tap to place the glass model." :
				"AR Ready! Plane detection is OFF."
			);
		} else if (state === ViroTrackingStateConstants.TRACKING_LIMITED) {
			setStatusText("Move your device slowly to detect surfaces...");
		} else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
			setStatusText("AR tracking unavailable. Check lighting and move the device.");
		}

		// Call parent callback if provided
		if (onTrackingUpdated) {
			onTrackingUpdated(state, reason);
		}
	};

	// Called when the user taps a detected plane
	const onPlaneSelected = (source: any, location: any, hitTestResults: any) => {
		if (!trackingReady) {
			console.log('AR not ready yet, ignoring tap');
			return;
		}

		console.log('Plane selected - source:', source, 'location:', location, 'hitTestResults:', hitTestResults);

		// Extract position from the plane tap
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
		position = [position[0], position[1] + 0.05, position[2]];

		console.log('Placing glass model at position:', position);
		Alert.alert('Glass Model Placed!', `New glass model at position: ${JSON.stringify(position)}`);

		// Create new glass model object
		const newObj = {
			id: Date.now().toString(),
			position: position,
			type: 'model', // Always place the glass model
			rotation: [0, 0, 0],
			scale: [0.1, 0.1, 0.1],
		};

		setPlacedObjects(prev => [...prev, newObj]);

		// Auto-disable plane detection after placing an object
		if (setPlaneDetectionMode) {
			console.log('Auto-disabling plane detection after object placement');
			setPlaneDetectionMode(false);
		}
	};

	// Delete an object by id
	const handleDeleteObject = (id: string) => {
		setPlacedObjects(prev => prev.filter(o => o.id !== id));
	};

	// Update an object by id
	const handleUpdateObject = (id: string, updates: any) => {
		setPlacedObjects(prev => prev.map(obj => 
			obj.id === id ? { ...obj, ...updates } : obj
		));
	};

	return (
		<ViroARScene onTrackingUpdated={handleTrackingUpdate}>
			<ViroAmbientLight color="#ffffff" intensity={500} />

			{/* Status text */}
			<ViroText
				text={statusText}
				scale={[0.2, 0.2, 0.2]}
				position={[0, 0.5, -1]}
				style={{
					fontFamily: "Arial",
					fontSize: 30,
					color: "#ffffff",
					textAlign: "center",
				}}
			/>

			{/* Only show plane detector and objects when tracking is ready */}
			{trackingReady && (
				<>
					{/* Show plane detector only when enabled */}
					{planeDetectionMode && (
						<PlaneDetector onPlaneSelected={onPlaneSelected} />
					)}
					
					{/* Always show placed objects */}
					<ObjectPlacer
						objects={placedObjects}
						onDeleteObject={handleDeleteObject}
						onUpdateObject={handleUpdateObject}
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

