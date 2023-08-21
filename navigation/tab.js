import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MainFeed from "../pages/mainfeed";
import Memories from "../pages/memories";
import FriendTabs from "../navigation/friendstuff_tabs";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import MainTabHeader from "../components/MainTabHeader";


const Tab = createMaterialTopTabNavigator();



export default function MyTabs({ route, navigation }) {
  const [userInfo, setUserInfo] = React.useState({});
  const goToMemories = () => {
    navigation.navigate("Memories", { userID: userInfo.userID }); // Replace 'FriendsTab' with the name of your desired tab screen
  };
  
  const goToFriends = () => {
    navigation.navigate("FriendTabs"); // Replace 'FriendsTab' with the name of your desired tab screen
  };
  useEffect(() => {
    retrieveUserInfo = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        if (jsonValue != null) {
          setUserInfo(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.log(error);
      }
    };
    retrieveUserInfo();
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="MainFeed"
      screenOptions={{
        tabBarStyle: { backgroundColor: "#121212" },
        tabBarShowLabel: false,
        gestureEnabled: false,
        swipeEnabled: false,
      }}
      tabBarPosition="top"
      tabBar={(props) => <MainTabHeader {...props} />}
      lazy={true}
    >
      <Tab.Screen name="FriendTabs" component={FriendTabs} />
      <Tab.Screen name="MainFeed" component={MainFeed} />
      <Tab.Screen name="Memories" component={Memories} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    width: "100%",
    paddingHorizontal: "3%",
    height: "12.5%",
    paddingTop: Platform.OS === "ios" ? "11%" : "0%",
    backgroundColor: "#121212",
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
});


