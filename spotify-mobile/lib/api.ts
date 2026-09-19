import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
export const SERVER_URL="http://192.168.1.5:5000";
const api=axios.create({baseURL:SERVER_URL+"/api",timeout:10000});
api.interceptors.request.use(async config=>{const token=await AsyncStorage.getItem("token");if(token)config.headers.Authorization="Bearer "+token;return config;});
export default api;