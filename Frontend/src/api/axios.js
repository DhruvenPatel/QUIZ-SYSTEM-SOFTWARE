import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:5001/api",
});

api.interceptors.request.use(
  (config) => {
    try {
      const userInfo = localStorage.getItem("userInfo");

      if (userInfo) {
        const parsedUser = JSON.parse(userInfo);

        if (parsedUser?.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      }
    } catch (error) {
      console.error("Failed to attach auth token:", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;