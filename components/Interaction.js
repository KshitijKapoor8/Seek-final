import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { Avatar, Modal } from "native-base";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { format } from "timeago.js";

export default function Interaction({ interactionData, navigation, userID }) {
  const [interaction, userOneInfo, userTwoInfo] = interactionData;
  const { link, link2, created_at } = interaction;
  const date = format(new Date(parseInt(created_at)));
  const [userHeaderWidth, setUserHeaderWidth] = useState(0);
  const offset = useSharedValue(0);
  const spin = useSharedValue(0);

  function onPress() {
    // let newLink = pictureLink === link2 ? link : link2;
    // setPictureLink(newLink);
    offset.value = offset.value > 0 ? 0 : userHeaderWidth / 2;
    spin.value = spin.value ? 0 : 1;
  }

  const headerAnimatedStyle = useAnimatedStyle(() => {
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

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [0, 180]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spinVal = interpolate(spin.value, [0, 1], [180, 360]);
    return {
      transform: [
        {
          rotateY: withTiming(`${spinVal}deg`, { duration: 500 }),
        },
      ],
    };
  }, []);

  function FriendProfileOnPressHandler(userID) {
    navigation.navigate("Memories", { userID: userID });
  }

  function UserHeader() {
    return (
      <View style={styles.postHeader}>
        <LinearGradient
          style={styles.userHeader}
          colors={["#7E78C6", "#5067B1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View
            onPress={onPress}
            style={styles.switch}
            onLayout={(event) => {
              const { width } = event.nativeEvent.layout;
              setUserHeaderWidth(width);
            }}
          >
            <Animated.View style={[styles.switchButton, headerAnimatedStyle]} />
            <TouchableOpacity
              style={styles.user_one}
              onPress={() => FriendProfileOnPressHandler(userOneInfo.id)}
            >
              <Avatar size={10} source={{ uri: userOneInfo.pfp }} />
              <View style={styles.userOneTxtWrapper}>
                <Text style={styles.userName}>{userOneInfo.name}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.user_two}
              onPress={() => FriendProfileOnPressHandler(userTwoInfo.id)}
            >
              <View style={styles.userTwoTxtWrapper}>
                <Text style={styles.userName}>{userTwoInfo.name}</Text>
              </View>
              <Avatar size={10} source={{ uri: userTwoInfo.pfp }} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View>
      <Pressable style={styles.container} onPress={onPress}>
        <UserHeader />
        <LinearGradient
          colors={["#7E78C6", "#5067B1"]}
          style={styles.gradientBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.innerContent}>
            <Animated.View style={[styles.postImage, frontAnimatedStyle]}>
              <ImageBackground
                source={{ uri: link }}
                style={styles.postImage}
              ></ImageBackground>
            </Animated.View>
            <Animated.View style={[styles.postImage2, backAnimatedStyle]}>
              <ImageBackground
                source={{ uri: link2 }}
                style={styles.postImage}
              ></ImageBackground>
            </Animated.View>
          </View>
        </LinearGradient>
        <View style={styles.interactionFooter}>
          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    width: "95%",
    height: "100%",
    marginVertical: "4%",
    alignSelf: "center",
  },
  postHeader: {
    flex: 1,
    width: "100%",
    position: "relative",
    flexDirection: "row",
    paddingBottom: "2%",
  },
  userHeader: {
    flex: 1,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  switch: {
    flex: 1,
    flexDirection: "row",
  },
  switchButton: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#121212",
    borderRadius: 20,
    opacity: 0.3,
  },
  gradientBorder: {
    padding: ".5%",
    borderRadius: 20,
    flexDirection: "row",
  },
  user_one: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  user_two: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  gradientBackground: {
    flex: 1,
    borderRadius: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  userOneTxtWrapper: {
    marginLeft: "3%",
  },
  userTwoTxtWrapper: {
    marginRight: "3%",
  },
  avatar: {
    height: "100%",
  },
  innerContent: {
    flex: 1,
    position: "relative",
    aspectRatio: 3 / 4,
    borderRadius: 20,
    alignItems: "center",
    overflow: "hidden",
    zIndex: 1,
  },
  postImage: {
    flex: 1,
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  postImage2: {
    flex: 1,
    position: "absolute",
    height: "100%",
    width: "100%",
    backfaceVisibility: "hidden",
  },
  interactionFooter: {
    flex: 1,
    left: "1%",
    top: "1%",
    flexDirection: "row",
  },
  footerText: {
    color: "#666666",
    fontSize: 14,
  },
});
