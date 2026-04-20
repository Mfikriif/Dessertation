import API from "../config/api";

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
};
