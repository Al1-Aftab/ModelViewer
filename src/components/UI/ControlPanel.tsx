import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ARModeState } from '../../types';

interface ControlPanelProps {
  modes: ARModeState;
  onToggleScaleMode: () => void;
  onToggleRotateMode: () => void;
  onToggleDragMode: () => void;
  onTogglePlaneDetection: () => void;
  showTools: boolean;
  onToggleShowTools: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  modes,
  onToggleScaleMode,
  onToggleRotateMode,
  onToggleDragMode,
  onTogglePlaneDetection,
  showTools,
  onToggleShowTools,
}) => {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      {/* Toggle button for showing/hiding tools */}
      <TouchableOpacity
        style={[styles.toggleButton, showTools && styles.toggleButtonActive]}
        onPress={onToggleShowTools}
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
              style={[styles.button, modes.planeDetectionMode && styles.buttonActive]}
              onPress={onTogglePlaneDetection}
            >
              <Text style={styles.buttonText}>
                {modes.planeDetectionMode ? 'Detection: ON' : 'Detection: OFF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, modes.scaleMode && styles.buttonActive]}
              onPress={onToggleScaleMode}
            >
              <Text style={styles.buttonText}>
                {modes.scaleMode ? 'Scale: ON' : 'Scale: OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Second row - Rotate and Drag */}
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.button, modes.rotateMode && styles.buttonActive]}
              onPress={onToggleRotateMode}
            >
              <Text style={styles.buttonText}>
                {modes.rotateMode ? 'Rotate: ON' : 'Rotate: OFF'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, modes.dragMode && styles.buttonActive]}
              onPress={onToggleDragMode}
            >
              <Text style={styles.buttonText}>
                {modes.dragMode ? 'Drag: ON' : 'Drag: OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ControlPanel;
