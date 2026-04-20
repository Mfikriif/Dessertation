import axios from "axios";
import API from "../config/api";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await API.post(`/auth/login`, {
        email,
        password,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Login gagal.");
      }
      throw error;
    }
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Tambahkan logika hapus user dari state / redirect jika perlu
    try {
      const response = await API.post(`/auth/logout`, {
        token: token,
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || "Logout gagal.");
      }
      throw error;
    }
  },
};
