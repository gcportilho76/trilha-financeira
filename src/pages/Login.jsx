import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TOKENS, fontImport } from '../lib/tokens';

export default function Login({ onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(traduzErro(error.message));
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: TOKENS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{fontImport}</style>
      <div style={{ width: '100%', maxWidth: 380, background: TOKENS.card, borderRadius: 16, padding: 28, border: `1px solid ${TOKENS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: TOKENS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogIn size={17} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: 0, color: TOKENS.primary }}>Entrar</h1>
        </div>
        <p style={{ fontSize: 13, color: TOKENS.inkSoft, margin: '0 0 22px' }}>Continue de onde parou na sua trilha financeira.</p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoComplete="email"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required autoComplete="current-password"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 18, boxSizing: 'border-box' }} />

          {error && <p style={{ fontSize: 12.5, color: TOKENS.ghost, margin: '0 0 14px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: TOKENS.primary,
            color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>

        <p style={{ fontSize: 13, color: TOKENS.inkSoft, textAlign: 'center', marginTop: 18 }}>
          Ainda não tem conta?{' '}
          <button onClick={onSwitchToSignUp} style={{ background: 'none', border: 'none', color: TOKENS.primary, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13 }}>
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}

function traduzErro(msg) {
  if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (msg.includes('Email not confirmed')) return 'Confirme seu e-mail antes de entrar (verifique sua caixa de entrada).';
  return 'Não foi possível entrar. Tente novamente.';
}
