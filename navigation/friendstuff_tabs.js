import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import Friends from "../pages/friends";
import FromContacts from "../pages/from_contacts";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Tab = createMaterialTopTabNavigator();
export default function FriendStuffTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Friends"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#1C1C1C",
          position: "absolute",
          bottom: "5%",
          right: "5%",
          left: "35%",
          borderRadius: 40,
          borderTopWidth: 0,
          height: "6%",
          width: "30%",
          tabBarActiveTintColor: "rgb(180, 198, 255,0.8)",
          tabBarInactiveTintColor: "rgb(180, 198, 255,0.7)",
        },
        tabBarShowLabel: false,
        tabBarPosition: "bottom",
        tabBarIndicatorStyle: {
          display: "none",
        },
      }}
      lazy={true}
    >
      <Tab.Screen
        name="Friends"
        component={Friends}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="circle"
              size={15}
              color={focused ? "rgb(180, 198, 255)" : "#777777"}
            />
          ),
          tabBarIconStyle: {
            top: "30%",
            left: "15%",
          },
        }}
      />
      <Tab.Screen
        name="From Contacts"
        component={FromContacts}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="circle"
              size={15}
              color={focused ? "rgb(180, 198, 255)" : "#777777"}
            />
          ),
          tabBarIconStyle: {
            top: "30%",
          },
        }}
      />
    </Tab.Navigator>
  );
}
