import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useEffect, useState} from 'react'
import { Modal } from "native-base";
import { FontAwesome5, MaterialIcons, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigationState } from '@react-navigation/native';
import AppContext from './AppContext';
import axios from 'axios';


export default function MainTabHeader({state, descriptors, navigation, position}) {
    const [userID, setUserID] = React.useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const globalStates = React.useContext(AppContext);
    let currentScreen = state.routes[state.index];


    const goToMemories = () => {
      navigation.navigate("Memories", { userID: userID }); // Replace 'FriendsTab' with the name of your desired tab screen
    };
    
    const goToFriends = () => {
      navigation.navigate("FriendTabs"); // Replace 'FriendsTab' with the name of your desired tab screen
    };

    const goToMainFeed = () => {
        navigation.navigate("MainFeed"); // Replace 'FriendsTab' with the name of your desired tab screen
    };
    useEffect(() => {
      retrieveUserInfo = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem("userData");
          if (jsonValue != null) {
            setUserID(JSON.parse(jsonValue).userID);
          }
          console.log(jsonValue)
        } catch (error) {
          console.log(error);
        }
      };
      retrieveUserInfo();
    }, []);

    const logout = () => {
        globalStates.setIsLoggedIn(false);
        setShowLogoutModal(false);
        axios.post("http://hihello.asuscomm.com:3000/users/updateNotificationId", {
          id: userID,
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

    function MainFeedTab() {
        return (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goToFriends()}>
            <FontAwesome5
              paddingHorizontal="4%"
              name="user-friends"
              size={24}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => goToMainFeed()}>
                <Text style={styles.headerText}>Seek</Text>
            </TouchableOpacity>
          <TouchableOpacity onPress={() => goToMemories()}>
            <MaterialIcons
              paddingHorizontal="4%"
              name="photo-album"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>
        )
    }

    function MemoriesTab() {
        return (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => goToMainFeed()}
          >
            <AntDesign 
                paddingHorizontal="4%"
                name="arrowleft" 
                size={24} 
                color="white" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goToMainFeed()}>
                <Text style={styles.headerText}>Seek</Text>
            </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
            <MaterialCommunityIcons 
                paddingHorizontal="4%"
                name="logout" 
                size={24} 
                color="white" 
            />
          </TouchableOpacity>
          <LogoutAlertModal />
        </View>
        )
    }

    function FriendsTab() {
        return (
        <View style = {styles.header}>
            <AntDesign
                paddingHorizontal="4%"
                name="arrowleft"
                size={24}
                color="#121212"
            />

            <TouchableOpacity onPress={() => goToMainFeed()}>
                <Text style={styles.headerText}>Seek</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => goToMainFeed()}>
                <AntDesign
                    paddingHorizontal="4%"
                    name="arrowright"
                    size={24}
                    color="white"
                />
            </TouchableOpacity>

        </View>
        )
    }

    if(currentScreen.name == "MainFeed") {
        return <MainFeedTab />
    } else if (currentScreen.name == "Memories") {
        return <MemoriesTab />
    } else if (currentScreen.name == "FriendTabs") {
        return <FriendsTab />
    }
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
      LogoutAlertModalContainer: {
        position: "absolute",
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
  });