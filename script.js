const form = document.getElementById("form-kriteria");
const hasilDiv = document.getElementById("hasil-ranking");
const loadingScreen = document.getElementById("loading-screen");

/**
 * PENTING: Ganti URL di bawah ini dengan URL Publik dari Railway Anda
 * Contoh: https://database-production.up.railway.app/api/hitung
 */
const API_URL = "https://database-production.up.railway.app/api/hitung"; 

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Ambil nilai input dari user
    const w_harga = parseFloat(document.getElementById("harga").value);
    const w_ram = parseFloat(document.getElementById("ram").value);
    const w_ssd = parseFloat(document.getElementById("ssd").value);
    const w_prosesor = parseFloat(document.getElementById("prosesor").value) || 1;
    const w_gpu = parseFloat(document.getElementById("gpu").value) || 1;
    const w_berat = parseFloat(document.getElementById("berat").value);

    // Validasi sederhana
    if (!w_harga || !w_ram || !w_ssd || !w_berat) {
        alert("⚠️ Tolong isi semua kriteria dengan benar!");
        return;
    }

    // 2. Tampilkan animasi loading
    loadingScreen.style.display = "flex";
    hasilDiv.innerHTML = `<p style="text-align:center; opacity:0.7;">Sedang menghitung rekomendasi...</p>`;

    try {
        // 3. Kirim data ke Backend Railway
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                w_harga,
                w_ram,
                w_prosesor,
                w_gpu,
                w_ssd,
                w_berat
            }),
        });

        const data = await response.json();
        loadingScreen.style.display = "none";

        if (response.ok) {
            // 4. Render Hasil Ranking
            let html = `
                <div class="result-card">
                    <h2 style="margin-bottom: 10px;">📊 Hasil Ranking Laptop</h2>
                    <p style="margin-bottom: 20px; font-size: 0.9rem; opacity: 0.8;">
                        Urutan berdasarkan perhitungan metode SAW (Simple Additive Weighting):
                    </p>
                    <div class="ranking-list">
            `;

            data.hasil.forEach((item, index) => {
                // Menentukan kelas khusus untuk peringkat 1
                const isFirst = index === 0 ? "top-rank" : "";
                const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;

                html += `
                    <div class="rank-item ${isFirst}" style="
                        display: flex; 
                        justify-content: space-between; 
                        align-items: center; 
                        background: rgba(255,255,255,0.1); 
                        padding: 15px; 
                        margin-bottom: 10px; 
                        border-radius: 12px;
                        border-left: 5px solid ${index === 0 ? '#38bdf8' : 'transparent'};
                    ">
                        <span>${medal} <b>${item.nama_laptop}</b></span>
                        <span class="score" style="font-weight: bold; color: #38bdf8;">
                            ${parseFloat(item.skor).toFixed(4)}
                        </span>
                    </div>`;
            });

            html += "</div></div>";
            hasilDiv.innerHTML = html;
        } else {
            hasilDiv.innerHTML = `<div class="error-box" style="color: #ff4d4d;">❌ Error: ${data.message}</div>`;
        }

    } catch (err) {
        loadingScreen.style.display = "none";
        hasilDiv.innerHTML = `
            <div class="error-box" style="padding: 20px; background: rgba(255,0,0,0.1); border-radius: 10px;">
                <p style="color: #ff4d4d; font-weight: bold;">⚠️ Gagal terhubung ke API</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">
                    Pastikan server Backend di Railway sudah aktif dan link API_URL sudah benar.<br>
                    Detail: ${err.message}
                </p>
            </div>
        `;
    }
});