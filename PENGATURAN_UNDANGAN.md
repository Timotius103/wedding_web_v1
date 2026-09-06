# Mengubah isi undangan

Edit objek `window.INVITATION_CONFIG` di `invitation-config.js`, simpan, lalu muat ulang halaman melalui server HTTP.

- `bride.name` dan `groom.name`: nama panggilan, otomatis dipakai di cover, judul tab, profil, penutup, dan footer.
- `surname`: bagian nama setelah nama panggilan; `instagram`: username tanpa `@`.
- `event.start`: tanggal dan jam dengan offset, format `YYYY-MM-DDTHH:mm:ss+07:00`. Tanggal, nama hari, tahun, jam tampilan, dan countdown dihitung dari nilai ini. Sesuaikan `timeZone` dan `timeZoneLabel` jika mengganti zona waktu.
- `event.title`, `venue`, dan `address`: judul acara, nama tempat, dan alamat. Biarkan `mapsUrl` kosong agar peta mengikuti lokasi/alamat, atau isi URL Google Maps khusus.
- `gifts`: dua rekening sesuai dua kartu yang tersedia. Isi nomor sebagai teks dalam tanda kutip agar nol di depan tidak hilang. Nomor tampilan dan tombol salin menggunakan nilai yang sama. `holder` adalah nama pemilik rekening bank, terpisah dari nama mempelai.
- `contacts`: nomor kontak dan WhatsApp. WhatsApp memakai kode negara tanpa `+` atau spasi.
- `music`: path file musik lokal atau URL HTTPS.

Nama tamu tetap berasal dari `data/guests.csv` melalui generator yang sudah ada. Teks ucapan tamu tidak diubah oleh konfigurasi ini. Mengubah jumlah kartu rekening atau struktur halaman masih memerlukan perubahan HTML.

## Memakai foto lokal

1. Masukkan file foto ke folder `assets/`, misalnya `assets/bride.jpg` dan `assets/cover.jpg`.
2. Buka bagian `photos` di `invitation-config.js`. Ubah `bride: ""` menjadi `bride: "assets/bride.jpg"`, atau `cover: ""` menjadi `cover: "assets/cover.jpg"`.
3. Simpan dan muat ulang situs melalui HTTP. Saat mengunggah situs, sertakan file foto dan konfigurasi yang diperbarui.

Semua path kosong secara default sehingga foto publik tetap tampil. Contoh nama file lokal sudah tersedia di komentar setiap pengaturan; file foto contoh belum disediakan. Path dihitung dari root situs, gunakan `/` sebagai pemisah, dan cocokkan huruf besar/kecil serta ekstensi file. JPG, PNG, dan WebP dapat digunakan. URL HTTPS juga tetap didukung.

| Pengaturan `photos` | Bagian halaman |
| --- | --- |
| `cover` | Foto pembuka |
| `couple` | Foto pasangan di bagian awal |
| `groom`, `bride` | Foto masing-masing mempelai |
| `trio` | 3 foto di bawah countdown |
| `carousel` | 5 foto carousel |
| `gallery` | 16 foto galeri, termasuk tampilan perbesar |
| `thankyou` | 4 latar slideshow penutup |

Isi elemen daftar sesuai urutan foto di halaman. Biarkan elemen lain `""` jika hanya ingin mengganti sebagian foto. Jumlah slot tetap mengikuti HTML; menambah elemen konfigurasi tidak menambah slot foto.

Jika foto lokal gagal dimuat, foto publik dipakai sebagai cadangan. Cadangan publik memerlukan koneksi internet. Untuk mengembalikan foto publik, kosongkan lagi path menjadi `""`.

Pastikan `invitation-config.js` ikut diunggah bersama `index.html` saat memperbarui situs.
