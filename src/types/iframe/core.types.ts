/**
 * Core TypeScript types for iframe testing system
 * Fundament pod 10 zaawansowanych funkcji
 */

// ============================================
// PODSTAWOWE TYPY
// ============================================

export interface IframeSite {
  id: string;
  name: string;
  url: string;
  category: IframeSiteCategory;
  sandbox: string;
  allow?: string;
  height?: string;
  custom?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
}

export type IframeSiteCategory =
  | 'Playgrounds'
  | 'APIs'
  | 'Education'
  | 'Media'
  | 'Maps'
  | 'Interactive'
  | 'Test'
  | 'Custom';

// ============================================
// TESTY I WYNIKI
// ============================================

export interface IframeTestResult {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  success: boolean;
  loadTime: number;
  timestamp: number;
  httpStatus?: number;
  errorMessage?: string;
  errorType?: IframeErrorType;
  networkMetrics?: NetworkMetrics;
  jsErrors?: JSError[];
}

export type IframeErrorType =
  | 'TIMEOUT'
  | 'CORS'
  | 'X_FRAME_OPTIONS'
  | 'NETWORK_ERROR'
  | 'JS_ERROR'
  | 'LOAD_ERROR'
  | 'UNKNOWN';

export interface NetworkMetrics {
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  requestTime: number;
  responseTime: number;
  totalTime: number;
}

export interface JSError {
  message: string;
  source: string;
  lineno: number;
  colno: number;
  timestamp: number;
}

// ============================================
// TEXT SELECTION & EXPORT
// ============================================

export interface TextSelection {
  id: string;
  text: string;
  sourceUrl: string;
  sourceName: string;
  timestamp: number;
  metadata: SelectionMetadata;
  notes?: string;
  tags?: string[];
  userId?: string;
}

export interface SelectionMetadata {
  characters: number;
  words: number;
  lines: number;
  language?: string;
  selectedRange?: DOMRange;
}

export interface DOMRange {
  startContainer: string;
  startOffset: number;
  endContainer: string;
  endOffset: number;
}

export type ExportFormat = 'md' | 'txt' | 'json' | 'html' | 'pdf' | 'docx';

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  includeMetadata: boolean;
  includeTimestamp: boolean;
  customTemplate?: string;
}

// ============================================
// POSTMESSAGE API
// ============================================

export type PostMessageType =
  | 'IFRAME_READY'
  | 'IFRAME_ERROR'
  | 'TEXT_SELECTED'
  | 'REQUEST_DATA'
  | 'RESPONSE_DATA'
  | 'NAVIGATION'
  | 'PERFORMANCE_DATA'
  | 'JS_ERROR_REPORT';

export interface PostMessageData<T = any> {
  type: PostMessageType;
  payload: T;
  timestamp: number;
  source: 'host' | 'iframe';
  requestId?: string;
}

export interface IframeReadyPayload {
  url: string;
  title: string;
  loadTime: number;
}

export interface TextSelectedPayload {
  text: string;
  range: DOMRange;
  metadata: SelectionMetadata;
}

export interface PerformanceDataPayload {
  metrics: NetworkMetrics;
  resources: ResourceTiming[];
}

export interface ResourceTiming {
  name: string;
  type: string;
  duration: number;
  size: number;
}

// ============================================
// SESJE I HISTORIA
// ============================================

export interface IframeSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
  sites: IframeSite[];
  results: IframeTestResult[];
  selections: TextSelection[];
  settings: SessionSettings;
}

export interface SessionSettings {
  autoRotateInterval: number;
  autoSaveEnabled: boolean;
  defaultSandbox: string;
  defaultAllow: string;
  theme: 'light' | 'dark';
}

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

export interface DashboardMetrics {
  totalTests: number;
  successRate: number;
  avgLoadTime: number;
  errorBreakdown: Record<IframeErrorType, number>;
  categoryBreakdown: Record<IframeSiteCategory, number>;
  testsOverTime: TimeSeriesData[];
  topSlowestSites: SitePerformance[];
  topFailingSites: SitePerformance[];
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
}

export interface SitePerformance {
  siteId: string;
  siteName: string;
  avgLoadTime: number;
  failureRate: number;
  testCount: number;
}

// ============================================
// AUTORYZACJA I AUDIT
// ============================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  settings: UserSettings;
}

export type UserRole = 'admin' | 'tester' | 'viewer';

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  defaultExportFormat: ExportFormat;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'TEST_RUN'
  | 'SESSION_START'
  | 'SESSION_END';

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// CONFIGURATION
// ============================================

export interface IframeTestConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  captureNetworkMetrics: boolean;
  captureJSErrors: boolean;
  validateContent: boolean;
  whitelistedDomains: string[];
  blacklistedDomains: string[];
}

export interface AutoRotateConfig {
  enabled: boolean;
  interval: number;
  randomize: boolean;
  skipFailedSites: boolean;
}
