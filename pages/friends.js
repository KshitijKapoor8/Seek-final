import { NativeBaseProvider, Button, Box, Text, Avatar } from "native-base";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/core";

export default function Friends({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [friends, setFriends] = React.useState([]);
  const [friendsUsers, setFriendsUsers] = React.useState([]);

  const [requestData, setRequestData] = React.useState([]);
  const [friendRequestUsers, setFriendRequestUsers] = React.useState([]);

  const isFocused = useIsFocused();
  useEffect(() => {
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
  }, [username, isFocused]);

  useEffect(() => {
    setTimeout(() => {
      async function getFriendReqs() {
        await axios
          .post(
            "http://hihello.asuscomm.com:3000/friendRequests/getIncomingFriendReqsByUserID",
            {
              id: username,
            }
          )
          .then((res) => {
            setRequestData(res.data);
          })
          .catch((err) => console.log(err))
          .finally(() => {
            const test2 = async () => {};

            test2();
          });
      }

      retrieveUserID();
      getFriendReqs();
    }, 1000);
  }, [username]);

  useEffect(() => {
    setFriendRequestUsers([]);
    async function loadUsers() {
      var index = -1;
      requestData.map(async function (onePerson) {
        index++;
        await axios
          .post("http://hihello.asuscomm.com:3000/users/getByID", {
            id: onePerson.sender_id,
          })
          .then((res) =>
            setFriendRequestUsers((friendRequestUsers) => [
              ...friendRequestUsers,
              res.data,
            ])
          )
          .catch((err) => console.log(err));
      });
    }
    loadUsers();
  }, [requestData]);

  // this use effect creates the array of users from the friends
  useEffect(() => {
    setFriendsUsers([]);
    async function loadUsers() {
      var index = -1;
      friends.map(async function (onePerson) {
        index++;
        await axios
          .post("http://hihello.asuscomm.com:3000/users/getByID", {
            id:
              onePerson.friend_id === username
                ? onePerson.user_id
                : onePerson.friend_id,
          })
          .then((res) =>
            setFriendsUsers((friendsUsers) => [...friendsUsers, res.data])
          )
          .catch((err) => console.log(err));
      });
    }
    loadUsers();
  }, [friends]);

  async function friendAccepted(sender) {
    // this request deletes friend request
    await axios
      .post("http://hihello.asuscomm.com:3000/friendRequests/acceptFriendReq", {
        sender_id: sender,
        recieve_id: username,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // this post request adds the sender to the user's friends list
    await axios
      .post("http://hihello.asuscomm.com:3000/friends/add", {
        id1: sender,
        id2: username,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // this updates incoming friend requests and resets the state setRequestData so that it rerenders
    await axios
      .post(
        "http://" +
          "hihello.asuscomm.com" +
          ":3000/friendRequests/getIncomingFriendReqsByUserID",
        {
          id: username,
        }
      )
      .then((res) => {
        setRequestData(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        const test2 = async () => {};

        test2();
      });
  }

  async function friendDenied(sender) {
    // this call deletes the friend request entirely! loser
    await axios
      .post("http://hihello.asuscomm.com:3000/friendRequests/acceptFriendReq", {
        sender_id: sender,
        recieve_id: username,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));

    // this updates incoming friend requests and resets the state setRequestData so that it rerenders
    await axios
      .post(
        "http://" +
          "hihello.asuscomm.com" +
          ":3000/friendRequests/getIncomingFriendReqsByUserID",
        {
          id: username,
        }
      )
      .then((res) => {
        setRequestData(res.data);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        const test2 = async () => {
          setLoading(false);
        };

        test2();
      });
  }

  function navigateToProfile(userID) {
    navigation.navigate("Memories", { userID: userID });
  }


  const renderItem = ({ item }) => {
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
          {item[0].pfp == null ? (
            <Text
              justifyContent={"flex-start"}
              color={"white"}
              paddingTop={"15%"}
            >
              {" "}
              No pfp
            </Text>
          ) : (
            <View paddingLeft={"1.5%"} paddingTop={"5%"}>
              <Avatar
                source={{
                  uri: item[0].pfp,
                }}
              ></Avatar>
            </View>
          )}

          {item[0].name == null ? (
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
              {item[0].name}
            </Text>
          )}
        </View>

        <View
          flexDirection={"row"}
          justifyContent={"flex-end"}
          width={"50%"}
          paddingTop={"2%"}
        >
          <Button
            onPress={() => friendAccepted(item[0].id)}
            justifyContent="flex-end"
            paddingLeft="10%"
            paddingRight="5%"
            paddingTop="7%"
            backgroundColor={"none"}
          >
            <AntDesign name="checkcircle" size={24} color="#3B3E79" />
          </Button>

          <Button
            onPress={() => friendDenied(item[0].id)}
            paddingTop="7%"
            backgroundColor={"none"}
          >
            <Entypo name="circle-with-cross" size={26} color="#3B3E79" />
          </Button>
        </View>
      </Box>
    );
  };

  const renderItem2 = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => navigateToProfile(item[0].id)}>
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
              {item[0].pfp == null ? (
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
                      uri: item[0].pfp,
                    }}
                  ></Avatar>
                </View>
              )}

              {item[0].name == null ? (
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
                  {item[0].name}
                </Text>
              )}
            </View>
          </Box>
      </TouchableOpacity>
        
    );
  };

  // const goToMemories = () => {
  //   navigation.navigate('Memories'); // Replace 'FriendsTab' with the name of your desired tab screen
  // };

  const goToMainfeed = () => {
    navigation.navigate("MainFeed"); // Replace 'FriendsTab' with the name of your desired tab screen
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

        {friendRequestUsers.length == 0 ? (
          // When there are no friend requests
          <View style={styles.container}>
            {friendsUsers.length != 0 ? (
              <View>
                <Text bold style={styles.friends_text}>
                  Friends
                </Text>
                <FlatList
                  data={friendsUsers}
                  renderItem={renderItem2}
                  keyExtractor={(item) =>
                    item[0].id.toString() +
                    new Date().getTime().toString() +
                    Math.floor(
                      Math.random() * Math.floor(new Date().getTime())
                    ).toString()
                  }
                  paddingTop={"5%"}
                />
              </View>
            ) : (
              <View style={styles.preLoadedContainer}>
                <Text style={styles.preLoadedText}>{`Nothing here :(
                                                  Invite your friends and start seeking!`}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.container}>
            <View style={styles.friendRequestContainer}>
              <Text bold style={styles.friend_request_text}>
                Friend Requests
              </Text>
              <FlatList
                data={friendRequestUsers}
                renderItem={renderItem}
                keyExtractor={(item) =>
                  item.id +
                  new Date().getTime().toString() +
                  Math.floor(
                    Math.random() * Math.floor(new Date().getTime())
                  ).toString()
                }
              />
            </View>
            <View style={styles.friendContainer}>
              <Text bold style={styles.friends_text2}>
                Friends
              </Text>
              <FlatList
                data={friendsUsers}
                renderItem={renderItem2}
                keyExtractor={(item) =>
                  item[0].id.toString() +
                  new Date().getTime().toString() +
                  Math.floor(
                    Math.random() * Math.floor(new Date().getTime())
                  ).toString()
                }
              />
            </View>
          </View>
        )}
      </View>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
    justifyContent: "flex-start",
  },
  friendRequestContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  friendContainer: {
    flex: 4,
    justifyContent: "flex-start",
  },
  friends_text: {
    color: "gray",
    paddingLeft: "5%",
    fontSize: 22,
    paddingTop: "5%",
  },
  spinner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    width: "100%",
    paddingHorizontal: "3%",
    height: "12.5%",
    paddingTop: Platform.OS === "ios" ? "11%" : 0,
  },
  headerText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
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
  friend_request_text: {
    color: "gray",
    paddingTop: "5%",
    paddingLeft: "5%",
    fontSize: 22,
  },
  friends_text2: {
    color: "gray",
    paddingLeft: "5%",
    fontSize: 22,
    paddingTop: "5%",
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
