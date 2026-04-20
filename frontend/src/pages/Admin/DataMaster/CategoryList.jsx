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
import EditCategoryModal from "../../../component/modals/EditCategoryModal";
import AddCategoryModal from "../../../component/modals/AddCategoryModal";

const CategoryList = () => {
  const { kategori, editKategori, addKategori } = useKategori();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAddKategori = async (data) => {
    const result = await addKategori(data);
    if (!result.success) {
      throw result.error;
    }
  };

  const handleEditClick = (cat) => {
    setSelectedCategory(cat);
    setIsEditModalOpen(true);
  };

  const handleEditKategori = async (id, data) => {
    const result = await editKategori(id, data);
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
            Data Kategori
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola Master Data Kategori Produk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            FILTER
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            TAMBAH KATEGORI
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
                <th className="px-6 py-4 font-medium tracking-wider w-16">NO</th>
                <th className="px-6 py-4 font-medium tracking-wider w-48">KODE KATEGORI</th>
                <th className="px-6 py-4 font-medium tracking-wider">NAMA KATEGORI</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center w-32">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(kategori) && kategori.length > 0 ? (
                kategori.map((item, index) => (
                  <tr
                    key={item.id_kategori || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}.</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.kode_kategori}
                    </td>
                    <td className="px-6 py-4">
                      {item.nama_kategori}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md border border-gray-200 hover:border-transparent transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md border border-gray-200 hover:border-transparent transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">
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
            MENAMPILKAN {kategori?.length || 0} KATEGORI
          </span>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-black text-white text-xs font-medium">
              1
            </button>
            <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddKategori}
      />

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
        }}
        onEdit={handleEditKategori}
        initialData={selectedCategory}
      />
    </div>
  );
};

export default CategoryList;
