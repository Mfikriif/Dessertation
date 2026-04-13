# Final Project

Ini adalah backend project berbasis **Node.js** dan **Express** dengan menggunakan database **MySQL**. Project ini dibuat untuk melayani RESTful API.

## Prasyarat

Sebelum memulai setup, pastikan mesin / komputer Anda sudah terinstal:
- [Node.js](https://nodejs.org/en/) (direkomendasikan versi 16 ke atas)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (XAMPP, MAMP, atau MySQL installer)
- Git (opsional)

## Cara Setup dan Instalasi

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan project ini di komputer Anda:

### 1. Install Dependencies
Buka terminal dan arahkan pada direktori root project ini (`backend`), lalu jalankan perintah berikut untuk menginstal semua library atau paket yang dibutuhkan:

```bash
npm install
```

### 2. Konfigurasi Database (MySQL)

1. Buat database baru di MySQL server Anda (misalnya: `my_database`).
2. Import schema dan dummpy data yang sudah disediakan ke dalam database tersebut. Di dalam folder root project ini, cari file bernama `schema_and_dummy.sql` dan eksekusi isinya ke database Anda.
   *(Jika Anda menggunakan phpMyAdmin, buka database yang baru Anda buat, pilih tab "Import", lalu pilih file `schema_and_dummy.sql` ini, dan tekan "Go" / "Submit".)*

### 3. Konfigurasi Environment Variables

Buka direktori root project ini dan buat sebuah file baru bernama `.env`. Jika Anda punya file contoh bernama `.env.example`, Anda cukup meng-copy-nya menjadi `.env`.

Salin dan sesuaikan variabel berikut di dalam file `.env`:

```env
# Konfigurasi Server
PORT=5005

# Konfigurasi Database (sesuaikan dengan MySQL Anda)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=my_database

# Konfigurasi Json Web Token (JWT)
JWT_SECRET=supersecretkeyyangsangatpanjangdanaman
```
> **Catatan:** Sesuaikan `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` dengan pengaturan database di komputer Anda. Jangan lupa ganti `JWT_SECRET` untuk keamanan (bisa berupa teks panjang acak).

### 4. Menjalankan Server

Setelah semuanya siap, Anda bisa menjalankan server menggunakan perintah:

Untuk tahap **development** (menggunakan *nodemon* untuk fitur hot-reload ketika ada perubahan kode):
```bash
npm run dev
```

Untuk tahap **production** / biasa:
```bash
npm start
```

Jika berhasil, Anda akan melihat output di terminal:
```text
Server is running on port 5005
```

### 5. Pengujian API / Health Check
Server sudah berjalan dan Anda bisa menguji endpoint sederhana untuk mengecek apakah server merespon dengan benar. 
Buka browser atau gunakan aplikasi seperti Postman / Insomnia dan arahkan ke:

`GET http://localhost:5005/api/health`

Anda seharusnya mendapat hasil balasan berupa JSON:
```json
{
  "message": "API is running",
  "status": "Active"
}
```

## Struktur Project

- `src/app.js` : Ini adalah file *entry point* di mana Express server di inisiasi serta registrasi global middleware.
- `src/config/db.js` : Berisi konfigurasi dan koneksi ke database MySQL menggunakan modul `mysql2`.
- `src/controllers/` : Berisi *logic handler* / pengendali untuk mengeksekusi proses sesuai masing-masing rute (contoh: log-in, register).
- `src/models/` : Berisi interaksi langsung ke tabel-tabel database via Query.
- `src/routes/` : Berisi definisi API endpoints dan menghubungkannya dengan controller terkait.
- `src/middlewares/` : Berisi fungsi utilitas dan pengaman seperti verifikasi token / role akses (contoh: otentikasi JWT).

---
Jika Anda mendapati error, pastikan koneksi MySQL nyala, spesifikasi port di `app.js` atau `.env` tidak dilarang / dipakai aplikasi lain, dan seluruh environment variable ditulis secara benar.
