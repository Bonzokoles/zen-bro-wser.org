import React, { useEffect, useState } from 'react';
export const SiteSearch = () => {
  const [sites, setSites] = useState([]);
  useEffect(() => {
    async function fetchSites() {
      const res = await fetch('/api/sites');
      if(res.ok) { setSites(await res.json()); }
    }
    fetchSites();
  }, []);
  return (
    <div>
      <h2>Site Search</h2>
      <ul>
        {sites.map(site => (
          <li key={site.id}>{site.url}</li>
        ))}
      </ul>
    </div>
  );
};
