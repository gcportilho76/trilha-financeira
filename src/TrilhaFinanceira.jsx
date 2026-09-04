import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import PaywallGate from './components/PaywallGate';
import { Lock, CheckCircle2, Wallet, TrendingUp, Shield, ChevronRight, ChevronLeft, Plus, X, Ghost, Home, Sparkles, Coins, Compass, Wind, Anchor, HeartHandshake, Users, PiggyBank, Snowflake, Mountain, Calendar, AlertTriangle, FileText, Copy, Clock, Activity, ClipboardCheck, Layers, Repeat, ShieldCheck, Target, ListOrdered, Landmark } from 'lucide-react';

const TOKENS = {
  bg: '#F5F3EC',
  card: '#FFFFFF',
  ink: '#1E241F',
  inkSoft: '#5B6459',
  primary: '#173328',
  primaryLight: '#2C5245',
  gold: '#B8933F',
  goldSoft: '#E7D9B8',
  ghost: '#A6512E',
  stone: '#C7C2B4',
  line: '#E4E0D3',
};

const QUESTIONS = [
  { id: 'q1', text: 'Quando penso em olhar meu extrato bancário, eu sinto...', options: ['Alívio', 'Ansiedade', 'Indiferença', 'Vergonha'] },
  { id: 'q2', text: 'Na minha casa, quando eu era criança, dinheiro era um assunto que...', options: ['Se falava abertamente', 'Era tabu', 'Causava brigas', 'Nunca faltava'] },
  { id: 'q3', text: 'Quando estou cansado(a) ou triste, a coisa que mais me dá vontade de comprar é...', options: ['Comida/delivery', 'Roupas', 'Assinaturas/apps', 'Nada, eu evito gastar'] },
  { id: 'q4', text: 'Hoje, quando alguém fala em "fazer orçamento", minha reação é...', options: ['Curiosidade', 'Cansaço', 'Ansiedade', 'Alívio'] },
];

const CATS = {
  essencial: { label: 'Essencial', icon: Home, color: TOKENS.primary },
  estilo: { label: 'Estilo de Vida', icon: Sparkles, color: TOKENS.gold },
  fantasma: { label: 'Vazamento Fantasma', icon: Ghost, color: TOKENS.ghost },
};

const CHECKLIST_WEEKS = [
  { title: 'Semana 1 — Estancar vazamentos', items: ['Revisei minha lista de Vazamentos Fantasmas', 'Cancelei ao menos 2 assinaturas não usadas', 'Negociei uma tarifa bancária desnecessária'] },
  { title: 'Semana 2 — Ajustar e reunir a família', items: ['Recalculei minhas % de Essencial/Estilo/Futuro', 'Marquei a primeira Mesa Redonda Financeira', 'Saímos da reunião com uma prioridade clara'] },
  { title: 'Semana 3 — Criar a reserva', items: ['Escolhi onde guardar a reserva', 'Automatizei uma transferência mensal', 'Fiz meu primeiro aporte'] },
  { title: 'Semana 4 — Mapear dívidas', items: ['Listei todas as minhas dívidas', 'Escolhi Bola de Neve ou Avalanche', 'Defini qual dívida atacar primeiro'] },
];

const ROTEIRO_MESA_REDONDA = [
  { min: '1-5 min', title: 'Abertura leve', desc: 'Relembrem o objetivo em comum que motivou essa conversa.' },
  { min: '5-15 min', title: 'Retrato atual, sem julgamento', desc: 'Compartilhem os números já levantados: quanto entra, quanto sai, vazamentos identificados.' },
  { min: '15-22 min', title: 'Uma prioridade para o período', desc: 'Escolham juntos uma única prioridade para as próximas semanas.' },
  { min: '22-27 min', title: 'Divisão de responsabilidades', desc: 'Decidam quem fica responsável por qual ação até o próximo encontro.' },
  { min: '27-30 min', title: 'Encerramento positivo', desc: 'Reconheçam o esforço e marquem a data da próxima Mesa Redonda.' },
];

const DEBT_TYPES = {
  financiamento_veiculo: { label: 'Financiamento de veículo', risk: 'alto' },
  financiamento_imovel: { label: 'Financiamento imobiliário', risk: 'alto' },
  consignado: { label: 'Consignado (alta comprometimento)', risk: 'alto' },
  conta_essencial: { label: 'Conta essencial (água/luz)', risk: 'alto' },
  rotativo: { label: 'Cartão de crédito rotativo', risk: 'baixo' },
  cheque_especial: { label: 'Cheque especial', risk: 'baixo' },
  emprestimo_pessoal: { label: 'Empréstimo pessoal sem garantia', risk: 'baixo' },
  divida_antiga: { label: 'Dívida antiga (perto da prescrição)', risk: 'baixo' },
};

function descontoEsperado(mesesAtraso) {
  if (mesesAtraso >= 24) return '70% a 90%';
  if (mesesAtraso >= 12) return '40% a 60%';
  if (mesesAtraso >= 6) return '20% a 40%';
  return '10% a 20%';
}

const RECONSTRUCAO_CHECKLIST = [
  'Mantenho o Cadastro Positivo ativo',
  'Pago contas de consumo (água, luz, telefone) no meu nome, em dia',
  'Evito abrir vários cartões ou fazer várias consultas de crédito em pouco tempo',
  'Mantenho ao menos uma linha de crédito ativa e com uso baixo',
  'Revejo meu nome nos birôs a cada poucos meses',
];

const GAVETAS = {
  curto: { label: 'Curto Prazo (0-2 anos)', desc: 'Liquidez', color: '#2C5245' },
  medio: { label: 'Médio Prazo (2-5 anos)', desc: 'Proteção/Crescimento', color: '#B8933F' },
  longo: { label: 'Longo Prazo (5+ anos)', desc: 'Independência', color: '#A6512E' },
};

const AUTOMACAO_PROTECAO_CHECKLIST = [
  { section: 'Automação', items: ['Transferência automática configurada no dia do recebimento', 'Ordens de compra recorrentes programadas na corretora', 'Reinvestimento automático de proventos ativado'] },
  { section: 'Proteção Patrimonial', items: ['Seguro de vida contratado (se há dependentes)', 'Seguro saúde ativo', 'Previdência privada avaliada (PGBL/VGBL)', 'Documento de sucessão organizado e atualizado'] },
];

const FATORES_RETIRADA = [
  { key: '4', label: '4% (25x)', factor: 25, desc: 'Regra original — mais risco no Brasil' },
  { key: '3.5', label: '3,5% (28,5x)', factor: 28.5, desc: 'Recomendado para o Brasil' },
  { key: '3', label: '3% (33,3x)', factor: 33.3, desc: 'Perfil conservador' },
];

const ORDEM_SAQUE = [
  { key: 'proventos', label: 'Proventos em caixa', desc: 'Dividendos, JCP e rendimentos já recebidos' },
  { key: 'buffer', label: 'Buffer de Liquidez', desc: 'Renda fixa/caixa — só se os proventos não bastarem' },
  { key: 'rebalance', label: 'Rebalanceamento', desc: 'Venda do que valorizou acima da meta' },
  { key: 'venda', label: 'Venda marginal de depreciados', desc: 'Último recurso' },
];

