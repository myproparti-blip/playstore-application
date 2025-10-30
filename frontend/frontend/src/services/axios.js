/ src/axios.js
import axios from "axios";
import { Toast } from "antd-mobile";

// Token Helpers
const getToken = () => localStorage.getItem("authToken");
const setToken = (token) => localStorage.setItem("authToken", token);

// ✅ Detect local vs production environment
const isLocal = window.location.hostname === "localhost";

// ✅ API Base URL Setup
const API_URL = isLocal
  ? `${process.env.REACT_APP_API_URL_LOCAL || "http://localhost:5000"}/api`
  : `${process.env.REACT_APP_API_URL || "https://playstore-application-xxq1.vercel.app"}/api`;

console.log("🌍 Using API base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ✅ Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
api.interceptors.response.use(
  (response) => {
    if (response.data?.accessToken) setToken(response.data.accessToken);
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.request ? "No response from server!" : error.message);

    if (error.response) {
      const status = error.response.status;
      if (status === 401)
        Toast.show({ content: "Unauthorized! Please login again.", icon: "fail" });
      else if (status === 403)
        Toast.show({ content: "Forbidden! Access denied.", icon: "fail" });
      else if (status >= 500)
        Toast.show({ content: "Server error! Try again later.", icon: "fail" });
      else Toast.show({ content: message, icon: "fail" });
    } else {
      Toast.show({ content: message, icon: "fail" });
    }

    return Promise.reject(error);
  }
);

export default api;