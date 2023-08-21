import { Camera, CameraType, FlashMode } from "expo-camera";
import { useState, useEffect, useContext } from "react";
import { Image, Dimensions, ActivityIndicator } from "react-native";
import { MaterialIcons, Entypo } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, NativeBaseProvider } from "native-base";
import axios from "axios";
// import { RNS3 } from "react-native-aws3";
const { height, width } = Dimensions.get("window");
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import AppContext from "../../components/AppContext";

export default function CameraView({ navigation }) {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [camera, setCamera] = useState(null); // sets the camera reference
  const [image, setImage] = useState("");
  const [name, setName] = useState();
  const [cameraZoom, setCameraZoom] = useState(0);
  const [flash, setFlash] = useState(FlashMode.off);
  const [flashButtonColor, setFlashButtonColor] = useState("white");
  const [isImageSizeSet, setIsImageSizeSet] = useState(false);
  const [imageSize, setImageSize] = useState("1440x1080");
  const [ratio, setRatio] = useState("4:3");
  const [awsLink, setAwsLink] = useState("");
  const [renderCamera, setRenderCamera] = useState(false);
  const isFocused = useIsFocused();

  const globalStates = useContext(AppContext);
  const interactionData = JSON.parse(globalStates.interactionData);
  console.log("user", globalStates.userInfo.id);
  var userID = globalStates.userInfo.id;
  var friendID =
    interactionData.user_one == userID
      ? interactionData.user_two
      : interactionData.user_one;

  setTimeout(() => {
    setRenderCamera(true);
  }, 200);

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener("focus", () => {
  //     setTimeout(() => {setRenderCamera(true)}, 200);
  //   });
  //   return unsubscribe;
  // }, [navigation]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
    getData();

    if (flash === FlashMode.off) {
      setFlashButtonColor("white");
    }
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userData");
      setUserId(JSON.parse(jsonValue).id);
    } catch (e) {}
  };

  const prepareSize = async () => {
    if (Platform.OS === "android") {
      const sizes = await camera.getAvailablePictureSizesAsync(ratio);
      sizes.forEach((size) => {
        const dimensions = size.split("x");
        if (dimensions[1] <= "1080") {
          setImageSize(size);
        }
      });
    }
    setIsImageSizeSet(true);
  };

  // the camera must be loaded in order to
  // access the supported ratios
  const setCameraReady = async () => {
    if (!isImageSizeSet) {
      await prepareSize();
    }
  };

  if (!permission) {
    return <View style={styles.container}></View>;
  }

  if (!permission.granted) {
    return <View style={styles.container}></View>;
  }

  // function zoomIn() {
  //   if (cameraZoom == 0.01) {
  //     setCameraZoom(0);
  //   } else {
  //     setCameraZoom(0.01);
  //   }
  // }

  function toggleCameraType() {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  }

  const takePicture = async () => {
    const photo = await camera.takePictureAsync({
      base64: true,
      exif: true,
      skipProcessing: true,
    });
    setImage(photo.uri);
    var final = photo.uri.substr(photo.uri.lastIndexOf("/") + 1);
    setName(final);
  };

  async function uploadImage() {
    const formData = new FormData();

    const fileInfo = await FileSystem.getInfoAsync(image);
    const fileBlob = await FileSystem.readAsStringAsync(image, {
      encoding: "base64",
    });

    const fileExtension = fileInfo.uri.split(".").pop();
    const fileName = `${fileInfo.uri.split("/").pop()}.${fileExtension}`;

    formData.append("image", {
      uri: fileInfo.uri,
      name: fileName,
      type: `image/${fileExtension}`,
    });

    axios
      .post(
        "http://hihello.asuscomm.com:3000/uploadImage/img-upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        axios
          .post(
            "http://hihello.asuscomm.com:3000/interaction/closeInteraction",
            {
              userId: userID,
              link: res.data.imageLocation,
              id: interactionData.id,
            }
          )
          .then((res1) => {
            axios
              .post("http://hihello.asuscomm.com:3000/interaction/close", {
                id: interactionData.id,
              })
              .then((res2) => {
                globalStates.setInteractionState("stopped");
                clearRunningInteractions();
              });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

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

  function newImage() {
    setImage("");
  }

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <View />
        <View style={styles.wrapper}>
          <View style={styles.innerContent}>
            {renderCamera ? (
              <Camera
                onCameraReady={setCameraReady}
                ref={(ref) => {
                  setCamera(ref);
                }}
                style={styles.cameraContent}
                ratio={"4:3"}
                flashMode={flash}
                zoom={cameraZoom}
                type={type}
                pictureSize={imageSize}
              />
            ) : (
              <LinearGradient
                colors={["#7E78C6", "#5067B1"]}
                style={styles.cameraBackground}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ActivityIndicator
                  style={styles.cameraLoad}
                  size={"large"}
                  color="#fff"
                />
              </LinearGradient>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <IconButton
            mb="4"
            variant="solid"
            bg="indigo.500"
            color="indigo"
            borderRadius="full"
            style={styles.icon}
            opacity={0.8}
            onPress={toggleCameraType}
            icon={
              <MaterialIcons name="flip-camera-ios" size={30} color="white" />
            }
          />
          <TouchableOpacity style={styles.button} onPress={takePicture} />
          <IconButton
            mb="4"
            variant="solid"
            bg="indigo.500"
            colorScheme="indigo"
            borderRadius="full"
            style={styles.icon}
            opacity={0.8}
            onPress={() => {
              setFlashButtonColor(flash === FlashMode.off ? "yellow" : "white");
              setFlash(flash === FlashMode.off ? FlashMode.on : FlashMode.off);
            }}
            icon={<Entypo name="flash" size={30} color={flashButtonColor} />}
          />
        </View>

        {image && (
          <View style={styles.container}>
            <View style={styles.wrapper}>
              <View style={styles.innerContent}>
                <Image source={{ uri: image }} style={styles.cameraContent} />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <IconButton
                mb="4"
                variant="solid"
                bg="indigo.500"
                colorScheme="indigo"
                borderRadius="full"
                style={styles.icon}
                opacity={1}
                icon={
                  <Entypo
                    name="cross"
                    size={30}
                    color="white"
                    onPress={newImage}
                  />
                }
              />

              <IconButton
                mb="4"
                variant="solid"
                bg="indigo.500"
                colorScheme="indigo"
                borderRadius="full"
                style={styles.icon}
                opacity={1}
                icon={
                  <Entypo
                    name="check"
                    size={30}
                    color="white"
                    onPress={uploadImage}
                  />
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
    flex: 1,
    position: "absolute",
    backgroundColor: "#121212",
    height: "100%",
    width: "100%",
  },
  wrapper: {
    flex: 1,
    position: "absolute",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBackground: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  cameraLoad: {
    flex: 1,
    position: "absolute",
  },
  innerContent: {
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
  cameraContent: {
    flex: 1,
    position: "relative",
    width: "100%",
  },
  middleicon: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
  },
  displayImage: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    aspectRatio: 3 / 4,
    borderRadius: 15,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-evenly",
    bottom: "15%",
  },
  icon: { marginBottom: 30 },
  checkmarkicon: { marginBottom: 35 },
  button: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
});
