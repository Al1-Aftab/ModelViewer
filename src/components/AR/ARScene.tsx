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

const ARScene: React.FC<ARSceneProps> = ({ onTrackingUpdated }) => {
	const [placedObjects, setPlacedObjects] = useState<any[]>([]);
	const [statusText, setStatusText] = useState("Initializing AR...");
	const [trackingReady, setTrackingReady] = useState(false);
	// key to force remounting PlaneDetector when needed (helps re-start plane detection)
	const [planeDetectorKey, setPlaneDetectorKey] = useState<number>(0);
	// When true, the app is in "plane placement" mode: planes are detected and taps place objects.
	// When false, plane detection UI is hidden and existing objects are interactive (move/delete).
	const [planeMode, setPlaneMode] = useState<boolean>(true);

	// Handle tracking state changes
	const handleTrackingUpdate = (state: any, reason: any) => {
		console.log("AR Tracking Update:", state, reason);

		if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
			setTrackingReady(true);
			setStatusText("AR Ready! Look around to detect planes, then tap to place objects.");
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

		// Try to extract the most reliable world position from the callback args.
		// Different Viro callbacks may return the anchor as `source` (with position/center)
		// or provide a `location` or `hitTestResults` array. We accept all.
		let position: [number, number, number] = [0, -0.2, -1]; // fallback

		// 1) If the plane "source" contains a direct world position, prefer that.
		if (source && Array.isArray(source.position) && source.position.length === 3) {
			position = source.position as [number, number, number];
			// 2) Some callbacks include a `center` (anchor-local) and also a `position` — fallback to center if that's all we have.
		} else if (source && Array.isArray(source.center) && source.center.length === 3) {
			position = source.center as [number, number, number];
			// 3) The `location` arg sometimes has a `.position` field.
		} else if (location && Array.isArray(location.position) && location.position.length === 3) {
			position = location.position as [number, number, number];
			// 4) Use hit test result transform if available
		} else if (hitTestResults && hitTestResults.length > 0) {
			const hitResult = hitTestResults[0];
			if (hitResult && hitResult.transform && Array.isArray(hitResult.transform.position)) {
				position = hitResult.transform.position as [number, number, number];
			}
		}

		// Lift object slightly above the plane to avoid Z-fighting / clipping
		position = [position[0], position[1] + 0.05, position[2]];

		console.log('Placing object at position:', position);
		Alert.alert('Object Placed!', `New object at position: ${JSON.stringify(position)}`);

		setPlacedObjects(prev => {
			const newObj = {
				id: Date.now().toString(),
				position: position,
				type: prev.length % 2 === 0 ? 'cube' : 'sphere' // Alternate between cubes and spheres
			};
			console.log('Adding new object:', newObj);
			// Add object
			const next = [...prev, newObj];
			// Force a remount of the PlaneDetector to ensure AR plane detection resumes after placing an object.
			// Remounting the detector is a conservative fix for devices/engines that sometimes pause
			// plane updates once scene children change. This keeps plane detection working when
			// the user moves the camera after placing objects.
			setPlaneDetectorKey(k => k + 1);
			return next;
		});
	};

	// Delete an object by id
	const handleDeleteObject = (id: string) => {
		setPlacedObjects(prev => prev.filter(o => o.id !== id));
	};

	// Update object position when drag ends
	const handleUpdateObject = (id: string, position: [number, number, number]) => {
		setPlacedObjects(prev => prev.map(o => o.id === id ? { ...o, position } : o));
	};

	return (
		<ViroARScene
			onTrackingUpdated={handleTrackingUpdate}
		>
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
					{/* Toggle button to enable/disable plane detection mode */}
					<ViroText
						text={planeMode ? 'Plane Mode: ON (tap to place)' : 'Plane Mode: OFF (tap objects)'}
						scale={[0.12, 0.12, 0.12]}
						position={[0.9, 0.8, -1]}
						style={{ fontSize: 18, color: planeMode ? '#00ff00' : '#ffdd57', textAlign: 'right' }}
						onClick={() => {
							setPlaneMode(p => !p);
							// When toggling back into plane mode, ensure detector remounts so detection resumes.
							if (!planeMode) setPlaneDetectorKey(k => k + 1);
						}}
					/>

					{/* give the detector a changing key so we can force a remount when needed; only render when planeMode is true */}
					{planeMode && (
						<PlaneDetector key={planeDetectorKey} onPlaneSelected={onPlaneSelected} />
					)}
					<ObjectPlacer
						objects={placedObjects}
						onUpdateObject={handleUpdateObject}
						disableInteraction={planeMode}
						onDeleteObject={handleDeleteObject}
					/>
				</>
			)}
		</ViroARScene>
	);
};

export default ARScene;

