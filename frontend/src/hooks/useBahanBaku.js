import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { bahanBakuService } from "../services/bahanBakuService";

export const useBahanBaku = () => {
  const [bahanBakuList, setBahanBakuList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBahanBaku = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await bahanBakuService.getAll();
      setBahanBakuList(response.data?.data || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setBahanBakuList([]);
      } else {
        setError(err);
        console.error("Error fetching bahan baku:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBahanBaku();
  }, []);

  const addBahanBaku = async (data) => {
    try {
      setIsLoading(true);
      await bahanBakuService.create(data);
      await fetchBahanBaku();
      toast.success("Bahan baku berhasil ditambahkan");
      return { success: true };
    } catch (err) {
      console.error("Error adding bahan baku:", err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan bahan baku");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const editBahanBaku = async (id, data) => {
    try {
      setIsLoading(true);
      await bahanBakuService.update(id, data);
      await fetchBahanBaku();
      toast.success("Bahan baku berhasil diperbarui");
      return { success: true };
    } catch (err) {
      console.error("Error editing bahan baku:", err);
      toast.error(err?.response?.data?.message || "Gagal mengupdate bahan baku");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBahanBaku = async (id) => {
    try {
      setIsLoading(true);
      await bahanBakuService.delete(id);
      await fetchBahanBaku();
      toast.success("Bahan baku berhasil dihapus");
      return { success: true };
    } catch (err) {
      console.error("Error deleting bahan baku:", err);
      toast.error(err?.response?.data?.message || "Gagal menghapus bahan baku");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { bahanBakuList, isLoading, error, fetchBahanBaku, addBahanBaku, editBahanBaku, deleteBahanBaku };
};
