import React from 'react';
import {
	ViroNode,
	ViroBox,
	ViroSphere,
	ViroMaterials,
	ViroText
} from '@reactvision/react-viro';

// Create materials for our 3D objects
ViroMaterials.createMaterials({
	cubeMaterial: {
		diffuseColor: '#ff6b6b',
		shininess: 2.0,
	},
	sphereMaterial: {
		diffuseColor: '#4ecdc4',
		shininess: 2.0,
	},
	selectedMaterial: {
		diffuseColor: '#ffe66d',
		shininess: 2.0,
	},
});

type PlacedObject = {
	id: string;
	position: [number, number, number];
	type?: string;
};

type Props = {
	objects: PlacedObject[];
};


type ObjectPlacerProps = Props & {
	onUpdateObject?: (id: string, position: [number, number, number]) => void;
	// When true, object interaction (drag/delete) is disabled so plane placement can occur
	disableInteraction?: boolean;
	// Optional callback when an object should be deleted
	onDeleteObject?: (id: string) => void;
};

const ObjectPlacer: React.FC<ObjectPlacerProps> = ({ objects, onUpdateObject, disableInteraction, onDeleteObject }) => {
	const [selectedId, setSelectedId] = React.useState<string | null>(null);

	// Auto-clear selection after a short timeout to avoid leaving UI in selected state.
	React.useEffect(() => {
		if (!selectedId) return;
		const t = setTimeout(() => setSelectedId(null), 5000);
		return () => clearTimeout(t);
	}, [selectedId]);

	// Called when an object is dragged (continuous updates)
	const handleDrag = (objectId: string, newPosition: [number, number, number]) => {
		console.log(`Object ${objectId} dragged to:`, newPosition);
	};

	// Called when drag ends — commit the new position to parent state
	const handleDragState = (objectId: string, dragState: string, position?: [number, number, number]) => {
		console.log(`Object ${objectId} drag state:`, dragState, 'pos:', position);
		if (dragState === 'drag-end' && position && onUpdateObject) {
			onUpdateObject(objectId, position);
		}
	};

	// Render different types of objects
	const renderObject = (obj: PlacedObject, index: number) => {
		const isEven = index % 2 === 0;
		const objectType = obj.type || (isEven ? 'cube' : 'sphere');

		return (
			<ViroNode
				key={obj.id}
				position={obj.position}
				// Keep a stable dragType prop to avoid runtime errors in the native bridge
				// when toggling interaction on/off. We still ignore drag events when
				// `disableInteraction` is true, but we don't remove the prop at runtime.
				dragType={'FixedToWorld'}
				onDrag={(_src: any, newPos: [number, number, number]) => {
					// Ignore drag updates when interaction is disabled (plane placement mode).
					if (disableInteraction) return;
					handleDrag(obj.id, newPos);
				}}
				onDragStateChanged={(_src: any, dragState: string, newPos?: [number, number, number]) => {
					// When interactions are disabled, ignore drag state updates
					if (disableInteraction) return;
					handleDragState(obj.id, dragState, newPos);
					// Keep selection behavior consistent: when a drag starts, mark selected so user can see controls
					if (dragState === 'drag-start') {
						setSelectedId(obj.id);
					} else if (dragState === 'drag-end') {
						setSelectedId(prev => prev === obj.id ? null : prev);
					}
				}}
				onClick={(_src: any) => {
					// Toggle selection on tap, but only when interactions are enabled.
					if (disableInteraction) return;
					setSelectedId(prev => prev === obj.id ? null : obj.id);
				}}
			>
				{/* Render cube or sphere based on type */}
				{objectType === 'cube' ? (
					<ViroBox
						materials={[selectedId === obj.id ? 'selectedMaterial' : 'cubeMaterial']}
						scale={[0.1, 0.1, 0.1]}
						position={[0, 0.05, 0]} // Slightly above ground
					/>
				) : (
					<ViroSphere
						materials={[selectedId === obj.id ? 'selectedMaterial' : 'sphereMaterial']}
						radius={0.05}
						position={[0, 0.05, 0]} // Slightly above ground
					/>
				)}

				{/* If this object is selected, render a small delete control above it */}
				{selectedId === obj.id && onDeleteObject && (
					<ViroText
						text={"Delete"}
						scale={[0.06, 0.06, 0.06]}
						position={[0, 0.28, 0]}
						style={{ color: '#ffe66d', fontSize: 20, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}
						onClick={() => {
							if (onDeleteObject) onDeleteObject(obj.id);
							setSelectedId(null);
						}}
					/>
				)}

				{/* Optional: Add a label above each object */}
				<ViroText
					text={`${objectType} ${index + 1}`}
					scale={[0.05, 0.05, 0.05]}
					position={[0, 0.15, 0]}
					style={{
						fontFamily: "Arial",
						fontSize: 20,
						color: "#ffffff",
						textAlign: "center",
					}}
				/>
			</ViroNode>
		);
	};

	return (
		<>
			{objects.map((obj, index) => renderObject(obj, index))}

			{/* Show instruction text when no objects are placed */}
			{objects.length === 0 && (
				<ViroText
					text="Look around to detect planes, then tap to place objects!"
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

export default ObjectPlacer;