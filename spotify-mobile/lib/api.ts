import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SERVER_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://tunestream-fth1.onrender.com";

const api = axios.create({
  baseURL: SERVER_URL + "/api",
  timeout: 15000,
});

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;
