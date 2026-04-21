import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { kategoriService } from "../services/kategoriService";

export const useKategori = () => {
  const [kategori, setKategori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKategori = async () => {
    try {
      setIsLoading(true);
      const response = await kategoriService.getAllKategori();
      const resultData = response.data?.data;
      setKategori(resultData || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching kategori:", err);
      toast.error("Gagal mengambil data kategori");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  const editKategori = async (id, data) => {
    try {
      setIsLoading(true);
      await kategoriService.updateKategori(id, data);
      await fetchKategori();
      toast.success("Kategori berhasil diperbarui!");
      return { success: true };
    } catch (err) {
      console.error("Error editing kategori:", err);
      toast.error(err?.response?.data?.message || "Gagal mengupdate kategori");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const addKategori = async (data) => {
    try {
      setIsLoading(true);
      await kategoriService.createKategori(data);
      await fetchKategori();
      toast.success("Kategori berhasil ditambahkan!");
      return { success: true };
    } catch (err) {
      console.error("Error adding kategori:", err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan kategori");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { kategori, isLoading, error, fetchKategori, editKategori, addKategori };
};
