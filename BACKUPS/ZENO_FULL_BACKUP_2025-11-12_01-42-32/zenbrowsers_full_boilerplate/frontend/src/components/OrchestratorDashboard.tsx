import React, { useEffect, useState } from 'react';
export const OrchestratorDashboard = () => {
  const [processed, setProcessed] = useState([]);
  const fetchData = async () => {
    const res = await fetch('/api/orchestrator/processed');
    if(res.ok) { setProcessed(await res.json()); }
  };
  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 10000); return () => clearInterval(interval); }, []);
  return (
    <div>
      <h2>Orchestrator Dashboard</h2>
      <ul>
        {processed.map(p => (
          <li key={p.id}>{p.id}: {p.category} - <a href={p.url}>{p.url}</a></li>
        ))}
      </ul>
    </div>
  );
};
