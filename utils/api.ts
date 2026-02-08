// utils/api.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE = "https://sfpapi.osacabd.org/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// attach token before each request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
