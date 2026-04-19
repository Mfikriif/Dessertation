import { useState, useEffect } from "react";
import { produkService } from "../services/produkService";

export const useProduk = () => {
  const [produk, setProduk] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await produkService.getAllProduk();
        const resultData = response.data?.data;
        setProduk(resultData || []);
      } catch (err) {
        setError(err);
        console.error("Error fetching produk:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { produk, isLoading, error, setProduk };
};
