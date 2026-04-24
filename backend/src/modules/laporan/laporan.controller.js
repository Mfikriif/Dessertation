const Laporan = require("./laporan.model");

const getLaporanBulanan = async (req, res) => {
  const { bulan, tahun } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const laporanBulanan = new Laporan(null, null, null, null, bulan, tahun);
    const laporan = await laporanBulanan.getLaporanBulanan(limit, offset);

    if (laporan.ringkasan.total_transaksi === 0) {
      return res.status(404).json({
        message: `Laporan tidak tersedia`,
        status: `Not foung`,
      });
    }

    return res.status(200).json({
      message: `Laporan berhasil diambil`,
      status: `Success`,
      periode: {
        bulan: bulan,
        tahun: tahun,
      },
      halaman_saat_ini: page,
      batas_per_halaman: limit,
      laporan,
    });
  } catch (error) {
    console.error(`Errro getLaporanBulanan: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getLaporanTahunan = async (req, res) => {
  const { tahun } = req.params;
  try {
    console.log(tahun);
    const laporanInstance = new Laporan(null, null, null, null, null, tahun);
    const laporan = await laporanInstance.getLaporanTahunan();
    if (laporan.length === 0) {
      return res.status(404).json({
        message: `Laporan penjualan tidak ditemukan`,
        status: `Not found`,
      });
    }

    return res.status(200).json({
      message: `Laporan berhasil diambil`,
      status: `Success`,
      laporan,
    });
  } catch (error) {
    console.error("Error getLaporanTahunan: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getDetailBulanan = async (req, res) => {
  const { bulan, tahun } = req.params;
  try {
    const laporanInstance = new Laporan(null, null, null, null, bulan, tahun);
    const dbResults = await laporanInstance.getDetailLaporanBulanan();
    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    const laporan = [];
    for (let i = 1; i <= jumlahHari; i++) {
      const dateStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dataHarian = dbResults.find(
        (row) => row.tanggal_transaksi === dateStr,
      );

      laporan.push({
        tanggal_transaksi: dateStr,
        jumlah_transaksi: dataHarian
          ? parseInt(dataHarian.jumlah_transaksi)
          : 0,
        total_pendapatan: dataHarian
          ? parseFloat(dataHarian.total_pendapatan)
          : 0,
      });
    }
    return res.status(200).json({
      message: `Laporan berhasil diambil`,
      status: `Success`,
      bulan,
      tahun,
      laporan,
    });
  } catch (error) {
    console.error("Error getDetailBulanan: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getDetailBulananOutlet = async (req, res) => {
  const { Idoutlet, bulan, tahun } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const laporanInstance = new Laporan(
      null,
      Idoutlet,
      null,
      null,
      bulan,
      tahun,
    );
    const dbResults = await laporanInstance.getDetailBulananOutlet(
      limit,
      offset,
    );
    let namaOutlet =
      dbResults.nama_outlet || "Belum Ada Transaksi / Outlet Tidak Ditemukan";

    const jumlahHari = new Date(tahun, bulan, 0).getDate();
    const grafikHarian = [];
    for (let i = 1; i <= jumlahHari; i++) {
      const dateStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dataHarian = dbResults.harian.find(
        (row) => row.tanggal_transaksi === dateStr,
      );

      grafikHarian.push({
        tanggal_transaksi: dateStr,
        jumlah_transaksi: dataHarian
          ? parseInt(dataHarian.jumlah_transaksi)
          : 0,
        total_pendapatan: dataHarian
          ? parseFloat(dataHarian.total_pendapatan)
          : 0,
      });
    }
    return res.status(200).json({
      message: `Laporan outlet berhasil diambil`,
      status: `Success`,
      namaOutlet,
      periode: {
        bulan,
        tahun,
      },
      paginasi_riwayat: {
        halaman_saat_ini: page,
        batas_per_halaman: limit,
      },
      data: {
        ringkasan: dbResults.ringkasan,
        grafik: grafikHarian,
        riwayat: dbResults.riwayat,
      },
    });
  } catch (error) {
    console.error("Error getDetailBulananOutlet: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getDetailTahunan = async (req, res) => {
  const { tahun } = req.params;
  try {
    const detailInstance = new Laporan(null, null, null, null, null, tahun);
    const laporan = await detailInstance.getDetailLaporanTahunan();
    if (laporan.length === 0) {
      return res.status(404).json({
        message: `Laporan detail tahunan tidak ditemukan`,
        status: `Not foung`,
      });
    }

    return res.status(200).json({
      message: `Laporan detail tahunan berhasil diambil`,
      status: `Success`,
      periode: tahun,
      laporan,
    });
  } catch (error) {
    console.error("Error getDetailTahunan: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getDetailTahunanOutlet = async (req, res) => {
  const { Idoutlet, tahun } = req.params;
  console.log(Idoutlet);
  try {
    const detailInstance = new Laporan(null, Idoutlet, null, null, null, tahun);
    const laporan = await detailInstance.getDetailTahunanOutlet();

    let namaOutlet = "Belum Ada Transaksi / Outlet Tidak Ditemukan";
    if (laporan.length > 0) {
      namaOutlet = laporan[0].nama_outlet;
    }

    if (laporan.length === 0) {
      return res.status(404).json({
        message: `Laporan detail tahunan tidak ditemukan`,
        status: `Not foung`,
      });
    }

    return res.status(200).json({
      message: `Laporan detail tahunan berhasil diambil`,
      status: `Success`,
      namaOutlet,
      periode: tahun,
      laporan,
    });
  } catch (error) {
    console.error("Error getDetailTahunan: ", error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

const getLaporanHarian = async (req, res) => {
  try {
    const filter = {
      tanggal: req.query.tanggal,
      id_outlet: req.query.id_outlet,
    };

    const laporanInstance = new Laporan();
    const data = await laporanInstance.getLaporanHarian(filter);

    res.status(200).json({
      message: "Laporan harian berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTopProdukHarian = async (req, res) => {
  try {
    const filter = {
      tanggal: req.query.tanggal,
      id_outlet: req.query.id_outlet,
      limit: req.query.limit || 5,
    };

    const laporanInstance = new Laporan();
    const data = await laporanInstance.getTopProdukHarian(filter);

    res.status(200).json({
      message: "Top produk harian berhasil diambil",
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getLaporanBulanan,
  getLaporanHarian,
  getTopProdukHarian,
  getLaporanTahunan,
  getDetailBulanan,
  getDetailTahunan,
  getDetailBulananOutlet,
  getDetailTahunanOutlet,
};
