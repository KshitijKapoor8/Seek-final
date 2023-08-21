import React from "react";
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
} from "native-base";
import { MaterialIcons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import jewels_top from "../../assets/jewels_top.png";
import jewels_bottom from "../../assets/jewels_bottom.png";
import axios from "axios";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";

export default function Register({ navigation }) {
  const config = {
    dependencies: {
      "linear-gradient": LinearGradient,
    },
  };

  const [name, setName] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [errors, setErrors] = React.useState({});

  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      longitude = JSON.stringify(location.coords.longitude);
      latitude = JSON.stringify(location.coords.latitude);
      console.log(JSON.stringify(location));
      console.log(longitude);
      console.log(latitude);
    })();
  }, []);

  const validate = () => {
    var stringifyYay = number + "";
    if (stringifyYay.length < 10) {
      return false;
    }
    return true;
  };

  const onSubmit = () => {
    if (validate()) {
      axios
        .post("http://hihello.asuscomm.com:3000/sendSms/verify", {
          number: number,
        })
        .then((res) => {
          console.log("The Code is:");
          console.log(res.data);
          navigation.navigate("VerifyNumber", {
            code: res.data,
            name: name,
            number: number,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log("Failed validate");
    }
  };

  return (
    <NativeBaseProvider config={config}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Image
            source={jewels_top}
            style={styles.jewel_header}
            alt="jewel_header"
          />
          <Heading size="xl" fontWeight="600" style={styles.welcomeMessage}>
            Welcome to Seek
          </Heading>
          <Heading
            mt="1"
            color="#D3D3D3"
            fontWeight="medium"
            size="sm"
            paddingBottom={10}
          >
            Sign up to continue!
          </Heading>
          <FormControl isRequired>
            <Stack mx="4" paddingBottom={5}>
              <Input
                mt="3"
                size="md"
                InputLeftElement={
                  <Icon
                    as={<MaterialIcons name="person" />}
                    size={5}
                    ml="2"
                    color="muted.400"
                  />
                }
                type="username"
                color="white"
                placeholder="Name"
                onChangeText={(value) => setName(value)}
              />
              <InputGroup mt="3" paddingTop={10}>
                <InputLeftAddon children={"+1"} w="10%" />
                <Input
                  keyboardType={"phone-pad"}
                  type="number"
                  w="90%"
                  h="100%"
                  color="white"
                  placeholder="Number"
                  maxLength={10}
                  onChangeText={(value) => setNumber("1" + value)}
                />
              </InputGroup>
            </Stack>
          </FormControl>
          <TouchableOpacity style={{ zIndex: 1 }} onPress={onSubmit}>
            <Box
              px={30}
              py={2}
              rounded="10"
              marginTop={"5%"}
              bg={{
                linearGradient: {
                  colors: ["#7E78C6", "#5067B1"],
                  start: [0, 0],
                  end: [1, 0],
                },
              }}
              _text={{
                color: "white",
                justifyContent: "flex-start",
                fontSize: "15",
              }}
            >
              Next
            </Box>
          </TouchableOpacity>
          <Image
            source={jewels_bottom}
            style={styles.jewel2_header}
            alt="jewel_header"
          />
        </View>
      </TouchableWithoutFeedback>
    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  welcomeMessage: {
    color: "#B4C6FF",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  jewel_header: {
    width: 400,
    height: 250,
    position: "absolute",
    top: 0,
  },
  jewel2_header: {
    width: 600,
    height: 250,
    position: "absolute",
    bottom: 0,
    left: 0,
  },
});
