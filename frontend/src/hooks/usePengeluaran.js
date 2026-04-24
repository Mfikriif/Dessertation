import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { pengeluaranService } from "../services/pengeluaranService";

export const usePengeluaran = () => {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPengeluaran = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await pengeluaranService.getAll();
      setPengeluaranList(response.data?.data || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setPengeluaranList([]);
      } else {
        setError(err);
        console.error("Error fetching pengeluaran:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengeluaran();
  }, []);

  const addPengeluaran = async (data) => {
    try {
      setIsLoading(true);
      await pengeluaranService.create(data);
      await fetchPengeluaran();
      toast.success("Catatan pengeluaran berhasil ditambahkan");
      return { success: true };
    } catch (err) {
      console.error("Error adding pengeluaran:", err);
      toast.error(
        err?.response?.data?.message || "Gagal menambahkan catatan pengeluaran",
      );
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const editPengeluaran = async (id, data) => {
    try {
      setIsLoading(true);
      await pengeluaranService.update(id, data);
      await fetchPengeluaran();
      toast.success("Catatan pengeluaran berhasil diperbarui");
      return { success: true };
    } catch (err) {
      console.error("Error editing pengeluaran:", err);
      toast.error(
        err?.response?.data?.message || "Gagal mengupdate catatan pengeluaran",
      );
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deletePengeluaran = async (id) => {
    try {
      setIsLoading(true);
      await pengeluaranService.delete(id);
      await fetchPengeluaran();
      toast.success("Catatan pengeluaran berhasil dihapus");
      return { success: true };
    } catch (err) {
      console.error("Error deleting pengeluaran:", err);
      toast.error(
        err?.response?.data?.message || "Gagal menghapus catatan pengeluaran",
      );
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pengeluaranList,
    isLoading,
    error,
    fetchPengeluaran,
    addPengeluaran,
    editPengeluaran,
    deletePengeluaran,
  };
};
