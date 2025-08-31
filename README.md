# AR Model Viewer

A React Native AR application for placing and interacting with 3D glass models using ViroReact.

## Features

- **Plane Detection**: Automatically detect horizontal planes for object placement
- **Multi-Model Support**: Choose between Glass and Future Car 3D models
- **Object Placement**: Tap detected planes to place selected 3D models
- **Adaptive Scaling**: Objects automatically scale based on detected plane size for optimal appearance
- **Gesture Controls**: Scale, rotate, and drag placed objects
- **Interactive UI**: Toggle between different interaction modes and select models
- **Real-time AR**: Smooth AR tracking and rendering

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

## Architecture Principles

### 1. **Separation of Concerns**
- UI components are separated from business logic
- Custom hooks manage state and side effects
- Utility functions handle data transformations

### 2. **Type Safety**
- Comprehensive TypeScript interfaces for all data structures
- Strict typing for AR events and transformations
- Type-safe component props and state

### 3. **Reusability**
- Modular component design
- Custom hooks for shared logic
- Configurable constants for easy customization

### 4. **Performance**
- Throttled gesture updates to prevent jitter
- Optimized re-renders with useCallback and useMemo
- Efficient object management

## Key Components

### ARScene
Main coordinator component that:
- Manages AR tracking state
- Handles object placement logic
- Coordinates between plane detection and object interaction

### PlaneDetector
Specialized component for:
- Detecting horizontal surfaces
- Handling plane selection events
- Configurable detection parameters

### ObjectPlacer
Handles 3D object management:
- Rendering placed objects
- Gesture recognition (pinch, rotate, drag)
- Object lifecycle management

### ControlPanel
User interface component:
- Mode toggles (scale, rotate, drag, detection)
- Collapsible interface
- Visual feedback for active modes

## State Management

### Custom Hooks Architecture
- `useARModes`: Manages interaction mode toggles
- `useARTracking`: Handles AR session state and status
- `usePlacedObjects`: Manages object collection and updates

### Benefits
- Separation of state logic from UI
- Reusable state management patterns
- Easier testing and debugging

## Getting Started

### Prerequisites
- React Native development environment
- ViroReact setup for AR capabilities
- Android/iOS device with ARCore/ARKit support

### Installation
```bash
npm install
# For iOS
cd ios && pod install && cd ..
```

### Running
```bash
# Android
npm run android

# iOS
npm run ios
```

## Configuration

### Constants
All configuration values are centralized in `src/constants/`:
- Model paths and settings
- UI layout parameters
- Gesture thresholds
- Status messages
- Plane-based scaling parameters

### Plane-Based Scaling
Objects now automatically scale based on the size of detected planes:
- **Scale Factor**: Objects are sized to 15% of the smallest plane dimension
- **Min/Max Limits**: Scaling is constrained between 3cm and 40cm (assuming meter units)
- **Configurable**: All scaling parameters can be adjusted in `PLANE_SCALING_CONFIG`
- **Fallback**: If plane dimensions can't be determined, uses default scale

### Model Selection
The app now supports multiple 3D models:
- **Glass Model**: The original glass/dirt model from the assets
- **Future Car**: A new futuristic car model
- **Dynamic Switching**: Use the Model toggle button to switch between models
- **Individual Scaling**: Each model type gets appropriate scaling based on plane size
- **Visual Labels**: Placed objects show their model type in the label

### Customization
- Modify `MODEL_CONFIG` to change 3D models
- Adjust `UI_CONFIG` for interface styling
- Update `GESTURE_THRESHOLDS` for interaction sensitivity

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

### Common Issues
1. **AR not initializing**: Check device AR capabilities
2. **Objects not placing**: Verify plane detection is enabled
3. **Gesture lag**: Adjust throttle intervals in constants

### Debug Features
- Console logging for AR events
- Object placement feedback
- Tracking state indicators

## Future Enhancements

### Potential Features
- Multiple model types
- Object persistence
- Advanced lighting
- Social sharing
- Object physics

### Architecture Improvements
- Error boundary implementation
- Enhanced testing coverage
- Performance monitoring
- Analytics integration
