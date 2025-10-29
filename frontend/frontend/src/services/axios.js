import axios from "axios";
import { Toast } from "antd-mobile";

const getToken = () => localStorage.getItem("authToken");
const setToken = (token) => localStorage.setItem("authToken", token);

// Use correct API URL depending on hostname
const API_URL =
  window.location.hostname === "localhost"
    ? process.env.REACT_APP_API_URL_LOCAL
    : process.env.REACT_APP_API_URL_LAN;

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    if (response.data?.accessToken) setToken(response.data.accessToken);
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const msg = error.response.data?.message || "Something went wrong!";
      if (status === 401) Toast.show({ content: "Unauthorized! Please login again.", icon: "fail" });
      else if (status === 403) Toast.show({ content: "Forbidden! Access denied.", icon: "fail" });
      else if (status >= 500) Toast.show({ content: "Server error! Try later.", icon: "fail" });
      else Toast.show({ content: msg, icon: "fail" });
    } else if (error.request) {
      Toast.show({ content: "No response from server. Check your connection!", icon: "fail" });
    } else {
      Toast.show({ content: error.message, icon: "fail" });
    }
    return Promise.reject(error);
  }
);

export default api;