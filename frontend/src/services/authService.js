import api from "./api";

const authService = {

  login: async (credentials) => {

    const response =
      await api.post(
        "/auth/login",
        credentials
      );

    if (response.data.token) {

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

    }

    return response.data;
  },

  getCurrentUser: async () => {

    const response =
      await api.get("/auth/me");

    return response.data.user;

  },

  logout: async () => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return true;

  },

};

export default authService;