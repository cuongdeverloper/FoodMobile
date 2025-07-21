import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Hàm sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const baseURL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_API_URL
    : process.env.EXPO_PUBLIC_IOS_API_URL;

const instance = axios.create({
  baseURL,
});

// Add a request interceptor
instance.interceptors.request.use(
  async function (config) {
    // await sleep(5000);

    // // Optional: Gửi header delay nếu bạn dùng bên server
    // config.headers["X-Delay"] = 5000;
    const access_token = await AsyncStorage.getItem("access_token");
    config.headers["Authorization"] = `Bearer ${access_token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default instance;
