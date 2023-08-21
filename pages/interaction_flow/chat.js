import {
  NativeBaseProvider,
  Text,
  Input,
  View,
  FlatList,
  Box,
  Avatar,
  Pressable,
  Divider,
  Icon,
} from "native-base";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import AppContext from "../../components/AppContext";
import { LinearGradient } from "expo-linear-gradient";

export default function Chat({ navigation }) {
  const [user, setUser] = useState("");
  const [otherUser, setOtherUser] = useState({});
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [USERID, setUSERID] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  const [prevID, setPrevID] = useState("");

  const [testOther, setTestOther] = useState("");
  const [interaction, setInteraction] = useState("");
  const globalStates = useContext(AppContext);
  const interactionData = JSON.parse(globalStates.interactionData);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [friendInfoLoading, setFriendInfoLoading] = useState(true);
  let scrollRef = useRef(null);

  const config = {
    dependencies: {
      "linear-gradient": LinearGradient,
    },
  };

  const getUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userData");
      if (jsonValue != null) {
        setUSERID(JSON.parse(jsonValue).userID);
        setInteraction(interactionData);
        if (interactionData.user_one == JSON.parse(jsonValue).userID) {
          setTestOther(interactionData.user_two);
        } else {
          setTestOther(interactionData.user_one);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const KeyboardButton = ({ onPress }) => (
    <TouchableOpacity style={styles.keyboardButton} onPress={onPress}>
      <Text style={styles.keyboardButtonText}>Press Me</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchData = async () => {
      await getMessages();
    };

    const interval = setInterval(fetchData, 3500); // Poll every 3.5 seconds

    setLoading(true);
    fetchData(); // Fetch initial data
    setLoading(false);
    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(interval);
    };
  }, [USERID, interaction]);

  useEffect(() => {
    axios
      .post("http://hihello.asuscomm.com:3000/users/getById", { id: testOther })
      .then((res) => {
        setOtherUser(res.data[0]);
      });
  }, [testOther]);

  const getMessages = async () => {
    try {
      const response = await axios.post(
        "http://hihello.asuscomm.com:3000/chat_messages/getByInteraction",
        {
          interaction_id: interaction.id,
        }
      );
      const newMessages = response.data;
      setMessages(newMessages);

      if (newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1];
        setPrevID(lastMessage.sender_id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const messageBoxes = ({ item, index }) => {
    let spacing = 5;
    let bottomSpacing = null;

    if (index > 0 && item.sender_id === messages[index - 1].sender_id) {
      spacing = 1;
    }

    // Calculate bottomSpacing
    if (index === messages.length - 1) {
      bottomSpacing = 3;
    }

    if (item.sender_id !== testOther) {
      return (
        <View style={styles.boxStyles}>
          {/* <Box bg={{
            linearGradient: {
              colors: ['lightBlue.300', 'violet.800'],
              start: [0, 0],
              end: [1, 0]
            }
          }} p="12" rounded="xl" _text={{
            fontSize: 'md',
            fontWeight: 'medium',
            color: 'warmGray.50',
            textAlign: 'center'
          }}>
              This is a Box with Linear Gradient
          </Box> */}

          <Box
            px={5}
            py={2}
            rounded="10"
            bg={{
              linearGradient: {
                colors: ["#7E78C6", "#5067B1"],
                start: [0, 0],
                end: [1, 0],
              },
            }}
            marginTop={spacing}
            marginBottom={bottomSpacing}
            width={200}
            height={"auto"}
            _text={{
              color: "white",
              justifyContent: "flex-start",
              fontSize: "15",
            }}
          >
            {item.content}
          </Box>
        </View>
      );
    } else {
      return (
        <Box
          px={5}
          py={2}
          rounded="10"
          bg="#242733"
          marginTop={spacing}
          marginBottom={bottomSpacing}
          width={200}
          height={"auto"}
          flexDirection={"row"}
          _text={{
            color: "white",
            fontSize: "15",
          }}
        >
          {item.content}
        </Box>
      );
    }
  };

  const handleSend = async () => {
    await axios
      .post("http://hihello.asuscomm.com:3000/chat_messages/sendMsg", {
        interaction_id: interaction.id,
        sender_id: USERID,
        content: text,
      })
      .then((response) => {
        getMessages();
      })
      .catch((err) => {
        console.log(err);
      });
    setText("");
  };

  return (
    <NativeBaseProvider config={config}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.content}
          behavior={Platform.OS === "ios" ? "padding" : "position"}
          contentContainerStyle={styles.content}
          onKeyboardWillShow={(frames) => {
            const keyboardFrame = frames.endCoordinates;
            setKeyboardHeight(keyboardFrame.height);
          }}
          keyboardVerticalOffset={
            Platform.OS === "ios" ? 110 : keyboardHeight - 180 // Adjust the offset as needed (e.g., -20)
          }
          scrollEnabled={true}
        >
          {otherUser != undefined ? (
            <View style={styles.headerContainer}>
              <Avatar
                style={styles.avatarStyles}
                size="9"
                source={{
                  uri: otherUser.pfp,
                }}
              />
              <Text bold style={styles.userName}>
                {otherUser.name}
              </Text>
            </View>
          ) : (
            <View></View>
          )}
          <Divider bg="gray.700" />

          {messages.length > 0 ? (
            <FlatList
              data={messages}
              renderItem={messageBoxes}
              keyExtractor={(item) => item.id}
              ref={(it) => (scrollRef.current = it)}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: false })
              }
            />
          ) : (
            <View style={styles.preLoadedContainer}>
              <Text style={styles.preLoadedText}>{`No messages yet! 
                                                  Send one to get the conversation rolling.`}</Text>
            </View>
          )}

          <Input
            size="lg"
            style={styles.inputStyles}
            w="100%"
            // InputRightElement={
            //   <Button
            //     size="xs"
            //     rounded="none"
            //     w="1/6"
            //     h="full"
            //     onPress={handleSend}
            //   >
            //     Send
            //   </Button>
            // }

            InputRightElement={
              <Pressable
                onPress={() => {
                  handleSend();
                }}
              >
                <Icon
                  as={<Feather name={"send"} />}
                  size={5}
                  mr="2"
                  color="muted.400"
                />
              </Pressable>
            }
            value={text}
            onChangeText={setText}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />

          {/* <InputAccessoryView nativeID="keyboardButton">
              <KeyboardButton onPress={() => alert('Button pressed!')} />
            </InputAccessoryView> */}

          {/* <TextInput /> */}
        </KeyboardAvoidingView>
      </View>
    </NativeBaseProvider>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingBottom: "5%", // Add more padding to move everything up more
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  userName: {
    color: "white",
    fontSize: 22,
    marginLeft: "2%",
  },
  inputStyles: {
    color: "white",
  },
  boxStyles: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  avatarStyles: {
    marginHorizontal: "3%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: "4.0%",
  },
  header: {
    flexDirection: "row",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  keyboardButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    paddingTop: "65%",
  },
  preLoadedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
