import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import { ARScene } from './src/components';
import { ControlPanel } from './src/components/UI';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useARModes } from './src/hooks';
import { ViroAppProps } from './src/types';

const App: React.FC = () => {
  const [showTools, setShowTools] = useState<boolean>(true);
  const {
    modes,
    toggleScaleMode,
    toggleRotateMode,
    toggleDragMode,
    togglePlaneDetection,
    setPlaneDetectionMode,
    setSelectedModelType,
  } = useARModes();

  const toggleModelType = () => {
    setSelectedModelType(modes.selectedModelType === 'GLASS' ? 'FUTURE_CAR' : 'GLASS');
  };

  const viroAppProps: ViroAppProps = {
    ...modes,
    setPlaneDetectionMode,
    setSelectedModelType,
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ViroARSceneNavigator
          autofocus={true}
          initialScene={{
            scene: ARScene,
          }}
          viroAppProps={viroAppProps}
          style={styles.arView}
        />

        <ControlPanel
          modes={modes}
          onToggleScaleMode={toggleScaleMode}
          onToggleRotateMode={toggleRotateMode}
          onToggleDragMode={toggleDragMode}
          onTogglePlaneDetection={togglePlaneDetection}
          onToggleModelType={toggleModelType}
          showTools={showTools}
          onToggleShowTools={() => setShowTools(!showTools)}
        />
      </View>
    </ErrorBoundary>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  arView: { 
    flex: 1 
  },
});
