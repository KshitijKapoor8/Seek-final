import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import Interaction from "./Interaction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { set } from "react-native-reanimated";

const InteractionList = ({ navigation }) => {
  const [interactions, setInteractions] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [interactionMargin, setInteractionMargin] = useState(0);
  const [layout, setLayout] = useState({
    width: 0,
    height: 0,
  });
  const pageSize = 1;

  // Fetches userID from AsyncStorage
  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");

        if (jsonValue != null) {
          setUserID(JSON.parse(jsonValue).userID);
        } else {
          console.log("userID not found");
        }
      } catch (e) {
        console.log(e);
      }

      return null;
    };

    fetchUserID();
  }, [userID]);

  // Fetches friends of user
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await axios.post(
          "http://hihello.asuscomm.com:3000/friends/getUserFriends",
          {
            id: userID,
          }
        );
        setFriends(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchFriends();
  }, [userID]);

  // Fetches interactions for each friend
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        setLoading(true);
        // Fetch interactions for each friend
        async function getInteractionPromises() {
          var results = [];
          for (let friend of friends) {
            await axios
              .post("http://hihello.asuscomm.com:3000/interaction/getByUser", {
                user_id:
                  friend.friend_id === userID
                    ? friend.user_id
                    : friend.friend_id,
              })
              .then((res) => {
                // console.log(res.data[1])
                // if(res.data[1] && res.data[1].done === 2) {
                //   results.push(res);
                // }
                for (let interaction of res.data) {
                  if (interaction.done === 2) {
                    results.push(interaction);
                  }
                }
              });
          }
          return results;
        }
        let allInteractions = await getInteractionPromises();
        // Fetch user information for user_one and user_two
        let userInfo = [];
        for (let i = 0; i < allInteractions.length; i++) {
          const interaction = allInteractions[i];
          const [userOneInfo, userTwoInfo] = await fetchUserInteractionInfo(
            interaction.user_one,
            interaction.user_two
          );
          allInteractions[i] = [
            allInteractions[i],
            userOneInfo[0],
            userTwoInfo[0],
          ];
        }
        allInteractions = [
          ...new Set(allInteractions.map((a) => JSON.stringify(a))),
        ]
          .map((a) => JSON.parse(a))
          .sort((a, b) => a[0].created_at - b[0].created_at);

        setInteractions(allInteractions.reverse());
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, [friends]);

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

  return (
    <View
      style={styles.container}
      onLayout={(event) => setLayout(event.nativeEvent.layout)}
    >
      {!loading ? (
        <FlatList
          style={styles.container}
          data={interactions}
          renderItem={({ item }) => (
            <Interaction
              interactionData={item}
              navigation={navigation}
              userID={userID}
            />
          )}
          keyExtractor={(item) => item[0].id.toString()}
        />
      ) : (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#7E78C6"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  loading: {
    flex: 1,
    alignSelf: "center",
  },
});

export default InteractionList;
