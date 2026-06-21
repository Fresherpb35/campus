import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    // Only set Content-Type for requests that have a body to avoid unnecessary CORS preflights
    const methodHasBody = ["post", "put", "patch"].includes((config.method || "").toLowerCase());
    if (methodHasBody) {
      if (config.data instanceof FormData) {
        // Let the browser set the multipart boundary automatically
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors like 401 Unauthorized
    if (error.response?.status === 401) {
      // Optional: Handle auto-logout or redirect here if not using AuthContext for it
      console.error("Unauthorized! Redirecting to login...");
    }
    return Promise.reject(error);
  },
);

export default apiClient;