import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { produkService } from "../services/produkService";

export const useProduk = () => {
  const [produk, setProduk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduk = async (categoryId = null) => {
    try {
      setIsLoading(true);
      setError(null);
      let response;
      if (categoryId) {
        response = await produkService.getProdukByIdKategori(categoryId);
      } else {
        response = await produkService.getAllProduk();
      }
      
      const resultData = response.data?.data;
      setProduk(resultData || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        // If 404, it means empty data
        setProduk([]);
      } else {
        setError(err);
        console.error("Error fetching produk:", err);
        // toast.error("Gagal mengambil data produk"); // Disabled toast for empty items on filter to avoid annoyance
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  const addProduk = async (data) => {
    try {
      setIsLoading(true);
      await produkService.createProduk(data);
      await fetchProduk(); // Refresh list after adding
      toast.success("Produk berhasil ditambahkan!");
      return { success: true };
    } catch (err) {
      console.error("Error adding produk:", err);
      toast.error(err?.response?.data?.message || "Gagal menambahkan produk");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const editProduk = async (id, data) => {
    try {
      setIsLoading(true);
      await produkService.updateProduk(id, data);
      await fetchProduk();
      toast.success("Produk berhasil diperbarui!");
      return { success: true };
    } catch (err) {
      console.error("Error editing produk:", err);
      toast.error(err?.response?.data?.message || "Gagal mengupdate produk");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduk = async (id) => {
    try {
      setIsLoading(true);
      await produkService.deleteProduk(id);
      await fetchProduk();
      toast.success("Produk berhasil dihapus!");
      return { success: true };
    } catch (err) {
      console.error("Error deleting produk:", err);
      toast.error(err?.response?.data?.message || "Gagal menghapus produk");
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { produk, isLoading, error, fetchProduk, addProduk, editProduk, deleteProduk };
};
