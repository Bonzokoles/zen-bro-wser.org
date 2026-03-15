// ZENO Extension Popup
document.addEventListener('DOMContentLoaded', async () => {
  const settings = await chrome.storage.local.get(['zenoApiUrl']);
  if (settings.zenoApiUrl) {
    document.getElementById('apiUrl').value = settings.zenoApiUrl;
  }
  checkConnection();
});

async function checkConnection() {
  const statusEl = document.getElementById('status');
  try {
    const settings = await chrome.storage.local.get(['zenoApiUrl']);
    const url = settings.zenoApiUrl || 'http://localhost:4378';
    const resp = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2000) });
    if (resp.ok) {
      statusEl.textContent = '● Connected to ZENO';
      statusEl.className = 'status';
    } else {
      statusEl.textContent = '● ZENO not responding';
      statusEl.className = 'status offline';
    }
  } catch {
    statusEl.textContent = '● ZENO offline (start localhost:4378)';
    statusEl.className = 'status offline';
  }
}

async function summarizePage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'SUMMARIZE_PAGE' });
  window.close();
}

async function analyzeSelected() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection()?.toString() || '',
  }).then((results) => {
    const text = results[0]?.result;
    if (text) chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_SELECTION', text });
  });
  window.close();
}

function openZeno() {
  chrome.tabs.create({ url: 'http://localhost:4378' });
  window.close();
}

async function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  await chrome.storage.local.set({ zenoApiUrl: apiUrl || 'http://localhost:4378' });
  checkConnection();
}
