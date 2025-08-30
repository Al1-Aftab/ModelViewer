import {
  ViroARSceneNavigator,
} from "@reactvision/react-viro";
import React from "react";
import { StyleSheet, View } from "react-native";
import ARScene from "./src/components/AR/ARScene";

export default () => {
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARScene,
        }}
        style={styles.arView}
      />
    </View>
  );
};

var styles = StyleSheet.create({
  container: { flex: 1 },
  arView: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