const SUCESSAO_NIVEIS = [
  { title: 'Nível 1 — Básico', items: ['Tenho testamento ou documento formal de vontade', 'Beneficiários de seguros e previdência estão atualizados', 'Família sabe onde encontrar a lista de bens e documentos'] },
  { title: 'Nível 2 — Intermediário', items: ['Possuo previdência privada (VGBL/PGBL) como liquidez pós-óbito', 'Já avaliei doação em vida dentro do limite da legítima', 'Tenho estimativa do ITCMD que incidiria hoje, no meu estado'] },
  { title: 'Nível 3 — Avançado', items: ['Avaliei a viabilidade de uma holding patrimonial familiar', 'Considerei cláusulas de proteção (inalienabilidade, impenhorabilidade etc.)'] },
  { title: 'Nível 4 — Internacional', items: ['Avaliei internacionalização de parte do patrimônio', 'Entendo as implicações fiscais de offshore, PIC ou trust'] },
];

const PROFILES = {
  evitador: {
    title: 'O Evitador Silencioso',
    Icon: Wind,
    color: TOKENS.ghost,
    text: 'Olhar para as contas te dá um aperto no peito — por isso você adia. Isso não é preguiça, é uma reação de proteção. A boa notícia: pequenos olhares curtos e frequentes, sem cobrança, tiram esse peso aos poucos.',
    tip: 'Comece pela Semana da Lupa com apenas 2 minutos por dia. Sem julgamento, só registro.',
  },
  ansioso: {
    title: 'O Vigilante Ansioso',
    Icon: Anchor,
    color: TOKENS.gold,
    text: 'Você até olha para o dinheiro, mas isso vem acompanhado de ansiedade constante — como se um erro pudesse desmoronar tudo. Seu desafio não é falta de atenção, é transformar vigilância em sistema.',
    tip: 'A Régua 50/30/20 vai te dar um número claro para observar, em vez de uma sensação difusa de alerta.',
  },
  impulsivo: {
    title: 'O Consolador por Impulso',
    Icon: HeartHandshake,
    color: TOKENS.primary,
    text: 'Em momentos difíceis, gastar é uma forma rápida de alívio emocional. Isso é humano — mas seu orçamento sente o impacto sem que você perceba a causa.',
    tip: 'Na Semana da Lupa, anote também como você se sentia ao gastar. Esse padrão vai aparecer sozinho.',
  },
  curioso: {
    title: 'O Explorador em Construção',
    Icon: Compass,
    color: TOKENS.primaryLight,
    text: 'Você já encara o dinheiro com mais curiosidade do que medo — uma base ótima para organizar rápido. Falta menos motivação e mais estrutura.',
    tip: 'Vá direto para a Régua 50/30/20: você já tem a mentalidade certa para aproveitar os números.',
  },
};

function computeProfile(answers) {
  const vals = Object.values(answers);
  const score = { evitador: 0, ansioso: 0, impulsivo: 0, curioso: 0 };
  vals.forEach(v => {
    if (['Vergonha', 'Era tabu', 'Nada, eu evito gastar'].includes(v)) score.evitador++;
    if (['Ansiedade', 'Causava brigas'].includes(v)) score.ansioso++;
    if (['Comida/delivery', 'Roupas', 'Assinaturas/apps'].includes(v)) score.impulsivo++;
    if (['Alívio', 'Curiosidade', 'Se falava abertamente', 'Nunca faltava'].includes(v)) score.curioso++;
  });
  const top = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  return PROFILES[top];
}

// Substitui o antigo window.storage (exclusivo do ambiente Claude)
// por persistência real na tabela `user_data` do Supabase, uma
// linha por (usuário, chave). A assinatura pública do hook
// continua a mesma — [value, setValue, loaded] — então nenhum
// componente que já usa useStored('chave', valorInicial) precisa
// mudar, só a implementação por trás dele.
function useStored(userId, key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  // Carrega o valor salvo assim que sabemos quem é o usuário.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('value')
        .eq('user_id', userId)
        .eq('key', key)
        .maybeSingle();
      if (!active) return;
      if (!error && data) setValue(data.value);
      setLoaded(true);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, key]);

  // Salva com um pequeno debounce, para não disparar uma escrita a
  // cada tecla digitada (ex: no campo de valor do gasto).
  useEffect(() => {
    if (!loaded || !userId) return;
    const timeout = setTimeout(() => {
      supabase
        .from('user_data')
        .upsert(
          { user_id: userId, key, value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,key' }
        )
        .then(({ error }) => {
          if (error) console.error(`Erro ao salvar "${key}":`, error);
        });
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, loaded, userId, key]);

  return [value, setValue, loaded];
}

function ProgressStone({ n, label, Icon, unlocked, current, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        background: 'none', border: 'none', cursor: 'pointer',
        opacity: unlocked ? 1 : 0.55, flex: 1, padding: '4px 0',
      }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: unlocked ? (current ? TOKENS.gold : TOKENS.primary) : TOKENS.stone,
        color: '#fff', boxShadow: current ? `0 0 0 4px ${TOKENS.goldSoft}` : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        {unlocked ? <Icon size={24} /> : <Lock size={20} />}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, textAlign: 'center', maxWidth: 84 }}>{label}</span>
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: TOKENS.card, borderRadius: 14, padding: 20,
      border: `1px solid ${TOKENS.line}`, ...style,
    }}>{children}</div>
  );
}

function MindTest({ answers, setAnswers, onFinish }) {
  const allAnswered = Object.keys(answers).length >= QUESTIONS.length;
  const [step, setStep] = useState(allAnswered ? QUESTIONS.length : 0);

  const pick = (q, opt) => {
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setStep(QUESTIONS.length);
  };

  if (step >= QUESTIONS.length) {
    const profile = computeProfile(answers);
    const { Icon } = profile;
    return (
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: profile.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><Icon size={24} color="#fff" /></div>
          <div>
            <p style={{ fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: TOKENS.inkSoft, margin: 0, fontWeight: 700 }}>Seu perfil</p>
            <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, margin: 0, color: TOKENS.ink }}>{profile.title}</h3>
          </div>
        </div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: TOKENS.ink, marginBottom: 14 }}>{profile.text}</p>
        <div style={{ background: TOKENS.bg, borderRadius: 10, padding: '12px 14px', marginBottom: 18, borderLeft: `3px solid ${profile.color}` }}>
          <p style={{ fontSize: 13, color: TOKENS.inkSoft, margin: 0, lineHeight: 1.5 }}><strong style={{ color: TOKENS.ink }}>Próximo passo: </strong>{profile.tip}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setStep(0)} style={{
            flex: 1, padding: '11px 14px', borderRadius: 8, border: `1px solid ${TOKENS.line}`,
            background: TOKENS.bg, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: TOKENS.inkSoft,
          }}>Refazer teste</button>
          <button onClick={onFinish} style={{
            flex: 2, padding: '11px 14px', borderRadius: 8, border: 'none',
            background: TOKENS.primary, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
          }}>Ir para a Semana da Lupa</button>
        </div>
      </Card>
    );
  }

  const q = QUESTIONS[step];
  return (
    <Card>
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, background: i <= step ? TOKENS.gold : TOKENS.line }} />
        ))}
      </div>
      <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 20, lineHeight: 1.4, color: TOKENS.ink, marginBottom: 20 }}>{q.text}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {q.options.map(opt => (
          <button key={opt} onClick={() => pick(q, opt)} style={{
            textAlign: 'left', padding: '14px 16px', borderRadius: 10,
            border: `1px solid ${TOKENS.line}`, background: TOKENS.bg, cursor: 'pointer',
            fontSize: 15, color: TOKENS.ink, fontWeight: 500,
          }}>{opt}</button>
        ))}
      </div>
    </Card>
  );
}

