import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { penggunaService } from "../services/penggunaService";

export const usePengguna = () => {
  const [pengguna, setPengguna] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPengguna = async () => {
    try {
      setIsLoading(true);
      const response = await penggunaService.getAllPengguna();
      const resultData = response.data?.data;
      setPengguna(resultData || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPengguna([]);
      } else {
        setError(err);
        console.error("Error fetching pengguna:", err);
        toast.error("Gagal mengambil data pengguna");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengguna();
  }, []);

  const addPengguna = async (data) => {
    try {
      setIsLoading(true);
      await penggunaService.createPengguna(data);
      await fetchPengguna();
      toast.success("Pengguna berhasil ditambahkan!");
      return { success: true };
    } catch (err) {
      console.error("Error adding pengguna:", err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan pengguna");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const editPengguna = async (id, data) => {
    try {
      setIsLoading(true);
      await penggunaService.updatePengguna(id, data);
      await fetchPengguna();
      toast.success("Pengguna berhasil diperbarui!");
      return { success: true };
    } catch (err) {
      console.error("Error editing pengguna:", err);
      toast.error(err?.response?.data?.message || "Gagal mengupdate pengguna");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePengguna = async (id) => {
    try {
      setIsLoading(true);
      await penggunaService.deletePengguna(id);
      await fetchPengguna();
      toast.success("Pengguna berhasil dihapus!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting pengguna:", err);
      toast.error(err?.response?.data?.message || "Gagal menghapus pengguna");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { pengguna, isLoading, error, fetchPengguna, addPengguna, editPengguna, deletePengguna };
};
