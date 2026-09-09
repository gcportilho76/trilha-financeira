import React, { useState } from 'react';
import { Lock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { TOKENS } from '../lib/tokens';
import { CHECKOUT_LINKS } from '../lib/checkoutLinks';
import { useAuth } from '../context/AuthContext';
import RedeemCode from './RedeemCode';

const VOLUME_TITLES = {
  vol2_access: 'Quitação de Dívidas',
  vol3_access: 'Construção de Patrimônio',
  vol4_access: 'Liberdade Financeira',
};

/**
 * Envolve qualquer módulo pago. Se o usuário já tem acesso, renderiza
 * os `children` normalmente. Se não tem, mostra a tela de cadeado.
 *
 * Uso:
 *   <PaywallGate volume="vol2_access">
 *     <ModuloDeNegociacao />
 *   </PaywallGate>
 */
export default function PaywallGate({ volume, children }) {
  const { profile, loading } = useAuth();
  const [showRedeem, setShowRedeem] = useState(false);

  if (loading) return null; // ou um spinner, se preferir

  const hasAccess = !!profile?.[volume];
  if (hasAccess) return children;

  return (
    <div style={{
      background: TOKENS.card, borderRadius: 14, padding: 28,
      border: `1px solid ${TOKENS.line}`, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', background: TOKENS.stone,
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
      }}>
        <Lock size={24} color="#fff" />
      </div>

      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, margin: '0 0 8px', color: TOKENS.ink }}>
        {VOLUME_TITLES[volume] ?? 'Módulo bloqueado'}
      </h3>
      <p style={{ fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.5, margin: '0 0 20px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
        Este módulo faz parte de um volume ainda não liberado na sua conta.
      </p>

      <a href={CHECKOUT_LINKS[volume]} target="_blank" rel="noreferrer" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 8,
        background: TOKENS.primary, color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
      }}>
        Desbloquear agora <ExternalLink size={15} />
      </a>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => setShowRedeem(!showRedeem)} style={{
          background: 'none', border: 'none', color: TOKENS.inkSoft, fontSize: 12.5, fontWeight: 600,
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0,
        }}>
          Já comprei o livro na Amazon {showRedeem ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {showRedeem && (
          <div style={{ marginTop: 14, textAlign: 'left' }}>
            <RedeemCode compact />
          </div>
        )}
      </div>
    </div>
  );
}
