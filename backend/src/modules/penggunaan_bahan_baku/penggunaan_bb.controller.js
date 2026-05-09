const PenggunaanBB = require("./penggunaan_bb.model");
const StokBahanBaku = require("../stokbahanbaku/stokbahanbaku.model");
const crypto = require("crypto");

const createPenggunaan = async (req, res) => {
  const { id_bahan_baku, jumlah_digunakan, catatan } = req.body;
  console.log(req.body);
  try {
    if (!id_bahan_baku || !jumlah_digunakan || !catatan) {
      return res.status(400).json({
        message: `Semua kolom wajib diisi`,
        status: `Bad request`,
      });
    }

    const Idpengguna = req.user.id_pengguna;
    console.log(Idpengguna);
    const Idpenggunaan = crypto.randomUUID();
    const tanggalPenggunaan = new Date();
    const penggunaanInstance = new PenggunaanBB(
      Idpenggunaan,
      id_bahan_baku,
      Idpengguna,
      jumlah_digunakan,
      catatan,
      tanggalPenggunaan,
    );
    const stokBahanBaku = new StokBahanBaku(null, id_bahan_baku);
    const stok = await stokBahanBaku.getStokById();
    console.log("Stok: ", stok);
    console.log("Jumlah digunakan: ", jumlah_digunakan);

    if (Number(stok.jumlah_stok) < Number(jumlah_digunakan)) {
      return res.status(400).json({
        message: `Stok tidak mencukupi`,
        status: `Bad request`,
      });
    }
    const penggunaan = await penggunaanInstance.create();
    const StokInstance = new StokBahanBaku();
    const updateStok = await StokInstance.updateStok(
      jumlah_digunakan,
      id_bahan_baku,
    );

    return res.status(201).json({
      message: `Penggunaan berhasil di catat`,
      status: `Success`,
      data: {
        id_bahan_baku,
        jumlah_digunakan,
        catatan,
      },
    });
  } catch (error) {
    console.error(`Error createPenggunaan: `, error);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

module.exports = {
  createPenggunaan,
};
