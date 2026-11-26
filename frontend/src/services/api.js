import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
});
const transport = { headers: { "X-ParkFair-Session": "web" } };
export const sessionEndedEvent = "parkfair:session-ended";
let accessToken;
let refreshInFlight;

function rememberSession(data) {
  accessToken = data.token;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return data;
}

function withSessionLock(operation) {
  return navigator.locks?.request("parkfair-web-session", operation) ?? operation();
}

export function startSession(credentials) {
  return withSessionLock(async () => rememberSession((await api.post("/auth/login", credentials, transport)).data));
}

export function refreshSession() {
  if (!refreshInFlight) {
    refreshInFlight = withSessionLock(async () =>
      rememberSession((await api.post("/auth/refresh", {}, transport)).data))
      .finally(() => { refreshInFlight = undefined; });
  }
  return refreshInFlight;
}

function clearSession() {
  accessToken = undefined;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function endSession() {
  return withSessionLock(async () => {
    await api.post("/auth/logout", {}, transport);
    clearSession();
    window.dispatchEvent(new Event(sessionEndedEvent));
  });
}

api.interceptors.request.use((config) => {
  const token = accessToken ?? localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  if (!config || ["/auth/login", "/auth/refresh", "/auth/logout"].includes(config.url)) throw error;
  const status = error.response?.status;
  if (status === 401 && !config.parkfairRetried) {
    config.parkfairRetried = true;
    try {
      if (!accessToken || config.headers.Authorization === `Bearer ${accessToken}`) await refreshSession();
      return api(config);
    } catch (refreshError) {
      if (![401, 403].includes(refreshError.response?.status)) throw refreshError;
    }
  }
  if (status === 401 || error.response?.data?.code === "ACCOUNT_DISABLED") {
    clearSession();
    window.dispatchEvent(new Event(sessionEndedEvent));
  }
  throw error;
});

export default api;
