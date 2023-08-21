import { NativeBaseProvider, Button, Box, Text, Avatar } from "native-base";
import { View, StyleSheet, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";

export default function FriendRequests({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [requestData, setRequestData] = React.useState([]);
  const [friends, setFriends] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [loading2, setLoading2] = React.useState(false);

  const [friendRequestUsers, setFriendRequestUsers] = React.useState([]);
  const [friendsUsers, setFriendsUsers] = React.useState([]);
  const [fromContacts, setFromContacts] = React.useState([]);
  const [allUsers, setAllUsers] = React.useState([]);

  // this use effect block gets the username that is currently logged in and retrieves the friend requests and friends json and stores in arrays

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
            const test2 = async () => {
              setLoading(false);
            };

            test2();
          });
      }

      retrieveUserID();
      getFriendReqs();
    }, 1000);
  }, [username]);

  // this use effect creates the array of users from the friend requests and friends json
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

  async function sendFriendReq(recipient) {
    // send the friend request
    await axios
      .post("http://hihello.asuscomm.com:3000/friendRequests/add", {
        user_id: username,
        friend_id: recipient,
      })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
    // remove that friend from suggested friends
    setFromContacts((current) =>
      current.filter((item) => !(item.id == recipient.id))
    );
  }

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
        const test2 = async () => {
          setLoading(false);
        };

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

  const renderItem = ({ item }) => {
    return (
      <Box
        px={5}
        py={2}
        rounded="md"
        // bg="#B4C6FF"
        my={2}
        width={400}
        height={"20"}
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
            <View paddingTop={"5%"}>
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
              paddingLeft={"10%"}
              paddingTop={"15%"}
              color={"white"}
              justifyContent={"flex-end"}
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
  return (
    <NativeBaseProvider>
      {friendRequestUsers.length == 0 ? (
        <Text></Text>
      ) : (
        <View style={styles.container}>
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
            paddingTop={"5%"}
          />
        </View>
      )}
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
    flex: 1,
  },
  friend_request_text: {
    color: "gray",
    paddingTop: "5%",
    paddingLeft: "5%",
    fontSize: 22,
  },
});
