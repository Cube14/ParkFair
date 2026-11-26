import api, { endSession, refreshSession, startSession } from "./api";

const authService = {
  login: startSession,
  async getCurrentUser() {
    if (localStorage.getItem("token")) return (await api.get("/auth/me")).data.user;
    return (await refreshSession()).user;
  },
  logout: endSession,
};

export default authService;
