import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status == 401) {
      try {
        const refresh = localStorage.getItem("refresh_token");
        const response = await axios.post(
          "http://127.0.0.1:8000/api/token/refresh/",
          {
            refresh: refresh,
          },
        );
        localStorage.setItem('access_token', response.data.access)
        error.config.headers.Authorization = `Bearer ${response.data.access}`
        return api(error.config)
      } catch (error) {
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("access_token")
        window.location.href = "/login"
      }
    }
  },
);

export default api;
