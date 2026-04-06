// src/lib/exportAbsensi.js
// Export absensi ke Excel (.xlsx) dan PDF — client-side, tanpa backend tambahan
// Menggunakan SheetJS (xlsx) dan jsPDF via CDN yang di-load dynamic

// ── Helper format tanggal ─────────────────────────────────────────────────────
function fmt(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function fmtShort(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ── Load library dinamis (CDN) ────────────────────────────────────────────────
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload  = resolve;
    s.onerror = () => reject(new Error(`Gagal load: ${src}`));
    document.head.appendChild(s);
  });
}

async function ensureXLSX() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  return window.XLSX;
}

async function ensureJsPDF() {
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
  return window.jspdf.jsPDF;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT EXCEL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export rekap per sesi ke Excel
 * @param {Array} data - data dari absensiApi.list()
 * @param {string} kelasNama
 */
export async function exportExcelPerSesi(data, kelasNama = 'Kelas') {
  const XLSX = await ensureXLSX();

  const rows = data.map((a, i) => ({
    'No':         i + 1,
    'Tanggal':    fmtShort(a.tanggal),
    'Mata Kuliah': a.matkul?.nama ?? '—',
    'Kode':       a.matkul?.kode ?? '—',
    'Hadir':      a.hadir,
    'Izin':       a.izin,
    'Alpha':      a.alpha,
    'Total':      a.total,
    'Persentase': `${Math.round((a.hadir / (a.total || 1)) * 100)}%`,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Lebar kolom
  ws['!cols'] = [
    { wch: 4 }, { wch: 14 }, { wch: 30 }, { wch: 12 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Per Sesi');
  XLSX.writeFile(wb, `Absensi_PerSesi_${kelasNama.replace(/\s/g,'_')}.xlsx`);
}

/**
 * Export rekap per mahasiswa ke Excel
 * @param {Array} data - data dari absensiApi.list()
 * @param {string} kelasNama
 */
export async function exportExcelPerMahasiswa(data, kelasNama = 'Kelas') {
  const XLSX = await ensureXLSX();

  // Kumpulkan semua mahasiswa dari detail
  const mahasiswaMap = {}; // { userId: { nama, nim, hadir, izin, alpha, total } }

  data.forEach(sesi => {
    (sesi.detail ?? []).forEach(d => {
      const uid = d.user?.id ?? d.userId;
      if (!mahasiswaMap[uid]) {
        mahasiswaMap[uid] = {
          nama:  d.user?.nama ?? '—',
          nim:   d.user?.nim  ?? '—',
          hadir: 0, izin: 0, alpha: 0, total: 0,
        };
      }
      mahasiswaMap[uid][d.status]++;
      mahasiswaMap[uid].total++;
    });
  });

  const rows = Object.values(mahasiswaMap)
    .sort((a, b) => a.nim.localeCompare(b.nim))
    .map((m, i) => ({
      'No':           i + 1,
      'Nama':         m.nama,
      'NIM':          m.nim,
      'Hadir':        m.hadir,
      'Izin':         m.izin,
      'Alpha':        m.alpha,
      'Total Sesi':   m.total,
      'Kehadiran (%)': `${Math.round((m.hadir / (m.total || 1)) * 100)}%`,
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 4 }, { wch: 28 }, { wch: 12 },
    { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Per Mahasiswa');
  XLSX.writeFile(wb, `Absensi_PerMahasiswa_${kelasNama.replace(/\s/g,'_')}.xlsx`);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PDF
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export rekap per sesi ke PDF
 */
export async function exportPDFPerSesi(data, kelasNama = 'Kelas') {
  const JsPDF = await ensureJsPDF();
  const doc   = new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekap Absensi Per Sesi', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kelas: ${kelasNama}`, 14, 23);
  doc.text(`Dicetak: ${fmt(new Date())}`, 14, 29);

  const rows = data.map((a, i) => [
    i + 1,
    fmtShort(a.tanggal),
    a.matkul?.nama ?? '—',
    a.matkul?.kode ?? '—',
    a.hadir,
    a.izin,
    a.alpha,
    a.total,
    `${Math.round((a.hadir / (a.total || 1)) * 100)}%`,
  ]);

  doc.autoTable({
    startY: 34,
    head: [['No', 'Tanggal', 'Mata Kuliah', 'Kode', 'Hadir', 'Izin', 'Alpha', 'Total', '%']],
    body: rows,
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [74, 47, 140], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 60 },
      3: { cellWidth: 25 },
      4: { cellWidth: 16 },
      5: { cellWidth: 16 },
      6: { cellWidth: 16 },
      7: { cellWidth: 16 },
      8: { cellWidth: 18 },
    },
  });

  // Footer halaman
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount} — ${kelasNama}`,
      doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Absensi_PerSesi_${kelasNama.replace(/\s/g,'_')}.pdf`);
}

/**
 * Export rekap per mahasiswa ke PDF
 */
export async function exportPDFPerMahasiswa(data, kelasNama = 'Kelas') {
  const JsPDF = await ensureJsPDF();
  const doc   = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rekap Kehadiran Per Mahasiswa', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kelas: ${kelasNama}`, 14, 23);
  doc.text(`Dicetak: ${fmt(new Date())}`, 14, 29);
  doc.text(`Total sesi: ${data.length}`, 14, 35);

  // Kumpulkan data per mahasiswa
  const mahasiswaMap = {};
  data.forEach(sesi => {
    (sesi.detail ?? []).forEach(d => {
      const uid = d.user?.id ?? d.userId;
      if (!mahasiswaMap[uid]) {
        mahasiswaMap[uid] = { nama: d.user?.nama ?? '—', nim: d.user?.nim ?? '—', hadir: 0, izin: 0, alpha: 0, total: 0 };
      }
      mahasiswaMap[uid][d.status]++;
      mahasiswaMap[uid].total++;
    });
  });

  const rows = Object.values(mahasiswaMap)
    .sort((a, b) => a.nim.localeCompare(b.nim))
    .map((m, i) => {
      const pct = Math.round((m.hadir / (m.total || 1)) * 100);
      return [i + 1, m.nama, m.nim, m.hadir, m.izin, m.alpha, m.total, `${pct}%`];
    });

  doc.autoTable({
    startY: 40,
    head: [['No', 'Nama', 'NIM', 'Hadir', 'Izin', 'Alpha', 'Total', '%']],
    body: rows,
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [74, 47, 140], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 16 },
      4: { cellWidth: 16 },
      5: { cellWidth: 16 },
      6: { cellWidth: 16 },
      7: { cellWidth: 18 },
    },
    // Warnai baris dengan kehadiran rendah (<75%)
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 7) {
        const pct = parseInt(hookData.cell.raw);
        if (pct < 75) {
          hookData.cell.styles.textColor  = [220, 53, 69];
          hookData.cell.styles.fontStyle  = 'bold';
        } else if (pct >= 90) {
          hookData.cell.styles.textColor  = [40, 167, 69];
          hookData.cell.styles.fontStyle  = 'bold';
        }
      }
    },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Halaman ${i} dari ${pageCount} — ${kelasNama}`,
      doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  doc.save(`Absensi_PerMahasiswa_${kelasNama.replace(/\s/g,'_')}.pdf`);
}