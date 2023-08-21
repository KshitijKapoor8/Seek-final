import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { NativeBaseProvider } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import InteractionList from "../components/InteractionList";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { FontAwesome5 } from "@expo/vector-icons";

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Original Title",
    body: "And here is the body!",
    data: { someData: "goes here" },
    sound: null,
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsyncAndAlsoAllOtherPermissions() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "9cae2ac2-bcae-48c1-ac56-de641b2f0531",
      })
    ).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}

export default function MainFeed({ navigation }) {
  const [userID, setUserID] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  useEffect(() => {
    registerForPushNotificationsAsyncAndAlsoAllOtherPermissions().then(
      (token) => setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  useEffect(() => {
    retrieveUserID = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        if (jsonValue != null) {
          setUserID(JSON.parse(jsonValue).userID);
        }
      } catch (error) {
        console.log(error);
      }
    };
    retrieveUserID();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsyncAndAlsoAllOtherPermissions().then(
      (token) => {
        axios.post(
          "http://hihello.asuscomm.com:3000/users/updateNotificationId",
          {
            id: userID,
            notificationId: token,
          }
        );
      }
    );
  }, [userID]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  const goToMemories = () => {
    navigation.navigate("Memories", { userID: userID }); // Replace 'FriendsTab' with the name of your desired tab screen
  };

  const goToFriends = () => {
    navigation.navigate("FriendTabs"); // Replace 'FriendsTab' with the name of your desired tab screen
  };
  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <TouchableOpacity onPress={goToFriends}>
            <FontAwesome5
              paddingHorizontal="4%"
              name="user-friends"
              size={21}
              color="white"
            />
          </TouchableOpacity>

          <Text style={styles.headerText}>Seek</Text>

          <TouchableOpacity onPress={goToMemories}>
            <MaterialIcons
              paddingHorizontal="4%"
              name="photo-album"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View> */}
        <View style={styles.listContainer}>
          <InteractionList navigation={navigation} />
        </View>
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#121212",
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    width: "100%",
    paddingHorizontal: "3%",
    height: "12.5%",
    paddingTop: Platform.OS === "ios" ? "11%" : "0%",
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
