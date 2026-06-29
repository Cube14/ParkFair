import api from "../../services/api";

const residentService = {
  getDashboard: async () => {
    const response = await api.get("/resident/dashboard");
    return response.data;
  },
};

export default residentService;