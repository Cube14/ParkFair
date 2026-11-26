import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const sessionEndedEvent = "parkfair:session-ended";
api.interceptors.response.use(undefined, (error) => {
  const sentToken = error.config?.headers?.Authorization;
  const currentToken = localStorage.getItem("token");
  const revoked = error.response?.status === 401 || error.response?.data?.code === "ACCOUNT_DISABLED";
  if (error.config?.url !== "/auth/login" && revoked && currentToken && sentToken === `Bearer ${currentToken}`) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event(sessionEndedEvent));
  }
  return Promise.reject(error);
});

export default api;