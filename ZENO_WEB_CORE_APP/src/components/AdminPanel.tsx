import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = '#HAOS1977#';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Settings
  const [cloudflareAccountId, setCloudflareAccountId] = useState('');
  const [cloudflareApiToken, setCloudflareApiToken] = useState('');
  const [defaultModel, setDefaultModel] = useState('llama-3.2-3b');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadSettings();
    }
  }, []);

  const loadSettings = () => {
    setCloudflareAccountId(localStorage.getItem('cf-account-id') || '');
    setCloudflareApiToken(localStorage.getItem('cf-api-token') || '');
    setDefaultModel(localStorage.getItem('default-ai-model') || 'llama-3.2-3b');
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

  const handleSaveSettings = () => {
    localStorage.setItem('cf-account-id', cloudflareAccountId);
    localStorage.setItem('cf-api-token', cloudflareApiToken);
    localStorage.setItem('default-ai-model', defaultModel);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '40px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #3b82f6',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#f8fafc',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          🔒 Admin Panel
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wprowadź hasło admina"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none'
            }}
            autoFocus
          />

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#fca5a5',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Zaloguj się
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <strong>Wskazówka:</strong> Skontaktuj się z administratorem systemu aby uzyskać hasło dostępu.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '40px',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '2px solid #3b82f6',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#f8fafc'
        }}>
          ⚙️ Ustawienia AI Assistant
        </h1>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#fca5a5',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Wyloguj
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          padding: '12px',
          marginBottom: '24px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: '4px',
          color: '#86efac',
          fontSize: '13px'
        }}>
          ✓ Ustawienia zapisane pomyślnie!
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '16px'
        }}>
          Cloudflare Workers AI
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            Account ID
          </label>
          <input
            type="text"
            value={cloudflareAccountId}
            onChange={(e) => setCloudflareAccountId(e.target.value)}
            placeholder="7f490d58a478c6baccb0ae01ea1d87c3"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            API Token
          </label>
          <input
            type="password"
            value={cloudflareApiToken}
            onChange={(e) => setCloudflareApiToken(e.target.value)}
            placeholder="••••••••••••••••••••••••"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            Get token: <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" style={{ color: '#60a5fa' }}>Cloudflare Dashboard</a>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '16px'
        }}>
          Domyślny Model AI
        </h2>

        <select
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: '4px',
            color: '#f8fafc',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="llama-3.2-1b">Llama 3.2 1B (najszybszy)</option>
          <option value="llama-3.2-3b">Llama 3.2 3B (zbalansowany)</option>
          <option value="gemma-7b">Gemma 7B (dobry)</option>
          <option value="gemma-12b">Gemma 12B (najlepszy)</option>
          <option value="qwen-7b">Qwen 7B (alternatywny)</option>
        </select>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: '1.6'
        }}>
          <strong>Informacje o modelach:</strong><br/>
          • Llama 3.2 1B/3B - Wielojęzyczne, szybkie<br/>
          • Gemma 12B - 140+ języków, najbardziej precyzyjny<br/>
          • Gemma 7B - Dobra jakość, średnia szybkość<br/>
          • Qwen 7B - Alternatywa dla Gemma<br/>
          <br/>
          Wszystkie modele są <strong>DARMOWE</strong> w ramach Cloudflare Workers AI
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        💾 Zapisz ustawienia
      </button>

      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '4px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#c4b5fd',
          marginBottom: '12px'
        }}>
          📊 Statystyki
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div>
            <strong>Knowledge Base:</strong> 5 dokumentów
          </div>
          <div>
            <strong>Dostępne modele:</strong> 5
          </div>
          <div>
            <strong>Pricing:</strong> $0.011/1000 neurons
          </div>
          <div>
            <strong>Status:</strong> <span style={{ color: '#22c55e' }}>✓ Aktywny</span>
          </div>
        </div>
      </div>
    </div>
  );
}
