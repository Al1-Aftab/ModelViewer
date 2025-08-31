import React from 'react';
import {
	ViroARPlaneSelector,
	ViroText
} from '@reactvision/react-viro';

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
			minHeight={0.1}
			minWidth={0.1}
			alignment="horizontal"
		>
			{/* Visual indicator for detected planes */}
			{/* <ViroText
				text="Detected Plane - Tap to place glass model!"
				scale={[0.1, 0.1, 0.1]}
				position={[0, 0.01, 0]}
				style={{
					fontFamily: "Arial",
					fontSize: 20,
					color: "#00ff00",
					textAlign: "center",
				}}
			/> */}
		</ViroARPlaneSelector>
	);
};

export default PlaneDetector;

