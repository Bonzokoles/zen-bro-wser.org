import React, { useState } from 'react';
import { pluginIPCBridge } from '../services/plugin-ipc-bridge';
import type { PluginMeta } from '../services/plugin-ipc-bridge';

interface PluginInstallerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstalled?: (meta: PluginMeta) => void;
}

type Step = 'url' | 'confirm' | 'installing' | 'done' | 'error';

const PluginInstaller: React.FC<PluginInstallerProps> = ({
  isOpen,
  onClose,
  onInstalled,
}) => {
  const [step, setStep] = useState<Step>('url');
  const [moduleUrl, setModuleUrl] = useState('');
  const [installedMeta, setInstalledMeta] = useState<PluginMeta | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const reset = () => {
    setStep('url');
    setModuleUrl('');
    setInstalledMeta(null);
    setErrorMsg('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    if (!moduleUrl.trim()) return;
    setStep('confirm');
  };

  const handleInstall = async () => {
    setStep('installing');
    try {
      const meta = await pluginIPCBridge.installPlugin(moduleUrl.trim());
      setInstalledMeta(meta);
      setStep('done');
      onInstalled?.(meta);
    } catch (err) {
      setErrorMsg(String(err));
      setStep('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">📦 Install Plugin</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 min-h-[180px] flex flex-col gap-4">
          {/* Step: Enter URL */}
          {step === 'url' && (
            <>
              <p className="text-gray-300 text-sm">
                Enter the URL of the plugin module to install. The module must
                export a valid <code className="text-blue-400">manifest</code>{' '}
                and a default factory function.
              </p>
              <input
                type="url"
                placeholder="https://example.com/my-plugin/index.js"
                value={moduleUrl}
                onChange={(e) => setModuleUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full"
                autoFocus
              />
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              <p className="text-gray-300 text-sm">
                You are about to install a plugin from:
              </p>
              <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm font-mono break-all text-blue-300">
                {moduleUrl}
              </div>
              <div className="bg-yellow-900/40 border border-yellow-600 rounded-lg px-4 py-3 text-sm text-yellow-200">
                ⚠️ Only install plugins from sources you trust. Plugins can
                access browser tabs, storage, and network depending on their
                declared permissions.
              </div>
            </>
          )}

          {/* Step: Installing */}
          {step === 'installing' && (
            <div className="flex flex-col items-center justify-center gap-3 py-6">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
              <p className="text-gray-300 text-sm">Installing plugin…</p>
            </div>
          )}

          {/* Step: Done */}
          {step === 'done' && installedMeta && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="text-4xl">✅</div>
              <p className="text-lg font-semibold">{installedMeta.name}</p>
              <p className="text-gray-400 text-sm">v{installedMeta.version}</p>
              <p className="text-gray-300 text-sm">
                Plugin installed successfully. You can enable it from Plugin Settings.
              </p>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <span className="text-2xl">❌</span>
                <p className="font-medium">Installation failed</p>
              </div>
              <div className="bg-gray-800 rounded-lg px-4 py-3 text-sm text-red-300 font-mono break-all">
                {errorMsg}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700">
          {step === 'url' && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={!moduleUrl.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors disabled:opacity-40"
              >
                Next →
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('url')}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => void handleInstall()}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-sm font-medium transition-colors"
              >
                Install
              </button>
            </>
          )}

          {(step === 'done' || step === 'error') && (
            <>
              {step === 'error' && (
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PluginInstaller;
