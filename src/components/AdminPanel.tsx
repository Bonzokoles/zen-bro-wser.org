import React, { useState, useEffect } from 'react';
import type { PlanType } from '../config/features';

const ADMIN_PASSWORD = 'HAOS77###';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanChange?: (plan: PlanType) => void;
}

export default function AdminPanel({ isOpen, onClose, onPlanChange }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState<PlanType>('lifetime');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API Key management
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; key: string; clientEmail: string; createdAt: string }>>([]);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [keyCounter, setKeyCounter] = useState(0); // Licznik dla końcówki klucza

  // User management
  const [users, setUsers] = useState<Array<{ email: string; plan: PlanType; activatedAt: string }>>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<PlanType>('monthly');

  useEffect(() => {
    if (isOpen) {
      const auth = sessionStorage.getItem('admin-auth');
      if (auth === 'true') {
        setIsAuthenticated(true);
        loadSettings();
      }
    }
  }, [isOpen]);

  const loadSettings = () => {
    // Load current plan from localStorage
    const savedPlan = localStorage.getItem('zeno-user-plan') as PlanType || 'lifetime';
    setCurrentPlan(savedPlan);

    // Load API keys
    const savedKeys = localStorage.getItem('zeno-admin-api-keys');
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys));
    }

    // Load key counter
    const savedCounter = localStorage.getItem('zeno-api-key-counter');
    if (savedCounter) {
      setKeyCounter(parseInt(savedCounter, 10));
    }

    // Load users (demo data)
    const savedUsers = localStorage.getItem('zeno-admin-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      setError('');
      loadSettings();
    } else {
      setError('Nieprawidłowe hasło');
      setPassword('');
    }
  };

  const handleChangePlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    localStorage.setItem('zeno-user-plan', plan);
    if (onPlanChange) {
      onPlanChange(plan);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddUser = () => {
    if (!newUserEmail) return;

    const newUser = {
      email: newUserEmail,
      plan: newUserPlan,
      activatedAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('zeno-admin-users', JSON.stringify(updatedUsers));

    setNewUserEmail('');
    setNewUserPlan('monthly');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRemoveUser = (email: string) => {
    const updatedUsers = users.filter(u => u.email !== email);
    setUsers(updatedUsers);
    localStorage.setItem('zeno-admin-users', JSON.stringify(updatedUsers));
  };

  // Generator API Key: ZENO-000-X gdzie X = 2/4/6 rosnąco
  const generateApiKey = () => {
    if (!newClientEmail) return;

    // Oblicz następną końcówkę (2, 4, 6, 8, 10, 12...)
    const nextSuffix = (keyCounter * 2) + 2;

    // Format: ZENO-000-2, ZENO-001-4, ZENO-002-6, etc.
    const paddedCounter = keyCounter.toString().padStart(3, '0');
    const apiKey = `ZENO-${paddedCounter}-${nextSuffix}`;

    const newKey = {
      id: Date.now().toString(),
      key: apiKey,
      clientEmail: newClientEmail,
      createdAt: new Date().toISOString()
    };

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    localStorage.setItem('zeno-admin-api-keys', JSON.stringify(updatedKeys));

    // Inkrementuj licznik
    const newCounter = keyCounter + 1;
    setKeyCounter(newCounter);
    localStorage.setItem('zeno-api-key-counter', newCounter.toString());

    setNewClientEmail('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRemoveApiKey = (id: string) => {
    const updatedKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(updatedKeys);
    localStorage.setItem('zeno-admin-api-keys', JSON.stringify(updatedKeys));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isOpen) return null;

  const colors = {
    bg: '#0f172a',
    primary: '#1e293b',
    border: '#334155',
    text: '#f8fafc',
    muted: '#94a3b8',
    accent: '#3b82f6',
    success: '#22c55e',
    danger: '#ef4444'
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          maxWidth: '450px',
          width: '100%',
          padding: '40px',
          backgroundColor: colors.bg,
          border: `2px solid ${colors.accent}`,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: colors.text,
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            🔐 Admin Panel - ZENO
          </h1>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wprowadź hasło: HAOS&&###"
              style={{
                width: '100%',
                padding: '14px 16px',
                marginBottom: '16px',
                backgroundColor: colors.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'monospace'
              }}
              autoFocus
            />

            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${colors.danger}`,
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '13px',
                textAlign: 'center'
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: colors.accent,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                marginBottom: '16px'
              }}
            >
              🔓 Zaloguj się
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.muted,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Anuluj
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000,
      overflowY: 'auto',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px',
        backgroundColor: colors.bg,
        border: `2px solid ${colors.accent}`,
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: colors.text
          }}>
            ⚙️ Admin Panel - ZENO Browser
          </h1>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${colors.danger}`,
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🚪 Wyloguj
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                backgroundColor: colors.primary,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.muted,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              ✕ Zamknij
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div style={{
            padding: '14px',
            marginBottom: '24px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: `1px solid ${colors.success}`,
            borderRadius: '8px',
            color: '#86efac',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ✓ Zmiany zapisane pomyślnie!
          </div>
        )}

        {/* Global Plan Settings */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: colors.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '16px'
          }}>
            🎯 Globalny Plan Dostępu
          </h2>
          <p style={{
            fontSize: '13px',
            color: colors.muted,
            marginBottom: '20px'
          }}>
            Ustaw poziom dostępu dla wszystkich funkcji. Na razie wszystko ustawione jako <strong>dostępne bez ograniczeń (lifetime)</strong>.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {(['free', 'monthly', 'yearly', 'lifetime'] as PlanType[]).map(plan => (
              <button
                key={plan}
                onClick={() => handleChangePlan(plan)}
                style={{
                  padding: '16px',
                  backgroundColor: currentPlan === plan ? colors.accent : colors.bg,
                  border: `2px solid ${currentPlan === plan ? colors.accent : colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s'
                }}
              >
                {plan === 'free' && '🆓 FREE'}
                {plan === 'monthly' && '📅 MONTHLY'}
                {plan === 'yearly' && '📆 YEARLY'}
                {plan === 'lifetime' && '♾️ LIFETIME'}
              </button>
            ))}
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: `1px solid rgba(59, 130, 246, 0.3)`,
            borderRadius: '8px',
            fontSize: '12px',
            color: colors.muted,
            lineHeight: '1.6'
          }}>
            <strong>Aktualny plan:</strong> <span style={{ color: colors.accent, fontWeight: 'bold' }}>{currentPlan.toUpperCase()}</span><br />
            • FREE: 5 zakładek, podstawowe funkcje<br />
            • MONTHLY: 30 zakładek, AI assistant, video players<br />
            • YEARLY: 100 zakładek, music player (Webamp), zaawansowane MCP<br />
            • LIFETIME: ∞ zakładek, wszystkie funkcje bez ograniczeń
          </div>
        </div>

        {/* API Key Generator */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: colors.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '8px'
          }}>
            🔑 Generator API Keys
          </h2>
          <div style={{ color: colors.muted, fontSize: '12px', marginBottom: '16px' }}>
            Format: ZENO-XXX-Y (XXX = licznik 000+, Y = parzyste 2/4/6/8...)
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              placeholder="Email klienta"
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px'
              }}
            />
            <button
              onClick={generateApiKey}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔐 Generuj Klucz
            </button>
          </div>

          {apiKeys.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {apiKeys.map((apiKey) => (
                <div
                  key={apiKey.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: '#3b82f6',
                      fontWeight: '700',
                      marginBottom: '4px',
                      fontFamily: 'monospace',
                      fontSize: '16px'
                    }}>
                      {apiKey.key}
                    </div>
                    <div style={{ color: colors.muted, fontSize: '12px' }}>
                      Email: <strong>{apiKey.clientEmail}</strong> | Utworzono: {new Date(apiKey.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveApiKey(apiKey.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${colors.danger}`,
                      borderRadius: '6px',
                      color: colors.danger,
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Usuń
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: colors.muted,
              backgroundColor: colors.bg,
              borderRadius: '8px',
              border: `1px dashed ${colors.border}`
            }}>
              Brak wygenerowanych kluczy API
            </div>
          )}
        </div>

        {/* User Management */}
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: colors.primary,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: colors.text,
            marginBottom: '16px'
          }}>
            👥 Zarządzanie Użytkownikami
          </h2>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="Email użytkownika"
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px'
              }}
            />
            <select
              value={newUserPlan}
              onChange={(e) => setNewUserPlan(e.target.value as PlanType)}
              style={{
                padding: '12px 16px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="lifetime">Lifetime</option>
            </select>
            <button
              onClick={handleAddUser}
              style={{
                padding: '12px 24px',
                backgroundColor: colors.success,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ➕ Dodaj
            </button>
          </div>

          {users.length > 0 ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {users.map((user, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{ color: colors.text, fontWeight: '600', marginBottom: '4px' }}>
                      {user.email}
                    </div>
                    <div style={{ color: colors.muted, fontSize: '12px' }}>
                      Plan: <strong>{user.plan}</strong> | Aktywowano: {new Date(user.activatedAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveUser(user.email)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${colors.danger}`,
                      borderRadius: '6px',
                      color: '#fca5a5',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Usuń
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: colors.muted,
              fontSize: '14px'
            }}>
              Brak dodanych użytkowników. Dodaj pierwszego powyżej.
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          padding: '24px',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          border: `1px solid rgba(139, 92, 246, 0.3)`,
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#c4b5fd',
            marginBottom: '16px'
          }}>
            📊 Statystyki Systemu
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            fontSize: '13px',
            color: colors.muted
          }}>
            <div>
              <strong>Zarejestrowani użytkownicy:</strong> {users.length}
            </div>
            <div>
              <strong>Aktywny plan globalny:</strong> {currentPlan.toUpperCase()}
            </div>
            <div>
              <strong>Dostępne features:</strong> Wszystkie (∞)
            </div>
            <div>
              <strong>Status systemu:</strong> <span style={{ color: colors.success }}>✓ Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
