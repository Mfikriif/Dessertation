import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { outletService } from "../services/outletService";

export const useOutlet = () => {
  const [outlet, setOutlet] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOutlet = async () => {
    try {
      setIsLoading(true);
      const response = await outletService.getAllOutlet();
      const resultData = response.data?.data;
      setOutlet(resultData || []);
    } catch (err) {
      setError(err);
      console.error("Error fetching outlet:", err);
      toast.error("Gagal mengambil data outlet");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlet();
  }, []);

  const addOutlet = async (data) => {
    try {
      setIsLoading(true);
      await outletService.createOutlet(data);
      await fetchOutlet();
      toast.success("Outlet berhasil ditambahkan!");
      return { success: true };
    } catch (err) {
      console.error("Error adding outlet:", err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan outlet");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const editOutlet = async (id, data) => {
    try {
      setIsLoading(true);
      await outletService.updateOutlet(id, data);
      await fetchOutlet();
      toast.success("Outlet berhasil diperbarui!");
      return { success: true };
    } catch (err) {
      console.error("Error editing outlet:", err);
      toast.error(err?.response?.data?.message || "Gagal mengupdate outlet");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOutlet = async (id) => {
    try {
      setIsLoading(true);
      await outletService.deleteOutlet(id);
      await fetchOutlet();
      toast.success("Outlet berhasil dihapus!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting outlet:", err);
      toast.error(err?.response?.data?.message || "Gagal menghapus outlet");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { outlet, isLoading, error, fetchOutlet, addOutlet, editOutlet, deleteOutlet };
};
