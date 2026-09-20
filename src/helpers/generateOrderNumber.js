const generateOrderNumber = () => {
  // Menentukan identitas informasi
  const identity = "ORD";

  // ambil waktu saat ini
  const now = new Date();

  // ambil tahun saat ini
  const year = now.getFullYear();

  // ambil bulan saat ini dan dimulai dari angka 1
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // ambil tanggal saat ini
  const day = String(now.getDate()).padStart(2, "0");

  // gabungkan format tahun-bulan-waktu
  const format = `${year}${month}${day}`;

  //  membuat angka acak
  const numberRandom = Math.floor(1000 + Math.random() * 9000);

  //  kemudian gabungkan semuanya
  return `${identity}-${format}-${numberRandom}`;
};

export default generateOrderNumber;
