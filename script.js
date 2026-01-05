const form = document.getElementById("form-kriteria");
const hasilDiv = document.getElementById("hasil-ranking");
const loadingScreen = document.getElementById("loading-screen");

// Pastikan URL ini sesuai dengan URL Vercel kamu
const API_URL = "https://databaselaptop.vercel.app/api/hitung";

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Ambil nilai input dan pastikan tipe datanya Float
    const w_harga = parseFloat(document.getElementById("harga").value);
    const w_ram = parseFloat(document.getElementById("ram").value);
    const w_ssd = parseFloat(document.getElementById("ssd").value);
    const w_prosesor = parseFloat(document.getElementById("prosesor").value);
    const w_gpu = parseFloat(document.getElementById("gpu").value);
    const w_berat = parseFloat(document.getElementById("berat").value);

    // 2. Validasi ketat: Jangan biarkan ada nilai kosong atau NaN
    if ([w_harga, w_ram, w_ssd, w_prosesor, w_gpu, w_berat].some(isNaN)) {
        alert("⚠️ Semua kriteria harus diisi dengan angka!");
        return;
    }

    // Tampilkan animasi loading
    loadingScreen.style.display = "flex";
    hasilDiv.innerHTML = `<p style="text-align:center; opacity:0.7;">Sedang menghitung peringkat...</p>`;

    try {
        // 3. Kirim data ke Backend (Nama Key harus sesuai dengan required_keys di Python)
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                "w_harga": w_harga,
                "w_ram": w_ram,
                "w_prosesor": w_prosesor,
                "w_gpu": w_gpu,
                "w_ssd": w_ssd,
                "w_berat": w_berat
            }),
        });

        const data = await response.json();
        loadingScreen.style.display = "none";

        if (response.ok) {
            // 4. Render Hasil Ranking
            let html = `
                <div class="result-card">
                    <h2 style="margin-bottom: 15px;">📊 Rekomendasi Laptop (SAW)</h2>
                    <div class="ranking-list">
            `;

            if (data.hasil.length === 0) {
                html += `<p>Tidak ada data laptop untuk dihitung.</p>`;
            } else {
                data.hasil.forEach((item, index) => {
                    const isFirst = index === 0 ? "top-rank" : "";
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
                    
                    html += `
                        <div class="rank-item ${isFirst}" style="
                            display: flex; 
                            justify-content: space-between; 
                            background: rgba(255,255,255,0.05); 
                            padding: 15px; 
                            margin-bottom: 8px; 
                            border-radius: 8px;
                            border-left: 4px solid ${index === 0 ? '#38bdf8' : 'transparent'};
                        ">
                            <span>${medal} <b>${item.nama_laptop}</b></span>
                            <span style="font-weight: bold; color: #38bdf8;">${item.skor}</span>
                        </div>`;
                });
            }

            html += "</div></div>";
            hasilDiv.innerHTML = html;
        } else {
            // Jika backend mengirim error (Misal: Database Kosong atau Koneksi Gagal)
            hasilDiv.innerHTML = `<div class="error-box" style="color:#ff4d4d; background:rgba(255,0,0,0.1); padding:15px; border-radius:8px;">
                ❌ Error: ${data.message}
            </div>`;
        }

    } catch (err) {
        loadingScreen.style.display = "none";
        hasilDiv.innerHTML = `
            <div class="error-box" style="padding: 20px; background: rgba(255,0,0,0.1); border-radius: 10px;">
                <p style="color: #ff4d4d; font-weight: bold;">⚠️ Gagal Menghubungkan ke API</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">${err.message}</p>
            </div>`;
    }
});
