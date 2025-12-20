import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get("csrfToken");
    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers["X-CSRF-Token"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("API Unauthorized: Possible session expiry");
    }
    return Promise.reject(error);
  }
);

export default api;
