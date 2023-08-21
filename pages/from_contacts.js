import {
  NativeBaseProvider,
  Heading,
  Button,
  Stack,
  FormControl,
  Input,
  InputLeftAddon,
  InputGroup,
  Icon,
  Image,
  Box,
  Text,
  ScrollView,
  Avatar,
  Divider,
  Spinner,
} from "native-base";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useState, useEffect, Component } from "react";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useIsFocused } from "@react-navigation/core";

export default function FromContacts({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [friends, setFriends] = React.useState([]);
  const [friendsUsers, setFriendsUsers] = React.useState([]);
  const [fromContacts, setFromContacts] = React.useState([]);
  const [allUsers, setAllUsers] = React.useState([]);
  const [loading2, setLoading2] = React.useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    setTimeout(() => {
      retrieveUserID = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem("userData");
          if (jsonValue != null) {
            setUsername(JSON.parse(jsonValue).userID);
          }
        } catch (error) {
          console.log(error);
        }
      };

      async function getFriends() {
        await axios
          .post("http://hihello.asuscomm.com:3000/friends/getUserFriends", {
            id: username,
          })
          .then((res) => {
            setFriends(res.data);
          })
          .catch((err) => console.log(err))
          .finally(() => {});
      }
      retrieveUserID();
      if (isFocused) {
        getFriends();
      }
    }, 1000);
  }, [username, isFocused]);

  // this use effect creates the array of users from the friends
  useEffect(() => {
    setFriendsUsers([]);
    async function loadUsers() {
      var index = -1;
      friends.map(async function (onePerson) {
        index++;
        await axios
          .post("http://hihello.asuscomm.com:3000/users/getByID", {
            id: onePerson.friend_id,
          })
          .then((res) =>
            setFriendsUsers((friendsUsers) => [...friendsUsers, res.data])
          )
          .catch((err) => console.log(err));
      });
    }
    loadUsers();
  }, [friends]);

  // this use effect takes care of the suggested contacts component
  useEffect(() => {
    setFromContacts([]);
    setLoading2(true);

    async function loadUsers() {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({});
        // first retrieve all the user objects and store the array in setAllUsers
        await axios
          .get("http://hihello.asuscomm.com:3000/users")
          .then((res) => {
            setAllUsers(res.data);
          })
          .catch((err) => console.log(err));
        allUsers.map(function (user) {
          data.map(function (contact) {
            let rawNumber;
            if (Platform.OS === "android") {
              rawNumber = contact.phoneNumbers[0].number.replace(/[^0-9]/g, "");
            } else {
              rawNumber =
                contact.phoneNumbers != null
                  ? (contact.phoneNumbers[0].digits + "").substring(1)
                  : "";
            }
            // check if the phone number is already in the friends
            var present = false;
            for (var j = 0; j < friendsUsers.length && !present; j++) {
              if (friendsUsers[j][0].phoneNumber === rawNumber + "") {
                present = true;
              }
            }
            if (!present && rawNumber === contact.phoneNumbers) {
              console.log("RAW:", rawNumber);
              setFromContacts((fromContacts) => [...fromContacts, contact]);
            }
          });
          setLoading2(false);
        });
      }
    }
    loadUsers();
  }, [username, isFocused]);

  async function sendRequest(sender) {
    // this call deletes the friend request entirely! loser
    await axios
      .post("http://hihello.asuscomm.com:3000/friendRequests/add", {
        user_id: username,
        friend_id: sender,
      })
      .then((res) => {
        let x = fromContacts;
        x = x.filter((item) => item.id !== sender);

        setFromContacts(x);
      })
      .catch((err) => console.log(err));
  }

  const goToMainfeed = () => {
    navigation.navigate("MainFeed"); // Replace 'FriendsTab' with the name of your desired tab screen
  };

  const renderItem3 = ({ item }) => {
    return (
      <Box
        px={5}
        py={2}
        rounded="md"
        // bg="#B4C6FF"
        my={2}
        width={400}
        height={20}
        alignSelf={"center"}
        flexDirection={"row"}
        _text={{
          color: "white",
          justifyContent: "flex-start",
          fontSize: "15",
        }}
      >
        <View flexDirection={"row"} justifyContent={"flex-start"} width={"50%"}>
          {item.pfp == null ? (
            <Text
              justifyContent={"flex-start"}
              paddingTop={"15%"}
              color={"white"}
            >
              No pfp
            </Text>
          ) : (
            <View paddingLeft={"1.5%"} paddingTop={"5%"}>
              <Avatar
                source={{
                  uri: item.pfp,
                }}
              ></Avatar>
            </View>
          )}

          {item.name == null ? (
            <Text
              paddingLeft={"10%"}
              paddingTop={"12%"}
              color={"white"}
              justifyContent={"flex-end"}
            >
              No Name
            </Text>
          ) : (
            <Text
              paddingLeft={"15%"}
              paddingTop={"11.5%"}
              color={"white"}
              justifyContent={"flex-end"}
              fontSize={17}
              bold
            >
              {item.name}
            </Text>
          )}
        </View>
        <Button
          onPress={() => sendRequest(item.id)}
          justifyContent={"flex-end"}
          backgroundColor={"none"}
          paddingLeft={"30%"}
          paddingTop={"7%"}
        >
          <AntDesign name="adduser" size={24} color="#B4C6FF" />
        </Button>
      </Box>
    );
  };

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        {/* <View style={styles.header2}>
          <Text></Text>

          <Text style={styles.headerText2}>Seek</Text>

          <TouchableOpacity onPress={goToMainfeed}>
            <AntDesign
              paddingRight="5%"
              name="arrowright"
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View> */}
        <Text bold style={styles.contacts_text}>
          Suggested{" "}
        </Text>
        {fromContacts.length == 0 ? (
          <View style={styles.preLoadedContainer}>
            <Text style={styles.preLoadedText}>{`Nothing here :(
                                              Invite your friends and start seeking!`}</Text>
          </View>
        ) : (
          <FlatList
            data={fromContacts}
            renderItem={renderItem3}
            keyExtractor={(item) =>
              item.id.toString() +
              new Date().getTime().toString() +
              Math.floor(
                Math.random() * Math.floor(new Date().getTime())
              ).toString()
            }
            paddingTop={"5%"}
          />
        )}
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
  },
  contacts_text: {
    color: "gray",
    paddingLeft: "5%",
    fontSize: 22,
    paddingTop: "5%",
  },
  header2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    width: "100%",
    height: "12.5%",
    paddingTop: Platform.OS === "ios" ? "12%" : "0%",
    margin: 0,
  },
  headerText2: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
    // backgroundColor: "rgba(255, 0, 0, 0.4)",
    padding: "2%",
    margin: 0,
    paddingLeft: "12.3%",
  },
  preLoadedText: {
    color: "gray",
    fontSize: 22,
    height: "100%",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    flex: 1,
    width: "60%",
    paddingTop: "55%",
  },
  preLoadedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
