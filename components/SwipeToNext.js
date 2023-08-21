import { View, Text, StyleSheet } from "react-native";
import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import leftArrow from "../assets/left-arrow.png";

export default function SwipeToNext() {
  const offset = useSharedValue(-5);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(
            offset.value,
            { duration: 750 },
            (finished) => {
              if (finished) {
                offset.value *= -1;
              }
            }
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Swipe to Continue...</Text>
      <Animated.Image
        source={leftArrow}
        style={[styles.image, animatedStyles]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "white",
    fontSize: 18,
  },

  container: {
    position: "relative",
    width: "90%",
    justifyContent: "center",
    opacity: 0.5,
    padding: 20,
    borderRadius: 10,
  },

  image: {
    position: "absolute",
    height: "50%",
    width: "10%",
    paddingVertical: 10,
    left: "90%",
  },
});
