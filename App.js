import { useState, useEffect } from "react";
import GetStarted from "./pages/first_time/get_started";
import Register from "./pages/first_time/register";
import VerifyNumber from "./pages/first_time/verifyNumber";
import CameraView from "./pages/interaction_flow/camera";
import MyTabs from "./navigation/tab";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogBox } from "react-native";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import axios from "axios";
import InteractionTabs from "./navigation/interactionTabs";
import AcceptInteraction from "./pages/interaction_flow/acceptInteraction";
import { NativeBaseProvider } from "native-base";
import AppContext from "./components/AppContext";
import * as Contacts from "expo-contacts";
import { Camera } from "expo-camera";
import * as Notifications from "expo-notifications";

const Stack = createNativeStackNavigator();

const LOCATION_TASK_NAME = "location-tracking";
const BACKGROUND_FETCH_TASK = "background-fetch";

var l1;
var l2;

const requestPermissions = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === 'granted') {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === 'granted') {
      console.log("permissions granted!");
    }
  }
};

const startLocationTracking = async () => {
  await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
    accuracy: Location.Accuracy.Highest,
    timeInterval: 5000,
    foregroundService: {
      notificationTitle: "BackgroundLocation Is On",
      notificationBody: "We are tracking your location",
      notificationColor: "#ffce52",
    },
  });
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userID, setUserID] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [interactionData, setInteractionData] = useState("");
  const [timer, setTimer] = useState(0);
  const [interactionState, setInteractionState] = useState("stopped");
  const [friendInfo, setFriendInfo] = useState({});
  const [userLocation, setUserLocation] = useState({});
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const globalStates = {
    interactionState: interactionState,
    interactionData: interactionData,
    userInfo: userInfo,
    userLocation: userLocation,
    friendInfo: friendInfo,
    setInteractionState,
    setInteractionData,
    setUserInfo,
    setUserLocation,
    setFriendInfo,
    setIsLoggedIn,
  };

  async function getUserID() {
    try {
      const jsonValue = await AsyncStorage.getItem("userData");
      if (jsonValue != null) {
        setUserID(JSON.parse(jsonValue).userID);
        setIsLoggedIn(true);
      } else {
        console.log("userID not found");
      }
    } catch (e) {
      console.log(e);
    }
  }

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
    getInteractionData();
    retrieveUserInfo();
  }, []);

  useEffect(() => {
    getUserID();
    locationTracking();
  }, [interactionState]);

  useEffect(() => {
    // getAcceptedInteraction();
    interactionFlow();
  }, [userID]);

  async function getAcceptedInteraction() {
    try {
      let accepted = await AsyncStorage.getItem("acceptedInteraction");
      if(accepted == null) {
        accepted = await AsyncStorage.setItem("acceptedInteraction", "stopped");
      }
      setAcceptedInteraction(accepted);
    } catch (e) {
      console.log(e);
    }
  }

  async function getInteractionData() {
    const { foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    const { backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    const { contactsStatus } = await Contacts.requestPermissionsAsync();
    const { notificationsStatus } =
      await Notifications.requestPermissionsAsync();
    if (!permission?.granted) requestPermission();
  }

  async function locationTracking() {
    if (interactionState == "accepted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 0.4,
        foregroundService: {
          notificationTitle: "Fast BackgroundLocation Is On",
          notificationBody: "We are tracking your location",
          notificationColor: "#ffce52",
        },
      }).then(() => {
        console.log("fast location tracking started");
      });
    } else {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Highest,
        foregroundService: {
          notificationTitle: "BackgroundLocation Is On",
          notificationBody: "We are tracking your location",
          notificationColor: "#ffce52",
        },
      }).then(() => {
        console.log("location tracking started");
      });
    }
  }

  TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
    if (error) {
      // Error occurred - check `error.message` for more details.
      console.log(error.message);
      return;
    }
    if (data) {
      const { locations } = data;

      let lat = locations[0].coords.latitude;
      let lon = locations[0].coords.longitude;

      setUserLocation({ lat: lat, lon: lon });

      console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${lon}`);

      // do something with the locations captured in the background
      // commented out cause we not usin it rn
      // if (userID) {
      //   axios
      //     .post("http://hihello.asuscomm.com:3000/users/updateLocation", {
      //       id: userID,
      //       lat: lat,
      //       lon: lon,
      //     })
      //     .then((res) => {})
      //     .catch((err) => {
      //       console.log(err);
      //     });
      // }
    }
  });

  async function interactionFlow() {
    await axios
      .post("http://hihello.asuscomm.com:3000/users/getByID", {
        id: userID,
      })
      .then((res) => {
        setUserInfo(res.data[0]);
        setInteractionData(res.data[0].interactionRunning);
        if (res.data[0].interactionRunning != "") {
          axios
            .post("http://hihello.asuscomm.com:3000/interaction/getByID", {
              id: JSON.parse(res.data[0].interactionRunning).id,
            })
            .then((res1) => {
              // sets acceptedInteraction to running if there is an interaction running to update frontend navigations
              if (
                res1.data[0].userOneAccepted &&
                res1.data[0].userTwoAccepted
              ) {
                setInteractionState("accepted");
              } else if (res1.data[0].interactionRunning != "") {
                setInteractionState("running");
              } else {
                setInteractionState("stopped");
              }
              // let parsedData = JSON.parse(interactionData)
              // axios.post("http://hihello.asuscomm.com:3000/users/getByID", {
              //   id: parsedData.user_one == userID ? parsedData.user_two : parsedData.user_one
              // }).then((res) => {
              //   setFriendInfo(res.data[0])
              // })
            });
        }

        axios
          .post("http://hihello.asuscomm.com:3000/users/getByID", {
            id:
              JSON.parse(interactionData).user_one == userID
                ? JSON.parse(interactionData).user_two
                : JSON.parse(interactionData).user_one,
          })
          .then((res) => {
            // console.log("test"  + JSON.stringify(res.data[0]))
            setFriendInfo(res.data[0]);
          });
      })
      .catch((err) => {
        console.log(err) ||
          "Something went wrong with getting user info for interaction flow";
      });
  }

  LogBox.ignoreLogs(["Warning: ..."]);
  LogBox.ignoreAllLogs();

  function LoadNavigator() {
    if (interactionState != "stopped") {
      return (
        <>
          <Stack.Group>
            {interactionState == "running" ? (
              <Stack.Screen
                name="AcceptInteraction"
                component={AcceptInteraction}
                options={{ gestureEnabled: false, animation: "none" }}
                initialParams={{ userID: userID }}
              />
            ) : (
              <Stack.Screen
                name="InteractionTabs"
                component={InteractionTabs}
                options={{ gestureEnabled: false, animation: "none" }}
                initialParams={{ userID: userID }}
              />
            )}
            <Stack.Screen
              name="Camera"
              component={CameraView}
              options={{ gestureEnabled: false, animation: "none" }}
              initialParams={{ userID: userID }}
            />
          </Stack.Group>
        </>
      );
    } else if (!isLoggedIn) {
      return (
        <Stack.Group>
          <Stack.Screen name="GetStarted" component={GetStarted} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen
            name="VerifyNumber"
            component={VerifyNumber}
            options={{ gestureEnabled: false }}
          />
        </Stack.Group>
      );
    }
  }

  function foo() {
    return (
      <Stack.Screen
        name="MyTabs"
        component={MyTabs}
        options={{ gestureEnabled: false, animation: "none" }}
      />
    );
  }

  return (
    <NavigationContainer>
      <NativeBaseProvider>
        <AppContext.Provider value={globalStates}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {LoadNavigator()}
            {/* {foo()} */}
            {interactionState == "stopped" ? (
              <Stack.Screen
                name="MyTabs"
                component={MyTabs}
                options={{ gestureEnabled: false, animation: "none" }}
                navigationKey={
                  interactionData != ""
                    ? "InteractionRunning"
                    : "NoInteractionRunning"
                }
              />
            ) : (
              () => {}
            )}
          </Stack.Navigator>
        </AppContext.Provider>
      </NativeBaseProvider>
    </NavigationContainer>
  );
}
