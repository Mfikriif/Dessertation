import API from "../config/api";

export const pengeluaranService = {
  getAll: async () => {
    return await API.get("/pengeluaran");
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
