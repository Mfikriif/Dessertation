import API from "../config/api";

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
