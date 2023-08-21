import * as React from "react";
import { Text, View, StyleSheet, Dimensions } from "react-native";
import {
  NavigationHelpersContext,
  useNavigationBuilder,
  createNavigatorFactory,
  TabRouter,
} from "@react-navigation/native";
import InteractionTabBar from "../components/InteractionTabBar";
import AppContext from "../components/AppContext";
import { useContext, useCallback, useState, useRef, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

function Navigator({
  initialRouteName,
  children,
  screenOptions,
  tabBarStyle,
  contentStyle,
}) {
  const { state, navigation, descriptors } = useNavigationBuilder(TabRouter, {
    children,
    screenOptions,
    initialRouteName,
  });
  const globalStates = useContext(AppContext);
  const interactionData = JSON.parse(globalStates.interactionData);
  const [expireTime, setExpireTime] = useState(
    interactionData.created_at + 300000 - Date.now()
  );
  const timerRef = useRef(expireTime);
  // const friendInfo = JSON.parse(globalStates.friendInfo);
  const [currentPage, setCurrentPage] = useState(0);
  const [prevPage, setPrevPage] = useState(0);
  const offset = useSharedValue(0);

  const pagerRef = useRef();

  function initalPage() {
    state.routes.map((route, index) => {
      if (route.name == initialRouteName) {
        return index;
      }
    });
  }

  useFocusEffect(
    useCallback(() => {
      const timerId = setInterval(() => {
        timerRef.current -= 1000;
        if (timerRef.current <= 0) {
          clearInterval(timerId);
        } else {
          setExpireTime(timerRef.current);
        }
      }, 1000);
      return () => {
        clearInterval(timerId);
      };
    }, [])
  );

  useEffect(() => {
    setTimeout(() => {
      state.routes.map((route, index) => {
        if (route.name == initialRouteName) {
          pagerRef.current.setPage(index);
        }
      });
    }, 100);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(offset.value),
        },
      ],
    };
  });

  function InteractionHeader() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.timeContainer, animatedStyle]}>
          <Text style={styles.time}>
            {Math.floor(expireTime / 60000)}:
            {Math.abs(Math.floor(expireTime / 1000)) % 60 < 10
              ? "0" + (Math.abs(Math.floor(expireTime / 1000)) % 60)
              : Math.abs(Math.floor(expireTime / 1000)) % 60}
          </Text>
        </Animated.View>
      </View>
    );
  }

  function renderPages() {
    return state.routes.map((route, index) => {
      const { options } = descriptors[route.key];
      const isFocused = currentPage === index;
      const renderScene = descriptors[route.key].render;
      return <View key={route.key}>{renderScene()}</View>;
    });
  }

  return (
    <NavigationHelpersContext.Provider value={navigation}>
      <InteractionHeader />
      <PagerView
        style={[{ flex: 1 }, contentStyle]}
        onPageSelected={(position) => {
          setPrevPage(currentPage);
          setCurrentPage(position.nativeEvent.position);
          if (position.nativeEvent.position !== 1) {
            offset.value = 0;
          } else {
            offset.value = -100;
          }
        }}
        ref={pagerRef}
      >
        {renderPages()}
      </PagerView>
      <InteractionTabBar
        state={state}
        descriptors={descriptors}
        navigation={navigation}
        currentPage={currentPage}
        pagerRef={pagerRef}
      />
    </NavigationHelpersContext.Provider>
  );
}

export const createNavigator = createNavigatorFactory(Navigator);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "2%",
    backgroundColor: "#121212",
    paddingTop: Platform.OS === "ios" ? "7%" : 0,
  },
  header: {
    position: "relative",
    backgroundColor: "blue",
  },
  timeContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
    marginTop: "2%",
  },
  time: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
