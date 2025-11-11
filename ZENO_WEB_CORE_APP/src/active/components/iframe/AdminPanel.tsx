/*
 * AdminPanel Component
 * Full admin interface for managing sites and users
 * Created: 2025-11-04
 * 
 * Features:
 * - CRUD operations for sites (Create, Read, Update, Delete)
 * - User management (list with roles)
 * - Form validation
 * - Loading states
 * - Confirmation dialogs
 * - Integration with /api/admin/* endpoints
 */

import React, { useState, useEffect } from 'react';

interface Site {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  iframeAllowed?: boolean;
  addedAt?: string;
  testCount?: number;
  tags?: string[];
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'tester' | 'viewer';
}

export const AdminPanel = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Form states
  const [formSite, setFormSite] = useState<Partial<Site>>({});
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    fetchSites();
    fetchUsers();
  }, []);

  const fetchSites = async () => {
    setLoadingSites(true);
    try {
      const res = await fetch('/api/admin/sites');
      const data = await res.json();
      setSites(data.success ? data.data : []);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
    setLoadingSites(false);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.success ? data.data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoadingUsers(false);
  };

  // Create or update site
  const saveSite = async () => {
    const method = editingSiteId ? 'PUT' : 'POST';
    const url = editingSiteId ? `/api/admin/sites/${editingSiteId}` : '/api/admin/sites';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSite),
      });
      if (res.ok) {
        setFormSite({});
        setEditingSiteId(null);
        fetchSites();
      }
    } catch (error) {
      console.error('Error saving site:', error);
    }
  };

  // Edit site
  const editSite = (site: Site) => {
    setFormSite(site);
    setEditingSiteId(site.id);
  };

  // Delete site
  const deleteSite = async (siteId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę stronę?')) return;
    try {
      await fetch(`/api/admin/sites/${siteId}`, { method: 'DELETE' });
      fetchSites();
    } catch (error) {
      console.error('Error deleting site:', error);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: '20px' }}>
      <h2>Panel administratora</h2>

      <section style={{ marginBottom: '40px' }}>
        <h3>Strony</h3>
        {loadingSites ? (
          <p>Ładowanie stron...</p>
        ) : (
          <>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sites.map((site) => (
                <li key={site.id} style={{ 
                  marginBottom: '10px', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px' 
                }}>
                  <strong>{site.name}</strong> ({site.category}) - {site.url}{' '}
                  {site.iframeAllowed && <span style={{ color: 'green' }}>✓ iframe</span>}
                  <div style={{ marginTop: '5px' }}>
                    <button onClick={() => editSite(site)}>Edytuj</button>{' '}
                    <button onClick={() => deleteSite(site.id)} style={{ color: 'red' }}>Usuń</button>
                  </div>
                </li>
              ))}
            </ul>

            <h4>{editingSiteId ? 'Edytuj stronę' : 'Dodaj nową stronę'}</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveSite();
              }}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px', 
                maxWidth: '500px' 
              }}
            >
              <input
                type="text"
                placeholder="Nazwa"
                value={formSite.name || ''}
                onChange={(e) => setFormSite({ ...formSite, name: e.target.value })}
                required
                style={{ padding: '8px', fontSize: '14px' }}
              />
              <input
                type="url"
                placeholder="URL"
                value={formSite.url || ''}
                onChange={(e) => setFormSite({ ...formSite, url: e.target.value })}
                required
                style={{ padding: '8px', fontSize: '14px' }}
              />
              <input
                type="text"
                placeholder="Kategoria"
                value={formSite.category || ''}
                onChange={(e) => setFormSite({ ...formSite, category: e.target.value })}
                style={{ padding: '8px', fontSize: '14px' }}
              />
              <textarea
                placeholder="Opis"
                value={formSite.description || ''}
                onChange={(e) => setFormSite({ ...formSite, description: e.target.value })}
                rows={3}
                style={{ padding: '8px', fontSize: '14px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formSite.iframeAllowed || false}
                  onChange={(e) => setFormSite({ ...formSite, iframeAllowed: e.target.checked })}
                />
                Pozwala na iframe
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '8px 16px' }}>
                  {editingSiteId ? 'Zapisz' : 'Dodaj'}
                </button>
                {editingSiteId && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormSite({});
                      setEditingSiteId(null);
                    }}
                    style={{ padding: '8px 16px' }}
                  >
                    Anuluj
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      <section>
        <h3>Użytkownicy</h3>
        {loadingUsers ? (
          <p>Ładowanie użytkowników...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map((user) => (
              <li key={user.id} style={{ 
                marginBottom: '10px', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}>
                {user.username} ({user.email}) — <strong>{user.role}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
