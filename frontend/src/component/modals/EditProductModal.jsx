import { useState, useEffect } from "react";
import { X, Package, Grid, Loader2 } from "lucide-react";
import { useKategori } from "../../hooks/useKategori";

const EditProductModal = ({ isOpen, onClose, onEdit, initialData }) => {
  const { kategori, isLoading: isLoadingKategori } = useKategori();
  const [formData, setFormData] = useState({
    nama_produk: "",
    id_kategori: "",
    harga: "",
    deskripsi: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_produk: initialData.nama_produk || "",
        id_kategori: initialData.id_kategori || "",
        harga: initialData.harga || "",
        deskripsi: initialData.deskripsi || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!initialData) return;
    setIsSubmitting(true);
    try {
      await onEdit(initialData.id_produk, formData);
      onClose();
    } catch (error) {
      console.error("Gagal mengedit produk:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            EDIT PRODUK
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          <form
            id="editProductForm"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nama Produk */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Nama Produk
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nama_produk"
                    value={formData.nama_produk}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
                    placeholder="Masukkan nama produk"
                  />
                </div>
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Grid className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="id_kategori"
                    value={formData.id_kategori}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm appearance-none bg-white font-medium text-gray-600 cursor-pointer"
                    disabled={isLoadingKategori}
                  >
                    <option value="" disabled>
                      Pilih Kategori
                    </option>
                    {kategori.map((cat) => (
                      <option key={cat.id_kategori} value={cat.id_kategori}>
                        {cat.nama_kategori}
                      </option>
                    ))}
                  </select>
                  {/* Custom arrow for select */}
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Harga */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Harga</label>
              <div className="relative w-full md:w-1/2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-medium text-sm">RP</span>
                </div>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  required
                  min="0"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Deskripsi Produk
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                required
                rows={4}
                className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-sm resize-none"
                placeholder="Masukkan deskripsi produk"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-colors disabled:opacity-50"
          >
            BATAL
          </button>
          <button
            type="submit"
            form="editProductForm"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors flex items-center justify-center min-w-[100px] shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "SIMPAN"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
