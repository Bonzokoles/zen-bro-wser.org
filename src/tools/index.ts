export { TerminalPanel } from './terminal-panel';
export { WebTunnelMonitor } from './web-tunnel-monitor';
export { AiSandbox } from './ai-sandbox';

import { TerminalPanelMeta } from './terminal-panel';
import { WebTunnelMonitorMeta } from './web-tunnel-monitor';
import { AiSandboxMeta } from './ai-sandbox';
import type { SandboxToolMeta } from './_template';

export type { SandboxToolProps, SandboxToolMeta } from './_template';

export const TOOL_REGISTRY: SandboxToolMeta[] = [
  TerminalPanelMeta,
  WebTunnelMonitorMeta,
  AiSandboxMeta,
];
