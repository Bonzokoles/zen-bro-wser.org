// ZENO Browser Extension - Content Script
// Injects AI capabilities into web pages

(function () {
  'use strict';

  let zenoOverlay = null;

  function createOverlay() {
    if (zenoOverlay) return;
    zenoOverlay = document.createElement('div');
    zenoOverlay.id = 'zeno-overlay';
    zenoOverlay.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 999999;
      background: rgba(15, 23, 42, 0.95); color: white; border-radius: 12px;
      padding: 16px; min-width: 300px; max-width: 500px; font-family: system-ui;
      border: 1px solid rgba(99, 102, 241, 0.5); backdrop-filter: blur(12px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(zenoOverlay);
  }

  function showAnalysis(text) {
    createOverlay();
    zenoOverlay.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <span style="font-weight:bold;color:#818cf8">⚡ ZENO AI Analysis</span>
        <button onclick="this.closest('#zeno-overlay').remove()" style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px">×</button>
      </div>
      <div style="font-size:14px;color:#e2e8f0;line-height:1.5">${text}</div>
    `;
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'ANALYZE_SELECTION') {
      chrome.runtime.sendMessage({
        type: 'MCP_CALL', tool: 'analyze_text', args: { text: message.text }
      }, (result) => showAnalysis(result?.text || 'Analysis complete'));
    }
    if (message.type === 'SUMMARIZE_PAGE') {
      chrome.runtime.sendMessage({
        type: 'MCP_CALL', tool: 'page_summarizer', args: { url: window.location.href }
      }, (result) => showAnalysis(result?.text || 'Page summarized'));
    }
  });

  // Text selection context
  document.addEventListener('mouseup', () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 10) {
      const existingBtn = document.getElementById('zeno-quick-btn');
      if (existingBtn) existingBtn.remove();
      const btn = document.createElement('button');
      btn.id = 'zeno-quick-btn';
      btn.textContent = '⚡ ZENO';
      btn.style.cssText = `
        position: fixed; z-index: 999998; background: #4f46e5; color: white;
        border: none; border-radius: 6px; padding: 4px 10px; font-size: 12px;
        cursor: pointer; font-family: system-ui;
      `;
      const range = window.getSelection().getRangeAt(0).getBoundingClientRect();
      btn.style.top = `${range.top + window.scrollY - 30}px`;
      btn.style.left = `${range.left + window.scrollX}px`;
      btn.onclick = () => {
        chrome.runtime.sendMessage({ type: 'MCP_CALL', tool: 'analyze_text', args: { text: selection } },
          (result) => { showAnalysis(result?.text || selection); btn.remove(); }
        );
      };
      document.body.appendChild(btn);
      setTimeout(() => btn.remove(), 3000);
    }
  });
})();
