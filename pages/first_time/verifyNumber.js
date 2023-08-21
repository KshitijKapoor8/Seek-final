import React, { useContext } from "react";
import {
  NativeBaseProvider,
  Heading,
  Button,
  Stack,
  FormControl,
  Image,
  Text,
  Box,
} from "native-base";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import jewels_top from "../../assets/jewels_top.png";
import jewels_bottom from "../../assets/jewels_bottom.png";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import AppContext from "../../components/AppContext";
import { LinearGradient } from "expo-linear-gradient";

// import * as Device from 'expo-device';
import * as Notifications from "expo-notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("test" + status);
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    token = (await Notifications.getDevicePushTokenAsync()).data;
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

export default function VerifyNumber({ route, navigation }) {
  const [verification, setVerification] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const { code, name, number } = route.params;
  const globalStates = useContext(AppContext);

  const CELL_COUNT = 5;
  const ref = useBlurOnFulfill({ verification, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    verification,
    setVerification,
  });

  const config = {
    dependencies: {
      "linear-gradient": LinearGradient,
    },
  };

  const showAlert = () => {
    Alert.alert("Verification code incorrect! Try again or stop hacking idiot");
  };

  const validate = () => {
    if (verification == code) {
      return true;
    } else {
      showAlert();
      return false;
    }
  };
  const onSubmit = () => {
    // console.log(number);
    // console.log(name);

    axios
      .post("http://hihello.asuscomm.com:3000/users/getByPhone", {
        phoneNumber: number,
      })
      .then((res) => {
        if (res.data[0] == undefined) {
          if (validate()) {
            axios
              .post("http://hihello.asuscomm.com:3000/users/add", {
                phoneNumber: number,
                name: name,
              })
              .then((res) => {
                const json = {
                  name: name,
                  phoneNumber: number,
                  userID: JSON.parse(JSON.stringify(res.data)),
                  pfp: "https://seekpfps.s3.amazonaws.com/Default_pfp-1688597251415.png",
                };
                registerForPushNotificationsAsync().then((token) => {
                  console.log("token: " + token);
                  console.log("userID: " + json.userID);
                  axios.post(
                    "http://hihello.asuscomm.com:3000/users/updateNotificationId",
                    {
                      id: json.userID,
                      notificationId: token,
                    }
                  );
                });
                saveUserData2(json).then((res) => {
                  navigation.navigate("MyTabs");
                });
                console.log("was this successful.." + json.userID);
                globalStates.setUserInfo(json);
              })
              .catch((err) => {
                console.log(err);
              });
          }
        } else {
          console.log(res.data[0]);
          saveUserData(res.data[0]).then((res) => {
            navigation.navigate("MyTabs");
          });
        }
      });
  };

  const saveUserData2 = async (value) => {
    try {
      let x = {
        name: value.name,
        phoneNumber: value.phoneNumber,
        userID: value.userID,
        pfp: "https://seekpfps.s3.amazonaws.com/Default_pfp-1688597251415.png",
      };
      const jsonValue = JSON.stringify(x);
      await AsyncStorage.setItem("userData", jsonValue);
    } catch (e) {
      console.log("Error Saving User Data");
      // saving error
    }
  };
  const saveUserData = async (value) => {
    try {
      let x = {
        name: value.name,
        phoneNumber: value.phoneNumber,
        userID: value.id,
        pfp: "https://seekpfps.s3.amazonaws.com/Default_pfp-1688597251415.png",
      };
      const jsonValue = JSON.stringify(x);
      await AsyncStorage.setItem("userData", jsonValue);
    } catch (e) {
      console.log("Error Saving User Data");
      // saving error
    }
  };
  return (
    <NativeBaseProvider config={config}>
      <View style={styles.container}>
        <Image
          source={jewels_top}
          style={styles.jewel_header}
          alt="jewel_header"
        />
        <Heading size="lg" fontWeight="600" style={styles.welcomeMessage}>
          Enter Verification Code
        </Heading>
        <Text style={styles.phoneNumberText}>
          We've sent a message to +{route.params.number}
        </Text>
        <FormControl isRequired>
          <Stack mx="4">
            <CodeField
              ref={ref}
              caretHidden={false}
              value={verification}
              onChangeText={(value) => {
                setVerification(value);
              }}
              cellCount={CELL_COUNT}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({ index, symbol, isFocused }) => (
                <View
                  onLayout={getCellOnLayoutHandler(index)}
                  key={index}
                  style={[styles.cellRoot, isFocused && styles.focusCell]}
                >
                  <Text style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                </View>
              )}
            />
          </Stack>
        </FormControl>
        <TouchableOpacity
          marginBottom={"10%"}
          onPress={onSubmit}
          style={{ zIndex: 1 }}
        >
          <Box
            px={30}
            py={2}
            rounded="10"
            marginTop={"5%"}
            bg={{
              linearGradient: {
                colors: ["#7E78C6", "#5067B1"],
                start: [0, 0],
                end: [1, 0],
              },
            }}
            _text={{
              color: "white",
              justifyContent: "flex-start",
              fontSize: "15",
            }}
          >
            Next
          </Box>
        </TouchableOpacity>
        <Image
          source={jewels_bottom}
          style={styles.jewel2_header}
          alt="jewel_header"
        />
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  welcomeMessage: {
    color: "#B4C6FF",
  },
  message: {
    color: "#ffffff",
  },
  jewel_header: {
    width: 400,
    height: 250,
    position: "absolute",
    top: 0,
  },
  jewel2_header: {
    width: 600,
    height: 250,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  jewel2_header: {
    width: 600,
    height: 250,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  cellText: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
  cellRoot: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  codeField: {
    paddingTop: "40",
  },
  phoneNumberText: {
    color: "white",
    paddingBottom: 30,
    paddingTop: 10,
  },
  cellRoot: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  focusCell: {
    borderBottomColor: "#007AFF",
    borderBottomWidth: 2,
  },
});