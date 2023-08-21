import * as React from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
import SwipeToNext from "../../components/SwipeToNext";
import backgroundPicture from "../../assets/bg.png";
// import * as Backgroundfetch from "expo-background-fetch";
// import * as TaskManager from "expo-task-manager";

const RegisterBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(LOCATION_TASK_NAME, {
      minimumInterval: 1, // seconds,
    });

    console.log("Task registered");
  } catch (err) {
    console.log("Task Register failed:", err);
  }
};

export default function GetStarted({ navigation }) {
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  function onSwipe(gestureName) {
    const { SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT } = swipeDirections;
    switch (gestureName) {
      case SWIPE_LEFT:
        navigation.navigate("Register");
        break;
      default:
        break;
    }
  }

  return (
    <GestureRecognizer
      onSwipe={(direction, state) => onSwipe(direction, state)}
      config={config}
      style={styles.container}
    >
      <Image source={backgroundPicture} style={styles.image} />
      <Animated.View entering={FadeInDown.duration(1500)} style={styles.image}>
        <LinearGradient
          // Background Linear Gradient
          colors={["transparent", "rgba(12, 12, 12,1)"]}
          style={styles.background}
          locations={[0, 0.75]}
        />
      </Animated.View>
      <Animated.View style={styles.header} entering={FadeInUp.duration(1500)}>
        <Text style={styles.headerBold}>Welcome to Seek</Text>
        <Text style={styles.headerCaption}>It's time to get started!</Text>
        <Animated.View
          style={styles.swipeContainer}
          entering={FadeInUp.duration(1700)}
        >
          <SwipeToNext />
        </Animated.View>
      </Animated.View>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  image: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  header: {
    position: "relative",
    left: "5%",
    top: "30%",
    width: "100%",
  },
  headerBold: {
    textAlign: "left",
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  headerCaption: {
    textAlign: "left",
    color: "white",
    fontSize: 20,
    fontWeight: "normal",
  },
  swipeContainer: {
    position: "relative",
    top: "20%",
  },
});
