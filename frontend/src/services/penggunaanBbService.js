import API from "../config/api";

export const penggunaanBbService = {
  create: async (data) => {
    const response = await API.post("/penggunaan-bb", data);
    return response.data;
  },
};
