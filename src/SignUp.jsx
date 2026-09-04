import React, { useState } from 'react';
import { UserPlus, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TOKENS, fontImport } from '../lib/tokens';

export default function SignUp({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (error) {
      setError(traduzErro(error.message));
    } else {
      // Importante: se a confirmação de e-mail estiver ativada no
      // projeto Supabase (Authentication > Providers > Email), a
      // linha em `profiles` só é criada quando o e-mail é
      // confirmado — o trigger dispara na criação do usuário no
      // auth.users, que acontece nesse momento em alguns fluxos, e
      // no signUp em outros, dependendo da configuração. Teste o
      // seu fluxo específico para confirmar quando o profile nasce.
      setDone(true);
    }
  };

  if (done) {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: TOKENS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <style>{fontImport}</style>
        <div style={{ width: '100%', maxWidth: 380, background: TOKENS.card, borderRadius: 16, padding: 28, border: `1px solid ${TOKENS.line}`, textAlign: 'center' }}>
          <CheckCircle2 size={36} color={TOKENS.primary} style={{ margin: '0 auto 14px' }} />
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, margin: '0 0 8px', color: TOKENS.primary }}>Quase lá!</h1>
          <p style={{ fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.5 }}>
            Enviamos um link de confirmação para <strong style={{ color: TOKENS.ink }}>{email}</strong>. Abra o e-mail e confirme para começar sua trilha.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: TOKENS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{fontImport}</style>
      <div style={{ width: '100%', maxWidth: 380, background: TOKENS.card, borderRadius: 16, padding: 28, border: `1px solid ${TOKENS.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: TOKENS.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={17} color="#fff" />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, margin: 0, color: TOKENS.primary }}>Criar conta</h1>
        </div>
        <p style={{ fontSize: 13, color: TOKENS.inkSoft, margin: '0 0 22px' }}>O Volume 1 já começa liberado para você.</p>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" required autoComplete="email"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Senha</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required autoComplete="new-password"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Confirmar senha</label>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required autoComplete="new-password"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 18, boxSizing: 'border-box' }} />

          {error && <p style={{ fontSize: 12.5, color: TOKENS.ghost, margin: '0 0 14px' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: TOKENS.primary,
            color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
          }}>{loading ? 'Criando conta...' : 'Criar conta'}</button>
        </form>

        <p style={{ fontSize: 13, color: TOKENS.inkSoft, textAlign: 'center', marginTop: 18 }}>
          Já tem conta?{' '}
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: TOKENS.primary, fontWeight: 600, cursor: 'pointer', padding: 0, fontSize: 13 }}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}

function traduzErro(msg) {
  if (msg.includes('already registered') || msg.includes('already exists')) return 'Já existe uma conta com esse e-mail.';
  if (msg.includes('Password')) return 'A senha não atende aos requisitos mínimos.';
  return 'Não foi possível criar a conta. Tente novamente.';
}
