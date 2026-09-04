import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import TrilhaFinanceira from './TrilhaFinanceira';
import { TOKENS, fontImport } from './lib/tokens';

function LoadingScreen() {
  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif", background: TOKENS.bg, minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <style>{fontImport}</style>
      <p style={{ color: TOKENS.inkSoft, fontSize: 14 }}>Carregando sua trilha...</p>
    </div>
  );
}

function Gate() {
  const { session, profile, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'signup'

  if (loading) return <LoadingScreen />;

  if (!session) {
    return authScreen === 'login'
      ? <Login onSwitchToSignUp={() => setAuthScreen('signup')} />
      : <SignUp onSwitchToLogin={() => setAuthScreen('login')} />;
  }

  // Sessão existe, mas o profile ainda não chegou (raríssimo — só
  // no instante entre confirmar o cadastro e a trigger rodar).
  if (!profile) return <LoadingScreen />;

  return <TrilhaFinanceira profile={profile} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
