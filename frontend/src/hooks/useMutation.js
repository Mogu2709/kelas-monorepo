// frontend/src/hooks/useMutation.js
// Re-export dari useApi agar semua komponen bisa import dari sini
// tanpa breaking change — pattern return { ok, data } / { ok: false, error }
export { useMutation } from './useApi';
