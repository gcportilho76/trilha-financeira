import React, { useState } from 'react';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { TOKENS } from '../lib/tokens';
import { useAuth } from '../context/AuthContext';

const VOLUME_LABELS = {
  vol2_access: 'Volume 2 — Quitação de Dívidas',
  vol3_access: 'Volume 3 — Construção de Patrimônio',
  vol4_access: 'Volume 4 — Liberdade Financeira',
};

export default function RedeemCode({ compact = false }) {
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setStatus('loading');
    setMessage('');

    const { data, error } = await supabase.rpc('redeem_code', { p_code: code.trim().toUpperCase() });

    if (error) {
      setStatus('error');
      setMessage('Não foi possível resgatar agora. Tente novamente.');
      return;
    }

    if (data?.success) {
      setStatus('success');
      setMessage(`${VOLUME_LABELS[data.volume] ?? 'Volume'} liberado!`);
      setCode('');
      await refreshProfile();
    } else {
      setStatus('error');
      setMessage(data?.error ?? 'Código inválido.');
    }
  };

  return (
    <div style={{ background: compact ? 'transparent' : TOKENS.bg, borderRadius: 10, padding: compact ? 0 : 14 }}>
      {!compact && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 10px' }}>
          <Ticket size={15} /> Comprou o livro na Amazon? Resgate seu código aqui.
        </p>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Ex: A1B2-C3D4-E5F6"
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`,
            fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5, boxSizing: 'border-box',
          }}
        />
        <button onClick={handleRedeem} disabled={status === 'loading'} style={{
          padding: '10px 16px', borderRadius: 8, border: 'none', background: TOKENS.gold,
          color: '#fff', fontWeight: 600, fontSize: 13.5, cursor: status === 'loading' ? 'default' : 'pointer',
          opacity: status === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap',
        }}>{status === 'loading' ? 'Verificando...' : 'Resgatar'}</button>
      </div>

      {status === 'success' && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: TOKENS.primary, marginTop: 10 }}>
          <CheckCircle2 size={15} /> {message}
        </p>
      )}
      {status === 'error' && (
        <p style={{ fontSize: 13, color: TOKENS.ghost, marginTop: 10 }}>{message}</p>
      )}
    </div>
  );
}
