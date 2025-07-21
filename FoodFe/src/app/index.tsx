import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useEffect } from "react";
import { userInforApi } from "@/utils/api";
import { useCurrentApp } from "@/context/app.context";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const RootPage = () => {
  const { setAppState } = useCurrentApp();

  useEffect(() => {
    
    async function prepare() {
      // await AsyncStorage.removeItem("access_token")
      try {
        // Check if access token exists before making API call
        const access_token = await AsyncStorage.getItem("access_token");
        if (!access_token) {
          console.log("🔑 No access token found - redirecting to welcome");
          router.replace("/auth/welcome");
          return;
        }

        const res = await userInforApi();
        if (res.data) {
          setAppState(res.data.user)
          router.replace("/(tabs)")
        } else {
          router.replace("/auth/welcome");
          
        }
      } catch (e) {
        console.warn(e);
        router.replace("/auth/welcome");
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);
  return (
    <>
    </>
  );
};

export default RootPage;
