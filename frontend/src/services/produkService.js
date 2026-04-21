import API from "../config/api";

export const produkService = {
  getAllProduk: async () => {
    return await API.get("/produk");
  },

  getProdukByIdKategori: async (id_kategori) => {
    return await API.get(`/produk/id-kategori/${id_kategori}`);
  },

  createProduk: async (data) => {
    try {
      const response = await API.post("/produk", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProduk: async (id, data) => {
    try {
      const response = await API.put(`/produk/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteProduk: async (id) => {
    try {
      const response = await API.delete(`/produk/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
