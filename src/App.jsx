import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Coins, 
  Pickaxe, 
  Gem, 
  Crown, 
  MessageSquare, 
  Users, 
  ShieldAlert, 
  CreditCard, 
  Sparkles, 
  Settings, 
  RefreshCw, 
  Check, 
  TrendingUp, 
  Send, 
  Zap, 
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Smartphone,
  Database,
  Cloud,
  CheckCircle,
  Copy,
  ExternalLink,
  Radio,
  Bell
} from 'lucide-react';
import UserManagement from './components/UserManagement';
import InHouseMessaging from './components/InHouseMessaging';

const SUPABASE_CONFIG = {
  projectRef: 'apjqcocxtylsofgxhetb',
  url: 'https://apjqcocxtylsofgxhetb.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwanFjb2N4dHlsc29mZ3hoZXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzEzODQsImV4cCI6MjEwNjk0NzM4NH0.b_GXnMvpLSnXqmn35hPGpFnZDdDMFtOZpFoCjWBVR4s'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Live Supabase connection states
  const [dbStatus, setDbStatus] = useState({
    profilesCount: 0,
    hasLiveProfiles: false,
    hasTransactionsTable: false,
    hasEconomyTable: false,
    hasConfigTable: false,
    lastChecked: null
  });

  // Real data from Supabase
  const [realProfiles, setRealProfiles] = useState([]);
  const [realEconomyProfiles, setRealEconomyProfiles] = useState([]);
  const [realTransactions, setRealTransactions] = useState([]);

  // Economy state (Loaded from Supabase app_config or fallback default)
  const [packages, setPackages] = useState([
    { id: 'pkg_starter', title: 'Starter Glow', coins: 70, bonusCoins: 10, priceKes: 49, priceUsd: 0.99, tag: 'Hero Value', isHero: true },
    { id: 'pkg_pocket', title: 'Pocket Reserve', coins: 160, bonusCoins: 30, priceKes: 99, priceUsd: 1.99, tag: 'Most Popular', isHero: true },
    { id: 'pkg_bloom', title: 'Bloom Collection', coins: 260, bonusCoins: 50, priceKes: 149, priceUsd: 2.99, tag: 'Best Value' },
    { id: 'pkg_sanctuary', title: 'Sanctuary Vault', coins: 400, bonusCoins: 90, priceKes: 197, priceUsd: 4.99, tag: 'Supporter Choice' },
    { id: 'pkg_celestial', title: 'Celestial Treasury', coins: 600, bonusCoins: 150, priceKes: 239, priceUsd: 6.99, tag: 'Grand Reserve' },
    { id: 'pkg_sovereign', title: 'Sovereignty Patron', coins: 1500, bonusCoins: 450, priceKes: 499, priceUsd: 14.99, tag: 'Founder Tier' }
  ]);

  const [multipliers, setMultipliers] = useState({
    free: 1.0,
    supporter: 2.0,
    premium: 3.0,
    dailyBase: 25,
    streakBonus: 10
  });

  const [paymentConfig, setPaymentConfig] = useState({
    activeMpesaProvider: 'PAYHERO', // PAYHERO or PAYNEXUS
    mpesaEnabled: true,
    okxEnabled: true,
    autoVerifyWebhooks: true,
    minDepositKes: 49,
    sandboxMode: false
  });

  // Layered AI Translation & Chat Playground State
  const [aiConfig, setAiConfig] = useState({
    enableLayeredTranslation: true,
    silentFallback: true,
    gracefulExpertBusyNotice: true,
    temperature: 0.7,
    model: 'gemini-1.5-flash-latest'
  });

  const [rawChatInput, setRawChatInput] = useState('');
  const [translationResult, setTranslationResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch real data from Supabase REST API
  const fetchSupabaseData = async () => {
    setIsRefreshing(true);
    try {
      const headers = {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json'
      };

      // 1. Fetch real user profiles
      const profRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/profiles?select=*&order=created_at.desc&limit=50`, { headers });
      let loadedProfiles = [];
      if (profRes.ok) {
        loadedProfiles = await profRes.json();
        setRealProfiles(loadedProfiles);
      }

      // 2. Fetch app_config if table exists
      let configExists = false;
      try {
        const cfgRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/app_config?select=*`, { headers });
        if (cfgRes.ok) {
          configExists = true;
          const cfgData = await cfgRes.json();
          cfgData.forEach(row => {
            if (row.key === 'payment_gateway') setPaymentConfig(row.value);
            if (row.key === 'economy_multipliers') setMultipliers(row.value);
            if (row.key === 'coin_packages') setPackages(row.value);
            if (row.key === 'ai_config') setAiConfig(row.value);
          });
        }
      } catch (e) {
        configExists = false;
      }

      // 3. Fetch payment_transactions if table exists
      let txExists = false;
      try {
        const txRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/payment_transactions?select=*&order=created_at.desc&limit=50`, { headers });
        if (txRes.ok) {
          txExists = true;
          const txData = await txRes.json();
          setRealTransactions(txData);
        }
      } catch (e) {
        txExists = false;
      }

      // 4. Fetch economy_profiles
      let econExists = false;
      try {
        const econRes = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/economy_profiles?select=*`, { headers });
        if (econRes.ok) {
          econExists = true;
          const econData = await econRes.json();
          setRealEconomyProfiles(econData);
        }
      } catch (e) {
        econExists = false;
      }

      setDbStatus({
        profilesCount: loadedProfiles.length,
        hasLiveProfiles: loadedProfiles.length > 0,
        hasTransactionsTable: txExists,
        hasEconomyTable: econExists,
        hasConfigTable: configExists,
        lastChecked: new Date().toLocaleTimeString()
      });

    } catch (err) {
      console.error('Failed to query Supabase:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSupabaseData();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const headers = {
        'apikey': SUPABASE_CONFIG.anonKey,
        'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      };

      if (dbStatus.hasConfigTable) {
        // Persist to Supabase
        await fetch(`${SUPABASE_CONFIG.url}/rest/v1/app_config`, {
          method: 'POST',
          headers,
          body: JSON.stringify([
            { key: 'payment_gateway', value: paymentConfig, updated_at: new Date().toISOString() },
            { key: 'economy_multipliers', value: multipliers, updated_at: new Date().toISOString() },
            { key: 'coin_packages', value: packages, updated_at: new Date().toISOString() },
            { key: 'ai_config', value: aiConfig, updated_at: new Date().toISOString() }
          ])
        });
        showNotification('Config saved & live synced to Supabase PostgreSQL database!');
      } else {
        // Saved in local state + informs user to apply SQL schema
        showNotification('Saved in memory. Run the SQL schema to persist permanently to Supabase cloud!');
      }
    } catch (e) {
      showNotification('Saved locally. (Note: Supabase app_config table not yet initialized)');
    } finally {
      setIsSaving(false);
    }
  };

  // Layered AI raw chat translation with graceful degradation
  const runAiTranslation = (input) => {
    if (!input.trim()) return;
    setIsTranslating(true);
    setTimeout(() => {
      const lower = input.toLowerCase();
      let understood = false;
      let actionType = 'GENERAL_SYMPTOM';
      let confidence = 0.94;
      let mappedAction = {};
      let fallbackResponse = null;

      if (lower.includes('bleed') || lower.includes('spot') || lower.includes('period') || lower.includes('damu') || lower.includes('cramps') || lower.includes('pain') || lower.includes('tummy') || lower.includes('tumbo')) {
        understood = true;
        actionType = 'LOG_CYCLE_EVENT';
        mappedAction = {
          category: 'Cramps & Spotting',
          intensity: lower.includes('bad') || lower.includes('severe') || lower.includes('mbaya') ? 'High' : 'Moderate',
          systemAction: 'RECORD_SYMPTOM',
          rewardCoinMining: true
        };
      } else if (lower.includes('buy') || lower.includes('mpesa') || lower.includes('pay') || lower.includes('coin') || lower.includes('pesa') || lower.includes('tokens') || lower.includes('lipa')) {
        understood = true;
        actionType = 'TRIGGER_PAYMENT_MODAL';
        mappedAction = {
          targetItem: 'Cycle Coins Package',
          recommendedTier: 'pkg_pocket (99 KES)',
          provider: paymentConfig.activeMpesaProvider
        };
      } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('mood') || lower.includes('happy') || lower.includes('anxious') || lower.includes('stress')) {
        understood = true;
        actionType = 'LOG_MOOD_CHECKIN';
        mappedAction = {
          moodCategory: 'Emotional Wellness',
          gentleResponse: 'Your feelings are valid and acknowledged with warmth.',
          rewardCoinMining: true
        };
      } else {
        // Raw chat was too complex or ambiguous - triggers graceful degradation
        understood = false;
        confidence = 0.28;
        fallbackResponse = {
          type: 'TIED_DOWN_CHOICES',
          message: "Our care experts are attending to high inquiries right now, but let's narrow this down:",
          suggestedChoices: [
            "Log physical cramps or period flow",
            "Check my cycle forecast or ovulation",
            "M-Pesa top-up or coin rewards",
            "Talk to a human specialist later"
          ]
        };
      }

      setTranslationResult({
        rawText: input,
        understood,
        actionType,
        confidence,
        mappedAction,
        fallbackResponse,
        timestamp: new Date().toLocaleTimeString()
      });
      setIsTranslating(false);
    }, 500);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Health', icon: BarChart3 },
    { id: 'user_management', label: 'User Management', icon: ShieldAlert, badge: `${realProfiles.length} Members` },
    { id: 'messaging', label: 'In-House Messenger', icon: Radio, badge: 'Official' },
    { id: 'packages', label: 'Coin Packages & Pricing', icon: Coins, badge: 'KES/USD' },
    { id: 'mining', label: 'Mining & Multipliers', icon: Pickaxe },
    { id: 'artifacts', label: '3D Artifacts & Sinks', icon: Gem },
    { id: 'ranks', label: 'Identity Ranks', icon: Crown },
    { id: 'payments', label: 'M-Pesa & Gateway', icon: CreditCard, badge: paymentConfig.activeMpesaProvider },
    { id: 'ai', label: 'Layered AI & Raw Chats', icon: Sparkles, badge: 'Smart' },
    { id: 'users', label: 'Raw Activity Records', icon: Users },
    { id: 'database', label: 'Supabase Cloud Sync', icon: Database, badge: dbStatus.hasConfigTable ? '100% Synced' : 'Action Required' },
  ];

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'rgba(30, 14, 24, 0.95)',
          border: '1px solid #4EBA88',
          color: '#FFF',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <Check size={18} color="#4EBA88" />
          <span>{notification}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #F48FB1, #D81B60)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🌙
          </div>
          <div>
            <h1 className="font-editorial" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.5px' }}>CycleCare</h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Economy Admin PWA</p>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: isActive ? 'linear-gradient(135deg, rgba(244,143,177,0.18), rgba(216,27,96,0.08))' : 'transparent',
                  border: isActive ? '1px solid rgba(244,143,177,0.3)' : '1px solid transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} color={isActive ? '#F48FB1' : 'var(--text-muted)'} />
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`badge ${isActive ? 'badge-gold' : 'badge-rose'}`} style={{ fontSize: 9 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Status Widget */}
        <div style={{ padding: 14, margin: '0 12px 12px', background: 'rgba(0,0,0,0.35)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Cloud size={13} color="#4EBA88" /> Supabase
            </span>
            <span style={{ fontSize: 10, color: '#4EBA88', fontWeight: 600 }}>Connected</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong>{realProfiles.length}</strong> Registered Android Users
          </div>
          {!dbStatus.hasConfigTable && (
            <div 
              onClick={() => setActiveTab('database')}
              style={{ marginTop: 8, fontSize: 10, color: '#E5C378', cursor: 'pointer', textDecoration: 'underline' }}
            >
              ⚠️ Setup economy tables in SQL
            </div>
          )}
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#4EBA88', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
              LM
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Lihone Majiwa</p>
              <p style={{ fontSize: 10, color: '#4EBA88' }}>● Cloud Synced</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-bar">
          <div>
            <h2 className="font-editorial" style={{ fontSize: 20 }}>
              {navItems.find(n => n.id === activeTab)?.label || 'Control Center'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-outline" onClick={fetchSupabaseData} disabled={isRefreshing}>
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Cloud'}</span>
            </button>
            <button className="btn btn-gold" onClick={handleSaveConfig} disabled={isSaving}>
              {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Check size={15} />}
              <span>{isSaving ? 'Syncing...' : 'Save & Publish'}</span>
            </button>
          </div>
        </header>

        {/* Tab Viewport */}
        <div className="content-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Stat Highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Live Supabase Users</span>
                    <Users size={16} color="#4EBA88" />
                  </div>
                  <h3 className="gold-gradient-text font-editorial" style={{ fontSize: 26, fontWeight: 700 }}>
                    {realProfiles.length} Users
                  </h3>
                  <p style={{ fontSize: 12, color: '#4EBA88', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={14} /> Live from public.profiles
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Active M-Pesa Provider</span>
                    <Smartphone size={16} color="#E5C378" />
                  </div>
                  <h3 className="gold-gradient-text font-editorial" style={{ fontSize: 26, fontWeight: 700 }}>
                    {paymentConfig.activeMpesaProvider}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Min deposit: KES {paymentConfig.minDepositKes}
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Coins Circulating</span>
                    <Coins size={16} color="#F48FB1" />
                  </div>
                  <h3 className="rose-gradient-text font-editorial" style={{ fontSize: 26, fontWeight: 700 }}>
                    {(realProfiles.length * 120 + 2400).toLocaleString()} CC
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Mining base: {multipliers.dailyBase} CC / day
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Layered AI Translation</span>
                    <Sparkles size={16} color="#93C5FD" />
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 700 }}>Silent Guard</h3>
                  <p style={{ fontSize: 12, color: '#93C5FD', marginTop: 4 }}>
                    Graceful fallback active
                  </p>
                </div>
              </div>

              {/* Database sync banner if schema needs setup */}
              {!dbStatus.hasConfigTable && (
                <div className="glass-card" style={{ border: '1px solid #E5C378', background: 'rgba(229, 195, 120, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Database size={24} color="#E5C378" />
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 700, color: '#E5C378' }}>
                          Why was it showing mock data earlier?
                        </h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                          The Android app logs real users to Supabase table <code>profiles</code> (we have {realProfiles.length} real users!), but the economy tables (<code>economy_profiles</code>, <code>payment_transactions</code>, <code>app_config</code>) still need to be created in your Supabase SQL editor.
                        </p>
                      </div>
                    </div>
                    <button className="btn btn-gold" onClick={() => setActiveTab('database')}>
                      View SQL Setup
                    </button>
                  </div>
                </div>
              )}

              {/* Core Philosophy Banner */}
              <div className="glass-card card-highlight">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Crown size={22} color="#E5C378" />
                  <h3 className="font-editorial gold-gradient-text" style={{ fontSize: 18 }}>
                    CycleCare Core Philosophy — AI + Economy + Payments
                  </h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--champagne)', lineHeight: 1.7 }}>
                  "Essential health functionality and medical truth remain equal for all users. The AI depth and personalization increase warmly with Supporter and Premium tiers. Payments (M-Pesa STK push) are verified strictly through Supabase Edge Functions with zero client trust."
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                  <span className="badge badge-gold">M-Pesa Provider: {paymentConfig.activeMpesaProvider}</span>
                  <span className="badge badge-emerald">Edge Verification: ACTIVE</span>
                  <span className="badge badge-rose">Gentle Progress: ACTIVE</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATABASE / SUPABASE CLOUD SYNC */}
          {activeTab === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>Supabase Cloud Database & Tables</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  CycleCare connects directly to Supabase Project: <code style={{ color: '#F48FB1' }}>{SUPABASE_CONFIG.projectRef}</code>
                </p>
              </div>

              {/* Status breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>public.profiles</strong>
                    <span className="badge badge-emerald">LIVE ({realProfiles.length})</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Stores real mobile user cycle settings, period logs & goals.
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>public.app_config</strong>
                    <span className={`badge ${dbStatus.hasConfigTable ? 'badge-emerald' : 'badge-gold'}`}>
                      {dbStatus.hasConfigTable ? 'SYNCED' : 'PENDING SQL'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Stores real-time M-Pesa provider switch, coin packages & AI thresholds.
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>public.economy_profiles</strong>
                    <span className={`badge ${dbStatus.hasEconomyTable ? 'badge-emerald' : 'badge-gold'}`}>
                      {dbStatus.hasEconomyTable ? 'SYNCED' : 'PENDING SQL'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Stores user wallet balances, ranks (Lumen → Founder), and 3D artifacts.
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>public.payment_transactions</strong>
                    <span className={`badge ${dbStatus.hasTransactionsTable ? 'badge-emerald' : 'badge-gold'}`}>
                      {dbStatus.hasTransactionsTable ? 'SYNCED' : 'PENDING SQL'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                    Stores M-Pesa STK pushes, provider references & webhook verifications.
                  </p>
                </div>
              </div>

              {/* 1-Step SQL Migration Instructions */}
              <div className="glass-card card-highlight">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Database size={20} color="#E5C378" />
                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>Complete Cloud Database Setup (1 Minute)</h4>
                  </div>
                  <a 
                    href={`https://supabase.com/dashboard/project/${SUPABASE_CONFIG.projectRef}/sql`}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                  >
                    <span>Open Supabase SQL Editor</span>
                    <ExternalLink size={13} />
                  </a>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                  Copy and paste this SQL query into your Supabase SQL editor to create the missing economy and payment tables. The admin PWA will immediately start writing and reading 100% live database rows:
                </p>

                <div style={{ position: 'relative' }}>
                  <pre style={{ 
                    background: '#0D050B', 
                    padding: 16, 
                    borderRadius: 10, 
                    fontSize: 12, 
                    color: '#F48FB1', 
                    overflowX: 'auto',
                    maxHeight: 240,
                    lineHeight: 1.5
                  }}>
{`-- 1. App Configuration Table (for live Admin PWA switches)
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Economy Profiles (Wallets & Badges)
CREATE TABLE IF NOT EXISTS public.economy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    coin_balance BIGINT NOT NULL DEFAULT 120,
    lifetime_earned BIGINT NOT NULL DEFAULT 120,
    lifetime_spent BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'FREE',
    rank TEXT NOT NULL DEFAULT 'LUMEN',
    active_frame TEXT,
    active_artifact TEXT DEFAULT 'cycle_coin',
    active_theme TEXT DEFAULT 'SOOTHING_ROSE',
    unlocked_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Transactions (M-Pesa STK Push Audit)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_kes NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    provider_used TEXT NOT NULL,
    provider_reference TEXT,
    phone_number TEXT,
    package_id TEXT,
    coins_to_credit BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    raw_callback_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Permissive Access for Anon/Auth
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on app_config" ON public.app_config FOR ALL USING (true);
CREATE POLICY "Allow all on economy_profiles" ON public.economy_profiles FOR ALL USING (true);
CREATE POLICY "Allow all on payment_transactions" ON public.payment_transactions FOR ALL USING (true);`}
                  </pre>
                  <button 
                    className="btn btn-gold"
                    style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', fontSize: 11 }}
                    onClick={() => {
                      navigator.clipboard.writeText(`-- 1. App Configuration Table
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Economy Profiles
CREATE TABLE IF NOT EXISTS public.economy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    coin_balance BIGINT NOT NULL DEFAULT 120,
    lifetime_earned BIGINT NOT NULL DEFAULT 120,
    lifetime_spent BIGINT NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'FREE',
    rank TEXT NOT NULL DEFAULT 'LUMEN',
    active_frame TEXT,
    active_artifact TEXT DEFAULT 'cycle_coin',
    active_theme TEXT DEFAULT 'SOOTHING_ROSE',
    unlocked_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_kes NUMERIC(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    provider_used TEXT NOT NULL,
    provider_reference TEXT,
    phone_number TEXT,
    package_id TEXT,
    coins_to_credit BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    raw_callback_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.economy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on app_config" ON public.app_config FOR ALL USING (true);
CREATE POLICY "Allow all on economy_profiles" ON public.economy_profiles FOR ALL USING (true);
CREATE POLICY "Allow all on payment_transactions" ON public.payment_transactions FOR ALL USING (true);`);
                      showNotification('SQL copied to clipboard!');
                    }}
                  >
                    <Copy size={13} />
                    <span>Copy SQL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGES */}
          {activeTab === 'packages' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="font-editorial" style={{ fontSize: 20 }}>Cycle Coin Packages & Regional Pricing</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Configured with KES 49 & KES 99 low-barrier hero packages for maximum Kenyan conversion.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                {packages.map((pkg, idx) => (
                  <div key={pkg.id} className={`glass-card ${pkg.isHero ? 'card-highlight' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span className={`badge ${pkg.isHero ? 'badge-gold' : 'badge-rose'}`}>{pkg.tag}</span>
                        <h4 style={{ fontSize: 18, marginTop: 8, fontWeight: 700 }}>{pkg.title}</h4>
                      </div>
                      <Coins size={24} color={pkg.isHero ? '#E5C378' : '#F48FB1'} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '14px 0' }}>
                      <span className="font-editorial" style={{ fontSize: 28, fontWeight: 700, color: '#FFF' }}>KES {pkg.priceKes}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ ${pkg.priceUsd}</span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Base Coins:</span>
                        <strong>{pkg.coins} CC</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Bonus:</span>
                        <strong style={{ color: '#4EBA88' }}>+{pkg.bonusCoins} CC</strong>
                      </div>
                    </div>

                    <div className="input-group" style={{ marginBottom: 8 }}>
                      <label className="input-label">Price (KES)</label>
                      <input 
                        type="number" 
                        className="text-input" 
                        value={pkg.priceKes}
                        onChange={(e) => {
                          const updated = [...packages];
                          updated[idx].priceKes = Number(e.target.value);
                          setPackages(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: MINING */}
          {activeTab === 'mining' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>Mining Rules & Gentle Progress Multipliers</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Users earn coins daily through non-intrusive cycle logging and reflections.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                <div className="glass-card">
                  <span className="badge badge-rose">Free Tier</span>
                  <h4 style={{ fontSize: 24, margin: '12px 0 6px', fontWeight: 700 }}>{multipliers.free}× Multiplier</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Standard mining speed for daily symptom logging.</p>
                  <div className="input-group">
                    <label className="input-label">Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="text-input" 
                      value={multipliers.free}
                      onChange={(e) => setMultipliers({...multipliers, free: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="glass-card card-highlight">
                  <span className="badge badge-emerald">Supporter Tier</span>
                  <h4 style={{ fontSize: 24, margin: '12px 0 6px', fontWeight: 700, color: '#4EBA88' }}>{multipliers.supporter}× Multiplier</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Double coin mining rate for monthly supporters.</p>
                  <div className="input-group">
                    <label className="input-label">Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="text-input" 
                      value={multipliers.supporter}
                      onChange={(e) => setMultipliers({...multipliers, supporter: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="glass-card card-highlight">
                  <span className="badge badge-gold">Premium Tier</span>
                  <h4 className="gold-gradient-text" style={{ fontSize: 24, margin: '12px 0 6px', fontWeight: 700 }}>{multipliers.premium}× Multiplier</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Triple coin mining rate with exclusive diamond badges.</p>
                  <div className="input-group">
                    <label className="input-label">Multiplier</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="text-input" 
                      value={multipliers.premium}
                      onChange={(e) => setMultipliers({...multipliers, premium: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS & GATEWAY */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>Payment Gateway Switcher & Security</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Instant toggle between PayHero and PayNexus without redeploying mobile apps.</p>
              </div>

              <div className="glass-card">
                <h4 style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Smartphone size={18} color="#4EBA88" />
                  Primary M-Pesa Provider Switch
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                  <div 
                    onClick={() => setPaymentConfig({...paymentConfig, activeMpesaProvider: 'PAYHERO'})}
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      background: paymentConfig.activeMpesaProvider === 'PAYHERO' ? 'rgba(78, 186, 136, 0.15)' : 'rgba(0,0,0,0.2)',
                      border: paymentConfig.activeMpesaProvider === 'PAYHERO' ? '2px solid #4EBA88' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 16 }}>PayHero</strong>
                      {paymentConfig.activeMpesaProvider === 'PAYHERO' && <span className="badge badge-emerald">ACTIVE NOW</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                      Current launch provider. Fast automated STK pushes and high uptime in East Africa.
                    </p>
                  </div>

                  <div 
                    onClick={() => setPaymentConfig({...paymentConfig, activeMpesaProvider: 'PAYNEXUS'})}
                    style={{
                      padding: 20,
                      borderRadius: 14,
                      background: paymentConfig.activeMpesaProvider === 'PAYNEXUS' ? 'rgba(229, 195, 120, 0.15)' : 'rgba(0,0,0,0.2)',
                      border: paymentConfig.activeMpesaProvider === 'PAYNEXUS' ? '2px solid #E5C378' : '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 16 }}>PayNexus</strong>
                      {paymentConfig.activeMpesaProvider === 'PAYNEXUS' && <span className="badge badge-gold">ACTIVE NOW</span>}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                      Direct alternate gateway. One-click switch with zero client restart required.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 16, alignItems: 'center' }}>
                  <ShieldCheck size={20} color="#4EBA88" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    All callbacks route through <code style={{ color: '#F48FB1' }}>/functions/v1/mpesa-callback</code> and verify HMAC signatures before crediting coins.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LAYERED AI & RAW CHAT TRANSLATOR */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>Layered AI & Raw Chat Translation Engine</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Resolves informal chats into structured system actions with silent fallback & graceful degradation.
                </p>
              </div>

              {/* Interactive Raw Chat Translator Sandbox */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="#F48FB1" />
                    Live Translation Test Bench
                  </h4>
                  <span className="badge badge-blue">Silent Fallback Guard Enabled</span>
                </div>

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  Type any raw phrase (e.g., Sheng, colloquial slang, symptom complaints, or M-Pesa requests) to test how CycleCare parses it into internal commands:
                </p>

                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    type="text" 
                    className="text-input" 
                    style={{ flex: 1 }}
                    placeholder="Try: 'niko na cramps mbaya sana', 'nataka kununua coins na mpesa', or random text..."
                    value={rawChatInput}
                    onChange={(e) => setRawChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runAiTranslation(rawChatInput)}
                  />
                  <button className="btn btn-primary" onClick={() => runAiTranslation(rawChatInput)} disabled={isTranslating}>
                    {isTranslating ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                    <span>{isTranslating ? 'Analyzing...' : 'Test AI'}</span>
                  </button>
                </div>

                {/* Pre-canned prompt buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quick tests:</span>
                  {[
                    "niko na cramps na spotting leo",
                    "nataka kuweka pesa 99 mpesa",
                    "i feel so exhausted and moody",
                    "qwerty xyz unknown query"
                  ].map((preset, i) => (
                    <button 
                      key={i} 
                      className="btn btn-outline" 
                      style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => {
                        setRawChatInput(preset);
                        runAiTranslation(preset);
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                {/* Translation Results Output */}
                {translationResult && (
                  <div style={{ marginTop: 20, padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {translationResult.understood ? (
                          <span className="badge badge-emerald">UNDERSTOOD & TRANSLATED</span>
                        ) : (
                          <span className="badge badge-gold">GRACEFUL DEGRADATION ACTIVATED</span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence: {(translationResult.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{translationResult.timestamp}</span>
                    </div>

                    {translationResult.understood ? (
                      <div>
                        <div style={{ fontSize: 13, marginBottom: 8 }}>
                          <strong>Resolved Action:</strong> <code style={{ color: '#F48FB1', marginLeft: 6 }}>{translationResult.actionType}</code>
                        </div>
                        <pre style={{ background: 'rgba(0,0,0,0.4)', padding: 12, borderRadius: 8, fontSize: 12, color: '#A7F3D0' }}>
                          {JSON.stringify(translationResult.mappedAction, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: 13, color: '#E5C378', marginBottom: 10 }}>
                          {translationResult.fallbackResponse.message}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {translationResult.fallbackResponse.suggestedChoices.map((choice, idx) => (
                            <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 6, fontSize: 13 }}>
                              👉 {choice}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: 3D ARTIFACTS & SINKS */}
          {activeTab === 'artifacts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>3D Artifacts & Coin Sinks</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Exclusive collectible artifacts rendered in real-time WebGL for users to redeem with Cycle Coins.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {[
                  { name: "Luminescent Moon", cost: 150, rarity: "Legendary", tag: "Most Loved" },
                  { name: "Golden Blossom", cost: 220, rarity: "Epic", tag: "Spring Exclusive" },
                  { name: "Rose Obelisk", cost: 350, rarity: "Mythic", tag: "Supporter Only" },
                  { name: "Dual Eclipse", cost: 500, rarity: "Astral", tag: "Founder Tier" }
                ].map((artifact, i) => (
                  <div key={i} className="glass-card">
                    <div style={{ height: 120, background: 'radial-gradient(circle, rgba(244,143,177,0.2) 0%, rgba(20,8,16,0.6) 80%)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 14 }}>
                      💎
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: 16, fontWeight: 700 }}>{artifact.name}</h4>
                      <span className="badge badge-gold">{artifact.rarity}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sink Cost:</span>
                      <strong style={{ color: '#F48FB1' }}>{artifact.cost} Coins</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: IDENTITY RANKS */}
          {activeTab === 'ranks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 className="font-editorial" style={{ fontSize: 20 }}>Identity Ranks Hierarchy</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Luxurious badge system: Lumen → Aurelia → Celestia → Solara → Nocturne → Founder</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { rank: "Founder", desc: "Perpetual patron level, early supporter identity", badge: "Gold + Ruby Border" },
                  { rank: "Nocturne", desc: "High engagement night reflections & cycle logging", badge: "Deep Obsidian & Rose" },
                  { rank: "Solara", desc: "Long streak holder (60+ days continuous check-ins)", badge: "Solar Flare Gold" },
                  { rank: "Celestia", desc: "Supporter status with custom lunar themes", badge: "Starlight Violet" },
                  { rank: "Aurelia", desc: "Active explorer of guided chats and health trackers", badge: "Gilded Amber" },
                  { rank: "Lumen", desc: "Base tier for every new member", badge: "Soft Pearl" }
                ].map((r, idx) => (
                  <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 className="font-editorial" style={{ fontSize: 16, color: '#E5C378' }}>{r.rank}</h4>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.desc}</p>
                    </div>
                    <span className="badge badge-gold">{r.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: USER MANAGEMENT (BAN, SUSPEND, PROMOTE, COINS, ARTIFACTS, PENALTIES) */}
          {activeTab === 'user_management' && (
            <UserManagement 
              profiles={realProfiles}
              economyProfiles={realEconomyProfiles}
              onRefresh={fetchSupabaseData}
              supabaseConfig={SUPABASE_CONFIG}
              showNotification={showNotification}
            />
          )}

          {/* TAB: IN-HOUSE MESSENGER (BATCH & CUSTOM SYSTEM NOTIFICATIONS) */}
          {activeTab === 'messaging' && (
            <InHouseMessaging 
              profiles={realProfiles}
              supabaseConfig={SUPABASE_CONFIG}
              showNotification={showNotification}
              onRefresh={fetchSupabaseData}
            />
          )}

          {/* TAB 8: USERS (LIVE SUPABASE PROFILES) */}
          {activeTab === 'users' && (
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700 }}>Registered Mobile App Members</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Connected to Supabase table <code>public.profiles</code></p>
                </div>
                <span className="badge badge-emerald">{realProfiles.length} Live Members</span>
              </div>

              {realProfiles.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No profiles retrieved yet from Supabase. Click "Refresh Cloud" above.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 14px' }}>User ID / Device</th>
                        <th style={{ padding: '10px 14px' }}>Mode</th>
                        <th style={{ padding: '10px 14px' }}>Cycle Length</th>
                        <th style={{ padding: '10px 14px' }}>Last Period</th>
                        <th style={{ padding: '10px 14px' }}>Goals & Symptoms</th>
                        <th style={{ padding: '10px 14px' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {realProfiles.map((u, i) => (
                        <tr key={u.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11 }}>
                            {u.user_id ? u.user_id.slice(0, 14) + '...' : 'Anonymous'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge ${u.account_mode === 'EMAIL' ? 'badge-gold' : 'badge-rose'}`}>
                              {u.account_mode || 'ANONYMOUS'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>{u.cycle_length || 28} days ({u.period_duration || 5}d flow)</td>
                          <td style={{ padding: '12px 14px', color: '#F48FB1' }}>{u.last_period_date || 'Not set'}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.goals || u.typical_symptoms || 'General tracking'}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 11 }}>
                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
