// Edit detail undangan hanya di objek ini. Semua teks ditampilkan sebagai teks biasa.
window.INVITATION_CONFIG = {
  groom: {
    name: "Timotius", // Nama panggilan, dipakai di seluruh halaman.
    surname: "Van Boukering", // Bagian nama setelah nama panggilan.
    instagram: "ferdtheman", // Tanpa @.
  },
  bride: {
    name: "Putri",
    surname: "Utami",
    instagram: "putri.utami",
  },
  event: {
    title: "Misa Pemberkatan Pernikahan",
    start: "2027-06-14T09:00:00+07:00", // Tanggal + jam + offset zona waktu.
    timeZone: "Asia/Jakarta", // WIB: Asia/Jakarta; WITA: Asia/Makassar; WIT: Asia/Jayapura.
    timeZoneLabel: "WIB",
    endLabel: "Selesai",
    venue: "Gereja Katolik Paroki Santo Petrus Tarsisius, Warak",
    address: "Jl. Purbaya No.100, Warak Kidul, Sumberadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55288",
    mapsUrl: "", // Kosong: peta otomatis mencari nama lokasi dan alamat di atas.
  },
  gifts: [
    { bank: "BCA", number: "1234567890", holder: "Timotius Van Boukering" },
    { bank: "BCA", number: "0987654321", holder: "Putri Utami" },
  ], // Nomor berupa teks agar nol di depan tetap tersimpan; tampilan dan salinan memakai nomor yang sama.
  contacts: {
    groomPhone: "081246843543",
    otherName: "Putri Utami",
    otherPhone: "081246843543",
    whatsapp: "6281246843543", // Format internasional tanpa + atau spasi.
  },
  // Isi path lokal setelah menaruh file di assets/. Kosong = foto publik saat ini.
  // Nama file contoh bebas diganti; huruf besar/kecil dan ekstensi harus cocok.
  photos: {
    cover: "", // Contoh: "assets/cover.jpg"
    couple: "", // Contoh: "assets/couple.jpg"
    groom: "", // Contoh: "assets/groom.jpg"
    bride: "", // Contoh: "assets/bride.jpg"
    trio: [
      "", // assets/trio-01.jpg
      "", // assets/trio-02.jpg
      "", // assets/trio-03.jpg
    ],
    carousel: [
      "", // assets/carousel-01.jpg
      "", // assets/carousel-02.jpg
      "", // assets/carousel-03.jpg
      "", // assets/carousel-04.jpg
      "", // assets/carousel-05.jpg
    ],
    gallery: [
      "", // assets/gallery-01.jpg
      "", // assets/gallery-02.jpg
      "", // assets/gallery-03.jpg
      "", // assets/gallery-04.jpg
      "", // assets/gallery-05.jpg
      "", // assets/gallery-06.jpg
      "", // assets/gallery-07.jpg
      "", // assets/gallery-08.jpg
      "", // assets/gallery-09.jpg
      "", // assets/gallery-10.jpg
      "", // assets/gallery-11.jpg
      "", // assets/gallery-12.jpg
      "", // assets/gallery-13.jpg
      "", // assets/gallery-14.jpg
      "", // assets/gallery-15.jpg
      "", // assets/gallery-16.jpg
    ],
    thankyou: [
      "", // assets/thankyou-01.jpg
      "", // assets/thankyou-02.jpg
      "", // assets/thankyou-03.jpg
      "", // assets/thankyou-04.jpg
    ],
  },
  music: "assets/music.mp3",
};
