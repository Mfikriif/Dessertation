const Bahanbaku = require("../Bahanbaku/bahanbaku.model");
const Transaksi = require("../Transaksi/transaksi.model");
const Produk = require("../produk/produk.model");
const Kategori = require("../kategori/kategori.model");
const PenggunaanBb = require("../penggunaan_bahan_baku/penggunaan_bb.model");

const dashboardInfo = async (req, res) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const data = [];

  let pendapatan;
  let pengeluaran;
  let total_produk;
  let total_bahanbaku;
  let total_kategori;
  let catatan_penggunaan;

  try {
    const instanceBahanbaku = new Bahanbaku();
    const jumlahBahanBaku = await instanceBahanbaku.getBahanBakuMenipis();
    total_bahanbaku = jumlahBahanBaku.total_bahan_baku_menipis;
    console.log(jumlahBahanBaku);

    const instancePengeluaranPendapatan =
      await Transaksi.getPendapatanDanPengluaran(month, year);
    console.log(instancePengeluaranPendapatan);

    const instanceProduk = new Produk();
    const totalProduk = await instanceProduk.countTotalProduk();
    total_produk = totalProduk.total_produk;
    console.log("Total produk: ", total_produk);

    const instanceKategori = new Kategori();
    const kategori = await instanceKategori.getTotalKategori();
    total_kategori = kategori.total_kategori;
    console.log("Total_kategori: ", total_kategori);

    const instancePenggunaanBb = new PenggunaanBb();
    const penggunaan = await instancePenggunaanBb.getPenggunaan();
    catatan_penggunaan = penggunaan;
    console.log("catatan penggunaan: ", catatan_penggunaan);

    if (
      instancePengeluaranPendapatan.total_pendapatan === null &&
      instancePengeluaranPendapatan.total_pengeluaran === null
    ) {
      pendapatan = 0;
      pengeluaran = 0;
    } else if (
      instancePengeluaranPendapatan.total_pendapatan === null &&
      instancePengeluaranPendapatan.total_pengeluaran !== null
    ) {
      pendapatan = 0;
      pengeluaran = instancePengeluaranPendapatan.total_pengeluaran;
    } else if (
      instancePengeluaranPendapatan.total_pendapatan !== null &&
      instancePengeluaranPendapatan.total_pengeluaran === null
    ) {
      pendapatan = instancePengeluaranPendapatan.total_pendapatan;
      pengeluaran = 0;
    } else {
      pendapatan = instancePengeluaranPendapatan.total_pendapatan;
      pengeluaran = instancePengeluaranPendapatan.total_pengeluaran;
    }

    data.push({
      pendapatan,
      pengeluaran,
      total_produk,
      total_bahanbaku,
      total_kategori,
      catatan_penggunaan,
    });

    return res.status(200).json({
      message: `Dashboard info`,
      status: "Success",
      data,
    });
  } catch (error) {
    console.error("Error dashboardInfo: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const performaBulanIni = async (req, res) => {
  const date = new Date();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  try {
    const data = await Transaksi.getPerformaBulanIni(month, year);

    // Format tanggal
    const formattedData = data.map((item) => {
      // In JS, dates from DB might need formatting
      const tgl = new Date(item.tanggal_transaksi);
      const yyyy = tgl.getFullYear();
      const mm = String(tgl.getMonth() + 1).padStart(2, "0");
      const dd = String(tgl.getDate()).padStart(2, "0");

      return {
        tanggal_transaksi: `${yyyy}-${mm}-${dd}`,
        total_pendapatan: item.total_pendapatan,
      };
    });

    return res.status(200).json({
      message: "Data performa bulan ini",
      status: "Success",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error performaBulanIni: ", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  dashboardInfo,
  performaBulanIni,
};
