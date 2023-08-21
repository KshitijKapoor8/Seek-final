import Chat from "../pages/interaction_flow/chat";
import Compass from "../pages/interaction_flow/compass";
import Timer from "../pages/interaction_flow/timer";
import { StyleSheet } from "react-native";
import { createNavigator } from "./Navigator";
import AppContext from "../components/AppContext";
import React from "react";
import { useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "react-native";
import axios from "axios";
// const Tab = createMaterialTopTabNavigator();
// const Tab = createMaterialBottomTabNavigator();
const Nav = createNavigator();

const TimerScreen = () => <Timer />;
const ChatScreen = () => <Chat />;
const CompassScreen = () => <Compass />;

export default function InteractionTabs() {
  return (
    <Nav.Navigator initialRouteName="Timer">
      <Nav.Screen name="Chat" component={ChatScreen} />
      <Nav.Screen name="Timer" component={TimerScreen} />
      <Nav.Screen name="Compass" component={CompassScreen} />
    </Nav.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "2%",
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "ios" ? "7%" : 0,
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },

  time: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
