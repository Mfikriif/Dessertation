import API from "../config/api";

export const penggunaService = {
  getAllPengguna: async () => {
    return await API.get("/pengguna");
  },

  createPengguna: async (data) => {
    return await API.post("/pengguna", data);
  },

  updatePengguna: async (id, data) => {
    return await API.put(`/pengguna/update/${id}`, data);
  },

  deletePengguna: async (id) => {
    return await API.delete(`/pengguna/delete/${id}`);
  },

  updatePassword: async (id, password) => {
    return await API.put(`/pengguna/update-password/${id}`, { password });
  },
};
