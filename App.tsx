import {
  ViroARSceneNavigator,
} from "@reactvision/react-viro";
import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import ARScene from "./src/components/AR/ARScene";

export default () => {
  const [scaleMode, setScaleMode] = React.useState<boolean>(false);
  const [rotateMode, setRotateMode] = React.useState<boolean>(false);
  const [dragMode, setDragMode] = React.useState<boolean>(false);
  const [planeDetectionMode, setPlaneDetectionMode] = React.useState<boolean>(true);
  const [showTools, setShowTools] = React.useState<boolean>(true);

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARScene,
        }}
        viroAppProps={{ planeDetectionMode, scaleMode, rotateMode, dragMode, setPlaneDetectionMode }}
        style={styles.arView}
      />

      {/* Overlay controls - positioned above AR view */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Toggle button for showing/hiding tools */}
        <TouchableOpacity
          style={[styles.toggleButton, showTools && styles.toggleButtonActive]}
          onPress={() => setShowTools(!showTools)}
        >
          <Text style={styles.toggleButtonText}>
            {showTools ? '▼ Hide Tools' : '▲ Show Tools'}
          </Text>
        </TouchableOpacity>

        {/* Tools panel - only show when toggled on */}
        {showTools && (
          <View style={styles.toolsPanel}>
            {/* First row - Detection and main tools */}
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.button, planeDetectionMode && styles.buttonActive]}
                onPress={() => setPlaneDetectionMode(enabled => !enabled)}
              >
                <Text style={styles.buttonText}>
                  {planeDetectionMode ? 'Detection: ON' : 'Detection: OFF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, scaleMode && styles.buttonActive]}
                onPress={() => setScaleMode(enabled => !enabled)}
              >
                <Text style={styles.buttonText}>
                  {scaleMode ? 'Scale: ON' : 'Scale: OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Second row - Rotate and Drag */}
            <View style={styles.row}>
              <TouchableOpacity 
                style={[styles.button, rotateMode && styles.buttonActive]}
                onPress={() => setRotateMode(enabled => !enabled)}
              >
                <Text style={styles.buttonText}>
                  {rotateMode ? 'Rotate: ON' : 'Rotate: OFF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, dragMode && styles.buttonActive]}
                onPress={() => setDragMode(enabled => !enabled)}
              >
                <Text style={styles.buttonText}>
                  {dragMode ? 'Drag: ON' : 'Drag: OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

var styles = StyleSheet.create({
  container: { flex: 1 },
  arView: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    marginBottom: 10,
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(0,150,200,0.8)'
  },
  toggleButtonText: { 
    color: '#fff', 
    fontSize: 14,
    fontWeight: 'bold'
  },
  toolsPanel: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  row: { 
    flexDirection: 'row', 
    backgroundColor: 'transparent',
    gap: 10,
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    minWidth: 80,
  },
  buttonActive: {
    backgroundColor: 'rgba(0,150,200,0.9)'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 11,
    textAlign: 'center',
  },
});
