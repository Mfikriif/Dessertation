import API from "../config/api";
import { withPolling } from "./pollingService";

export const kategoriService = {
  getAllKategori: async () => {
    return await API.get("/kategori");
  },

  updateKategori: async (id, data) => {
    return await API.put(`/kategori/update/${id}`, data);
  },

  createKategori: async (data) => {
    return await API.post(`/kategori/create`, data);
  },

  deleteKategori: async (id) => {
    return await API.delete(`/kategori/delete/${id}`);
  },
};

kategoriService.pollGetAllKategori = withPolling(kategoriService.getAllKategori, 5000);
