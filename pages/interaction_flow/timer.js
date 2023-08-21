import { useState, useEffect, useContext, useRef } from "react";
import { Dimensions } from "react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeBaseProvider } from "native-base";
import axios from "axios";
// import { RNS3 } from "react-native-aws3";
const { height, width } = Dimensions.get("window");
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import AppContext from "../../components/AppContext";
import { useNavigation } from "@react-navigation/native";
import { set } from "react-native-reanimated";

export default function Timer({ route, friendInfo }) {
  const navigation = useNavigation();
  const [userID, setUserID] = useState("");
  const [friend, setFriend] = useState({});
  const [user, setUser] = useState({});
  const [friendID, setFriendID] = useState("");
  const globalStates = useContext(AppContext);
  const interactionData = JSON.parse(globalStates.interactionData);
  const [expireTime, setExpireTime] = useState(
    interactionData.created_at + 300000 - Date.now()
  );
  const timerRef = useRef(expireTime);
  const [timeOver, setTimeOver] = useState(false);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userData");
      setUserID(JSON.parse(jsonValue).userID);
    } catch (e) {}
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (userID != undefined) {
      if (userID == JSON.parse(globalStates.interactionData).user_one) {
        setFriendID(JSON.parse(globalStates.interactionData).user_two);
      } else {
        setFriendID(JSON.parse(globalStates.interactionData).user_one);
      }
    }

    axios
      .post(`http://hihello.asuscomm.com:3000/users/getById`, { id: userID })
      .then((res) => {
        setUser(res.data[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userID]);

  useEffect(() => {
    axios
      .post("http://hihello.asuscomm.com:3000/users/getById", { id: friendID })
      .then((res) => {
        setFriendInfo(res.data[0]);
        setFriend(res.data[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [friendID]);

  const config = {
    dependencies: {
      "linear-gradient": LinearGradient,
    },
  };

  useEffect(() => {
    const timerId = setInterval(() => {
      timerRef.current -= 1000;
      if (timerRef.current <= 0) {
        clearInterval(timerId);
        setTimeOver(true);
        clearRunningInteractions();
        globalStates.setInteractionState("stopped");
      } else {
        setExpireTime(timerRef.current);
      }
    }, 1000);
    return () => {
      clearInterval(timerId);
      // clearInterval(interval);
    };
  }, [friendInfo]);

  function onPress() {
    navigation.navigate("Camera");
  }

  async function clearRunningInteractions() {
    await axios
      .post("http://hihello.asuscomm.com:3000/users/updateInteractionRunning", {
        id: interactionData.user_one,
        interactionRunning: "",
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .post("http://hihello.asuscomm.com:3000/users/updateInteractionRunning", {
        id: interactionData.user_two,
        interactionRunning: "",
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <NativeBaseProvider config={config}>
      <View style={styles.container}>
        <View style={styles.timeContainer}>
          <View>
            <Text style={styles.headerText}>You have</Text>
          </View>
          <Text bold style={styles.timer}>
            {Math.floor(expireTime / 60000)}:
            {Math.abs(Math.floor(expireTime / 1000)) % 60 < 10
              ? "0" + (Math.abs(Math.floor(expireTime / 1000)) % 60)
              : Math.abs(Math.floor(expireTime / 1000)) % 60}
          </Text>
          <View>
            <Text style={styles.headerText}>
              minutes left to complete this Quest!
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
          <LinearGradient
            colors={["#7E78C6", "#5067B1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>I found my friend!</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: "#121212",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    color: "white",
    fontSize: 70,
    fontWeight: "bold",
    paddingVertical: "5%",
  },
  headerText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  timeContainer: {
    flex: 2,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  time: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginTop: "2%",
    width: "50%",
    bottom: "10%",
  },
  button: {
    borderRadius: 40,
    width: "100%",
    paddingVertical: "5%",
  },
  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
