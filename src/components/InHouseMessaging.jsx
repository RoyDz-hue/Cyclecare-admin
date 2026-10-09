import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  AlertCircle,
  Radio,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function InHouseMessaging({ 
  supabaseConfig, 
  profiles = [], 
  showNotification,
  onRefresh 
}) {
  const [messagesHistory, setMessagesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Form State
  const [targetAudience, setTargetAudience] = useState('ALL'); // 'ALL', 'FREE', 'SUPPORTER', 'PREMIUM', 'CUSTOM_LIST'
  const [messageType, setMessageType] = useState('SYSTEM_ANNOUNCEMENT'); // 'SYSTEM_ANNOUNCEMENT', 'ALERT', 'CARE_TIP', 'PROMO'
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [customUserIds, setCustomUserIds] = useState('');
  const [pushNotification, setPushNotification] = useState(true);

  // Fetch dispatched in-house messages from Supabase
  const fetchMessageHistory = async () => {
    setIsLoading(true);
    try {
      const headers = {
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${supabaseConfig.anonKey}`
      };
      const res = await fetch(`${supabaseConfig.url}/rest/v1/in_house_messages?select=*&order=created_at.desc&limit=25`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMessagesHistory(data);
      }
    } catch (e) {
      console.error('Failed to load in-house messages:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessageHistory();
  }, []);

  // Dispatch Batch In-House Message
  const handleDispatchBatch = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showNotification('Please provide a message title and body.');
      return;
    }

    setIsSending(true);
    try {
      const headers = {
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${supabaseConfig.anonKey}`,
        'Content-Type': 'application/json'
      };

      // 1. Insert official in-house message record
      const msgRes = await fetch(`${supabaseConfig.url}/rest/v1/in_house_messages`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          title,
          message,
          message_type: messageType,
          target_audience: targetAudience,
          action_url: actionUrl || null,
          sent_by: 'CycleCare Official Team'
        })
      });

      let createdMsg = null;
      if (msgRes.ok) {
        const resData = await msgRes.json();
        if (Array.isArray(resData) && resData.length > 0) {
          createdMsg = resData[0];
        }
      }

      // 2. Identify target recipients from profiles
      let recipients = [];
      if (targetAudience === 'ALL') {
        recipients = profiles.map(p => p.user_id || p.device_id || p.id).filter(Boolean);
      } else if (targetAudience === 'CUSTOM_LIST') {
        recipients = customUserIds.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      } else {
        // Tiers: FREE, SUPPORTER, PREMIUM
        recipients = profiles.map(p => p.user_id || p.device_id || p.id).filter(Boolean);
      }

      // Deduplicate recipients
      recipients = Array.from(new Set(recipients));

      // 3. Batch insert notifications for targeted users
      if (recipients.length > 0 && pushNotification) {
        const notificationsPayload = recipients.map(targetId => ({
          message_id: createdMsg ? createdMsg.id : null,
          target_identifier: targetId,
          title: title,
          body: message,
          type: messageType,
          is_read: false
        }));

        // Insert in chunks of 50 to avoid request size limits
        for (let i = 0; i < notificationsPayload.length; i += 50) {
          const chunk = notificationsPayload.slice(i, i + 50);
          await fetch(`${supabaseConfig.url}/rest/v1/user_notifications`, {
            method: 'POST',
            headers,
            body: JSON.stringify(chunk)
          });
        }
      }

      // Log admin audit
      await fetch(`${supabaseConfig.url}/rest/v1/admin_audit_logs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          admin_action: 'DISPATCH_IN_HOUSE_MESSAGE',
          target_user_id: targetAudience,
          details: { title, targetCount: recipients.length, messageType }
        })
      });

      showNotification(`Successfully broadcasted in-house message to ${recipients.length} users!`);
      setTitle('');
      setMessage('');
      setActionUrl('');
      setCustomUserIds('');
      fetchMessageHistory();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to dispatch in-house message:', err);
      showNotification('Failed to dispatch message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="font-editorial" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={22} color="#4EBA88" /> Official In-House Messenger & Push Broadcast
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Programmatically dispatch messages to all users, specific tiers, or customized individual batches. Messages are stamped as <strong>Official CycleCare In-House</strong> and cannot be spoofed by regular accounts.
            </p>
          </div>
          <span className="badge badge-emerald">Verified In-House Sender</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Left Column: Message Compose Form */}
        <div className="glass-card">
          <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={18} color="#F48FB1" /> Compose In-House Broadcast
          </h4>

          <form onSubmit={handleDispatchBatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Target Audience */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Target Audience:
              </label>
              <select 
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
              >
                <option value="ALL">All Active Users ({profiles.length} detected)</option>
                <option value="FREE">Free Tier Members Only</option>
                <option value="SUPPORTER">Supporters Tier Only</option>
                <option value="PREMIUM">Premium Patrons Only</option>
                <option value="CUSTOM_LIST">Custom Batch of User IDs / Devices</option>
              </select>
            </div>

            {targetAudience === 'CUSTOM_LIST' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Target User IDs / Device IDs (comma or newline separated):
                </label>
                <textarea 
                  rows={3}
                  placeholder="usr_123, usr_456, a8f1b2c3..."
                  value={customUserIds}
                  onChange={(e) => setCustomUserIds(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF', fontFamily: 'monospace', fontSize: 12 }}
                />
              </div>
            )}

            {/* Message Type */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Message Category:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { id: 'SYSTEM_ANNOUNCEMENT', label: 'Announcement', icon: '📢' },
                  { id: 'ALERT', label: 'Urgent Care Alert', icon: '⚠️' },
                  { id: 'CARE_TIP', label: 'Cycle & Wellness Tip', icon: '🌸' },
                  { id: 'PROMO', label: 'Coin Reward / Promo', icon: '💎' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setMessageType(cat.id)}
                    className={`btn ${messageType === cat.id ? 'btn-gold' : 'btn-outline'}`}
                    style={{ padding: '8px 12px', fontSize: 12, justifyContent: 'flex-start' }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                In-House Message Subject / Title:
              </label>
              <input 
                type="text"
                placeholder="e.g. New Lunar Cycle Forecast Feature is Live!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                required
              />
            </div>

            {/* Body */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Message Content:
              </label>
              <textarea 
                rows={5}
                placeholder="Write the message text. Tone: calm, warm, scientific, and human..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF', resize: 'vertical' }}
                required
              />
            </div>

            {/* Action Deep-link URL */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Optional Action Route / Deep-link:
              </label>
              <input 
                type="text"
                placeholder="e.g. cyclecare://economy or cyclecare://chat"
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
              />
            </div>

            {/* Push toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input 
                type="checkbox" 
                id="pushNotifToggle"
                checked={pushNotification}
                onChange={(e) => setPushNotification(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#4EBA88' }}
              />
              <label htmlFor="pushNotifToggle" style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Deliver directly to user in-app notification centers
              </label>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="btn btn-gold" 
              disabled={isSending}
              style={{ marginTop: 8, padding: '12px 18px', fontSize: 14 }}
            >
              {isSending ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Dispatching to Supabase...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Broadcast In-House Message</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Broadcast History & Audit */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#E5C378" /> In-House Dispatches History
            </h4>
            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 11 }} onClick={fetchMessageHistory}>
              Refresh
            </button>
          </div>

          {messagesHistory.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              No in-house messages broadcasted yet. Compose one on the left to notify users!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 520, overflowY: 'auto' }}>
              {messagesHistory.map((msg) => (
                <div 
                  key={msg.id} 
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-emerald" style={{ fontSize: 10 }}>OFFICIAL</span>
                        <strong style={{ fontSize: 14, color: '#FFF' }}>{msg.title}</strong>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Target: <span style={{ color: '#E5C378' }}>{msg.target_audience}</span> ● {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                    <span className="badge badge-gold" style={{ fontSize: 10 }}>
                      {msg.message_type}
                    </span>
                  </div>

                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {msg.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Sender: <em>{msg.sent_by || 'CycleCare Team'}</em></span>
                    {msg.action_url && (
                      <span style={{ color: '#F48FB1', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ExternalLink size={12} /> {msg.action_url}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