function ExpenseTracker({ expenses, setExpenses }) {
  const [desc, setDesc] = useState('');
  const [val, setVal] = useState('');
  const [cat, setCat] = useState('essencial');

  const add = () => {
    if (!desc || !val) return;
    setExpenses([...expenses, { id: Date.now(), desc, val: parseFloat(val), cat }]);
    setDesc(''); setVal('');
  };
  const remove = (id) => setExpenses(expenses.filter(e => e.id !== id));

  const totals = { essencial: 0, estilo: 0, fantasma: 0 };
  expenses.forEach(e => { totals[e.cat] += e.val; });
  const total = totals.essencial + totals.estilo + totals.fantasma;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>A Semana da Lupa</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="O que foi o gasto?"
          style={{ flex: '2 1 140px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="R$" type="number"
          style={{ flex: '1 1 70px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <select value={cat} onChange={e => setCat(e.target.value)}
          style={{ flex: '1 1 140px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }}>
          {Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {expenses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18, maxHeight: 180, overflowY: 'auto' }}>
          {expenses.slice().reverse().map(e => {
            const C = CATS[e.cat];
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, padding: '6px 8px', borderRadius: 8, background: TOKENS.bg }}>
                <C.icon size={15} color={C.color} />
                <span style={{ flex: 1, color: TOKENS.ink }}>{e.desc}</span>
                <span style={{ fontWeight: 600, color: TOKENS.ink }}>R$ {e.val.toFixed(2)}</span>
                <button onClick={() => remove(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
              </div>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(CATS).map(([k, v]) => {
            const pct = total ? (totals[k] / total) * 100 : 0;
            return (
              <div key={k}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.inkSoft, marginBottom: 3 }}>
                  <span>{v.label}</span><span>R$ {totals[k].toFixed(2)} · {pct.toFixed(0)}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: TOKENS.line, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: v.color, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function BudgetMeter({ income, setIncome, expenses }) {
  const totals = { essencial: 0, estilo: 0, fantasma: 0 };
  expenses.forEach(e => { totals[e.cat] += e.val; });
  const targets = { essencial: 50, estilo: 30, fantasma: 0 };
  const rows = [
    { key: 'essencial', label: 'Essenciais', target: 50 },
    { key: 'estilo', label: 'Estilo de Vida', target: 30 },
  ];
  const futurePct = income ? Math.max(0, 100 - ((totals.essencial + totals.estilo + totals.fantasma) / income * 100)) : 0;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>Sua régua 50/30/20</h3>
      <input value={income} onChange={e => setIncome(e.target.value)} type="number" placeholder="Renda líquida mensal (R$)"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />
      {income > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map(r => {
            const actual = (totals[r.key] / income) * 100;
            return (
              <div key={r.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: TOKENS.ink }}>{r.label}</span>
                  <span style={{ color: actual > r.target ? TOKENS.ghost : TOKENS.primaryLight }}>{actual.toFixed(0)}% (meta {r.target}%)</span>
                </div>
                <div style={{ position: 'relative', height: 10, borderRadius: 5, background: TOKENS.line }}>
                  <div style={{ position: 'absolute', left: `${r.target}%`, top: -3, width: 2, height: 16, background: TOKENS.ink }} />
                  <div style={{ height: '100%', width: `${Math.min(100, actual)}%`, borderRadius: 5, background: actual > r.target ? TOKENS.ghost : TOKENS.primary }} />
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `1px dashed ${TOKENS.line}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>Sobra para o Futuro</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: TOKENS.gold, fontFamily: 'Fraunces, Georgia, serif' }}>{futurePct.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </Card>
  );
}

function Checklist({ done, setDone }) {
  const toggle = (id) => setDone({ ...done, [id]: !done[id] });
  const totalItems = CHECKLIST_WEEKS.reduce((a, w) => a + w.items.length, 0);
  const doneCount = Object.values(done).filter(Boolean).length;
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: 0, color: TOKENS.ink }}>Plano de 30 Dias</h3>
        <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{doneCount}/{totalItems} concluído</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CHECKLIST_WEEKS.map((w, wi) => (
          <div key={wi}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 8px' }}>{w.title}</p>
            {w.items.map((it, ii) => {
              const id = `${wi}-${ii}`;
              return (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13.5, color: done[id] ? TOKENS.inkSoft : TOKENS.ink, textDecoration: done[id] ? 'line-through' : 'none' }}>
                  <input type="checkbox" checked={!!done[id]} onChange={() => toggle(id)} style={{ accentColor: TOKENS.primary, width: 15, height: 15 }} />
                  {it}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

function MesaRedonda({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const toggleStep = (i) => setData({ ...data, steps: { ...data.steps, [i]: !data.steps?.[i] } });
  const doneSteps = Object.values(data.steps || {}).filter(Boolean).length;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Mesa Redonda Financeira</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Sem acusações. Foco no futuro. Um objetivo em comum.</p>

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Nosso objetivo em comum</label>
      <input value={data.goal || ''} onChange={e => set('goal', e.target.value)} placeholder="Ex: montar a reserva de emergência"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Próxima reunião</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <Calendar size={16} color={TOKENS.inkSoft} />
        <input value={data.nextDate || ''} onChange={e => set('nextDate', e.target.value)} type="date"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: 0 }}>Roteiro dos 30 minutos</p>
        <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{doneSteps}/{ROTEIRO_MESA_REDONDA.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROTEIRO_MESA_REDONDA.map((s, i) => (
          <label key={i} style={{ display: 'flex', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, background: TOKENS.bg }}>
            <input type="checkbox" checked={!!data.steps?.[i]} onChange={() => toggleStep(i)} style={{ accentColor: TOKENS.primary, width: 15, height: 15, marginTop: 2 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: data.steps?.[i] ? TOKENS.inkSoft : TOKENS.ink, textDecoration: data.steps?.[i] ? 'line-through' : 'none' }}>{s.title} <span style={{ fontWeight: 400, color: TOKENS.inkSoft }}>· {s.min}</span></p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: TOKENS.inkSoft }}>{s.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
}

function ReserveCalculator({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const monthly = parseFloat(data.monthlyCost) || 0;
  const months = parseInt(data.months) || 6;
  const goal = monthly * months;
  const current = parseFloat(data.current) || 0;
  const progress = goal ? Math.min(100, (current / goal) * 100) : 0;
  const remaining = Math.max(0, goal - current);
  const monthlyDeposit = parseFloat(data.monthlyDeposit) || 0;
  const monthsLeft = monthlyDeposit > 0 ? Math.ceil(remaining / monthlyDeposit) : null;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>Reserva de Emergência</h3>

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Custo essencial mensal (R$)</label>
      <input value={data.monthlyCost || ''} onChange={e => set('monthlyCost', e.target.value)} type="number"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Meses de cobertura desejados</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[3, 6, 12].map(m => (
          <button key={m} onClick={() => set('months', m)} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${months === m ? TOKENS.primary : TOKENS.line}`,
            background: months === m ? TOKENS.primary : TOKENS.bg, color: months === m ? '#fff' : TOKENS.ink,
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>{m} meses</button>
        ))}
      </div>

      {goal > 0 && (
        <>
          <div style={{ background: TOKENS.bg, borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: TOKENS.inkSoft, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Meta da reserva</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: TOKENS.primary, margin: 0, fontFamily: 'Fraunces, Georgia, serif' }}>R$ {goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Já tenho guardado (R$)</label>
          <input value={data.current || ''} onChange={e => set('current', e.target.value)} type="number"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

          <div style={{ height: 10, borderRadius: 5, background: TOKENS.line, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: TOKENS.gold, borderRadius: 5 }} />
          </div>
          <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: '0 0 14px' }}>{progress.toFixed(0)}% da meta · faltam R$ {remaining.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Quanto pretendo guardar por mês (R$)</label>
          <input value={data.monthlyDeposit || ''} onChange={e => set('monthlyDeposit', e.target.value)} type="number"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, boxSizing: 'border-box' }} />
          {monthsLeft !== null && (
            <p style={{ fontSize: 13, color: TOKENS.primary, fontWeight: 600, marginTop: 10 }}>Nesse ritmo, você completa a reserva em ~{monthsLeft} {monthsLeft === 1 ? 'mês' : 'meses'}.</p>
          )}
        </>
      )}
    </Card>
  );
}

function DebtCompare({ debts, setDebts }) {
  const [method, setMethod] = useState('bola');
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [rate, setRate] = useState('');
  const [parcelas, setParcelas] = useState('');

  const add = () => {
    if (!name || !val) return;
    setDebts([...debts, { id: Date.now(), name, val: parseFloat(val), rate: parseFloat(rate) || 0, parcelas: parseInt(parcelas) || 0 }]);
    setName(''); setVal(''); setRate(''); setParcelas('');
  };
  const remove = (id) => setDebts(debts.filter(d => d.id !== id));

  const ordered = [...debts].sort((a, b) => method === 'bola' ? a.val - b.val : b.rate - a.rate);

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>Bola de Neve x Avalanche</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Credor"
          style={{ flex: '2 1 110px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Valor total R$" type="number"
          style={{ flex: '1 1 90px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={rate} onChange={e => setRate(e.target.value)} placeholder="Juros % a.m." type="number"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={parcelas} onChange={e => setParcelas(e.target.value)} placeholder="Parcelas restantes" type="number"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {debts.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setMethod('bola')} style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${method === 'bola' ? TOKENS.primary : TOKENS.line}`,
              background: method === 'bola' ? TOKENS.primary : TOKENS.bg, color: method === 'bola' ? '#fff' : TOKENS.ink,
              fontWeight: 600, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Snowflake size={14} /> Bola de Neve</button>
            <button onClick={() => setMethod('avalanche')} style={{
              flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${method === 'avalanche' ? TOKENS.primary : TOKENS.line}`,
              background: method === 'avalanche' ? TOKENS.primary : TOKENS.bg, color: method === 'avalanche' ? '#fff' : TOKENS.ink,
              fontWeight: 600, fontSize: 12.5, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Mountain size={14} /> Avalanche</button>
          </div>
          <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: '0 0 12px' }}>
            {method === 'bola' ? 'Ordem por menor valor primeiro — vitórias rápidas.' : 'Ordem por maior juros primeiro — menos juros pagos no total.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ordered.map((d, i) => {
              const parcela = d.parcelas > 0 ? d.val / d.parcelas : null;
              return (
                <div key={d.id} style={{ padding: '9px 10px', borderRadius: 8, background: i === 0 ? TOKENS.goldSoft : TOKENS.bg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                    <span style={{ fontWeight: 700, color: TOKENS.primary, width: 18 }}>{i + 1}º</span>
                    <span style={{ flex: 1, color: TOKENS.ink, fontWeight: i === 0 ? 700 : 500 }}>{d.name}</span>
                    <span style={{ color: TOKENS.inkSoft }}>{d.rate}% a.m.</span>
                    <span style={{ fontWeight: 600, color: TOKENS.ink }}>R$ {d.val.toFixed(2)}</span>
                    <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
                  </div>
                  {d.parcelas > 0 && (
                    <p style={{ margin: '4px 0 0 28px', fontSize: 12, color: TOKENS.inkSoft }}>
                      {d.parcelas}x de R$ {parcela.toFixed(2)} restantes
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function RiskMatrix({ debts, setDebts }) {
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [type, setType] = useState('rotativo');
  const [atraso, setAtraso] = useState('');

  const add = () => {
    if (!name || !val) return;
    setDebts([...debts, { id: Date.now(), name, val: parseFloat(val), type, atraso: parseInt(atraso) || 0 }]);
    setName(''); setVal(''); setAtraso('');
  };
  const remove = (id) => setDebts(debts.filter(d => d.id !== id));

  const alto = debts.filter(d => DEBT_TYPES[d.type].risk === 'alto').sort((a, b) => b.val - a.val);
  const baixo = debts.filter(d => DEBT_TYPES[d.type].risk === 'baixo').sort((a, b) => b.atraso - a.atraso);

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Matriz de Prioridade de Risco</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Classifique cada dívida — o app organiza por risco real, não por tamanho do número.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Credor"
          style={{ flex: '2 1 100px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Valor R$" type="number"
          style={{ flex: '1 1 80px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={atraso} onChange={e => setAtraso(e.target.value)} placeholder="Meses atraso" type="number"
          style={{ flex: '1 1 90px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={type} onChange={e => setType(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }}>
          {Object.entries(DEBT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {debts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: TOKENS.ghost, margin: '0 0 8px' }}>
              <AlertTriangle size={15} /> Alto Risco — perda de bens/essenciais
            </p>
            {alto.length === 0 && <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: 0 }}>Nenhuma dívida de alto risco cadastrada.</p>}
            {alto.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, padding: '8px 10px', borderRadius: 8, background: '#FBEDE7', marginBottom: 6 }}>
                <span style={{ flex: 1, color: TOKENS.ink, fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{DEBT_TYPES[d.type].label}</span>
                <span style={{ fontWeight: 600, color: TOKENS.ink }}>R$ {d.val.toFixed(2)}</span>
                <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 8px' }}>Baixo Risco — sem garantia</p>
            {baixo.length === 0 && <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: 0 }}>Nenhuma dívida de baixo risco cadastrada.</p>}
            {baixo.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, padding: '8px 10px', borderRadius: 8, background: TOKENS.bg, marginBottom: 6 }}>
                <span style={{ flex: 1, color: TOKENS.ink, fontWeight: 600 }}>{d.name}</span>
                <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{DEBT_TYPES[d.type].label} · {d.atraso}m</span>
                <span style={{ fontWeight: 600, color: TOKENS.ink }}>R$ {d.val.toFixed(2)}</span>
                <button onClick={() => remove(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function NegotiationScript() {
  const [credor, setCredor] = useState('');
  const [valOriginal, setValOriginal] = useState('');
  const [valAtual, setValAtual] = useState('');
  const [atraso, setAtraso] = useState('');
  const [tipo, setTipo] = useState('semGarantia');
  const [copied, setCopied] = useState(false);

  const faixa = atraso ? descontoEsperado(parseInt(atraso)) : null;

  const script = tipo === 'semGarantia'
    ? `Eu quero regularizar essa dívida com ${credor || '[credor]'}, mas não com as condições atuais. Gostaria de negociar a retirada total dos juros de mora e das multas, considerando apenas o valor principal atualizado (R$ ${valOriginal || '[valor original]'}). Se eu conseguir pagar à vista, qual é o melhor desconto que vocês conseguem oferecer sobre o valor de R$ ${valAtual || '[valor atual]'}? Considerando o tempo de atraso, espero um desconto entre ${faixa || '10% e 20%'}.`
    : `Quero entender minhas opções de repactuação da dívida com ${credor || '[credor]'}. Antes disso, gostaria de saber a taxa de juros atual do meu contrato e se existe possibilidade de portabilidade para uma taxa menor, considerando meu histórico de pagamento.`;

  const copy = () => {
    navigator.clipboard?.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>Gerador de Script de Negociação</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setTipo('semGarantia')} style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${tipo === 'semGarantia' ? TOKENS.primary : TOKENS.line}`,
          background: tipo === 'semGarantia' ? TOKENS.primary : TOKENS.bg, color: tipo === 'semGarantia' ? '#fff' : TOKENS.ink,
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        }}>Sem garantia</button>
        <button onClick={() => setTipo('comGarantia')} style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${tipo === 'comGarantia' ? TOKENS.primary : TOKENS.line}`,
          background: tipo === 'comGarantia' ? TOKENS.primary : TOKENS.bg, color: tipo === 'comGarantia' ? '#fff' : TOKENS.ink,
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        }}>Com garantia/consignado</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input value={credor} onChange={e => setCredor(e.target.value)} placeholder="Nome do credor"
          style={{ flex: '2 1 120px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={atraso} onChange={e => setAtraso(e.target.value)} placeholder="Meses de atraso" type="number"
          style={{ flex: '1 1 100px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>
      {tipo === 'semGarantia' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input value={valOriginal} onChange={e => setValOriginal(e.target.value)} placeholder="Valor original R$" type="number"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
          <input value={valAtual} onChange={e => setValAtual(e.target.value)} placeholder="Valor atual R$" type="number"
            style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        </div>
      )}

      {faixa && <p style={{ fontSize: 12.5, color: TOKENS.gold, fontWeight: 600, margin: '0 0 12px' }}>Desconto esperado pela Bateria de Descontos: {faixa}</p>}

      <div style={{ background: TOKENS.bg, borderRadius: 10, padding: 14, borderLeft: `3px solid ${TOKENS.primary}`, marginBottom: 12 }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: TOKENS.ink, margin: 0, fontStyle: 'italic' }}>"{script}"</p>
      </div>
      <button onClick={copy} style={{
        width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: copied ? TOKENS.gold : TOKENS.primary,
        color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}><Copy size={14} /> {copied ? 'Copiado!' : 'Copiar script'}</button>
    </Card>
  );
}

function ProposalVault({ proposals, setProposals }) {
  const [credor, setCredor] = useState('');
  const [valorPago, setValorPago] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');

  const addDays = (dateStr, days) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d.toLocaleDateString('pt-BR');
  };

  const add = () => {
    if (!credor || !dataPagamento) return;
    setProposals([...proposals, {
      id: Date.now(), credor, valorPago: parseFloat(valorPago) || 0, dataPagamento,
      prazoLimite: addDays(dataPagamento, 5),
    }]);
    setCredor(''); setValorPago(''); setDataPagamento('');
  };
  const remove = (id) => setProposals(proposals.filter(p => p.id !== id));

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Cofre de Acordos</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Nunca pague sem termo por escrito. Registre aqui para acompanhar o prazo de retirada do nome (5 dias úteis).</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={credor} onChange={e => setCredor(e.target.value)} placeholder="Credor"
          style={{ flex: '2 1 100px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={valorPago} onChange={e => setValorPago(e.target.value)} placeholder="Valor pago R$" type="number"
          style={{ flex: '1 1 90px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={dataPagamento} onChange={e => setDataPagamento(e.target.value)} type="date"
          style={{ flex: '1 1 130px', padding: '9px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {proposals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {proposals.map(p => (
            <div key={p.id} style={{ padding: '10px 12px', borderRadius: 10, background: TOKENS.bg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.ink }}>{p.credor}</span>
                <button onClick={() => remove(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
              </div>
              <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: '4px 0 0' }}>Pago em {new Date(p.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')} · R$ {p.valorPago.toFixed(2)}</p>
              <p style={{ fontSize: 12, color: TOKENS.gold, fontWeight: 600, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={12} /> Nome deve sair do Serasa/SPC até {p.prazoLimite}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Reconstruction({ checklistState, setChecklistState, scoreHistory, setScoreHistory }) {
  const [newScore, setNewScore] = useState('');
  const toggle = (i) => setChecklistState({ ...checklistState, [i]: !checklistState[i] });

  const addScore = () => {
    if (!newScore) return;
    setScoreHistory([...scoreHistory, { id: Date.now(), value: parseInt(newScore), date: new Date().toLocaleDateString('pt-BR') }]);
    setNewScore('');
  };
  const last = scoreHistory[scoreHistory.length - 1];
  const first = scoreHistory[0];
  const max = Math.max(...scoreHistory.map(s => s.value), 1000);

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 14px', color: TOKENS.ink }}>Reconstrução do Score</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={newScore} onChange={e => setNewScore(e.target.value)} placeholder="Score atual (0-1000)" type="number"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <button onClick={addScore} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {scoreHistory.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70, marginBottom: 8 }}>
            {scoreHistory.slice(-8).map(s => (
              <div key={s.id} style={{ flex: 1, background: TOKENS.gold, borderRadius: '4px 4px 0 0', height: `${(s.value / max) * 100}%`, minHeight: 4 }} title={`${s.value}`} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>Primeiro: {first.value}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: TOKENS.primary, fontFamily: 'Fraunces, Georgia, serif' }}>Atual: {last.value}</span>
          </div>
        </div>
      )}

      <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 10px' }}>
        <ClipboardCheck size={15} /> Checklist de hábitos
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RECONSTRUCAO_CHECKLIST.map((item, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: checklistState[i] ? TOKENS.inkSoft : TOKENS.ink, textDecoration: checklistState[i] ? 'line-through' : 'none' }}>
            <input type="checkbox" checked={!!checklistState[i]} onChange={() => toggle(i)} style={{ accentColor: TOKENS.primary, width: 15, height: 15 }} />
            {item}
          </label>
        ))}
      </div>
    </Card>
  );
}

function FreedomReserve({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const perfil = data.perfil || 'clt';
  const range = perfil === 'clt' ? [3, 6] : [6, 12];
  const months = parseInt(data.months) || range[0];
  const monthlyCost = parseFloat(data.monthlyCost) || 0;
  const goal = monthlyCost * months;
  const current = parseFloat(data.current) || 0;
  const progress = goal ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Reserva da Liberdade</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>A base que te dá liberdade para investir o resto sem medo.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => set('perfil', 'clt')} style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${perfil === 'clt' ? TOKENS.primary : TOKENS.line}`,
          background: perfil === 'clt' ? TOKENS.primary : TOKENS.bg, color: perfil === 'clt' ? '#fff' : TOKENS.ink,
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        }}>CLT / Servidor</button>
        <button onClick={() => set('perfil', 'auto')} style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${perfil === 'auto' ? TOKENS.primary : TOKENS.line}`,
          background: perfil === 'auto' ? TOKENS.primary : TOKENS.bg, color: perfil === 'auto' ? '#fff' : TOKENS.ink,
          fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        }}>Autônomo/Empresário</button>
      </div>

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Custo Fixo Vital mensal (R$)</label>
      <input value={data.monthlyCost || ''} onChange={e => set('monthlyCost', e.target.value)} type="number"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Meses-alvo ({range[0]} a {range[1]})</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {Array.from({ length: range[1] - range[0] + 1 }, (_, i) => range[0] + i).filter(m => m === range[0] || m === Math.round((range[0]+range[1])/2) || m === range[1]).map(m => (
          <button key={m} onClick={() => set('months', m)} style={{
            flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${months === m ? TOKENS.primary : TOKENS.line}`,
            background: months === m ? TOKENS.primary : TOKENS.bg, color: months === m ? '#fff' : TOKENS.ink,
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>{m} meses</button>
        ))}
      </div>

      {goal > 0 && (
        <>
          <div style={{ background: TOKENS.bg, borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: TOKENS.inkSoft, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Meta da Reserva da Liberdade</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: TOKENS.primary, margin: 0, fontFamily: 'Fraunces, Georgia, serif' }}>R$ {goal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Já tenho guardado (R$)</label>
          <input value={data.current || ''} onChange={e => set('current', e.target.value)} type="number"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
          <div style={{ height: 10, borderRadius: 5, background: TOKENS.line, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: TOKENS.gold, borderRadius: 5 }} />
          </div>
          <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: 0 }}>{progress.toFixed(0)}% da meta atingida</p>
        </>
      )}
    </Card>
  );
}

function PortfolioArchitecture({ assets, setAssets }) {
  const [name, setName] = useState('');
  const [val, setVal] = useState('');
  const [gaveta, setGaveta] = useState('curto');

  const add = () => {
    if (!name || !val) return;
    setAssets([...assets, { id: Date.now(), name, val: parseFloat(val), gaveta }]);
    setName(''); setVal('');
  };
  const remove = (id) => setAssets(assets.filter(a => a.id !== id));

  const totals = { curto: 0, medio: 0, longo: 0 };
  assets.forEach(a => { totals[a.gaveta] += a.val; });
  const total = totals.curto + totals.medio + totals.longo;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Arquitetura de Gavetas</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Cada ativo tem uma data de uso — e cada data pede um tipo de investimento diferente.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome do ativo"
          style={{ flex: '2 1 110px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Valor R$" type="number"
          style={{ flex: '1 1 90px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={gaveta} onChange={e => setGaveta(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }}>
          {Object.entries(GAVETAS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {assets.length > 0 && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, maxHeight: 160, overflowY: 'auto' }}>
            {assets.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, padding: '7px 10px', borderRadius: 8, background: TOKENS.bg }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: GAVETAS[a.gaveta].color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: TOKENS.ink }}>{a.name}</span>
                <span style={{ fontWeight: 600, color: TOKENS.ink }}>R$ {a.val.toFixed(2)}</span>
                <button onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(GAVETAS).map(([k, g]) => {
              const pct = total ? (totals[k] / total) * 100 : 0;
              return (
                <div key={k}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.inkSoft, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: TOKENS.ink }}>{g.label} <span style={{ fontWeight: 400 }}>· {g.desc}</span></span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: TOKENS.line, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: g.color, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function MagicNumberCalc({ items, setItems }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [provento, setProvento] = useState('');
  const [owned, setOwned] = useState('');

  const add = () => {
    if (!name || !price || !provento) return;
    setItems([...items, { id: Date.now(), name, price: parseFloat(price), provento: parseFloat(provento), owned: parseInt(owned) || 0 }]);
    setName(''); setPrice(''); setProvento(''); setOwned('');
  };
  const remove = (id) => setItems(items.filter(i => i.id !== id));

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Calculadora do Número Mágico</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Quantas cotas/ações até os proventos comprarem uma nova unidade sozinhos.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Ativo (ex: FII XYZ11)"
          style={{ flex: '2 1 110px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={owned} onChange={e => setOwned(e.target.value)} placeholder="Cotas que já tenho" type="number"
          style={{ flex: '1 1 100px', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Preço da cota R$" type="number"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <input value={provento} onChange={e => setProvento(e.target.value)} placeholder="Provento mensal R$" type="number"
          style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14 }} />
        <button onClick={add} style={{
          padding: '10px 14px', borderRadius: 8, border: 'none', background: TOKENS.primary,
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
        }}><Plus size={18} /></button>
      </div>

      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(it => {
            const magic = Math.ceil(it.price / it.provento);
            const pct = Math.min(100, (it.owned / magic) * 100);
            return (
              <div key={it.id} style={{ padding: '10px 12px', borderRadius: 10, background: TOKENS.bg }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.ink }}>{it.name}</span>
                  <button onClick={() => remove(it.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: TOKENS.inkSoft }}><X size={14} /></button>
                </div>
                <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: '0 0 6px' }}>Número Mágico: <strong style={{ color: TOKENS.gold }}>{magic} cotas</strong> · você tem {it.owned}</p>
                <div style={{ height: 7, borderRadius: 4, background: TOKENS.line, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: TOKENS.gold, borderRadius: 4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function AutomationChecklist({ state, setState }) {
  const flat = AUTOMACAO_PROTECAO_CHECKLIST.flatMap((s, si) => s.items.map((it, ii) => `${si}-${ii}`));
  const doneCount = flat.filter(id => state[id]).length;
  const toggle = (id) => setState({ ...state, [id]: !state[id] });

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: 0, color: TOKENS.ink }}>Automação e Proteção</h3>
        <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{doneCount}/{flat.length}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {AUTOMACAO_PROTECAO_CHECKLIST.map((s, si) => (
          <div key={si}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 8px' }}>
              {si === 0 ? <Repeat size={15} /> : <ShieldCheck size={15} />} {s.section}
            </p>
            {s.items.map((it, ii) => {
              const id = `${si}-${ii}`;
              return (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13.5, color: state[id] ? TOKENS.inkSoft : TOKENS.ink, textDecoration: state[id] ? 'line-through' : 'none' }}>
                  <input type="checkbox" checked={!!state[id]} onChange={() => toggle(id)} style={{ accentColor: TOKENS.primary, width: 15, height: 15 }} />
                  {it}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

function RetirementCalculator({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const fatorKey = data.fator || '3.5';
  const fator = FATORES_RETIRADA.find(f => f.key === fatorKey);
  const monthly = parseFloat(data.monthly) || 0;
  const annual = monthly * 12;
  const target = annual * fator.factor;
  const current = parseFloat(data.current) || 0;
  const gap = Math.max(0, target - current);
  const progress = target ? Math.min(100, (current / target) * 100) : 0;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Calculadora de Liberação Financeira</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>Seu Número de Aposentadoria — quanto patrimônio sustenta sua independência.</p>

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Gasto mensal desejado (R$)</label>
      <input value={data.monthly || ''} onChange={e => set('monthly', e.target.value)} type="number"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' }} />

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 6 }}>Fator de segurança</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {FATORES_RETIRADA.map(f => (
          <button key={f.key} onClick={() => set('fator', f.key)} style={{
            textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: `1px solid ${fatorKey === f.key ? TOKENS.primary : TOKENS.line}`,
            background: fatorKey === f.key ? TOKENS.goldSoft : TOKENS.bg, cursor: 'pointer',
          }}>
            <span style={{ fontWeight: 700, fontSize: 13.5, color: TOKENS.ink }}>{f.label}</span>
            <span style={{ fontSize: 12, color: TOKENS.inkSoft, marginLeft: 8 }}>{f.desc}</span>
          </button>
        ))}
      </div>

      {target > 0 && (
        <>
          <div style={{ background: TOKENS.bg, borderRadius: 10, padding: 14, marginBottom: 14, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: TOKENS.inkSoft, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Seu Número de Aposentadoria</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: TOKENS.primary, margin: 0, fontFamily: 'Fraunces, Georgia, serif' }}>R$ {target.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Patrimônio já acumulado (R$)</label>
          <input value={data.current || ''} onChange={e => set('current', e.target.value)} type="number"
            style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
          <div style={{ height: 10, borderRadius: 5, background: TOKENS.line, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: TOKENS.gold, borderRadius: 5 }} />
          </div>
          <p style={{ fontSize: 12, color: TOKENS.inkSoft, margin: 0 }}>{progress.toFixed(1)}% do caminho · faltam R$ {gap.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </>
      )}
    </Card>
  );
}

function WithdrawalFlow({ data, setData }) {
  const set = (k, v) => setData({ ...data, [k]: v });
  const vals = ORDEM_SAQUE.reduce((acc, o) => { acc[o.key] = parseFloat(data[o.key]) || 0; return acc; }, {});
  const totalSaque = Object.values(vals).reduce((a, b) => a + b, 0);
  const vendasAcoes = parseFloat(data.vendasAcoes) || 0;
  const dentroLimite = vendasAcoes <= 20000;
  const bufferMeses = parseFloat(data.bufferMeses) || 0;

  return (
    <Card>
      <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: '0 0 6px', color: TOKENS.ink }}>Matriz de Liquidação e Fluxo de Saque</h3>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>De onde tirar o dinheiro este mês, na ordem certa.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        {ORDEM_SAQUE.map((o, i) => (
          <div key={o.key}>
            <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: TOKENS.primary, color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              {o.label} <span style={{ fontWeight: 400, color: TOKENS.inkSoft }}>· {o.desc}</span>
            </label>
            <input value={data[o.key] || ''} onChange={e => set(o.key, e.target.value)} type="number" placeholder="R$ 0,00"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>

      <div style={{ background: TOKENS.bg, borderRadius: 10, padding: 12, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.ink }}>Total sacado no mês</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: TOKENS.primary, fontFamily: 'Fraunces, Georgia, serif' }}>R$ {totalSaque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Vendas de ações acumuladas no mês (R$)</label>
      <input value={data.vendasAcoes || ''} onChange={e => set('vendasAcoes', e.target.value)} type="number"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 6, boxSizing: 'border-box' }} />
      {data.vendasAcoes && (
        <p style={{ fontSize: 12, fontWeight: 600, margin: '0 0 14px', color: dentroLimite ? TOKENS.primary : TOKENS.ghost }}>
          {dentroLimite ? '✓ Dentro do limite de isenção (R$ 20.000)' : '⚠ Acima do limite — ganho tributado a 15%'}
        </p>
      )}

      <label style={{ fontSize: 12, fontWeight: 600, color: TOKENS.ink, display: 'block', marginBottom: 4 }}>Buffer de Liquidez — meses de cobertura restantes</label>
      <input value={data.bufferMeses || ''} onChange={e => set('bufferMeses', e.target.value)} type="number"
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${TOKENS.line}`, fontSize: 14, marginBottom: 6, boxSizing: 'border-box' }} />
      {data.bufferMeses && (
        <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: bufferMeses >= 24 ? TOKENS.primary : TOKENS.ghost }}>
          {bufferMeses >= 24 ? '✓ Buffer saudável (24+ meses)' : '⚠ Abaixo de 24 meses — vale reabastecer'}
        </p>
      )}
    </Card>
  );
}

function SuccessionChecklist({ state, setState }) {
  const flat = SUCESSAO_NIVEIS.flatMap((n, ni) => n.items.map((it, ii) => `${ni}-${ii}`));
  const doneCount = flat.filter(id => state[id]).length;
  const toggle = (id) => setState({ ...state, [id]: !state[id] });

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 18, margin: 0, color: TOKENS.ink }}>Diagnóstico Sucessório</h3>
        <span style={{ fontSize: 12, color: TOKENS.inkSoft }}>{doneCount}/{flat.length}</span>
      </div>
      <p style={{ fontSize: 12.5, color: TOKENS.inkSoft, margin: '0 0 16px' }}>A maioria das famílias já ganha muita proteção completando os Níveis 1 e 2.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SUCESSAO_NIVEIS.map((n, ni) => (
          <div key={ni}>
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: TOKENS.primary, margin: '0 0 8px' }}>
              <Landmark size={15} /> {n.title}
            </p>
            {n.items.map((it, ii) => {
              const id = `${ni}-${ii}`;
              return (
                <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13.5, color: state[id] ? TOKENS.inkSoft : TOKENS.ink, textDecoration: state[id] ? 'line-through' : 'none' }}>
                  <input type="checkbox" checked={!!state[id]} onChange={() => toggle(id)} style={{ accentColor: TOKENS.primary, width: 15, height: 15 }} />
                  {it}
                </label>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function TrilhaFinanceira({ profile }) {
  const userId = profile?.id;
  const [view, setView] = useState('home');
  const [answers, setAnswers, l1] = useStored(userId, 'mind-test-answers', {});
  const [expenses, setExpenses, l2] = useStored(userId, 'expenses', []);
  const [income, setIncome, l3] = useStored(userId, 'income', '');
  const [done, setDone, l4] = useStored(userId, 'checklist-done', {});
  const [mesaData, setMesaData, l5] = useStored(userId, 'mesa-redonda', {});
  const [reserveData, setReserveData, l6] = useStored(userId, 'reserve-calc', {});
  const [debts, setDebts, l7] = useStored(userId, 'debts', []);
  const [activeVolume, setActiveVolume] = useState('v1');
  const [riskDebts, setRiskDebts, l8] = useStored(userId, 'risk-debts', []);
  const [proposals, setProposals, l9] = useStored(userId, 'proposals', []);
  const [reconChecklist, setReconChecklist, l10] = useStored(userId, 'recon-checklist', {});
  const [scoreHistory, setScoreHistory, l11] = useStored(userId, 'score-history', []);
  const [freedomData, setFreedomData, l12] = useStored(userId, 'freedom-reserve', {});
  const [portfolioAssets, setPortfolioAssets, l13] = useStored(userId, 'portfolio-assets', []);
  const [magicItems, setMagicItems, l14] = useStored(userId, 'magic-number-items', []);
  const [automationState, setAutomationState, l15] = useStored(userId, 'automation-checklist', {});
  const [retirementData, setRetirementData, l16] = useStored(userId, 'retirement-calc', {});
  const [withdrawalData, setWithdrawalData, l17] = useStored(userId, 'withdrawal-flow', {});
  const [successionState, setSuccessionState, l18] = useStored(userId, 'succession-checklist', {});

  const V1_MODULES = [
    { key: 'test', label: '1. Teste da Mente Financeira', done: !!answers.q4 },
    { key: 'tracker', label: '2. Semana da Lupa (gastos)' },
    { key: 'budget', label: '3. Régua 50/30/20' },
    { key: 'checklist', label: '4. Plano de 30 Dias' },
    { key: 'mesa', label: '5. Mesa Redonda Financeira' },
    { key: 'reserve', label: '6. Reserva de Emergência' },
    { key: 'debts', label: '7. Bola de Neve x Avalanche' },
  ];
  const V2_MODULES = [
    { key: 'riskMatrix', label: '1. Matriz de Prioridade de Risco' },
    { key: 'script', label: '2. Gerador de Script de Negociação' },
    { key: 'vault', label: '3. Cofre de Acordos' },
    { key: 'recon', label: '4. Reconstrução do Score' },
  ];
  const V3_MODULES = [
    { key: 'freedom', label: '1. Reserva da Liberdade' },
    { key: 'gavetas', label: '2. Arquitetura de Gavetas' },
    { key: 'magic', label: '3. Número Mágico' },
    { key: 'automation', label: '4. Automação e Proteção' },
  ];
  const V4_MODULES = [
    { key: 'retirement', label: '1. Calculadora de Liberação Financeira' },
    { key: 'withdrawal', label: '2. Matriz de Liquidação e Fluxo de Saque' },
    { key: 'succession', label: '3. Diagnóstico Sucessório' },
  ];
  const VOLUME_INFO = {
    v1: { title: 'O Resgate do Orçamento', modules: V1_MODULES },
    v2: { title: 'Quitação de Dívidas', modules: V2_MODULES },
    v3: { title: 'Construção de Patrimônio', modules: V3_MODULES },
    v4: { title: 'Liberdade Financeira', modules: V4_MODULES },
  };

  const ACCESS_KEY = { v1: null, v2: 'vol2_access', v3: 'vol3_access', v4: 'vol4_access' };

  const stones = [
    { id: 'v1', label: 'Resgate do Orçamento', Icon: Wallet, unlocked: true },
    { id: 'v2', label: 'Quitação de Dívidas', Icon: Shield, unlocked: !!profile?.vol2_access },
    { id: 'v3', label: 'Construção de Patrimônio', Icon: TrendingUp, unlocked: !!profile?.vol3_access },
    { id: 'v4', label: 'Liberdade Financeira', Icon: Coins, unlocked: !!profile?.vol4_access },
  ];

  // Permite navegar até a "vitrine" de um volume trancado (para ver
  // do que se trata e a tela de paywall), mesmo sem acesso ainda —
  // só os módulos individuais ficam realmente bloqueados.
  const isVolumeLocked = activeVolume !== 'v1' && !profile?.[ACCESS_KEY[activeVolume]];

  const info = VOLUME_INFO[activeVolume];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", background: TOKENS.bg, minHeight: '100vh', padding: '28px 20px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <header style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: TOKENS.gold, fontWeight: 700, margin: '0 0 4px' }}>Sua trilha financeira</p>
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 26, margin: 0, color: TOKENS.primary }}>{info.title}</h1>
        </header>

        <div style={{ display: 'flex', marginBottom: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 28, left: '12%', right: '12%', height: 2, background: TOKENS.line, zIndex: 0 }} />
          {stones.map(s => (
            <ProgressStone key={s.id} {...s} current={activeVolume === s.id}
              onClick={() => { setActiveVolume(s.id); setView('home'); }} />
          ))}
        </div>

        {view === 'home' && (
          <Card style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: TOKENS.inkSoft, margin: '0 0 14px', lineHeight: 1.5 }}>
              {activeVolume === 'v1' && 'O Volume 1 está completo — 7 módulos, um para cada exercício do ebook.'}
              {activeVolume === 'v2' && 'O Volume 2 está completo — 4 módulos para negociar e sair das dívidas com confiança.'}
              {activeVolume === 'v3' && 'O Volume 3 está completo — 4 módulos para construir e blindar seu patrimônio.'}
              {activeVolume === 'v4' && 'O Volume 4 está completo — 3 módulos para sua independência e sucessão patrimonial.'}
            </p>
            {info.modules.map((m, i) => (
              <button key={m.key} onClick={() => setView(m.key)} style={{
                width: '100%', textAlign: 'left', padding: '14px 16px', borderRadius: 10, border: `1px solid ${TOKENS.line}`,
                background: TOKENS.bg, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: i < info.modules.length - 1 ? 10 : 0,
              }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</span>
                {m.done ? <CheckCircle2 size={18} color={TOKENS.primary} /> : <ChevronRight size={18} color={TOKENS.inkSoft} />}
              </button>
            ))}
          </Card>
        )}

        {view !== 'home' && (
          <button onClick={() => setView('home')} style={{
            display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
            color: TOKENS.primary, fontWeight: 600, fontSize: 13, marginBottom: 12, cursor: 'pointer', padding: 0,
          }}><ChevronLeft size={16} /> Voltar à trilha</button>
        )}

        {view !== 'home' && isVolumeLocked && (
          <PaywallGate volume={ACCESS_KEY[activeVolume]} />
        )}

        {view !== 'home' && !isVolumeLocked && (
          <>
            {view === 'test' && <MindTest answers={answers} setAnswers={setAnswers} onFinish={() => setView('tracker')} />}
            {view === 'tracker' && <ExpenseTracker expenses={expenses} setExpenses={setExpenses} />}
            {view === 'budget' && <BudgetMeter income={income} setIncome={setIncome} expenses={expenses} />}
            {view === 'checklist' && <Checklist done={done} setDone={setDone} />}
            {view === 'mesa' && <MesaRedonda data={mesaData} setData={setMesaData} />}
            {view === 'reserve' && <ReserveCalculator data={reserveData} setData={setReserveData} />}
            {view === 'debts' && <DebtCompare debts={debts} setDebts={setDebts} />}
            {view === 'riskMatrix' && <RiskMatrix debts={riskDebts} setDebts={setRiskDebts} />}
            {view === 'script' && <NegotiationScript />}
            {view === 'vault' && <ProposalVault proposals={proposals} setProposals={setProposals} />}
            {view === 'recon' && <Reconstruction checklistState={reconChecklist} setChecklistState={setReconChecklist} scoreHistory={scoreHistory} setScoreHistory={setScoreHistory} />}
            {view === 'freedom' && <FreedomReserve data={freedomData} setData={setFreedomData} />}
            {view === 'gavetas' && <PortfolioArchitecture assets={portfolioAssets} setAssets={setPortfolioAssets} />}
            {view === 'magic' && <MagicNumberCalc items={magicItems} setItems={setMagicItems} />}
            {view === 'automation' && <AutomationChecklist state={automationState} setState={setAutomationState} />}
            {view === 'retirement' && <RetirementCalculator data={retirementData} setData={setRetirementData} />}
            {view === 'withdrawal' && <WithdrawalFlow data={withdrawalData} setData={setWithdrawalData} />}
            {view === 'succession' && <SuccessionChecklist state={successionState} setState={setSuccessionState} />}
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 24 }}>
          {profile?.email ? `Logado como ${profile.email}` : 'Sua trilha financeira'}
        </p>
      </div>
    </div>
  );
}
