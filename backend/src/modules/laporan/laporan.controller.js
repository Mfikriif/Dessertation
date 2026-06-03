const Laporan = require("./laporan.model");
const ExcelJS = require("exceljs");

const getLaporanBulanan = async (req, res) => {
  const { bulan, tahun } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const laporanBulanan = new Laporan(null, null, null, null, bulan, tahun);
    const laporan = await laporanBulanan.getLaporanBulanan(limit, offset);

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

    let namaFile = `Laporan_Pendapatan`;
    if (paramBulan) namaFile += `_Bulan_${String(paramBulan).padStart(2, "0")}`;
    if (paramTahun) namaFile += `_Tahun_${paramTahun}`;
    if (Idoutlet) namaFile += `_Outlet_${Idoutlet}`;
    namaFile += `.xlsx`;

    const workbook = new ExcelJS.Workbook();

    if (isBulanan) {
      if (
        !dataLaporan ||
        !dataLaporan.harian ||
        dataLaporan.harian.length === 0
      ) {
        return res
          .status(404)
          .send("Tidak ada data pendapatan pada periode bulanan tersebut");
      }

      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${namaFile}"`,
        "Access-Control-Expose-Headers": "Content-Disposition",
      });

      const sheet = workbook.addWorksheet("Laporan Bulanan", {
        views: [{ showGridLines: false }],
      });

      sheet.columns = [
        { header: "Tanggal", key: "tanggal", width: 15 },
        { header: "Jml Transaksi", key: "jumlah_transaksi", width: 15 },
        { header: "Pendapatan Harian", key: "total_pendapatan", width: 22 },

        { header: "", key: "spacer", width: 4 },

        { header: "ID Transaksi", key: "id_trx", width: 15 },
        { header: "Waktu Transaksi", key: "waktu", width: 22 },
        { header: "Metode", key: "metode", width: 15 },
        { header: "Nama Produk", key: "produk", width: 30 },
        { header: "Qty", key: "qty", width: 10 },
        { header: "Harga Satuan", key: "harga", width: 18 },
        { header: "Subtotal Item", key: "subtotal", width: 18 },
        { header: "Total Bayar", key: "total_nota", width: 18 },
      ];

      const detailRows = [];
      dataLaporan.riwayat.forEach((trx) => {
        trx.detail_pembelian.forEach((item) => {
          detailRows.push({
            id_trx: trx.id_transaksi,
            waktu: trx.waktu_transaksi,
            metode: trx.metode_bayar,
            total_nota: parseFloat(trx.total_harga),
            produk: item.nama_produk,
            qty: item.jumlah,
            harga: parseFloat(item.harga_satuan),
            subtotal: parseFloat(item.subtotal),
          });
        });
      });

      const summaryRows = dataLaporan.harian;
      const maxRows = Math.max(summaryRows.length, detailRows.length);

      for (let i = 0; i < maxRows; i++) {
        const harian = summaryRows[i] || {};
        const detail = detailRows[i] || {};

        sheet.addRow({
          // Kolom Kiri
          tanggal: harian.tanggal_transaksi || "",
          jumlah_transaksi: harian.jumlah_transaksi || "",
          total_pendapatan: harian.total_pendapatan
            ? parseFloat(harian.total_pendapatan)
            : "",
          spacer: "",
          id_trx: detail.id_trx || "",
          waktu: detail.waktu || "",
          metode: detail.metode ? String(detail.metode).toUpperCase() : "",
          produk: detail.produk || "",
          qty: detail.qty || "",
          harga: detail.harga || "",
          subtotal: detail.subtotal || "",
          total_nota: detail.total_nota || "",
        });
      }

      const headerRow = sheet.getRow(1);
      headerRow.height = 25;

      headerRow.eachCell((cell, colNumber) => {
        if (colNumber !== 4) {
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
        }
      });

      const formatRupiah = '"Rp" #,##0.00;[Red]-"Rp" #,##0.00';

      for (let i = 2; i <= maxRows + 1; i++) {
        const row = sheet.getRow(i);
        row.eachCell((cell, colNumber) => {
          if (colNumber !== 4) {
            const isKiri = colNumber < 4 && i <= summaryRows.length + 1;
            const isKanan = colNumber > 4 && i <= detailRows.length + 1;

            if (isKiri || isKanan) {
              cell.border = {
                top: { style: "thin", color: { argb: "FFBFBFBF" } },
                left: { style: "thin", color: { argb: "FFBFBFBF" } },
                bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
                right: { style: "thin", color: { argb: "FFBFBFBF" } },
              };
              cell.alignment = { vertical: "middle" };
            }
          }
        });

        [3, 10, 11, 12].forEach((colIndex) => {
          const selUang = row.getCell(colIndex);
          if (typeof selUang.value === "number") {
            selUang.numFmt = formatRupiah;
          }
        });
      }

      // sheet baru hanya jika !Idoutlet (untuk keseluruhan outlet) dan dataLaporan.pengeluaran tersedia
      if (!Idoutlet && dataLaporan.pengeluaran) {
        const expenseSheet = workbook.addWorksheet("Laporan Pengeluaran", {
          views: [{ showGridLines: false }],
        });

        expenseSheet.columns = [
          { header: "Tanggal", key: "tanggal", width: 15 },
          { header: "Deskripsi Pengeluaran", key: "deskripsi", width: 35 },
          { header: "Dicatat Oleh", key: "nama_pengguna", width: 20 },
          { header: "Biaya", key: "biaya", width: 18 },
        ];

        let totalPengeluaranSum = 0;
        dataLaporan.pengeluaran.forEach((exp) => {
          const biayaVal = parseFloat(exp.biaya) || 0;
          totalPengeluaranSum += biayaVal;
          expenseSheet.addRow({
            tanggal: exp.tanggal || "",
            deskripsi: exp.deskripsi || "",
            nama_pengguna: exp.nama_pengguna || "",
            biaya: biayaVal,
          });
        });

        // Add Total Row
        const totalRow = expenseSheet.addRow({
          tanggal: "TOTAL",
          deskripsi: "",
          nama_pengguna: "",
          biaya: totalPengeluaranSum,
        });
        totalRow.font = { bold: true };

        // Styling the header row (Row 1)
        const expHeaderRow = expenseSheet.getRow(1);
        expHeaderRow.height = 25;
        expHeaderRow.eachCell((cell) => {
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

        // Styling the data and total rows
        const formatRupiahPattern = '"Rp" #,##0.00;[Red]-"Rp" #,##0.00';
        for (let i = 2; i <= dataLaporan.pengeluaran.length + 2; i++) {
          const row = expenseSheet.getRow(i);
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin", color: { argb: "FFBFBFBF" } },
              left: { style: "thin", color: { argb: "FFBFBFBF" } },
              bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
              right: { style: "thin", color: { argb: "FFBFBFBF" } },
            };
            cell.alignment = { vertical: "middle" };
          });
          const biayaCell = row.getCell(4);
          biayaCell.numFmt = formatRupiahPattern;
        }
      }
    } else {
      if (!dataLaporan) {
        return res.status(404).send("Tidak ada data laporan tahunan");
      }

      res.set({
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${namaFile}"`,
        "Access-Control-Expose-Headers": "Content-Disposition",
      });

      const sheet = workbook.addWorksheet("Laporan Tahunan", {
        views: [{ showGridLines: false }],
      });

      const formatRupiah = '"Rp" #,##0.00;[Red]-"Rp" #,##0.00';
      const stylingHeader = (cell) => {
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
      };
      const stylingBorder = (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFBFBFBF" } },
          left: { style: "thin", color: { argb: "FFBFBFBF" } },
          bottom: { style: "thin", color: { argb: "FFBFBFBF" } },
          right: { style: "thin", color: { argb: "FFBFBFBF" } },
        };
        cell.alignment = { vertical: "middle" };
      };

      if (Idoutlet) {
        if (!Array.isArray(dataLaporan) || dataLaporan.length === 0) {
          res.removeHeader("Content-Disposition");
          res.removeHeader("Content-Type");
          return res
            .status(404)
            .send(
              "Tidak ada data pendapatan untuk outlet ini di tahun tersebut",
            );
        }

        sheet.columns = [
          { header: "Bulan Ke-", key: "bulan", width: 15 },
          { header: "Jumlah Transaksi", key: "jumlah_transaksi", width: 20 },
          { header: "Total Pendapatan", key: "total_pendapatan", width: 25 },
        ];

        sheet.getRow(1).height = 25;
        sheet.getRow(1).eachCell(stylingHeader);

        let grandTotalJml = 0;
        let grandTotalRp = 0;

        dataLaporan.forEach((data) => {
          grandTotalJml += data.jumlah_transaksi;
          grandTotalRp += parseFloat(data.total_pendapatan);

          sheet.addRow({
            bulan: `Bulan ${data.bulan}`,
            jumlah_transaksi: data.jumlah_transaksi,
            total_pendapatan: parseFloat(data.total_pendapatan),
          });
        });

        const rowTotal = sheet.addRow({
          bulan: "TOTAL SETAHUN",
          jumlah_transaksi: grandTotalJml,
          total_pendapatan: grandTotalRp,
        });
        rowTotal.font = { bold: true };

        for (let i = 2; i <= dataLaporan.length + 2; i++) {
          const row = sheet.getRow(i);
          row.eachCell(stylingBorder);
          row.getCell(3).numFmt = formatRupiah;
        }
      } else {
        if (
          !dataLaporan.detail_outlet ||
          dataLaporan.detail_outlet.length === 0
        ) {
          res.removeHeader("Content-Disposition");
          res.removeHeader("Content-Type");
          return res.status(404).send("Tidak ada data pendapatan tahunan");
        }

        sheet.columns = [
          { header: "Ringkasan Global", key: "ket", width: 25 },
          { header: "Nilai", key: "nilai", width: 25 },
          { header: "", key: "spacer", width: 4 },
          { header: "ID Outlet", key: "id_outlet", width: 15 },
          { header: "Nama Outlet", key: "nama_outlet", width: 30 },
          { header: "Jml Transaksi", key: "jml_trx", width: 15 },
          { header: "Total Pendapatan", key: "pendapatan", width: 25 },
        ];

        sheet.getRow(1).height = 25;
        sheet.getRow(1).eachCell((cell, colNumber) => {
          if (colNumber !== 3) stylingHeader(cell);
        });

        const ringkasanKiri = [
          { ket: "Tahun Laporan", nilai: paramTahun },
          {
            ket: "Total Seluruh Transaksi",
            nilai: dataLaporan.ringkasan.total_transaksi,
          },
          {
            ket: "Total Seluruh Pendapatan",
            nilai: parseFloat(dataLaporan.ringkasan.total_pendapatan),
          },
        ];

        const detailKanan = dataLaporan.detail_outlet;
        const maxRows = Math.max(ringkasanKiri.length, detailKanan.length);

        for (let i = 0; i < maxRows; i++) {
          const kiri = ringkasanKiri[i] || {};
          const kanan = detailKanan[i] || {};

          sheet.addRow({
            ket: kiri.ket || "",
            nilai: kiri.nilai !== undefined ? kiri.nilai : "",
            spacer: "",
            id_outlet: kanan.id_outlet || "",
            nama_outlet: kanan.nama_outlet || "",
            jml_trx: kanan.jumlah_transaksi || "",
            pendapatan: kanan.total_pendapatan
              ? parseFloat(kanan.total_pendapatan)
              : "",
          });
        }

        for (let i = 2; i <= maxRows + 1; i++) {
          const row = sheet.getRow(i);
          row.eachCell((cell, colNumber) => {
            if (colNumber !== 3) {
              const isKiri = colNumber < 3 && i <= ringkasanKiri.length + 1;
              const isKanan = colNumber > 3 && i <= detailKanan.length + 1;

              if (isKiri || isKanan) stylingBorder(cell);
            }
          });

          if (i === 4) row.getCell(2).numFmt = formatRupiah;

          if (i <= detailKanan.length + 1) {
            row.getCell(7).numFmt = formatRupiah;
          }
        }
      }
    }

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
};
