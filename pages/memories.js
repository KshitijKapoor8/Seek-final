import {
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import React, { useRef } from "react";
import GestureRecognizer, {
  swipeDirections,
} from "react-native-swipe-gestures";
import {
  NativeBaseProvider,
  HStack,
  Center,
  Image,
  Box,
  Spinner,
  IconButton,
  Text,
  Avatar,
  Divider,
  VStack,
  Modal,
} from "native-base";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import axios from "axios";
import parseErrorStack from "react-native/Libraries/Core/Devtools/parseErrorStack";
import { set } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { useContext } from "react";
import AppContext from "../components/AppContext";
import { LinearGradient } from "expo-linear-gradient";
import InteractionModal from "../components/InteractionModal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");


// https://stackoverflow.com/questions/42707080/preload-images-before-navigating-to-component
export default function Memories({ navigation, route }) {
  const propID = route.params.userID;
  const [showModal, setShowModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ImageURL, setImageURL] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(false);
  const [showSpinnerModal, setShowSpinnerModal] = useState(true);
  const [showSpinner, setShowSpinner] = useState(true);
  const [parsedData, setParsedData] = useState([]);
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pfp, setPfp] = useState("");
  const [isPfpLoaded, setIsPfpLoaded] = useState(false);
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [loadingPfp, setLoadingPfp] = useState(false);
  const userInfoRef = React.useRef(userInfo);
  const [interactionData, setInteractionData] = useState({});
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const globalStates = useContext(AppContext);
  // const [status, requestPermissions] = ImagePicker.useMediaLibraryPermissions();
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };

  parsedResponse = [];
  list = [];

  async function fetchUserData() {
    try {
      await axios
        .post("http://hihello.asuscomm.com:3000/users/getById", {
          id: propID,
        })
        .then((res) => {
          setUserInfo(res.data[0]);
          console.log(res.data[0]);
        })
        .catch((err) => {
          console.log(err);
        });

      await AsyncStorage.getItem("userData").then((res) => {
        if (res != null) {
          const jsonValue = JSON.parse(res);
          setIsLoggedInUser(jsonValue.userID === propID);
        }
      });
    } catch (e) {
      console.log("THERE IS A PROBLEM");
    }
  }

  async function fetchDoneInteractions() {
    await axios
      .post("http://hihello.asuscomm.com:3000/interaction/getByUserDone", {
        user_id: userInfo.id,
      })
      .then((res) => {
        list = res.data;
        list.slice().map((l) => {
          parsedResponse.push(l);
        });
        setParsedData([...list]);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async function fetchFriends() {
    await axios
      .post("http://hihello.asuscomm.com:3000/friends/getUserFriends", {
        id: userInfo.id,
      })
      .then((res) => {
        list = res.data;
        list.slice().map((list) => {
          parsedResponse.push(list);
        });
        setFriends([...list]);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  useEffect(() => {
    fetchUserData();
  }, [propID]);

  useEffect(() => {
    if (userInfo) {
      fetchDoneInteractions();
      fetchFriends();
    }
  }, [userInfo]);

  async function handleImagePress(interactionData) {
    // setSelectedImage(imageURL);
    // Fetch user information for user_one and user_two
    async function fetchUserInteractionInfo(userOneId, userTwoId) {
      try {
        const userOneRes = await axios.post(
          `http://hihello.asuscomm.com:3000/users/getByID`,
          {
            id: userOneId,
          }
        );
        const userTwoRes = await axios.post(
          `http://hihello.asuscomm.com:3000/users/getByID`,
          {
            id: userTwoId,
          }
        );
        return [userOneRes.data, userTwoRes.data];
      } catch (err) {
        console.log(err);
      }
    }
    const [userOneInfo, userTwoInfo] = await fetchUserInteractionInfo(
      interactionData.user_one,
      interactionData.user_two
    );

    setInteractionData([interactionData, userOneInfo[0], userTwoInfo[0]]);

    setShowModal(true);
  }

  const DisplayModal = () => {
    if (showModal && interactionData && interactionData !== {}) {
      console.log("test " + JSON.stringify(interactionData));
      return (
        <Modal isOpen={showModal}>
          <View style={styles.ModalContainer}>
            <InteractionModal interactionData={interactionData} />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowModal(false)}
            >
              <LinearGradient
                colors={["#7E78C6", "#5067B1"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalClose}
              >
                <Entypo name="cross" size={50} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Modal>
      );
    } else {
      return null;
    }
  };
  const goToMainfeed = () => {
    navigation.navigate("MainFeed"); // Replace 'FriendsTab' with the name of your desired tab screen
  };

  const logout = () => {
    globalStates.setIsLoggedIn(false);
    setShowLogoutModal(false);
    axios.post("http://hihello.asuscomm.com:3000/users/updateNotificationId", {
      id: userInfo.id,
      isLoggedIn: false
    }).then((res) => {
      AsyncStorage.removeItem("userData");
    }).catch((err) => {

    });
    navigation.navigate("GetStarted");
  };

  function LogoutAlertModal() {
    return (
      <Modal isOpen={showLogoutModal}>
        <View style={styles.LogoutAlertModalContainer}>
          <View style={styles.LogoutAlertModalContent}>
            <View style={styles.LogoutAlertHeaderText}>
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Logout
              </Text>
            </View>
            <View style={styles.LogoutAlertBodyText}>
              <Text style={{ color: "white", fontSize: 14 }}>
                Are you sure you want to logout?
              </Text>
            </View>
            <View style={styles.LogoutAlertButtonContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: "#e11c48" }]}
                onPress={() => logout()}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  async function updatePfp() {
    if (!isLoggedInUser) {
      console.log("no", propID);
      return;
    }
    console.log("update pfp");
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    setImage(res.assets[0].uri);
    setPfp(res.assets[0].uri);
    const formData = new FormData();

    const fileInfo = await FileSystem.getInfoAsync(res.assets[0].uri);
    // const fileBlob = await FileSystem.readAsStringAsync(
    //   res.assets[0].uri,
    //   { encoding: "base64" }
    // );

    const fileExtension = fileInfo.uri.split(".").pop();
    const fileName = `${fileInfo.uri.split("/").pop()}.${fileExtension}`;

    formData.append("image", {
      uri: fileInfo.uri,
      name: fileName,
      type: `image/${fileExtension}`,
    });

    axios
      .post("http://hihello.asuscomm.com:3000/uploadPfp/img-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((pfpRes) => {
        setLoadingPfp(true);
        axios
          .post("http://hihello.asuscomm.com:3000/users/addPfp", {
            id: userInfo.id,
            pfp: pfpRes.data.imageLocation,
          })
          .then((res) => {
            console.log(res.data.imageLocation);
            setPfp(pfpRes.data.imageLocation);
            setUserInfo({ ...userInfo, pfp: pfpRes.data.imageLocation });
            setLoadingPfp(false);
          })
          .catch((err) => {});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function navigateToFriends() {
    navigation.navigate("FriendTabs");
  }

  function InfoHeader() {
    return (
      <View style={styles.profileData}>
        <TouchableOpacity
          style={styles.userHeaderInfoContainer}
          onPress={() => updatePfp()}
        >
          <Avatar size={"xl"} source={{ uri: userInfo.pfp }} style={styles.avatar}/>
          <Text style={styles.displayName}>{userInfo.name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.InfoContainer} onPress={() => navigateToFriends()}>
          <Text bold style={styles.profileNumberText}>
                {friends.length}
          </Text>
          <Text style={styles.profileText}>Friends</Text>
        </TouchableOpacity>
        <View style={styles.InfoContainer}>
          <Text bold style={styles.profileNumberText}>
                {parsedData.length}
          </Text>
          <Text style={styles.profileText}>Memories</Text>
        </View>
      </View>
    );
  }

  return (
    <NativeBaseProvider>
      <DisplayModal />
      <LogoutAlertModal />
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <TouchableOpacity
            style={{ paddingLeft: "5%" }}
            onPress={goToMainfeed}
          >
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerText}>Seek</Text>

          <TouchableOpacity
            style={{ paddingRight: "5%" }}
            onPress={() => setShowLogoutModal(true)}
          >
            <MaterialCommunityIcons name="logout" size={22} color="white" />
          </TouchableOpacity>
        </View> */}
        <InfoHeader />
        <View style={styles.wrapperDisplayMemories}>

          <Divider />
          <View style={styles.displayMemories}>
            {isLoaded == true ? (
              <FlatList
                // showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.index}
                data={parsedData}
                numColumns={3}
                style={{ height: "100%"}}
                renderItem={(item) => (
                  <View style={styles.gridContent}>
                    {showSpinner && (
                      <Spinner
                        color="indigo.500"
                        size="lg"
                        style={styles.spinnerInGrid}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleImagePress(item.item)}
                    >
                      <Image
                        onLoad={() => setShowSpinner(false)}
                        source={{
                          uri:
                            propID === item.item.user_one
                              ? item.item.link
                              : item.item.link2,
                        }}
                        alt="Memories"
                        width={width / 3}
                        height={width / 3}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <>
                <Spinner
                  color="indigo.500"
                  size="lg"
                  style={styles.mainLoadingSpinner}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  wrapperDisplayMemories: { 
    flex: 9,
    width: "100%",   
    paddingTop: "5%", 
  },
  container: {
    flex: 1,
    backgroundColor: "#121212",
    width: "100%",
    height: "100%",
  },
  ModalContainer: {
    flex: 4,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    flex: 1,
    borderRadius: 100,
  },
  displayMemories: {
    width: "100%",
    // display: "flex",
    // flexDirection: "row",
    // justifyContent: "flex-start",
    // alignItems: "flex-start",
    // flexWrap: "wrap",
    // alignContent: "flex-start",
  },
  gridContent: {
    marginLeft: 1,
    marginRight: 1,
    // marginTop: 1,
    // borderRadius: 20,
    // overflow: "hidden",
    // marginTop: "10%",
    // marginLeft: "5%",
  },
  ModalContent: {
    flex: 1,
    position: "relative",
    aspectRatio: 3 / 4,
    width: "90%",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    top: "15%",
    overflow: "hidden",
  },
  wrapper: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginRight: "2%",
    marginTop: "10%",
  },
  spinner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "100%",
  },
  spinnerInGrid: {
    // marginTop: "10%",
  },
  heartButton: {
    marginBottom: "20%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  memoriesText: {
    color: "white",
    paddingTop: "20%",
    paddingLeft: "5%",
    width: "100%",
    height: "14%",
    fontSize: 20,
    flexDirection: "row",
  },
  profileData: {
    flex: 2,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  profileText: {
    color: "white",
    fontSize: 15,
  },
  profileNumberText: {
    color: "white",
    fontSize: 15,
    alignSelf: "center",
  },
  displayName: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    // marginBottom: "80%",
  },
  userHeaderInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",    
  },
  avatar: {
    marginTop: "2%",
    marginBottom: "4%",
  },
  InfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  
  mainLoadingSpinner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "10%",
    marginRight: "10%",
    marginTop: "60%",
    marginBottom: "90%",
  },
  container2: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  plusButtonContainer: {
    position: "absolute",
    borderRadius: "100%",
    marginLeft: "60%",
    marginTop: "50%",
    backgroundColor: "#B4C6FF",
    padding: 0,
    margin: 0,
    // Adjust the values as needed
  },
  plusButton: {
    borderRadius: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? "12%" : 0,
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    paddingTop: "5.5%",
  },
  LogoutAlertModalContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  LogoutAlertModalContent: {
    width: "80%",
    height: "20%",
    backgroundColor: "#121212",
    borderRadius: 20,
  },
  plusButton: {
    borderRadius: "100%",
  },
  plusText: {
    fontSize: 18,
    color: "white",
  },
  LogoutAlertHeaderText: {
    flex: 2,
    width: "100%",
    justifyContent: "center",
    paddingLeft: "7.5%",
  },
  LogoutAlertBodyText: {
    flex: 2,
    width: "100%",
    paddingLeft: "5%",
    justifyContent: "center",
  },
  LogoutAlertButtonContainer: {
    flex: 2,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: "5%",
  },
  logoutButton: {
    borderRadius: 10,
    paddingHorizontal: "5%",
    paddingVertical: "2%",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "5%",
  },
  logoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
