import React, { useState, useEffect, useCallback } from 'react';
import { pluginIPCBridge } from '../services/plugin-ipc-bridge';
import type { PluginMeta, UpdateAvailable } from '../services/plugin-ipc-bridge';

interface PluginSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const PluginSettings: React.FC<PluginSettingsProps> = ({ isOpen, onClose }) => {
  const [plugins, setPlugins] = useState<PluginMeta[]>([]);
  const [updates, setUpdates] = useState<Map<string, UpdateAvailable>>(new Map());
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setPlugins(pluginIPCBridge.getInstalledPlugins());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refresh();
  }, [isOpen, refresh]);

  const setBusy = (id: string, busy: boolean) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      busy ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleToggle = async (plugin: PluginMeta) => {
    setBusy(plugin.id, true);
    setError(null);
    try {
      if (plugin.enabled) {
        await pluginIPCBridge.disablePlugin(plugin.id);
      } else {
        await pluginIPCBridge.enablePlugin(plugin.id);
      }
      refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(plugin.id, false);
    }
  };

  const handleUninstall = async (plugin: PluginMeta) => {
    if (
      !window.confirm(
        `Uninstall "${plugin.name}"? This will remove all plugin data.`
      )
    ) {
      return;
    }
    setBusy(plugin.id, true);
    setError(null);
    try {
      await pluginIPCBridge.uninstallPlugin(plugin.id);
      refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(plugin.id, false);
    }
  };

  const handleUpdate = async (plugin: PluginMeta) => {
    setBusy(plugin.id, true);
    setError(null);
    try {
      await pluginIPCBridge.updatePlugin(plugin.id);
      setUpdates((prev) => {
        const next = new Map(prev);
        next.delete(plugin.id);
        return next;
      });
      refresh();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(plugin.id, false);
    }
  };

  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    setError(null);
    try {
      const available = await pluginIPCBridge.checkForUpdates();
      const map = new Map<string, UpdateAvailable>();
      available.forEach((u) => map.set(u.installedMeta.id, u));
      setUpdates(map);
    } catch (err) {
      setError(String(err));
    } finally {
      setCheckingUpdates(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">⚙️ Plugin Settings</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => void handleCheckUpdates()}
              disabled={checkingUpdates}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {checkingUpdates ? 'Checking…' : 'Check Updates'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-600 rounded-lg px-4 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Update banner */}
        {updates.size > 0 && (
          <div className="mx-6 mt-4 bg-blue-900/40 border border-blue-600 rounded-lg px-4 py-2 text-sm text-blue-200 flex items-center justify-between gap-3">
            <span>
              🔔 {updates.size} update{updates.size > 1 ? 's' : ''} available
            </span>
            <button
              onClick={() => void pluginIPCBridge.updateAll().then(refresh)}
              className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg font-medium"
            >
              Update All
            </button>
          </div>
        )}

        {/* Plugin List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {plugins.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-gray-400">
              <span className="text-4xl">🧩</span>
              <p className="text-sm">No plugins installed yet.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {plugins.map((plugin) => {
                const isBusy = busyIds.has(plugin.id);
                const update = updates.get(plugin.id);

                return (
                  <li
                    key={plugin.id}
                    className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {plugin.icon ? (
                          <img
                            src={plugin.icon}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-lg flex-shrink-0">
                            🧩
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{plugin.name}</p>
                          <p className="text-xs text-gray-400">
                            v{plugin.version} · by {plugin.author}
                          </p>
                        </div>
                      </div>

                      {/* Enable/Disable toggle */}
                      <button
                        onClick={() => void handleToggle(plugin)}
                        disabled={isBusy}
                        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                          plugin.enabled ? 'bg-blue-600' : 'bg-gray-600'
                        } disabled:opacity-50`}
                        aria-label={plugin.enabled ? 'Disable plugin' : 'Enable plugin'}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                            plugin.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2">
                      {plugin.description}
                    </p>

                    {/* Permissions */}
                    {plugin.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {plugin.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Status badge + actions */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          plugin.status === 'enabled'
                            ? 'bg-green-900/50 text-green-300'
                            : plugin.status === 'error'
                              ? 'bg-red-900/50 text-red-300'
                              : plugin.status === 'updating'
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {plugin.status}
                      </span>

                      <div className="flex items-center gap-2">
                        {update && (
                          <button
                            onClick={() => void handleUpdate(plugin)}
                            disabled={isBusy}
                            className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg font-medium disabled:opacity-50 transition-colors"
                          >
                            {isBusy ? '…' : `Update → v${update.toVersion}`}
                          </button>
                        )}
                        <button
                          onClick={() => void handleUninstall(plugin)}
                          disabled={isBusy}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                        >
                          Uninstall
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PluginSettings;
