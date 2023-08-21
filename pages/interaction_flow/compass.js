import React, { useState, useEffect, useContext } from "react";
import { View, Dimensions, StyleSheet, ImageBackground } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import * as Location from "expo-location";
import AppContext from "../../components/AppContext";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import compass_bg from "../../assets/seek_logo_bg.png";
import compass_pointer from "../../assets/seek_logo_needles.png";

const { height, width } = Dimensions.get("window");

export default App = () => {
  const needleAngleCorrection = -45;
  const [data, setData] = useState();
  const [angle, setAngle] = useState(0);
  const [USERID, setUSERID] = useState("");
  const [testOther, setTestOther] = useState("");
  const [interaction, setInteraction] = useState("");
  const [otherLoc, setOtherLoc] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [userLoc, setUserLoc] = useState({
    latitude: 0,
    longitude: 0,
  });
  const rotation = useSharedValue(angle);

  const [loading, setLoading] = useState(false);

  setTimeout(() => {
    setLoading(true);
  }, 200);

  const globalStates = useContext(AppContext);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userData");
      if (jsonValue != null) {
        setUSERID(JSON.parse(jsonValue).userID);
        setInteraction(JSON.parse(globalStates.interactionData));

        if (
          JSON.parse(globalStates.interactionData).user_one ==
          JSON.parse(jsonValue).userID
        ) {
          setTestOther(JSON.parse(globalStates.interactionData).user_two);
        } else {
          setTestOther(JSON.parse(globalStates.interactionData).user_one);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getData();

    Location.watchHeadingAsync((heading) => {
      setData(heading.magHeading);
    });
  }, []);

  const getOtherLoc = async () => {
    axios
      .post("http://hihello.asuscomm.com:3000/users/getLocation", {
        id: testOther,
      })
      .then((res) => {
        let otherLoc = {};
        otherLoc.lat = res.data[0].lat == null ? 0 : res.data[0].lat;
        otherLoc.lon = res.data[0].lon == null ? 0 : res.data[0].lon;
        setOtherLoc(otherLoc);
        return otherLoc;
      })
      .catch((err) => {
        console.log(err);
      });

    axios
      .post("http://hihello.asuscomm.com:3000/users/getLocation", {
        id: USERID,
      })
      .then((res) => {
        let userLoc = {};
        userLoc.lat = res.data[0].lat == null ? 0 : res.data[0].lat;
        userLoc.lon = res.data[0].lon == null ? 0 : res.data[0].lon;
        setUserLoc(userLoc);
        return userLoc;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    async function fetchData() {
      getOtherLoc().then(() => {
        calculateAngle(userLoc.lat, userLoc.lon, otherLoc.lat, otherLoc.lon);
      });
      // calculateAngle(otherLoc.lat, otherLoc.lon, otherLoc.lat, otherLoc.lon);
    }

    fetchData();
    // const angleInterval = setInterval(fetchData, 3000);
    // return () => clearInterval(angleInterval);
  }, [data]);

  function calculateAngle(lat1, lon1, lat2, lon2) {
    deltaLat = lat2 - lat1;
    deltaLon = lon2 - lon1;
    const coordAngle = Math.atan2(deltaLon, deltaLat) * (180 / Math.PI);
    const finalAngle =
      coordAngle - data < 0 ? coordAngle - data + 360 : coordAngle - data;
    setAngle(finalAngle + needleAngleCorrection);
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${angle}deg`,
          // rotate: `${rotation.value}deg`,
        },
      ],
    };
  });

  // Display compassHeading and direction (if needed)
  return (
    <View style={styles.container}>
      <ImageBackground source={compass_bg} style={styles.compassBackground}>
        <Animated.Image
          source={compass_pointer}
          style={[styles.compassPointer, animatedStyle]}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "relative",

    borderRadius: 1000,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  compassBackground: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "blue"
  },
  compassPointer: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red"
  },
  arrow: {
    position: "absolute",
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "white",
    borderLeftColor: "transparent",
    top: "2%",
    left: width * 0.4 - 10,
  },
});
