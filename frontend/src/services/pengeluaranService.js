import API from "../config/api";
import { withPolling } from "./pollingService";

export const pengeluaranService = {
  getAll: async (params = {}) => {
    return await API.get("/pengeluaran", { params });
  },

  create: async (data) => {
    const response = await API.post("/pengeluaran", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await API.put(`/pengeluaran/update/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await API.delete(`/pengeluaran/delete/${id}`);
    return response.data;
  },
};

pengeluaranService.pollGetAll = withPolling(pengeluaranService.getAll, 5000);
