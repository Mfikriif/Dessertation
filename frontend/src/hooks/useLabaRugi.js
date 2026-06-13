import { useState, useCallback } from "react";
import API from "../config/api";
import toast from "react-hot-toast";

export const useLabaRugi = () => {
  const [dataLabaRugi, setDataLabaRugi] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLabaRugi = useCallback(async (bulan, tahun, id_outlet, startDate = null, endDate = null) => {
    try {
      setIsLoading(true);
      const params = {
        bulan: bulan === "all" ? "all" : bulan,
        tahun: tahun,
        id_outlet: id_outlet || "all",
      };

      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await API.get("/laporan/laba-rugi", { params });
      if (response.data?.status === "Success") {
        setDataLabaRugi(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching laba rugi:", error);
      toast.error(
        error?.response?.data?.message || "Gagal mengambil data Laba/Rugi",
      );
      setDataLabaRugi(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dataLabaRugi,
    isLoading,
    fetchLabaRugi,
  };
};
