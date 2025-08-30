import React, { useState, useRef } from 'react';
import {
	ViroARPlane,
	ViroARPlaneSelector,
	ViroMaterials,
	ViroText
} from '@reactvision/react-viro';

// Create a semi-transparent material for detected planes
ViroMaterials.createMaterials({
	planeMaterial: {
		diffuseColor: '#0080ff',
		transparency: 0.3,
	},
});

interface PlaneDetectorProps {
	onPlaneSelected?: (source: any, location: any, hitTestResults: any) => void;
}

const PlaneDetector: React.FC<PlaneDetectorProps> = ({ onPlaneSelected }) => {
	const [detectedPlanes, setDetectedPlanes] = useState<any[]>([]);

	// Configuration / thresholds (meters / degrees)
	const MIN_PLANE_WIDTH = 0.12; // meters
	const MIN_PLANE_HEIGHT = 0.12; // meters
	const MIN_PLANE_AREA = 0.03; // m^2 (fallback) — raised to avoid tiny noisy planes
	const HORIZONTAL_ANGLE_TOLERANCE = 15; // degrees
	const HORIZONTAL_DOT_THRESHOLD = Math.cos((HORIZONTAL_ANGLE_TOLERANCE * Math.PI) / 180); // ~0.966
	const OVERLAP_AREA_FRACTION = 0.3; // overlap fraction to treat as same plane

	// keep a ref to avoid stale closures in handlers
	const planesRef = useRef(detectedPlanes);
	planesRef.current = detectedPlanes;

	// Helper: try to extract center/position from different anchor shapes
	const getPlaneCenter = (anchor: any) => {
		// common fields: anchor.center {x,y,z}, anchor.position [x,y,z], anchor.position.x etc.
		if (!anchor) return [0, 0, 0];
		if (anchor.center && typeof anchor.center.x === 'number') {
			return [anchor.center.x, anchor.center.y, anchor.center.z];
		}
		if (Array.isArray(anchor.position) && anchor.position.length >= 3) {
			return anchor.position;
		}
		if (anchor.position && typeof anchor.position.x === 'number') {
			return [anchor.position.x, anchor.position.y, anchor.position.z];
		}
		// fallback: use anchor.transform if present (4x4 matrix row-major)
		if (anchor.transform && Array.isArray(anchor.transform) && anchor.transform.length >= 12) {
			// transform is usually a 4x4 matrix; translation components are indices 12..14 in some SDKs
			const t = anchor.transform;
			return [t[12] || 0, t[13] || 0, t[14] || 0];
		}
		return [0, 0, 0];
	};

	// Helper: estimate plane area from anchor data
	const getPlaneArea = (anchor: any) => {
		// Common plane extent fields: extent {x,z}, width/height or extentX/extentZ
		const ext = anchor.extent || anchor.planeExtent || {};
		const maybeWidth = ext.x || ext.width || anchor.width || anchor.extentX;
		const maybeDepth = ext.z || ext.depth || anchor.depth || anchor.extentZ;
		if (typeof maybeWidth === 'number' && typeof maybeDepth === 'number') {
			return Math.abs(maybeWidth * maybeDepth);
		}
		// fallback to provided min dimensions
		return Math.max(MIN_PLANE_WIDTH * MIN_PLANE_HEIGHT, MIN_PLANE_AREA);
	};

	// Try to read extents (width/depth) for bounding-box overlap testing
	const getPlaneExtents = (anchor: any) => {
		const ext = anchor.extent || anchor.planeExtent || {};
		const width = Number(ext.x || ext.width || anchor.width || anchor.extentX || 0) || 0;
		const depth = Number(ext.z || ext.depth || anchor.depth || anchor.extentZ || 0) || 0;
		// if not provided, fallback to square root of area
		if (!width || !depth) {
			const area = getPlaneArea(anchor);
			const guess = Math.sqrt(area || MIN_PLANE_AREA);
			return { width: guess, depth: guess };
		}
		return { width: Math.abs(width), depth: Math.abs(depth) };
	};

	// Helper: check rotation to ensure plane is near-horizontal
	// Compute a plane normal (approx) from transform or rotation if available
	const computePlaneNormal = (anchor: any) => {
		// If transform (16 floats) exists assume 4x4 matrix in column-major or row-major; try treating as column-major
		const t = anchor.transform;
		if (Array.isArray(t) && t.length >= 16) {
			// treat as column-major 4x4: columns are basis vectors
			// column 1: t[0],t[1],t[2]; column 2: t[4],t[5],t[6]; column 3: t[8],t[9],t[10]
			// Many AR SDKs store right, up, forward as columns; the up vector is column 2
			const up = [t[4] || 0, t[5] || 0, t[6] || 0];
			return up;
		}
		// fallback to rotation/euler if present (degrees)
		const rot = anchor.rotation || anchor.eulerAngles || null;
		if (Array.isArray(rot) && rot.length >= 3) {
			// rot assumed [pitch, yaw, roll] or [x,y,z]; convert small-angle approximation
			// We'll compute the up vector from pitch/roll (in degrees) ignoring yaw
			const pitch = (rot[0] || 0) * (Math.PI / 180);
			const roll = (rot[2] || 0) * (Math.PI / 180);
			// up vector after applying pitch then roll
			const ux = Math.sin(roll);
			const uy = Math.cos(roll) * Math.cos(pitch);
			const uz = Math.sin(pitch);
			return [ux, uy, uz];
		}
		return null;
	};

	const isNearHorizontal = (anchor: any) => {
		const normal = computePlaneNormal(anchor);
		if (normal && normal.length >= 3) {
			// dot with world up [0,1,0] is simply normal[1] / |normal|
			const len = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]) || 1;
			const dot = (normal[1] || 0) / len;
			// Accept if plane up is near world up or near -world up (both sides of horizontal)
			return Math.abs(dot) >= HORIZONTAL_DOT_THRESHOLD;
		}
		// no normal info - be conservative and allow, classification will gate
		return true;
	};

	// Helper: try plane classification if available (ARKit iOS 13+ provides classifications)
	const isAllowedClassification = (anchor: any) => {
		const cls = anchor.classification || anchor.planeClassification || anchor.type || null;
		if (!cls) return null; // unknown
		// normalise to lowercase string
		const c = String(cls).toLowerCase();
		// allowed plane types where users usually place objects
		const allowed = ['floor', 'table', 'seat', 'chair', 'sofa', 'couch', 'bed'];
		for (const a of allowed) if (c.includes(a)) return true;
		// explicitly reject vertical things like wall, ceiling
		if (c.includes('wall') || c.includes('ceiling')) return false;
		return null; // unknown
	};

	const distanceXZ = (a: number[], b: number[]) => {
		const dx = (a[0] || 0) - (b[0] || 0);
		const dz = (a[2] || 0) - (b[2] || 0);
		return Math.sqrt(dx * dx + dz * dz);
	};

	// Determine whether new plane overlaps with an existing one using axis-aligned bounding boxes in XZ
	const findOverlappingIndex = (center: number[], area: number, anchor: any) => {
		const newExt = getPlaneExtents(anchor);
		const newBox = {
			minX: center[0] - newExt.width / 2,
			maxX: center[0] + newExt.width / 2,
			minZ: center[2] - newExt.depth / 2,
			maxZ: center[2] + newExt.depth / 2,
			area: Math.max(area, newExt.width * newExt.depth, MIN_PLANE_AREA),
		};

		for (let i = 0; i < planesRef.current.length; i++) {
			const p = planesRef.current[i];
			const existingCenter = p.center || getPlaneCenter(p.anchor) || [0, 0, 0];
			const ext = getPlaneExtents(p.anchor);
			const existingBox = {
				minX: existingCenter[0] - ext.width / 2,
				maxX: existingCenter[0] + ext.width / 2,
				minZ: existingCenter[2] - ext.depth / 2,
				maxZ: existingCenter[2] + ext.depth / 2,
				area: Math.max(p.area || getPlaneArea(p.anchor), ext.width * ext.depth, MIN_PLANE_AREA),
			};

			// compute overlap in X and Z
			const overlapX = Math.max(0, Math.min(newBox.maxX, existingBox.maxX) - Math.max(newBox.minX, existingBox.minX));
			const overlapZ = Math.max(0, Math.min(newBox.maxZ, existingBox.maxZ) - Math.max(newBox.minZ, existingBox.minZ));
			const overlapArea = overlapX * overlapZ;
			const smallerArea = Math.min(newBox.area, existingBox.area) || 1;
			const overlapFraction = overlapArea / smallerArea;

			// Compare normals to avoid merging planes that are at different tilts (table vs leaning surface)
			const n1 = computePlaneNormal(anchor) || [0, 1, 0];
			const n2 = computePlaneNormal(p.anchor) || [0, 1, 0];
			const len1 = Math.sqrt(n1[0] * n1[0] + n1[1] * n1[1] + n1[2] * n1[2]) || 1;
			const len2 = Math.sqrt(n2[0] * n2[0] + n2[1] * n2[1] + n2[2] * n2[2]) || 1;
			const dot = (n1[0] * n2[0] + n1[1] * n2[1] + n1[2] * n2[2]) / (len1 * len2);

			// treat as overlapping only if overlap fraction is large enough and normals are similar
			if (overlapFraction >= OVERLAP_AREA_FRACTION && Math.abs(dot) >= HORIZONTAL_DOT_THRESHOLD) {
				return i;
			}
		}
		return -1;
	};

	// Called when a plane is first detected
	const onPlaneFound = (anchor: any) => {
		console.log('Raw plane anchor:', anchor);

		// Quick alignment guard: if anchor explicitly gives alignment, require horizontal
		if (anchor.alignment && String(anchor.alignment).toLowerCase() !== 'horizontal') {
			console.log('Ignoring non-horizontal alignment:', anchor.alignment);
			return;
		}

		// If classification exists, use it to accept/reject
		const clsDecision = isAllowedClassification(anchor);
		if (clsDecision === false) {
			console.log('Anchor rejected by classification:', anchor.classification || anchor.planeClassification);
			return;
		}

		// rotation check (if available)
		if (!isNearHorizontal(anchor)) {
			console.log('Anchor rejected due to angle:', anchor.rotation || anchor.eulerAngles);
			return;
		}

		// Compute center and area
		const center = getPlaneCenter(anchor);
		const area = getPlaneArea(anchor);
		const ext = getPlaneExtents(anchor);

		// Reject overly small planes
		if (area < MIN_PLANE_AREA) {
			console.log('Ignoring tiny plane (area):', area);
			return;
		}

		// If classification explicitly says allowed -> accept regardless of rotation fallback
		if (clsDecision === true) {
			// allowed, continue
		}

		// Check overlap with existing detected planes
		const overlappingIndex = findOverlappingIndex(center, area, anchor);
		if (overlappingIndex >= 0) {
			const existing = detectedPlanes[overlappingIndex];
			const existingArea = existing.area || getPlaneArea(existing.anchor);
			// If new plane is substantially larger, replace the old one. Otherwise ignore.
			if (area > existingArea * 1.5) {
				console.log('Replacing overlapping plane with larger one');
				setDetectedPlanes(prev => prev.map((p, idx) => idx === overlappingIndex ? {
					id: anchor.anchorId || Date.now().toString(),
					anchor,
					center,
					area,
					position: center,
					rotation: anchor.rotation || [0, 0, 0],
				} : p));
			} else {
				console.log('Ignoring overlapping smaller plane');
			}
			return;
		}

		// Add the plane to our state for visual feedback
		setDetectedPlanes(prev => [...prev, {
			id: anchor.anchorId || Date.now().toString(),
			anchor: anchor,
			center,
			area,
			ext: ext,
			position: center,
			rotation: anchor.rotation || [0, 0, 0],
		}]);
	};

	// Update handler for anchors that change size/position
	const onPlaneUpdated = (anchor: any) => {
		const id = anchor.anchorId || anchor.identifier || null;
		if (!id) return;
		setDetectedPlanes(prev => prev.map(p => {
			if (p.id === id || p.anchor && (p.anchor.anchorId === id || p.anchor.identifier === id)) {
				const center = getPlaneCenter(anchor);
				return {
					...p,
					anchor,
					center,
					area: getPlaneArea(anchor),
					ext: getPlaneExtents(anchor),
					position: center,
				};
			}
			return p;
		}));
	};

	const onPlaneRemoved = (anchor: any) => {
		const id = anchor.anchorId || anchor.identifier || null;
		if (!id) return;
		setDetectedPlanes(prev => prev.filter(p => !(p.id === id || (p.anchor && (p.anchor.anchorId === id || p.anchor.identifier === id)))));
	};

	// Handle tap on detected plane
	const handlePlaneClick = (source: any, location: any, hitTestResults: any) => {
		console.log('Plane tapped:', { source, location, hitTestResults });
		// Normalize the args we forward so parent can reliably extract a world position.
		const forwardedSource = source || (location && location.anchor) || null;
		const forwardedLocation = location || null;
		const forwardedHits = Array.isArray(hitTestResults) ? hitTestResults : [];
		if (onPlaneSelected) {
			onPlaneSelected(forwardedSource, forwardedLocation, forwardedHits);
		}
	};

	return (
		<>
			{/* This detects horizontal planes and allows tap-to-place */}
			<ViroARPlaneSelector
				onPlaneSelected={handlePlaneClick}
				minHeight={0.1}
				minWidth={0.1}
				alignment="Horizontal"
			>
				{/* Visual indicator for detected planes */}
				<ViroText
					text="Detected Plane - Tap to place objects!"
					scale={[0.1, 0.1, 0.1]}
					position={[0, 0.01, 0]}
					style={{
						fontFamily: "Arial",
						fontSize: 20,
						color: "#00ff00",
						textAlign: "center",
					}}
				/>
			</ViroARPlaneSelector>

			{/* This detects horizontal planes for visualization */}
			{/* Keep a live ARPlane to receive anchors, then render visual markers for each anchor we know about. */}
			<ViroARPlane
				minHeight={0.1}
				minWidth={0.1}
				alignment="Horizontal"
				onAnchorFound={onPlaneFound}
				pauseUpdates={false}
			/>

			{/* Render semi-transparent plane indicators for debugging and UX. */}
			{detectedPlanes.map(p => (
				/* Each plane is rendered at the anchor's reported position and rotation. */
				<ViroText
					key={`plane-${p.id}`}
					text="Plane"
					scale={[0.1, 0.1, 0.1]}
					position={p.position}
					rotation={p.rotation}
					style={{ color: '#00ff00', fontSize: 20 }}
				/>
			))}
		</>
	);
};

export default PlaneDetector;

