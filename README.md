# AR Model Viewer

A React Native AR application for placing and interacting with 3D models using ViroReact. Built and tested on Android devices with ARCore support.

## Features

- **Horizontal Plane Detection**: Detects horizontal surfaces for object placement
- **Multi-Model Support**: Choose between Glass and Future Car 3D models
- **Object Placement**: Tap detected planes to place selected 3D models
- **Adaptive Scaling**: Objects automatically scale based on detected plane size
- **Gesture Controls**: Scale, rotate, and drag placed objects
- **Interactive UI**: Toggle between different interaction modes and select models
- **Real-time AR**: AR tracking and rendering

## Project Structure

```
src/
├── components/           # React components
│   ├── AR/              # AR-specific components
│   │   ├── ARScene.tsx  # Main AR scene coordinator
│   │   ├── PlaneDetector.tsx # Plane detection logic
│   │   ├── ObjectPlacer.tsx  # Object placement and gestures
│   │   └── index.ts     # AR components exports
│   ├── UI/              # UI components
│   │   ├── ControlPanel.tsx  # Main control interface
│   │   └── index.ts     # UI components exports
│   └── index.ts         # All components exports
├── hooks/               # Custom React hooks
│   ├── useARModes.ts    # AR interaction modes state
│   ├── useARTracking.ts # AR tracking state management
│   ├── usePlacedObjects.ts # Object management logic
│   └── index.ts         # Hooks exports
├── types/               # TypeScript type definitions
│   └── index.ts         # All type definitions
├── constants/           # Application constants
│   └── index.ts         # Configuration and constants
├── utils/               # Utility functions
│   └── index.ts         # Helper functions
├── assets/              # 3D models and textures
│   └── glass_dirt/      # Glass model files
└── index.ts             # Main exports
```

## Architecture

### Components
- **ARScene**: Main AR scene coordinator
- **PlaneDetector**: Horizontal plane detection
- **ObjectPlacer**: 3D object rendering and gesture handling
- **ControlPanel**: UI controls for modes and model selection

### State Management
- **useARModes**: Interaction mode toggles and model selection
- **useARTracking**: AR session state management
- **usePlacedObjects**: Object collection and updates

### Configuration
- **Constants**: Centralized configuration for models, UI, gestures, and scaling
- **Types**: TypeScript interfaces for type safety
- **Utils**: Helper functions for plane events and object creation

## Installation & Setup

### Prerequisites
- React Native development environment
- ViroReact setup
- Android device with ARCore support

### Installation
```bash
npm install
```

### Running
```bash
npm run android
```

## Implementation Details

### Plane-Based Scaling
- Objects scale to 15% of the smallest detected plane dimension
- Scale limits: 3cm minimum, 40cm maximum
- Falls back to default scale if plane data unavailable

### Model Selection
- Two 3D models: Glass and Future Car (GLTF format)
- Toggle between models using the purple "Model" button
- Each placed object remembers its model type
- Objects labeled with model type and unique ID

### Controls
```
UI Layout:
Row 1: [Model: Glass/Future Car] [Detection: ON/OFF]
Row 2: [Scale: ON/OFF] [Rotate: ON/OFF]  
Row 3: [Drag: ON/OFF]
```

## Development Best Practices

### Code Organization
- Feature-based folder structure
- Consistent naming conventions
- Proper import/export patterns

### Type Safety
- Strict TypeScript configuration
- Comprehensive interface definitions
- Runtime type validation where needed

### Performance
- Gesture throttling to prevent excessive updates
- Optimized component rendering
- Memory-efficient object management

## Troubleshooting

- **AR not initializing**: Check device ARCore compatibility
- **Objects not placing**: Enable plane detection mode
- **Gesture lag**: Normal on lower-end devices
- **Poor plane detection**: Ensure good lighting and textured surfaces

## Limitations

### Platform
- **Tested only on Android** with ARCore support
- **iOS not tested** (no Mac/iPhone available for testing)

### AR Capabilities
- **Horizontal planes only** - vertical plane detection not supported
- **Single plane type** - cannot detect walls or angled surfaces
- **Lighting dependent** - poor lighting affects plane detection
- **Surface dependent** - works best on textured surfaces

### Technical
- **GLTF models only** - other 3D formats not supported
- **Performance varies** by device capabilities
- **Memory intensive** with multiple large models
- **Battery impact** from continuous AR processing
