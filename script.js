// 1. Logika Tombol Buka Undangan
document.getElementById('btnBuka').addEventListener('click', function() {
    // Sembunyikan cover dengan animasi
    document.getElementById('cover').classList.add('cover-hidden');
    // Tampilkan konten utama
    document.getElementById('main-content').classList.remove('hidden');
});

// 2. Logika Timer Mundur (Target: 2 Mei 2026, 08:30 WIB)
const targetDate = new Date("May 2, 2026 08:30:00").getTime();

const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("timer").innerHTML = `
        <div><span>${days}</span><br><small>Hari</small></div>
        <div><span>${hours}</span><br><small>Jam</small></div>
        <div><span>${minutes}</span><br><small>Menit</small></div>
        <div><span>${seconds}</span><br><small>Detik</small></div>
    `;

    if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").innerHTML = "ACARA SEDANG BERLANGSUNG";
    }
}, 1000);

// 3. Logika Kirim Form ke Google Sheets
// PENTING: Ganti string di bawah ini dengan URL Web App dari Tahap 1!
// PENTING: Masukkan URL Web App Versi Baru Anda di bawah ini
const scriptURL = 'https://script.google.com/macros/s/AKfycbwJdit6xUGGQBiO7alhSaR0KjxEnDifvu9yJBuompAdIAPXAO5t9HNW1f6RniiOzVAnNQ/exec'; 

const form = document.getElementById('formRSVP');
const btnKirim = document.getElementById('btnKirim');
const statusSelect = document.getElementById('status');
const sectionJabatan = document.getElementById('sectionJabatan');
const jabatanSelect = document.getElementById('jabatan');
const jumlahSelect = document.getElementById('jumlah');
const infoIuran = document.getElementById('infoIuran');

// Daftar Tarif Jabatan
const tarif = {
    "Professor": 600000,
    "LK": 300000,
    "Lektor": 200000,
    "AA": 100000
};

// Fungsi memformat angka ke Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// Fungsi Mengatur Tampilan Form
// Fungsi Mengatur Tampilan Form
const updateForm = () => {
    const status = statusSelect.value;
    const currentJumlah = parseInt(jumlahSelect.value) || 1;
    
    // Kosongkan dulu pilihan jumlah yang ada
    jumlahSelect.innerHTML = '';

    if (status === "Dosen Aktif") {
        // Tampilkan pilihan jabatan
        sectionJabatan.classList.remove('hidden-element');
        // Masukkan opsi 1 sampai 4
        jumlahSelect.innerHTML = `
            <option value="1">1 Orang</option>
            <option value="2">2 Orang</option>
            <option value="3">3 Orang</option>
            <option value="4">4 Orang</option>
        `;
    } else if (status === "Pensiunan") {
        // Sembunyikan jabatan jika pensiunan
        sectionJabatan.classList.add('hidden-element');
        jabatanSelect.value = ""; 
        // Masukkan opsi 1 sampai 2 saja
        jumlahSelect.innerHTML = `
            <option value="1">1 Orang</option>
            <option value="2">2 Orang</option>
        `;
    }

    // Mengatur ulang pilihan sebelumnya agar tidak error
    // Limit maksimal: Aktif = 4, Pensiunan = 2
    const batasMaksimal = status === "Dosen Aktif" ? 4 : 2; 
    
    if (currentJumlah <= batasMaksimal) {
        jumlahSelect.value = currentJumlah;
    } else {
        jumlahSelect.value = "1"; // Jika opsi sebelumnya kelebihan, kembalikan ke 1
    }

    // Panggil ulang perhitungan iuran jika ada perubahan status
    hitungIuran();
};

// Fungsi Menghitung Biaya
const hitungIuran = () => {
    const status = statusSelect.value;
    const jabatan = jabatanSelect.value;
    const jumlah = parseInt(jumlahSelect.value) || 1;
    
    if (!status) return;

    let totalIuran = 0;
    let rincian = [];

    // Hitung Biaya Jabatan (Hanya Dosen Aktif)
    if (status === "Dosen Aktif" && jabatan && tarif[jabatan]) {
        totalIuran += tarif[jabatan];
        rincian.push(`Iuran Jabatan (${jabatan}): <b>${formatRupiah(tarif[jabatan])}</b>`);
    }

    // Hitung Biaya Tambahan Konsumsi (> 2 orang)
    if (jumlah > 2) {
        const extraOrang = jumlah - 2;
        const biayaExtra = extraOrang * 75000;
        totalIuran += biayaExtra;
        rincian.push(`Konsumsi Tambahan (${extraOrang} org): <b>${formatRupiah(biayaExtra)}</b>`);
    }

    // Tampilkan Informasi ke Layar
    if (totalIuran > 0) {
        infoIuran.classList.remove('hidden-element');
        infoIuran.innerHTML = `
            <div style="margin-bottom:8px;">${rincian.join('<br>')}</div>
            <div style="font-weight:bold; font-size:15px; margin-bottom:8px; color: #d9534f;">Total Bayar: ${formatRupiah(totalIuran)}</div>
            <hr style="border:0; border-top:1px dashed #ccc; margin:8px 0;">
            <i style="font-size: 11px;">Mohon pembayaran dilakukan paling lambat 16 April 2026 ke rek BNI <b>1865034541</b> a.n Nurmala Setianing Putri, dan konfirmasikan ke Bu Nurmala.</i>
        `;
    } else {
        infoIuran.classList.add('hidden-element');
    }
    document.getElementById('totalInput').value = totalIuran;
};

// Pasang pendeteksi perubahan
statusSelect.addEventListener('change', updateForm);
jabatanSelect.addEventListener('change', hitungIuran);
jumlahSelect.addEventListener('change', hitungIuran);

// Logika Submit Form
form.addEventListener('submit', e => {
    e.preventDefault();

    // Cek Honeypot (Anti-Bot)
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot !== "") {
        alert("Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.");
        form.reset();
        return; 
    }

    btnKirim.innerHTML = "Mengirim...";
    btnKirim.disabled = true;

    // Menggunakan URLSearchParams agar stabil menembus CORS
    const formData = new FormData(form);
    const params = new URLSearchParams();
    formData.forEach((value, key) => { params.append(key, value); });

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })
    .then(() => {
        alert("Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.");
        form.reset();
        updateForm(); // Reset tampilan ke awal
        btnKirim.innerHTML = "Kirim Konfirmasi";
        btnKirim.disabled = false;
    })
    .catch(error => {
        alert("Terjadi kesalahan. Silakan coba lagi.");
        btnKirim.innerHTML = "Kirim Konfirmasi";
        btnKirim.disabled = false;
    });
});