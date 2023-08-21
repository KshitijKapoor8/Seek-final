import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Avatar } from "native-base";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { SlideInDown } from "react-native-reanimated";
import AppContext from "../../components/AppContext";
import { useFocusEffect } from "@react-navigation/native";

export default function AcceptInteraction({ route, navigation }) {
  const [friend, setFriend] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [userID, setUserID] = useState(route.params.userID);
  const [otherAccepted, setOtherAccepted] = useState(false);
  const [otherRejected, setOtherRejected] = useState(false);
  const [userAccepted, setUserAccepted] = useState(false);
  const [userRejected, setUserRejected] = useState(false);
  const [timeOver, setTimeOver] = useState(false);
  const globalStates = useContext(AppContext);
  const interactionData = JSON.parse(globalStates.interactionData);
  const friendID =
    interactionData.user_one == userID
      ? interactionData.user_two
      : interactionData.user_one;
  const [expireTime, setExpireTime] = useState(
    interactionData.created_at + 300000 - Date.now()
  );
  const timerRef = useRef(expireTime);
  const interval = setInterval(getResponses, 3500); // Poll every 3.5 seconds

  useEffect(() => {
    axios
      .post("http://hihello.asuscomm.com:3000/users/getById", { id: friendID })
      .then((res) => {
        globalStates.setFriendInfo(JSON.stringify(res.data[0]));
        setFriend(res.data[0]);
      });
  }, [globalStates.interactionData]);

  useFocusEffect(
    useCallback(() => {
      const timerId = setInterval(() => {
        timerRef.current -= 1000;
        if (timerRef.current <= 0) {
          clearInterval(timerId);
          setTimeOver(true);
        } else {
          setExpireTime(timerRef.current);
        }
      }, 1000);
      return () => {
        clearInterval(timerId);
        clearInterval(interval);
      };
    }, [])
  );

  useEffect(() => {
    getResponses();


  }, []);

  // useEffect(() => {
  //   const timerId = setInterval(() => {
  //     timerRef.current -= 1;
  //     if (timerRef.current <= 0) {
  //       setTimeOver(true);
  //       clearInterval(timerId);
  //     } else {
  //       setExpireTime(timerRef.current);
  //     }
  //   }, 1000);

  //   return () => {
  //     clearInterval(timerId);
  //     clearInterval(interval);
  //   };
  // }, [friend])

  useEffect(() => {
    if (otherAccepted && userAccepted) {
      clearInterval(interval);
      globalStates.setInteractionState("accepted");
    }
  }, [otherAccepted, userAccepted]);

  useEffect(() => {
    if (otherRejected || userRejected || timeOver) {
      clearInterval(interval);
      clearRunningInteractions();
      globalStates.setInteractionState("stopped");
    }
  }, [otherRejected, userRejected, timeOver]);

  async function clearRunningInteractions() {
    await axios
      .post("http://hihello.asuscomm.com:3000/users/updateInteractionRunning", {
        id: userID,
        interactionRunning: "",
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .post("http://hihello.asuscomm.com:3000/users/updateInteractionRunning", {
        id: friendID,
        interactionRunning: "",
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function getResponses() {
    try {
      const otherResponse = await axios.post(
        "http://hihello.asuscomm.com:3000/interaction/getOtherUserAccepted",
        { id: interactionData.id, userId: userID }
      );
      if (otherResponse.data[0].Accepted == 1) {
        setOtherAccepted(true);
      } else if (otherResponse.data[0].Accepted == -1) {
        setOtherRejected(true);
      }

      const userResponse = await axios.post(
        "http://hihello.asuscomm.com:3000/interaction/getOtherUserAccepted",
        { id: interactionData.id, userId: friendID }
      );
      if (userResponse.data[0].Accepted == 1) {
        setUserAccepted(true);
      } else if (userResponse.data[0].Accepted == -1) {
        setUserRejected(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function onSubmitYes() {
    await axios
      .post("http://hihello.asuscomm.com:3000/interaction/changeAcceptance", {
        id: interactionData.id,
        userId: userID,
        acceptance: 1,
      })
      .then((res) => {
        setUserAccepted(true);
      });
  }

  async function onSubmitNo() {
    await axios
      .post("http://hihello.asuscomm.com:3000/interaction/changeAcceptance", {
        id: interactionData.id,
        userId: userID,
        acceptance: -1,
      })
      .then((res) => {
        setUserRejected(true);
      });
  }

  function RenderCaption() {
    if (userAccepted) {
      return <Text style={styles.caption}>You have accepted!</Text>;
    } else if (otherAccepted) {
      return <Text style={styles.caption}>Your friend has accepted!</Text>;
    } else {
      return (
        <Text style={styles.caption}>
          You have been invited to interact with {friend.name}!
        </Text>
      );
    }
  }

  return (
    <LinearGradient
      colors={["#7E78C6", "#5067B1"]}
      style={styles.container}
      start={{ x: 1, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={styles.background}
        entering={SlideInDown.duration(1500)}
      >
        <View style={styles.timeWrapper}>
          <Text style={styles.time}>
            {Math.floor(expireTime / 60000)}:
            {Math.abs(Math.floor(expireTime / 1000)) % 60 < 10
              ? "0" + (Math.abs(Math.floor(expireTime / 1000)) % 60)
              : Math.abs(Math.floor(expireTime / 1000)) % 60}
          </Text>
        </View>
        <View style={styles.contentWrapper}>
          <View style={styles.friendInfo}>
            <View style={styles.friendInfoWrapper}>
              <Avatar size={120} source={{ uri: friend.pfp }} />
              <Text style={styles.friendName}>{friend.name}</Text>
            </View>
          </View>
          <View style={styles.captionWrapper}>
            <RenderCaption />
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#AAA1F7" }]}
                onPress={() => onSubmitYes()}
              >
                <Entypo name="check" size={30} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#7E78C6" }]}
                onPress={() => onSubmitNo()}
              >
                <Entypo name="cross" size={30} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  background: {
    position: "absolute",
    width: "85%",
    height: "80%",
    backgroundColor: "#121212",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  timeWrapper: {
    flex: 1,
    position: "relative",
    top: "5%",
  },
  time: {
    color: "white",
    fontSize: 50,
  },
  contentWrapper: {
    flex: 4,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  friendInfo: {
    flex: 1,
    justifyContent: "center",
  },
  friendInfoWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    bottom: "5%",
  },
  friendName: {
    color: "white",
    fontSize: 30,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonWrapper: {
    top: "10%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
  },
  button: {
    borderRadius: 40,
    backgroundColor: "white",
    padding: 15,
  },
  captionWrapper: {
    width: "80%",
    alignItems: "center",
    top: "5%",
  },
  caption: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
  },
});
