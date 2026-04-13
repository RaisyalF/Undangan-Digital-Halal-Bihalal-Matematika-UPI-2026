// ==========================================
// 1. KONFIGURASI UTAMA & VARIABEL ELEMEN
// ==========================================
const scriptURL = 'https://script.google.com/macros/s/AKfycbwJdit6xUGGQBiO7alhSaR0KjxEnDifvu9yJBuompAdIAPXAO5t9HNW1f6RniiOzVAnNQ/exec'; 
const targetDate = new Date("May 2, 2026 08:30:00").getTime();

// Mengambil elemen-elemen dari HTML
const form = document.getElementById('formRSVP');
const btnKirim = document.getElementById('btnKirim');
const statusSelect = document.getElementById('status');
const sectionJabatan = document.getElementById('sectionJabatan');
const jabatanSelect = document.getElementById('jabatan');
const jumlahSelect = document.getElementById('jumlah');
const sectionJumlahPasti = document.getElementById('sectionJumlahPasti'); 
const jumlahPastiInput = document.getElementById('jumlahPasti'); 
const infoIuran = document.getElementById('infoIuran');
const totalInput = document.getElementById('totalInput');

// Data Tarif
const tarif = { "Professor": 600000, "LK": 300000, "Lektor": 200000, "AA": 100000 };

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// ==========================================
// 2. LOGIKA TAMPILAN AWAL (COVER & TIMER)
// ==========================================
document.getElementById('btnBuka').addEventListener('click', function() {
    document.getElementById('cover').classList.add('cover-hidden');
    document.getElementById('main-content').classList.remove('hidden');
});

const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Jika waktu habis
    if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("timer").innerHTML = "ACARA SEDANG BERLANGSUNG";
        return;
    }

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
}, 1000);

// ==========================================
// 3. LOGIKA DINAMIS FORMULIR & IURAN
// ==========================================
const cekJumlahLebihDari5 = () => {
    if (sectionJumlahPasti) { 
        if (jumlahSelect.value === ">5") {
            sectionJumlahPasti.classList.remove('hidden-element');
        } else {
            sectionJumlahPasti.classList.add('hidden-element');
        }
    }
};

const updateForm = () => {
    const status = statusSelect.value;
    jumlahSelect.innerHTML = '';

    if (status === "Dosen Aktif") {
        sectionJabatan.classList.remove('hidden-element');
        jumlahSelect.innerHTML = `
            <option value="1">1 Orang</option>
            <option value="2">2 Orang</option>
            <option value="3">3 Orang</option>
            <option value="4">4 Orang</option>
            <option value="5">5 Orang</option>
            <option value=">5">Lebih dari 5 Orang</option>
        `;
    } else if (status === "Pensiunan") {
        sectionJabatan.classList.add('hidden-element');
        jabatanSelect.value = ""; 
        jumlahSelect.innerHTML = `
            <option value="1">1 Orang</option>
            <option value="2">2 Orang</option>
        `;
    }
    
    cekJumlahLebihDari5();
    hitungIuran();
};

const hitungIuran = () => {
    const status = statusSelect.value;
    const jabatan = jabatanSelect.value;
    
    // Tentukan jumlah pasti untuk perhitungan
    let jumlah = 1;
    if (jumlahSelect.value === ">5" && jumlahPastiInput) {
        jumlah = parseInt(jumlahPastiInput.value) || 6;
    } else {
        jumlah = parseInt(jumlahSelect.value) || 1;
    }
    
    if (!status) return;

    let totalIuran = 0;
    let rincian = [];

    // Tambah Iuran Jabatan
    if (status === "Dosen Aktif" && jabatan && tarif[jabatan]) {
        totalIuran += tarif[jabatan];
        rincian.push(`Iuran Jabatan (${jabatan}): <b>${formatRupiah(tarif[jabatan])}</b>`);
    }

    // Tambah Iuran Konsumsi
    if (jumlah > 2) {
        const extraOrang = jumlah - 2;
        const biayaExtra = extraOrang * 75000;
        totalIuran += biayaExtra;
        rincian.push(`Konsumsi Tambahan (${extraOrang} org): <b>${formatRupiah(biayaExtra)}</b>`);
    }

    // Render ke Layar
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
    
    if(totalInput) totalInput.value = totalIuran;
};

// ==========================================
// 4. EVENT LISTENER & PENGIRIMAN DATA
// ==========================================
statusSelect.addEventListener('change', updateForm);
jabatanSelect.addEventListener('change', hitungIuran);
jumlahSelect.addEventListener('change', () => {
    cekJumlahLebihDari5();
    hitungIuran();
});
if(jumlahPastiInput) jumlahPastiInput.addEventListener('input', hitungIuran);

form.addEventListener('submit', e => {
    e.preventDefault();

    // Pencegah Bot Spam
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot !== "") {
        alert("Terima kasih! Konfirmasi kehadiran Anda telah tersimpan.");
        form.reset();
        return; 
    }

    btnKirim.innerHTML = "Mengirim...";
    btnKirim.disabled = true;

    const formData = new FormData(form);
    
    // Ubah string ">5" menjadi angka asli agar terbaca di Sheets
    if (formData.get('jumlah') === '>5' && jumlahPastiInput) {
        formData.set('jumlah', jumlahPastiInput.value);
    }

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
        updateForm(); // Kembalikan tampilan form ke awal
        btnKirim.innerHTML = "Kirim Konfirmasi";
        btnKirim.disabled = false;
    })
    .catch(error => {
        alert("Terjadi kesalahan. Silakan coba lagi.");
        btnKirim.innerHTML = "Kirim Konfirmasi";
        btnKirim.disabled = false;
    });
});