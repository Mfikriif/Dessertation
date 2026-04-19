import API from "../config/api";

export const produkService = {
  getAllProduk: async () => {
    return await API.get("/produk");
  },

  //   createProduk: async (data) => {
  //     try {
  //       const response = await API.post("/produk", data);
  //       return response.data;
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  //   updateProduk: async (id, data) => {
  //     try {
  //       const response = await API.put(`/produk/${id}`, data);
  //       return response.data;
  //     } catch (error) {
  //       throw error;
  //     }
  //   },

  //   deleteProduk: async (id) => {
  //     try {
  //       const response = await API.delete(`/produk/${id}`);
  //       return response.data;
  //     } catch (error) {
  //       throw error;
  //     }
  //   },
};
