import { useState } from "react";
import toast from "react-hot-toast";
import { penggunaanBbService } from "../services/penggunaanBbService";

export const usePenggunaanBb = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addPenggunaan = async (data) => {
    try {
      setIsLoading(true);
      await penggunaanBbService.create(data);
      toast.success("Catatan penggunaan berhasil disimpan");
      return { success: true };
    } catch (err) {
      console.error("Error adding penggunaan bb:", err);
      toast.error(
        err?.response?.data?.message || "Gagal menyimpan catatan penggunaan",
      );
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  return { addPenggunaan, isLoading };
};
