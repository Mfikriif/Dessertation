import { useState } from "react";
import {
  Filter,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useOutlet } from "../../../hooks/useOutlet";
import AddOutletModal from "../../../component/modals/AddOutletModal";
import EditOutletModal from "../../../component/modals/EditOutletModal";
import DeleteOutletModal from "../../../component/modals/DeleteOutletModal";

const OutletList = () => {
  const { outlet, addOutlet, editOutlet, deleteOutlet } = useOutlet();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [selectedDeleteOutlet, setSelectedDeleteOutlet] = useState(null);

  const handleAddOutlet = async (data) => {
    const result = await addOutlet(data);
    if (!result.success) throw result.error;
  };

  const handleEditClick = (otl) => {
    setSelectedOutlet(otl);
    setIsEditModalOpen(true);
  };

  const handleEditOutlet = async (id, data) => {
    const result = await editOutlet(id, data);
    if (!result.success) throw result.error;
  };

  const handleDeleteClick = (otl) => {
    setSelectedDeleteOutlet(otl);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteOutlet = async (id) => {
    const result = await deleteOutlet(id);
    if (!result.success) throw result.error;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Data Master
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola Data Master Produk, Kategori, Pengguna, Outlet.
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
            TAMBAH OUTLET
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
                <th className="px-6 py-4 font-medium tracking-wider w-24">NO</th>
                <th className="px-6 py-4 font-medium tracking-wider">NAMA OUTLET</th>
                <th className="px-6 py-4 font-medium tracking-wider">ALAMAT</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center w-32">
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(outlet) && outlet.length > 0 ? (
                outlet.map((item, index) => (
                  <tr
                    key={item.id_outlet || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500">{index + 1}.</td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {item.nama_outlet}
                    </td>
                    <td className="px-6 py-4">
                      {item.alamat || "-"}
                    </td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    Tidak ada data outlet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-bold text-gray-500 tracking-wider">
            MENAMPILKAN {outlet?.length || 0} OUTLET
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

      <AddOutletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddOutlet}
      />

      <EditOutletModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedOutlet(null);
        }}
        onEdit={handleEditOutlet}
        initialData={selectedOutlet}
      />

      <DeleteOutletModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeleteOutlet(null);
        }}
        onDelete={handleDeleteOutlet}
        outletData={selectedDeleteOutlet}
      />
    </div>
  );
};

export default OutletList;
