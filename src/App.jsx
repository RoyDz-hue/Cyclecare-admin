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
  Smartphone
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Economy state
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

  const handleSaveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showNotification('Configuration successfully saved & synced to Supabase Edge layer!');
    }, 600);
  };

  // Simulate layered AI raw chat translation with graceful degradation
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

      if (lower.includes('bleed') || lower.includes('spot') || lower.includes('period') || lower.includes('damu') || lower.includes('cramps') || lower.includes('pain') || lower.includes('tummy')) {
        understood = true;
        actionType = 'LOG_CYCLE_EVENT';
        mappedAction = {
          category: 'Cramps & Spotting',
          intensity: lower.includes('bad') || lower.includes('severe') ? 'High' : 'Moderate',
          systemAction: 'RECORD_SYMPTOM',
          rewardCoinMining: true
        };
      } else if (lower.includes('buy') || lower.includes('mpesa') || lower.includes('pay') || lower.includes('coin') || lower.includes('pesa') || lower.includes('tokens')) {
        understood = true;
        actionType = 'TRIGGER_PAYMENT_MODAL';
        mappedAction = {
          targetItem: 'Cycle Coins Package',
          recommendedTier: 'pkg_pocket (99 KES)',
          provider: paymentConfig.activeMpesaProvider
        };
      } else if (lower.includes('sad') || lower.includes('cry') || lower.includes('mood') || lower.includes('happy') || lower.includes('anxious')) {
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
    }, 700);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Health', icon: BarChart3 },
    { id: 'packages', label: 'Coin Packages & Pricing', icon: Coins, badge: 'KES/USD' },
    { id: 'mining', label: 'Mining & Multipliers', icon: Pickaxe },
    { id: 'artifacts', label: '3D Artifacts & Sinks', icon: Gem },
    { id: 'ranks', label: 'Identity Ranks', icon: Crown },
    { id: 'payments', label: 'M-Pesa & Gateway', icon: CreditCard, badge: paymentConfig.activeMpesaProvider },
    { id: 'ai', label: 'Layered AI & Raw Chats', icon: Sparkles, badge: 'Smart' },
    { id: 'users', label: 'User Care & Activity', icon: Users },
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
            <button className="btn btn-outline" onClick={() => showNotification('Refreshed real-time telemetry from Supabase & M-Pesa.')}>
              <RefreshCw size={15} />
              <span>Refresh</span>
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
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Daily M-Pesa Volume</span>
                    <Flame size={16} color="#E5C378" />
                  </div>
                  <h3 className="gold-gradient-text font-editorial" style={{ fontSize: 26, fontWeight: 700 }}>KES 148,250</h3>
                  <p style={{ fontSize: 12, color: '#4EBA88', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} /> +24.8% vs last week
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Coins Circulating</span>
                    <Coins size={16} color="#F48FB1" />
                  </div>
                  <h3 className="rose-gradient-text font-editorial" style={{ fontSize: 26, fontWeight: 700 }}>2,840,190 CC</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Burn rate: 42.1% via 3D sinks
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Daily Active Check-ins</span>
                    <Pickaxe size={16} color="#4EBA88" />
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 700 }}>18,420 Users</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    "Gentle Progress" reward cycle
                  </p>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, textTransform: 'uppercase' }}>Layered AI Translation</span>
                    <Sparkles size={16} color="#93C5FD" />
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 700 }}>99.2% Graceful</h3>
                  <p style={{ fontSize: 12, color: '#93C5FD', marginTop: 4 }}>
                    Zero user-facing crashes
                  </p>
                </div>
              </div>

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
                        <pre style={{ background: '#12050E', padding: 12, borderRadius: 8, fontSize: 12, color: '#4EBA88', overflowX: 'auto' }}>
                          {JSON.stringify(translationResult.mappedAction, null, 2)}
                        </pre>
                        <p style={{ fontSize: 12, color: '#4EBA88', marginTop: 8 }}>
                          ✓ User continues seamlessly without knowing complex translation occurred behind the scenes.
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E5C378', marginBottom: 8 }}>
                          <AlertTriangle size={16} />
                          <strong>Rule Triggered: Safe Fallback without user panic</strong>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--champagne)', marginBottom: 12 }}>
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

          {/* TAB 8: USERS */}
          {activeTab === 'users' && (
            <div className="glass-card">
              <h4 style={{ fontSize: 16, marginBottom: 16 }}>Recent Member Activity</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 14px' }}>User</th>
                      <th style={{ padding: '10px 14px' }}>Rank</th>
                      <th style={{ padding: '10px 14px' }}>Multiplier</th>
                      <th style={{ padding: '10px 14px' }}>Balance</th>
                      <th style={{ padding: '10px 14px' }}>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Grace K. (Nairobi)", rank: "Founder", mult: "3.0×", coins: "1,420 CC", act: "M-Pesa STK 99 KES (Completed)" },
                      { name: "Amina M. (Mombasa)", rank: "Celestia", mult: "2.0×", coins: "640 CC", act: "Gentle Progress Daily Log" },
                      { name: "Wanjiru N. (Nakuru)", rank: "Lumen", mult: "1.0×", coins: "115 CC", act: "Mood check-in" },
                      { name: "Brenda O. (Kisumu)", rank: "Solara", mult: "2.0×", coins: "980 CC", act: "Unlocked Luminescent Moon" }
                    ].map((u, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{u.name}</td>
                        <td style={{ padding: '12px 14px' }}><span className="badge badge-gold">{u.rank}</span></td>
                        <td style={{ padding: '12px 14px' }}>{u.mult}</td>
                        <td style={{ padding: '12px 14px', color: '#F48FB1' }}>{u.coins}</td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.act}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
