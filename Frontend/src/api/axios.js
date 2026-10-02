import axios from "axios";

const api = axios.create({
  baseURL: "https://quiz-rho-jade.vercel.app/api",
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
