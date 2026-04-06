import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    // BUG FIX: login() adalah async tapi tidak di-await — result selalu Promise (truthy), bukan { ok, error }
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.ok) setError(result.error ?? 'Login gagal.');
  }

  return (
    <div style={{
      height: '100vh', width: '100vw',
      background: 'var(--bg0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 340 }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'var(--purple)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: '#fff',
            marginBottom: 12,
            letterSpacing: '-0.02em',
          }}>IF</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text1)' }}>kelas.id</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>
            IF-2024-A · Teknik Informatika
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text1)', marginBottom: 18 }}>
            Masuk ke akun kamu
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Username */}
            <div>
              <label style={labelStyle}>Username</label>
              <input
                style={inputStyle(error)}
                type="text"
                autoComplete="username"
                placeholder="contoh: rizka"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inputStyle(error), paddingRight: 38 }}
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text3)', fontSize: 12,
                    cursor: 'pointer', padding: '2px 4px',
                  }}
                >{showPass ? 'hide' : 'show'}</button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                fontSize: 11, color: 'var(--red)',
                background: '#3d1a1a',
                border: '1px solid #5a2020',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '9px 0',
                background: loading ? 'var(--bg5)' : 'var(--purple)',
                color: loading ? 'var(--text3)' : '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Hint */}
        <div style={{
          marginTop: 14, textAlign: 'center',
          fontSize: 10, color: 'var(--text3)',
          fontFamily: 'var(--font-mono)',
        }}>
          Belum punya akun? Hubungi admin kelas.
        </div>

        {/* Dev hint — hapus sebelum deploy ke production */}
        {import.meta.env.DEV && (
          <div style={{
            marginTop: 18,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text3)',
          }}>
            <div style={{ color: 'var(--purple)', marginBottom: 5, fontWeight: 700 }}>// dev — akun default</div>
            <div>admin → <span style={{ color: 'var(--text2)' }}>admin / admin123</span></div>
            <div>mahasiswa → <span style={{ color: 'var(--text2)' }}>rizka / rizka123</span></div>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text3)',
  fontFamily: 'var(--font-mono)',
  marginBottom: 5,
};

const inputStyle = (hasError) => ({
  width: '100%',
  background: 'var(--bg3)',
  border: `1px solid ${hasError ? '#5a2020' : 'var(--border2)'}`,
  borderRadius: 'var(--radius-sm)',
  padding: '7px 10px',
  fontSize: 13,
  color: 'var(--text1)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
});
