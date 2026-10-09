import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  Coins, 
  Gift, 
  AlertTriangle, 
  Search, 
  Crown, 
  Sparkles,
  Send,
  History,
  Check,
  Clock,
  Filter
} from 'lucide-react';

export default function UserManagement({ 
  profiles = [], 
  economyProfiles = [], 
  onRefresh, 
  supabaseConfig,
  showNotification 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null); // 'STATUS', 'COINS', 'GIFT', 'PENALTY', 'CUSTOM_MSG'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for modals
  const [modalForm, setModalForm] = useState({
    status: 'ACTIVE',
    reason: '',
    durationHours: 24,
    coinAmount: 100,
    coinAction: 'CREDIT', // 'CREDIT' or 'DEBIT'
    artifactName: 'Luminescent Moon',
    artifactCost: 0,
    penaltyPercent: 20,
    msgTitle: 'CycleCare Team Announcement',
    msgBody: '',
    msgType: 'SYSTEM'
  });

  // Artifact catalogue
  const artifactsCatalogue = [
    { name: "Luminescent Moon", rarity: "Legendary", icon: "🌙" },
    { name: "Golden Blossom", rarity: "Epic", icon: "🌸" },
    { name: "Rose Obelisk", rarity: "Mythic", icon: "🌹" },
    { name: "Dual Eclipse", rarity: "Astral", icon: "✨" },
    { name: "Celestial Tiara", rarity: "Royalty", icon: "👑" }
  ];

  // Helper to match profile with economy
  const mergedUsers = profiles.map(p => {
    const econ = economyProfiles.find(e => 
      (e.user_id && e.user_id === p.user_id) || 
      (e.device_id && e.device_id === p.device_id) ||
      (e.user_id && e.user_id === p.id)
    ) || {};
    
    return {
      ...p,
      coin_balance: econ.coin_balance !== undefined ? econ.coin_balance : 0,
      supporter_tier: econ.supporter_tier || 'FREE',
      identity_rank: econ.identity_rank || 'Lumen',
      status: p.status || econ.status || 'ACTIVE',
      suspension_reason: p.suspension_reason || econ.suspension_reason || '',
      suspended_until: p.suspended_until || econ.suspended_until || null,
      artifacts: econ.artifacts || [],
      last_penalized_at: econ.last_penalized_at || null,
      econId: econ.id
    };
  });

  const filteredUsers = mergedUsers.filter(u => {
    const idMatches = (u.user_id || u.device_id || u.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatches = statusFilter === 'ALL' || u.status === statusFilter;
    const tierMatches = tierFilter === 'ALL' || u.supporter_tier === tierFilter;
    return idMatches && statusMatches && tierMatches;
  });

  // Execute database operations directly via Supabase REST API
  const handlePerformAction = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    const identifier = selectedUser.user_id || selectedUser.device_id || selectedUser.id;
    const headers = {
      'apikey': supabaseConfig.anonKey,
      'Authorization': `Bearer ${supabaseConfig.anonKey}`,
      'Content-Type': 'application/json'
    };

    try {
      if (actionModal === 'STATUS') {
        const until = modalForm.status === 'SUSPENDED' 
          ? new Date(Date.now() + modalForm.durationHours * 3600 * 1000).toISOString()
          : null;
        
        // Update profiles & economy_profiles
        await fetch(`${supabaseConfig.url}/rest/v1/profiles?id=eq.${selectedUser.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            status: modalForm.status,
            suspension_reason: modalForm.reason || null,
            suspended_until: until
          })
        });

        // Audit log
        await fetch(`${supabaseConfig.url}/rest/v1/admin_audit_logs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            admin_action: `CHANGE_STATUS_${modalForm.status}`,
            target_user_id: identifier,
            details: { reason: modalForm.reason, suspended_until: until }
          })
        });

        showNotification(`User account status updated to ${modalForm.status}!`);
      }

      else if (actionModal === 'COINS') {
        const delta = modalForm.coinAction === 'CREDIT' ? Number(modalForm.coinAmount) : -Number(modalForm.coinAmount);
        const newBalance = Math.max(0, (selectedUser.coin_balance || 0) + delta);

        if (selectedUser.econId) {
          await fetch(`${supabaseConfig.url}/rest/v1/economy_profiles?id=eq.${selectedUser.econId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ coin_balance: newBalance })
          });
        }

        // Also record an in-house official notification to the user
        await fetch(`${supabaseConfig.url}/rest/v1/user_notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            target_identifier: identifier,
            title: delta > 0 ? 'Cycle Coins Received!' : 'Account Balance Adjustment',
            body: delta > 0 
              ? `You have received ${Math.abs(delta)} Cycle Coins from CycleCare In-House Team.`
              : `Your balance was adjusted by ${delta} Cycle Coins (${modalForm.reason || 'Administrative adjustment'}).`,
            type: delta > 0 ? 'REWARD' : 'PENALTY'
          })
        });

        // Audit log
        await fetch(`${supabaseConfig.url}/rest/v1/admin_audit_logs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            admin_action: modalForm.coinAction === 'CREDIT' ? 'CREDIT_COINS' : 'DEBIT_COINS',
            target_user_id: identifier,
            details: { delta, newBalance, reason: modalForm.reason }
          })
        });

        showNotification(`${delta > 0 ? 'Credited' : 'Debited'} ${Math.abs(delta)} coins for user.`);
      }

      else if (actionModal === 'GIFT') {
        const updatedArtifacts = [...(selectedUser.artifacts || [])];
        const art = artifactsCatalogue.find(a => a.name === modalForm.artifactName);
        updatedArtifacts.push({
          name: modalForm.artifactName,
          rarity: art ? art.rarity : 'Rare',
          giftedAt: new Date().toISOString(),
          giftedBy: 'CycleCare In-House Team'
        });

        if (selectedUser.econId) {
          await fetch(`${supabaseConfig.url}/rest/v1/economy_profiles?id=eq.${selectedUser.econId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ artifacts: updatedArtifacts })
          });
        }

        // Push official notification
        await fetch(`${supabaseConfig.url}/rest/v1/user_notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            target_identifier: identifier,
            title: `Exclusive Gift: ${modalForm.artifactName}`,
            body: `The CycleCare In-House Team has gifted you a rare 3D collectible artifact: ${modalForm.artifactName}!`,
            type: 'GIFT'
          })
        });

        // Audit log
        await fetch(`${supabaseConfig.url}/rest/v1/admin_audit_logs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            admin_action: 'GIFT_ARTIFACT',
            target_user_id: identifier,
            details: { artifact: modalForm.artifactName }
          })
        });

        showNotification(`Gifted 3D artifact "${modalForm.artifactName}" to user!`);
      }

      else if (actionModal === 'PENALTY') {
        const penaltyRate = Number(modalForm.penaltyPercent) / 100;
        const currentBal = selectedUser.coin_balance || 0;
        const deducted = Math.floor(currentBal * penaltyRate);
        const newBalance = Math.max(0, currentBal - deducted);

        if (selectedUser.econId) {
          await fetch(`${supabaseConfig.url}/rest/v1/economy_profiles?id=eq.${selectedUser.econId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ 
              coin_balance: newBalance,
              last_penalized_at: new Date().toISOString()
            })
          });
        }

        // In-house message notice
        await fetch(`${supabaseConfig.url}/rest/v1/user_notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            target_identifier: identifier,
            title: 'Account Inactivity / Policy Notice',
            body: `An inactivity penalty of ${deducted} coins (${modalForm.penaltyPercent}%) was applied. Log in regularly to maintain full mining rewards!`,
            type: 'WARNING'
          })
        });

        // Audit log
        await fetch(`${supabaseConfig.url}/rest/v1/admin_audit_logs`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            admin_action: 'INACTIVITY_PENALTY',
            target_user_id: identifier,
            details: { deducted, newBalance, penaltyPercent: modalForm.penaltyPercent }
          })
        });

        showNotification(`Applied ${modalForm.penaltyPercent}% penalty (-${deducted} coins).`);
      }

      else if (actionModal === 'CUSTOM_MSG') {
        // Direct in-house message dispatched to this specific user
        await fetch(`${supabaseConfig.url}/rest/v1/user_notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            target_identifier: identifier,
            title: modalForm.msgTitle || 'In-House CycleCare Notice',
            body: modalForm.msgBody,
            type: modalForm.msgType || 'SYSTEM'
          })
        });

        // Also record in in_house_messages
        await fetch(`${supabaseConfig.url}/rest/v1/in_house_messages`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            title: modalForm.msgTitle,
            message: modalForm.msgBody,
            message_type: modalForm.msgType,
            target_audience: 'INDIVIDUAL',
            target_user_id: identifier,
            sent_by: 'CycleCare Official Care Team'
          })
        });

        showNotification(`Sent official in-house message to ${identifier.slice(0, 10)}...!`);
      }

      setActionModal(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error executing user management action:', err);
      showNotification('Failed to execute action. Check Supabase connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Filter Controls */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 className="font-editorial" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={22} color="#F48FB1" /> User Account Management & Controls
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Manage member account states (Ban, Suspend, Activate), credit/debit coins, gift 3D artifacts, penalize dormancy, or dispatch official in-house notices.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge badge-emerald">{filteredUsers.length} Displayed</span>
            <span className="badge badge-gold">{mergedUsers.filter(u => u.status === 'BANNED' || u.status === 'SUSPENDED').length} Restricted</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input 
              type="text" 
              placeholder="Search by User ID / Device ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#FFF',
                fontSize: 13
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#FFF',
                fontSize: 13
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="BANNED">Banned</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tier:</span>
            <select 
              value={tierFilter} 
              onChange={(e) => setTierFilter(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                color: '#FFF',
                fontSize: 13
              }}
            >
              <option value="ALL">All Tiers</option>
              <option value="FREE">Free Tier</option>
              <option value="SUPPORTER">Supporter</option>
              <option value="PREMIUM">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>User ID / Identity</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px' }}>Tier & Rank</th>
                <th style={{ padding: '12px 16px' }}>Coins Balance</th>
                <th style={{ padding: '12px 16px' }}>Artifacts</th>
                <th style={{ padding: '12px 16px' }}>Cycle Info</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No matching users found in the database.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, idx) => {
                  const idDisplay = user.user_id || user.device_id || user.id || 'Anonymous';
                  const isRestricted = user.status === 'BANNED' || user.status === 'SUSPENDED';

                  return (
                    <tr 
                      key={user.id || idx} 
                      style={{ 
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: isRestricted ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#FFF' }}>
                            {idDisplay.length > 20 ? idDisplay.slice(0, 18) + '...' : idDisplay}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {user.account_mode || 'Mobile Client'} ● {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {user.status === 'ACTIVE' && (
                          <span className="badge badge-emerald">ACTIVE</span>
                        )}
                        {user.status === 'SUSPENDED' && (
                          <span className="badge badge-gold" title={user.suspension_reason || 'Suspended'}>SUSPENDED</span>
                        )}
                        {user.status === 'BANNED' && (
                          <span className="badge" style={{ background: '#EF4444', color: '#FFF' }} title={user.suspension_reason || 'Banned'}>BANNED</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Crown size={14} color="#E5C378" />
                          <span style={{ fontWeight: 600, color: '#E5C378' }}>{user.supporter_tier}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({user.identity_rank})</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Coins size={14} color="#F48FB1" />
                          <strong style={{ color: '#F48FB1', fontSize: 14 }}>{user.coin_balance}</strong>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {user.artifacts && user.artifacts.length > 0 ? (
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {user.artifacts.map((art, aIdx) => (
                              <span key={aIdx} className="badge badge-rose" style={{ fontSize: 10 }}>
                                💎 {art.name || art}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>None</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: 12 }}>
                          {user.cycle_length || 28}d cycle ({user.period_duration || 5}d flow)
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Last: {user.last_period_date || 'N/A'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          {/* Quick Action: Status Change */}
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: 11 }}
                            title="Ban or Suspend User"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalForm({
                                ...modalForm,
                                status: user.status === 'BANNED' ? 'ACTIVE' : 'BANNED',
                                reason: ''
                              });
                              setActionModal('STATUS');
                            }}
                          >
                            <ShieldAlert size={13} color="#EF4444" />
                            <span>{user.status === 'ACTIVE' ? 'Ban/Suspend' : 'Change Status'}</span>
                          </button>

                          {/* Quick Action: Debit/Credit Coins */}
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: 11 }}
                            title="Credit or Debit Coins"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalForm({
                                ...modalForm,
                                coinAmount: 100,
                                coinAction: 'CREDIT',
                                reason: ''
                              });
                              setActionModal('COINS');
                            }}
                          >
                            <Coins size={13} color="#E5C378" />
                            <span>Coins</span>
                          </button>

                          {/* Quick Action: Gift Artifact */}
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: 11 }}
                            title="Gift 3D Artifact"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionModal('GIFT');
                            }}
                          >
                            <Gift size={13} color="#F48FB1" />
                            <span>Gift</span>
                          </button>

                          {/* Quick Action: Penalize for Inactiveness */}
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: 11 }}
                            title="Penalize for Inactivity (Deduct % of Coins)"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalForm({
                                ...modalForm,
                                penaltyPercent: 20
                              });
                              setActionModal('PENALTY');
                            }}
                          >
                            <AlertTriangle size={13} color="#F59E0B" />
                            <span>Penalize</span>
                          </button>

                          {/* Quick Action: Custom In-House Message */}
                          <button 
                            className="btn btn-outline"
                            style={{ padding: '6px 10px', fontSize: 11 }}
                            title="Push Custom Official In-House Message"
                            onClick={() => {
                              setSelectedUser(user);
                              setModalForm({
                                ...modalForm,
                                msgTitle: 'Official CycleCare In-House Notice',
                                msgBody: '',
                                msgType: 'SYSTEM'
                              });
                              setActionModal('CUSTOM_MSG');
                            }}
                          >
                            <Send size={13} color="#4EBA88" />
                            <span>Msg</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION MODAL OVERLAY */}
      {actionModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 20
        }}>
          <div className="glass-card" style={{ maxWidth: 520, width: '100%', background: '#190B14', border: '1px solid rgba(244,143,177,0.3)' }}>
            {/* Modal Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="font-editorial" style={{ fontSize: 18, color: '#FFF' }}>
                {actionModal === 'STATUS' && 'Change Account Access Status'}
                {actionModal === 'COINS' && 'Credit or Debit Cycle Coins'}
                {actionModal === 'GIFT' && 'Gift 3D Collectible Artifact'}
                {actionModal === 'PENALTY' && 'Penalize for Inactivity / Dormancy'}
                {actionModal === 'CUSTOM_MSG' && 'Send Official In-House Message'}
              </h3>
              <button 
                className="btn btn-outline" 
                style={{ padding: '4px 8px', fontSize: 12 }}
                onClick={() => setActionModal(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 8 }}>
              Target User: <strong style={{ color: '#FFF' }}>{selectedUser.user_id || selectedUser.device_id || selectedUser.id}</strong>
              <div style={{ marginTop: 4 }}>
                Balance: <strong>{selectedUser.coin_balance} Coins</strong> | Status: <strong>{selectedUser.status}</strong>
              </div>
            </div>

            {/* STATUS MODAL CONTENT */}
            {actionModal === 'STATUS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Target Status:</label>
                  <select 
                    value={modalForm.status}
                    onChange={(e) => setModalForm({ ...modalForm, status: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    <option value="ACTIVE">ACTIVE (Full access restored)</option>
                    <option value="SUSPENDED">SUSPENDED (Temporary restriction)</option>
                    <option value="BANNED">BANNED (Permanent account lock)</option>
                  </select>
                </div>

                {modalForm.status === 'SUSPENDED' && (
                  <div>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Suspension Duration (Hours):</label>
                    <input 
                      type="number"
                      value={modalForm.durationHours}
                      onChange={(e) => setModalForm({ ...modalForm, durationHours: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Reason for Action:</label>
                  <input 
                    type="text"
                    placeholder="e.g. Terms violation, unusual traffic, requested by support..."
                    value={modalForm.reason}
                    onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
              </div>
            )}

            {/* COINS MODAL CONTENT */}
            {actionModal === 'COINS' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Action:</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button 
                      type="button"
                      className={`btn ${modalForm.coinAction === 'CREDIT' ? 'btn-gold' : 'btn-outline'}`}
                      style={{ flex: 1 }}
                      onClick={() => setModalForm({ ...modalForm, coinAction: 'CREDIT' })}
                    >
                      Credit (Give Coins)
                    </button>
                    <button 
                      type="button"
                      className={`btn ${modalForm.coinAction === 'DEBIT' ? 'btn-gold' : 'btn-outline'}`}
                      style={{ flex: 1 }}
                      onClick={() => setModalForm({ ...modalForm, coinAction: 'DEBIT' })}
                    >
                      Debit (Deduct Coins)
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Coin Amount:</label>
                  <input 
                    type="number"
                    value={modalForm.coinAmount}
                    onChange={(e) => setModalForm({ ...modalForm, coinAmount: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Reason / Note:</label>
                  <input 
                    type="text"
                    placeholder="e.g. Community contribution reward, bug bounty, adjustment..."
                    value={modalForm.reason}
                    onChange={(e) => setModalForm({ ...modalForm, reason: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>
              </div>
            )}

            {/* GIFT MODAL CONTENT */}
            {actionModal === 'GIFT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Select 3D Collectible Artifact:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {artifactsCatalogue.map((art, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setModalForm({ ...modalForm, artifactName: art.name })}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: modalForm.artifactName === art.name ? 'rgba(244,143,177,0.2)' : 'rgba(0,0,0,0.2)',
                          border: modalForm.artifactName === art.name ? '1px solid #F48FB1' : '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{art.icon}</span>
                          <strong style={{ fontSize: 13, color: '#FFF' }}>{art.name}</strong>
                        </div>
                        <span className="badge badge-gold">{art.rarity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PENALTY MODAL CONTENT */}
            {actionModal === 'PENALTY' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 8, color: '#FBBF24', fontSize: 12 }}>
                  ⚠️ Inactivity penalties deduct a percentage of dormant coins to maintain token circulation and encourage continuous gentle cycle logging.
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Penalty Percentage:</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[10, 20, 30, 50].map((pct) => (
                      <button 
                        key={pct}
                        type="button"
                        className={`btn ${Number(modalForm.penaltyPercent) === pct ? 'btn-gold' : 'btn-outline'}`}
                        style={{ flex: 1, padding: '8px 0' }}
                        onClick={() => setModalForm({ ...modalForm, penaltyPercent: pct })}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Coins to be deducted: <strong style={{ color: '#EF4444' }}>{Math.floor((selectedUser.coin_balance || 0) * (modalForm.penaltyPercent / 100))} Coins</strong>
                  <br />
                  Remaining Balance: <strong style={{ color: '#4EBA88' }}>{Math.max(0, (selectedUser.coin_balance || 0) - Math.floor((selectedUser.coin_balance || 0) * (modalForm.penaltyPercent / 100)))} Coins</strong>
                </div>
              </div>
            )}

            {/* CUSTOM IN-HOUSE MESSAGE CONTENT */}
            {actionModal === 'CUSTOM_MSG' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ padding: 10, background: 'rgba(78, 186, 136, 0.1)', border: '1px solid rgba(78, 186, 136, 0.3)', borderRadius: 8, color: '#4EBA88', fontSize: 12 }}>
                  ✉️ This message will appear as an official in-house message from CycleCare (not from any user account).
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Message Type:</label>
                  <select 
                    value={modalForm.msgType}
                    onChange={(e) => setModalForm({ ...modalForm, msgType: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  >
                    <option value="SYSTEM">System Announcement</option>
                    <option value="ALERT">Urgent Health / Security Alert</option>
                    <option value="CARE">Personalized Care & Cycle Advice</option>
                    <option value="REWARD">Exclusive Reward Notification</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject / Title:</label>
                  <input 
                    type="text"
                    value={modalForm.msgTitle}
                    onChange={(e) => setModalForm({ ...modalForm, msgTitle: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Message Body:</label>
                  <textarea 
                    rows={4}
                    placeholder="Enter the official care message..."
                    value={modalForm.msgBody}
                    onChange={(e) => setModalForm({ ...modalForm, msgBody: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#250E1E', border: '1px solid var(--border-subtle)', color: '#FFF', resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setActionModal(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-gold" 
                onClick={handlePerformAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Executing...' : 'Confirm & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
