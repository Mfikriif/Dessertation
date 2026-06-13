const Laporan = require("./laporan.model");
const ExcelJS = require("exceljs");

const getLaporanBulanan = async (req, res) => {
  const { bulan, tahun } = req.params;
  const { start_date, end_date } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const laporanBulanan = new Laporan(null, null, null, null, bulan, tahun);
    const laporan = await laporanBulanan.getLaporanBulanan(limit, offset, start_date, end_date);

    if (
      Number(laporan.ringkasan.total_transaksi) === 0 &&
      Number(laporan.ringkasan.total_pengeluaran) === 0
    ) {
      return res.status(404).json({
        message: `Laporan tidak tersedia`,
        status: `Not found`,
      });
    }

    const totalRiwayat = laporan.ringkasan.total_transaksi;
    const totalHalaman = Math.ceil(totalRiwayat / limit);

    return res.status(200).json({
      message: `Laporan berhasil diambil`,
      status: `Success`,
      periode: {
        bulan: bulan,
        tahun: tahun,
      },
      halaman_saat_ini: page,
      batas_per_halaman: limit,
      total_riwayat: totalRiwayat,
      total_halaman: totalHalaman,
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
  const { start_date, end_date } = req.query;
  try {
    const laporanInstance = new Laporan(null, null, null, null, bulan, tahun);
    const dbResults = await laporanInstance.getDetailLaporanBulanan(start_date, end_date);

    // Tentukan rentang tanggal untuk grafik
    let dateStart, dateEnd;
    if (start_date && end_date) {
      dateStart = new Date(start_date);
      dateEnd = new Date(end_date);
    } else if (start_date) {
      dateStart = new Date(start_date);
      dateEnd = new Date(start_date);
    } else {
      // Default: seluruh bulan
      dateStart = new Date(tahun, bulan - 1, 1);
      dateEnd = new Date(tahun, bulan, 0);
    }

    const laporan = [];
    for (let d = new Date(dateStart); d <= dateEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  const { start_date, end_date } = req.query;
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
      start_date,
      end_date
    );
    let namaOutlet =
      dbResults.nama_outlet || "Belum Ada Transaksi / Outlet Tidak Ditemukan";

    // Tentukan rentang tanggal untuk grafik
    let dateStart, dateEnd;
    if (start_date && end_date) {
      dateStart = new Date(start_date);
      dateEnd = new Date(end_date);
    } else if (start_date) {
      dateStart = new Date(start_date);
      dateEnd = new Date(start_date);
    } else {
      // Default: seluruh bulan
      dateStart = new Date(tahun, bulan - 1, 1);
      dateEnd = new Date(tahun, bulan, 0);
    }

    const grafikHarian = [];
    for (let d = new Date(dateStart); d <= dateEnd; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    const totalRiwayat = dbResults.ringkasan.total_transaksi;
    const totalHalaman = Math.ceil(totalRiwayat / limit);

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
        total_riwayat: totalRiwayat,
        total_halaman: totalHalaman,
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
        status: `Not found`,
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
    const { tanggal, id_outlet, limit } = req.query;

    const filter = {
      tanggal: tanggal || new Date().toISOString().split("T")[0],
      id_outlet: id_outlet || null,
      limit: limit || 10,
    };

    const laporanInstance = new Laporan();
    const data = await laporanInstance.getTopProdukHarian(filter);

    return res.status(200).json({
      message: "Data top produk harian berhasil diambil",
      status: "Success",
      data,
    });
  } catch (error) {
    console.error("Error getTopProdukHarian: ", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getLabaRugi = async (req, res) => {
  try {
    const { bulan, tahun, id_outlet, start_date, end_date } = req.query;

    if (!tahun) {
      return res.status(400).json({
        message: "Tahun harus disertakan",
        status: "Bad request",
      });
    }

    const laporanInstance = new Laporan();
    const data = await laporanInstance.getLabaRugi(
      bulan,
      tahun,
      id_outlet,
      start_date || null,
      end_date || null
    );

    return res.status(200).json({
      message: "Data Laba/Rugi berhasil diambil",
      status: "Success",
      data,
    });
  } catch (error) {
    console.error("Error getLabaRugi: ", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const createExcelFile = async (req, res) => {
  try {
    let { bulan, tahun, Idoutlet } = req.params;

    if (!Idoutlet || Idoutlet === "undefined" || Idoutlet === "null") {
      Idoutlet = null;
    } else {
      Idoutlet = Idoutlet.trim();
    }

    const paramBulan = bulan ? Number(bulan) : null;
    const paramTahun = tahun ? Number(tahun) : null;

    const laporanInstance = new Laporan(
      null,
      Idoutlet,
      null,
      null,
      paramBulan,
      paramTahun,
    );

    let dataLaporan;
    const isBulanan = paramBulan && paramTahun;

    if (paramBulan && paramTahun && Idoutlet) {
      dataLaporan = await laporanInstance.getDetailBulananOutlet(999999, 0);
    } else if (paramBulan && paramTahun) {
      dataLaporan = await laporanInstance.getLaporanBulanan(999999, 0);
    } else if (paramTahun && Idoutlet) {
      dataLaporan = await laporanInstance.getDetailTahunanOutlet();
    } else if (paramTahun) {
      dataLaporan = await laporanInstance.getLaporanTahunan();
    }

    const dataLabaRugi = await laporanInstance.getLabaRugi(
      paramBulan || 'all', 
      paramTahun || 'all', 
      Idoutlet || 'all'
    );

    let detail_bulanan = null;
    if (!isBulanan) {
      detail_bulanan = [];
      for (let m = 1; m <= 12; m++) {
        const bln = String(m).padStart(2, '0');
        const monthlyData = await laporanInstance.getLabaRugi(bln, paramTahun || 'all', Idoutlet || 'all');
        detail_bulanan.push({
          bulan: bln,
          ...monthlyData
        });
      }
    }

    let namaFile = `Laporan_Pendapatan`;
    if (paramBulan) namaFile += `_Bulan_${String(paramBulan).padStart(2, "0")}`;
    if (paramTahun) namaFile += `_Tahun_${paramTahun}`;
    if (Idoutlet) namaFile += `_Outlet_${Idoutlet}`;
    namaFile += `.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const formatRupiah = '"Rp" #,##0.00;[Red]-"Rp" #,##0.00';

    // ----------------------------------------------------
    // SHEET 1: LAPORAN LABA RUGI
    // ----------------------------------------------------
    const sheetLabaRugi = workbook.addWorksheet("Laba Rugi", {
      views: [{ showGridLines: false }],
    });

    sheetLabaRugi.columns = [
      { header: "Keterangan", key: "keterangan", width: 40 },
      { header: "Nilai", key: "nilai", width: 25 },
    ];

    const lrHeader = sheetLabaRugi.getRow(1);
    lrHeader.height = 25;
    lrHeader.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF203764" },
      };
      cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    sheetLabaRugi.addRow({
      keterangan: "RINCIAN PENDAPATAN:",
      nilai: "",
    }).font = { bold: true, italic: true };

    if (isBulanan && dataLaporan && dataLaporan.harian) {
      dataLaporan.harian.forEach((hari) => {
        sheetLabaRugi.addRow({
          keterangan: `  Tanggal ${hari.tanggal_transaksi}`,
          nilai: parseFloat(hari.total_pendapatan) || 0,
        });
      });
    } else if (!isBulanan && Idoutlet && Array.isArray(dataLaporan)) {
      dataLaporan.forEach((bulanData) => {
        sheetLabaRugi.addRow({
          keterangan: `  Bulan ${bulanData.bulan}`,
          nilai: parseFloat(bulanData.total_pendapatan) || 0,
        });
      });
    } else if (
      !isBulanan &&
      !Idoutlet &&
      dataLaporan &&
      dataLaporan.detail_outlet
    ) {
      dataLaporan.detail_outlet.forEach((outlet) => {
        sheetLabaRugi.addRow({
          keterangan: `  ${outlet.nama_outlet}`,
          nilai: parseFloat(outlet.total_pendapatan) || 0,
        });
      });
    }

    sheetLabaRugi.addRow({
      keterangan: "TOTAL PENDAPATAN",
      nilai: dataLabaRugi.pendapatan,
    }).font = { bold: true };
    sheetLabaRugi.addRow({ keterangan: "", nilai: "" });

    sheetLabaRugi.addRow({ keterangan: "PENGELUARAN:", nilai: "" }).font = {
      bold: true,
      italic: true,
    };
    sheetLabaRugi.addRow({
      keterangan: "  Beban Pokok Produksi (HPP)",
      nilai: dataLabaRugi.pengeluaran.hpp,
    });
    sheetLabaRugi.addRow({
      keterangan: "  Beban Produk Terbuang",
      nilai: dataLabaRugi.pengeluaran.waste,
    });

    for (const [key, val] of Object.entries(
      dataLabaRugi.pengeluaran.operasional,
    )) {
      sheetLabaRugi.addRow({ keterangan: `  ${key}`, nilai: val });
    }

    sheetLabaRugi.addRow({
      keterangan: "TOTAL PENGELUARAN",
      nilai: dataLabaRugi.total_pengeluaran,
    }).font = { bold: true };
    sheetLabaRugi.addRow({ keterangan: "", nilai: "" });
    const rowLabaBersih = sheetLabaRugi.addRow({
      keterangan: "LABA BERSIH",
      nilai: dataLabaRugi.laba_rugi_bersih,
    });
    rowLabaBersih.font = { bold: true, size: 12 };

    for (let i = 2; i <= sheetLabaRugi.rowCount; i++) {
      const row = sheetLabaRugi.getRow(i);
      row.eachCell((cell, colNumber) => {
        if (cell.value !== "") {
          cell.border = {
            top: { style: "thin", color: { argb: "FFBFBFBF" } },
            left: { style: "thin", color: { argb: "FFBFBFBF" } },
            bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
            right: { style: "thin", color: { argb: "FFBFBFBF" } },
          };
          cell.alignment = { vertical: "middle" };
        }
      });
      if (typeof row.getCell(2).value === "number") {
        row.getCell(2).numFmt = formatRupiah;
      }
    }

    // ----------------------------------------------------
    // SHEET 2: DETAIL TRANSAKSI / OUTLET
    // ----------------------------------------------------
    if (isBulanan) {
      const sheet = workbook.addWorksheet("Detail Transaksi", {
        views: [{ showGridLines: false }],
      });

      sheet.columns = [
        { header: "Tanggal", key: "tanggal", width: 15 },
        { header: "ID Transaksi", key: "id_trx", width: 15 },
        { header: "Waktu Transaksi", key: "waktu", width: 22 },
        { header: "Metode", key: "metode", width: 15 },
        { header: "Nama Produk", key: "produk", width: 30 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Harga Satuan", key: "harga", width: 18 },
        { header: "Subtotal Item", key: "subtotal", width: 18 },
        { header: "Total Bayar", key: "total_nota", width: 18 },
      ];

      const headerRow = sheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF203764" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      if (dataLaporan && dataLaporan.riwayat) {
        dataLaporan.riwayat.forEach((trx) => {
          let detailPembelian = trx.detail_pembelian;
          if (typeof detailPembelian === "string") {
            try {
              detailPembelian = JSON.parse(detailPembelian);
            } catch (e) {
              detailPembelian = [];
            }
          }
          if (Array.isArray(detailPembelian)) {
            detailPembelian.forEach((item) => {
              sheet.addRow({
                tanggal:
                  trx.tanggal_transaksi ||
                  (trx.waktu_transaksi
                    ? trx.waktu_transaksi.split(" ")[0]
                    : ""),
                id_trx: trx.id_transaksi,
                waktu: trx.waktu_transaksi,
                metode: trx.metode_bayar
                  ? String(trx.metode_bayar).toUpperCase()
                  : "",
                total_nota: parseFloat(trx.total_harga),
                produk: item.nama_produk,
                qty: item.jumlah,
                harga: parseFloat(item.harga_satuan),
                subtotal: parseFloat(item.subtotal),
              });
            });
          }
        });
      }

      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFBFBFBF" } },
            left: { style: "thin", color: { argb: "FFBFBFBF" } },
            bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
            right: { style: "thin", color: { argb: "FFBFBFBF" } },
          };
          cell.alignment = { vertical: "middle" };
        });
        [7, 8, 9].forEach((colIndex) => {
          const selUang = row.getCell(colIndex);
          if (typeof selUang.value === "number") {
            selUang.numFmt = formatRupiah;
          }
        });
      }
    } else {
      const sheet = workbook.addWorksheet("Detail Laporan", {
        views: [{ showGridLines: false }],
      });

      if (Idoutlet) {
        sheet.columns = [
          { header: "Bulan Ke-", key: "bulan", width: 15 },
          { header: "Jumlah Transaksi", key: "jumlah_transaksi", width: 20 },
          { header: "Total Pendapatan", key: "total_pendapatan", width: 25 },
        ];

        if (Array.isArray(dataLaporan)) {
          dataLaporan.forEach((data) => {
            sheet.addRow({
              bulan: `Bulan ${data.bulan}`,
              jumlah_transaksi: data.jumlah_transaksi,
              total_pendapatan: parseFloat(data.total_pendapatan),
            });
          });
        }
      } else {
        sheet.columns = [
          { header: "ID Outlet", key: "id_outlet", width: 15 },
          { header: "Nama Outlet", key: "nama_outlet", width: 30 },
          { header: "Jml Transaksi", key: "jml_trx", width: 15 },
          { header: "Total Pendapatan", key: "pendapatan", width: 25 },
        ];

        if (dataLaporan && dataLaporan.detail_outlet) {
          dataLaporan.detail_outlet.forEach((kanan) => {
            sheet.addRow({
              id_outlet: kanan.id_outlet || "",
              nama_outlet: kanan.nama_outlet || "",
              jml_trx: kanan.jumlah_transaksi || "",
              pendapatan: kanan.total_pendapatan
                ? parseFloat(kanan.total_pendapatan)
                : "",
            });
          });
        }
      }

      const headerRow = sheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF203764" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      for (let i = 2; i <= sheet.rowCount; i++) {
        const row = sheet.getRow(i);
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFBFBFBF" } },
            left: { style: "thin", color: { argb: "FFBFBFBF" } },
            bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
            right: { style: "thin", color: { argb: "FFBFBFBF" } },
          };
          cell.alignment = { vertical: "middle" };
        });

        if (Idoutlet) {
          row.getCell(3).numFmt = formatRupiah;
        } else {
          row.getCell(4).numFmt = formatRupiah;
        }
      }
    }

    // ----------------------------------------------------
    // SHEET 3: RINCIAN BULANAN (HANYA TAHUNAN)
    // ----------------------------------------------------
    if (!isBulanan && detail_bulanan && detail_bulanan.length > 0) {
      const sheetBulanan = workbook.addWorksheet("Rincian Bulanan", {
        views: [{ showGridLines: false }],
      });

      const catSet = new Set();
      catSet.add("Beban Penyusutan"); // Selalu tampilkan Beban Penyusutan meskipun 0
      detail_bulanan.forEach(b => {
        if (b.pengeluaran && b.pengeluaran.operasional) {
          Object.keys(b.pengeluaran.operasional).forEach(k => catSet.add(k));
        }
      });
      const opCategories = Array.from(catSet);

      const columns = [
        { header: "Bulan", key: "bulan", width: 15 },
        { header: "Pendapatan", key: "pendapatan", width: 20 },
        { header: "Beban Pokok (HPP)", key: "hpp", width: 20 },
        { header: "Beban Waste", key: "waste", width: 20 }
      ];

      opCategories.forEach(cat => {
        columns.push({ header: cat, key: cat, width: 20 });
      });
      columns.push({ header: "Laba Bersih", key: "laba_bersih", width: 20 });

      sheetBulanan.columns = columns;

      const BULAN_LABELS = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];

      detail_bulanan.forEach((b, idx) => {
        const rowData = {
          bulan: BULAN_LABELS[idx] || `Bulan ${b.bulan}`,
          pendapatan: parseFloat(b.pendapatan) || 0,
          hpp: parseFloat(b.pengeluaran.hpp) || 0,
          waste: parseFloat(b.pengeluaran.waste) || 0,
          laba_bersih: parseFloat(b.laba_rugi_bersih) || 0
        };

        opCategories.forEach(cat => {
          rowData[cat] = parseFloat(b.pengeluaran.operasional[cat]) || 0;
        });

        sheetBulanan.addRow(rowData);
      });

      const headerRowBulanan = sheetBulanan.getRow(1);
      headerRowBulanan.height = 25;
      headerRowBulanan.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF203764" } };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
        cell.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      });

      for (let i = 2; i <= sheetBulanan.rowCount; i++) {
        const row = sheetBulanan.getRow(i);
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFBFBFBF" } },
            left: { style: "thin", color: { argb: "FFBFBFBF" } },
            bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
            right: { style: "thin", color: { argb: "FFBFBFBF" } },
          };
          cell.alignment = { vertical: "middle" };
          
          if (colNumber > 1) {
            cell.numFmt = formatRupiah;
          }
        });
      }
    }

    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${namaFile}"`,
      "Access-Control-Expose-Headers": "Content-Disposition",
    });

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      res.end();
    }
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
  createExcelFile,
  getLabaRugi,
};
