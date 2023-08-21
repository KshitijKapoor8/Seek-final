import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Entypo, MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function InteractionTabBar({
  state,
  descriptors,
  navigation,
  currentPage,
  pagerRef,
}) {
  const offset = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(offset.value, {
            duration: 350,
            easing: Easing.bezier(0.42, 0, 0.58, 1),
          }),
        },
      ],
    };
  });

  useEffect(() => {
    offset.value = ((currentPage * 1) / 3) * width;
  }, [currentPage]);

  return (
    <View style={styles.container}>
      <View style={styles.dotContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = currentPage === index;

          function renderIcon() {
            if (label == "Compass") {
              return (
                <Entypo
                  name="compass"
                  size={30}
                  color={isFocused ? "#5067B1" : "white"}
                />
              );
            } else if (label == "Chat") {
              return (
                <Entypo
                  name="chat"
                  size={30}
                  color={isFocused ? "#5067B1" : "white"}
                />
              );
            } else if (label == "Timer") {
              return (
                <MaterialIcons
                  name="timer"
                  size={30}
                  color={isFocused ? "#5067B1" : "white"}
                />
              );
            } else {
              return (
                <View
                  style={[
                    styles.tabDots,
                    { backgroundColor: isFocused ? "#5067B1" : "white" },
                  ]}
                />
              );
            }
          }

          const onPress = () => {
            offset.value = ((index * 1) / 3) * width;
            if (!isFocused) {
              pagerRef.current.setPage(index);
            }
          };

          return (
            <TouchableOpacity
              onPress={onPress}
              style={styles.pressableContainer}
            >
              {renderIcon()}
              {/* <Text style={[{color: isFocused ? "#5067B1" : "white"}, styles.labelText]}>
                {label}
              </Text> */}
            </TouchableOpacity>
          );
        })}
        {/* <Animated.View style={[animatedStyle, styles.animated]}/> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-evenly",
    flexDirection: "row",
    paddingTop: "2%",
    paddingBottom: "7.5%",
    backgroundColor: "#121212",
  },
  pressableContainer: {},
  labelText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "75%",
    borderRadius: 100,
    paddingVertical: "2%",
    backgroundColor: "#1c1c1c",
  },
  tabDots: {
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  animated: {
    position: "absolute",
    width: (1 / 3) * width,
    height: "100%",
    backgroundColor: "#7E78C6",
    borderRadius: 20,
    opacity: 0.5,
    left: 0,
  },
});
