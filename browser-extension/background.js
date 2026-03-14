// ZENO Browser Extension - Background Service Worker
// Handles MCP communication and AI model integration

chrome.runtime.onInstalled.addListener(() => {
  console.log('ZENO Extension installed');
  chrome.contextMenus.create({
    id: 'zeno-ai-analyze',
    title: 'Analyze with ZENO AI',
    contexts: ['selection', 'page'],
  });
  chrome.contextMenus.create({
    id: 'zeno-summarize',
    title: 'Summarize page with ZENO',
    contexts: ['page'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  if (info.menuItemId === 'zeno-ai-analyze') {
    chrome.tabs.sendMessage(tab.id, { type: 'ANALYZE_SELECTION', text: info.selectionText });
  } else if (info.menuItemId === 'zeno-summarize') {
    chrome.tabs.sendMessage(tab.id, { type: 'SUMMARIZE_PAGE' });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MCP_CALL') {
    handleMCPCall(message.tool, message.args).then(sendResponse);
    return true;
  }
});

async function handleMCPCall(tool, args) {
  try {
    const settings = await chrome.storage.local.get(['zenoApiUrl', 'zenoApiKey']);
    const url = settings.zenoApiUrl || 'http://localhost:4378/api/mcp';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': settings.zenoApiKey || '' },
      body: JSON.stringify({ tool, args }),
    });
    return await response.json();
  } catch (error) {
    return { error: error.message };
  }
}
