import API from "../config/api";
import { withPolling } from "./pollingService";

export const bahanBakuService = {
  getAll: async () => {
    return await API.get("/bahan-baku");
  },

  getById: async (id) => {
    return await API.get(`/bahan-baku/id/${id}`);
  },

  search: async (query) => {
    return await API.get(`/bahan-baku/search?bahanbaku=${query}`);
  },

  create: async (data) => {
    const response = await API.post("/bahan-baku", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await API.put(`/bahan-baku/update/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await API.delete(`/bahan-baku/delete/${id}`);
    return response.data;
  },
};

// Menambahkan metode polling dengan interval 5 detik untuk operasi GET
bahanBakuService.pollAll = withPolling(bahanBakuService.getAll, 5000);
bahanBakuService.pollById = withPolling(bahanBakuService.getById, 5000);
bahanBakuService.pollSearch = withPolling(bahanBakuService.search, 5000);
