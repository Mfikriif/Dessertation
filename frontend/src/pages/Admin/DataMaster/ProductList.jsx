import { useState } from "react";
import {
  Filter,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useKategori } from "../../../hooks/useKategori";
import { useProduk } from "../../../hooks/useProduk";
import AddProductModal from "../../../component/modals/AddProductModal";
import EditProductModal from "../../../component/modals/EditProductModal";
import DeleteProductModal from "../../../component/modals/DeleteProductModal";

const ProductList = () => {
  const { kategori } = useKategori();
  const { produk, fetchProduk, addProduk, editProduk, deleteProduk } = useProduk();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const totalItems = Array.isArray(produk) ? produk.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Bounds check for current page if total pages drop
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const currentData = Array.isArray(produk)
    ? produk.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
      )
    : [];

  const handleFilterChange = (categoryId) => {
    setCurrentPage(1); // Reset to first page on filter
    fetchProduk(categoryId || null);
  };

  const handleAddProduk = async (data) => {
    const result = await addProduk(data);
    if (!result.success) {
      throw result.error;
    }
  };

  const handleEditClick = (item) => {
    setSelectedProduct(item);
    setIsEditModalOpen(true);
  };

  const handleEditProduk = async (id, data) => {
    const result = await editProduk(id, data);
    if (!result.success) {
      throw result.error;
    }
  };

  const handleDeleteClick = (item) => {
    setSelectedDeleteProduct(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduk = async (id) => {
    const result = await deleteProduk(id);
    if (!result.success) {
      throw result.error;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Produk
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola Data Master Produk, Kategori, Pengguna, Outlet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            <select 
              onChange={(e) => handleFilterChange(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-medium text-sm transition-colors shadow-sm cursor-pointer min-w-[160px]"
            >
              <option value="">SEMUA KATEGORI</option>
              {Array.isArray(kategori) && kategori.map((kat) => (
                <option key={kat.id_kategori} value={kat.id_kategori}>
                  {kat.nama_kategori.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            TAMBAH PRODUK
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">NO</th>
                <th className="px-6 py-4 font-medium tracking-wider">NAMA</th>
                <th className="px-6 py-4 font-medium tracking-wider">
                  KATEGORI
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">
                  DESKRIPSI
                </th>
                <th className="px-6 py-4 font-medium tracking-wider">HARGA</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((item, index) => {
                  const globalIndex =
                    (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                  return (
                    <tr
                      key={item.id_produk || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-500">
                        {globalIndex}.
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.nama_produk}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center text-xs font-medium text-gray-600">
                          {item.nama_kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4">{item.deskripsi}</td>
                      <td className="px-6 py-4">{item.harga}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 hover:border-transparent transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-gray-200 hover:border-transparent transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            MENAMPILKAN {currentData.length} DARI {totalItems} PRODUK
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              // Logic to show max 5 page buttons
              .filter(
                (pageNum) =>
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1),
              )
              .map((pageNum, index, array) => (
                <div key={pageNum} className="flex items-center gap-1">
                  {index > 0 && array[index - 1] !== pageNum - 1 && (
                    <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-black text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                </div>
              ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProduk}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onEdit={handleEditProduk}
        initialData={selectedProduct}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeleteProduct(null);
        }}
        onDelete={handleDeleteProduk}
        productData={selectedDeleteProduct}
      />
    </div>
  );
};

export default ProductList;
