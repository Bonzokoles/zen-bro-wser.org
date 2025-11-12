# Anomaly Detection - Wykrywanie Anomalii

## Koncepcja

System wykrywający nietypowe wzorce, podejrzane zachowania i anomalie w danych, ruchu sieciowym, treściach i zachowaniu użytkownika.

## Typy Anomalii

1. **Point Anomalies** - Pojedyncze nietypowe wartości
2. **Contextual Anomalies** - Normalne wartości w niewłaściwym kontekście
3. **Collective Anomalies** - Grupy obserwacji tworzące anomalię

## Architektura

```
src/services/anomaly/
├── detector.ts                 # Główny detektor
├── models/
│   ├── statistical.ts          # Modele statystyczne
│   ├── ml-based.ts             # Machine learning
│   ├── rule-based.ts           # Reguły biznesowe
│   └── hybrid.ts               # Podejście hybrydowe
├── analyzers/
│   ├── content-analyzer.ts     # Analiza treści
│   ├── behavior-analyzer.ts    # Analiza zachowania
│   ├── network-analyzer.ts     # Analiza ruchu
│   └── timeline-analyzer.ts    # Analiza czasowa
├── alerts/
│   ├── alert-manager.ts        # Zarządzanie alertami
│   ├── notification.ts         # Powiadomienia
│   └── report-generator.ts     # Generowanie raportów
└── learning/
    └── adaptive-learning.ts    # Uczenie adaptacyjne
```

## Core Types

```typescript
// src/services/anomaly/types.ts

interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: Date;
  description: string;
  data: any;
  context: AnomalyContext;
  actions: SuggestedAction[];
}

type AnomalyType =
  | 'content_manipulation'
  | 'suspicious_behavior'
  | 'data_breach'
  | 'pattern_break'
  | 'unusual_traffic'
  | 'permission_escalation'
  | 'resource_abuse'
  | 'timing_attack'
  | 'injection_attempt'
  | 'unauthorized_access';

interface AnomalyContext {
  source: string;
  affectedEntities: string[];
  relatedEvents: Event[];
  timeline: TimelineEvent[];
}

interface SuggestedAction {
  type: 'block' | 'alert' | 'investigate' | 'log' | 'ignore';
  description: string;
  automated: boolean;
  urgency: 'immediate' | 'soon' | 'eventual';
}

interface AnomalyReport {
  period: { start: Date; end: Date };
  anomalies: Anomaly[];
  patterns: DetectedPattern[];
  summary: {
    total: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    falsePositives: number;
  };
}
```

## Anomaly Detector

```typescript
// src/services/anomaly/detector.ts

class AnomalyDetector {
  private models: AnomalyModel[] = [];
  private baseline: Baseline;
  private alertManager: AlertManager;
  private learningEnabled = true;

  constructor() {
    this.initializeModels();
    this.baseline = new Baseline();
    this.alertManager = new AlertManager();
  }

  private initializeModels() {
    this.models = [
      new StatisticalModel(),
      new MLBasedModel(),
      new RuleBasedModel(),
      new HybridModel()
    ];
  }

  async detect(data: any, context: DetectionContext): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Run all models in parallel
    const results = await Promise.all(
      this.models.map(model => model.detect(data, context, this.baseline))
    );

    // Aggregate results
    for (const result of results.flat()) {
      // Filter false positives
      if (result.confidence < 0.5) continue;

      // Add context
      result.context = await this.enrichContext(result);

      // Suggest actions
      result.actions = await this.generateActions(result);

      anomalies.push(result);
    }

    // Learn from detections
    if (this.learningEnabled) {
      await this.learn(anomalies);
    }

    // Send alerts for critical anomalies
    const critical = anomalies.filter(a => a.severity === 'critical');
    for (const anomaly of critical) {
      await this.alertManager.send(anomaly);
    }

    return anomalies;
  }

  private async enrichContext(anomaly: Anomaly): Promise<AnomalyContext> {
    // Find related events
    const relatedEvents = await this.findRelatedEvents(anomaly);

    // Build timeline
    const timeline = await this.buildTimeline(anomaly, relatedEvents);

    // Identify affected entities
    const affectedEntities = await this.identifyAffectedEntities(anomaly);

    return {
      source: anomaly.data.source || 'unknown',
      affectedEntities,
      relatedEvents,
      timeline
    };
  }

  private async generateActions(anomaly: Anomaly): Promise<SuggestedAction[]> {
    const actions: SuggestedAction[] = [];

    switch (anomaly.type) {
      case 'content_manipulation':
        actions.push({
          type: 'alert',
          description: 'Notify content moderators',
          automated: true,
          urgency: 'soon'
        });
        actions.push({
          type: 'investigate',
          description: 'Review content history',
          automated: false,
          urgency: 'eventual'
        });
        break;

      case 'data_breach':
      case 'unauthorized_access':
        actions.push({
          type: 'block',
          description: 'Block suspicious IP/user',
          automated: true,
          urgency: 'immediate'
        });
        actions.push({
          type: 'alert',
          description: 'Emergency security notification',
          automated: true,
          urgency: 'immediate'
        });
        break;

      case 'injection_attempt':
        actions.push({
          type: 'block',
          description: 'Block injection attempt',
          automated: true,
          urgency: 'immediate'
        });
        actions.push({
          type: 'log',
          description: 'Log attempt details for analysis',
          automated: true,
          urgency: 'immediate'
        });
        break;

      default:
        actions.push({
          type: 'log',
          description: 'Log anomaly for review',
          automated: true,
          urgency: 'eventual'
        });
    }

    return actions;
  }

  private async learn(anomalies: Anomaly[]) {
    // Update baseline with new normal behavior
    for (const anomaly of anomalies) {
      // If anomaly was false positive, update models
      if (anomaly.falsePositive) {
        await this.baseline.addNormalSample(anomaly.data);

        for (const model of this.models) {
          await model.updateFromFalsePositive(anomaly);
        }
      }
    }
  }

  async getReport(period: { start: Date; end: Date }): Promise<AnomalyReport> {
    const anomalies = await this.getAnomaliesInPeriod(period);

    const summary = {
      total: anomalies.length,
      bySeverity: this.groupBy(anomalies, 'severity'),
      byType: this.groupBy(anomalies, 'type'),
      falsePositives: anomalies.filter(a => a.falsePositive).length
    };

    const patterns = await this.detectPatterns(anomalies);

    return {
      period,
      anomalies,
      patterns,
      summary
    };
  }
}
```

## Statistical Model

```typescript
// src/services/anomaly/models/statistical.ts

class StatisticalModel implements AnomalyModel {
  async detect(
    data: any,
    context: DetectionContext,
    baseline: Baseline
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Z-score anomaly detection
    const zScoreAnomalies = this.detectZScoreAnomalies(data, baseline);
    anomalies.push(...zScoreAnomalies);

    // IQR (Interquartile Range) method
    const iqrAnomalies = this.detectIQRAnomalies(data, baseline);
    anomalies.push(...iqrAnomalies);

    // Moving average deviation
    const maAnomalies = this.detectMovingAverageAnomalies(data, baseline);
    anomalies.push(...maAnomalies);

    return anomalies;
  }

  private detectZScoreAnomalies(data: any, baseline: Baseline): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'number') continue;

      const stats = baseline.getStats(key);
      if (!stats) continue;

      // Calculate z-score
      const zScore = (value - stats.mean) / stats.stdDev;

      // Threshold: |z| > 3 is anomalous
      if (Math.abs(zScore) > 3) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'pattern_break',
          severity: this.severityFromZScore(zScore),
          confidence: Math.min(Math.abs(zScore) / 6, 1),
          timestamp: new Date(),
          description: `Value ${value} for ${key} is ${zScore.toFixed(2)} standard deviations from mean`,
          data: { key, value, zScore, mean: stats.mean },
          context: null!,
          actions: []
        });
      }
    }

    return anomalies;
  }

  private detectIQRAnomalies(data: any, baseline: Baseline): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'number') continue;

      const quartiles = baseline.getQuartiles(key);
      if (!quartiles) continue;

      const iqr = quartiles.q3 - quartiles.q1;
      const lowerBound = quartiles.q1 - 1.5 * iqr;
      const upperBound = quartiles.q3 + 1.5 * iqr;

      if (value < lowerBound || value > upperBound) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'pattern_break',
          severity: 'medium',
          confidence: 0.7,
          timestamp: new Date(),
          description: `Value ${value} for ${key} is outside IQR bounds [${lowerBound}, ${upperBound}]`,
          data: { key, value, lowerBound, upperBound },
          context: null!,
          actions: []
        });
      }
    }

    return anomalies;
  }

  private detectMovingAverageAnomalies(data: any, baseline: Baseline): Anomaly[] {
    // Compare current value to moving average
    const anomalies: Anomaly[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value !== 'number') continue;

      const ma = baseline.getMovingAverage(key);
      if (!ma) continue;

      const deviation = Math.abs(value - ma.value) / ma.value;

      // Threshold: >50% deviation
      if (deviation > 0.5) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'pattern_break',
          severity: deviation > 1 ? 'high' : 'medium',
          confidence: Math.min(deviation, 1),
          timestamp: new Date(),
          description: `Value ${value} deviates ${(deviation * 100).toFixed(1)}% from moving average`,
          data: { key, value, ma: ma.value, deviation },
          context: null!,
          actions: []
        });
      }
    }

    return anomalies;
  }

  private severityFromZScore(zScore: number): 'critical' | 'high' | 'medium' | 'low' {
    const abs = Math.abs(zScore);
    if (abs > 5) return 'critical';
    if (abs > 4) return 'high';
    if (abs > 3) return 'medium';
    return 'low';
  }

  async updateFromFalsePositive(anomaly: Anomaly) {
    // Update internal thresholds based on false positive
  }
}
```

## Rule-Based Model

```typescript
// src/services/anomaly/models/rule-based.ts

interface Rule {
  id: string;
  name: string;
  condition: (data: any, context: DetectionContext) => boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

class RuleBasedModel implements AnomalyModel {
  private rules: Rule[] = [];

  constructor() {
    this.loadRules();
  }

  private loadRules() {
    this.rules = [
      // SQL Injection
      {
        id: 'sql-injection',
        name: 'SQL Injection Attempt',
        condition: (data) => {
          const text = JSON.stringify(data).toLowerCase();
          return /(\bselect\b.*\bfrom\b|\bunion\b.*\bselect\b|\b--\b)/i.test(text);
        },
        severity: 'critical',
        description: 'Potential SQL injection attempt detected'
      },

      // XSS
      {
        id: 'xss-attempt',
        name: 'XSS Attempt',
        condition: (data) => {
          const text = JSON.stringify(data);
          return /<script|onerror|onload|javascript:/i.test(text);
        },
        severity: 'high',
        description: 'Potential XSS attack detected'
      },

      // Path Traversal
      {
        id: 'path-traversal',
        name: 'Path Traversal Attempt',
        condition: (data) => {
          const text = JSON.stringify(data);
          return /(\.\.[\/\\]|\.\.%2[fF])/i.test(text);
        },
        severity: 'high',
        description: 'Path traversal attempt detected'
      },

      // Excessive API Calls
      {
        id: 'api-abuse',
        name: 'API Rate Limit Exceeded',
        condition: (data, context) => {
          if (!data.apiCalls) return false;
          return data.apiCalls > context.limits.maxApiCalls;
        },
        severity: 'medium',
        description: 'Excessive API calls detected'
      },

      // Large Data Transfer
      {
        id: 'data-exfiltration',
        name: 'Potential Data Exfiltration',
        condition: (data) => {
          return data.bytesTransferred > 100 * 1024 * 1024; // 100MB
        },
        severity: 'high',
        description: 'Unusually large data transfer detected'
      },

      // Failed Login Attempts
      {
        id: 'brute-force',
        name: 'Brute Force Attack',
        condition: (data) => {
          return data.failedLogins > 10;
        },
        severity: 'high',
        description: 'Multiple failed login attempts detected'
      },

      // Privilege Escalation
      {
        id: 'privilege-escalation',
        name: 'Privilege Escalation Attempt',
        condition: (data) => {
          return data.action === 'permission_change' &&
                 data.newRole > data.currentRole;
        },
        severity: 'critical',
        description: 'Unauthorized privilege escalation detected'
      },

      // Unusual Time Access
      {
        id: 'unusual-time',
        name: 'Access During Unusual Hours',
        condition: (data, context) => {
          const hour = new Date(data.timestamp).getHours();
          return hour < 6 || hour > 22; // Outside business hours
        },
        severity: 'low',
        description: 'Access during unusual hours'
      },

      // Geo-Anomaly
      {
        id: 'geo-anomaly',
        name: 'Unusual Geographic Location',
        condition: (data, context) => {
          if (!data.location || !context.baseline.location) return false;

          const distance = this.calculateDistance(
            data.location,
            context.baseline.location
          );

          return distance > 1000; // km
        },
        severity: 'medium',
        description: 'Access from unusual geographic location'
      },

      // Content Manipulation
      {
        id: 'content-manipulation',
        name: 'Suspicious Content Changes',
        condition: (data) => {
          if (!data.contentChange) return false;

          // Large deletion
          if (data.contentChange.deletedChars > 1000) return true;

          // Mass link addition
          if (data.contentChange.linksAdded > 10) return true;

          return false;
        },
        severity: 'medium',
        description: 'Suspicious content modification detected'
      }
    ];
  }

  async detect(
    data: any,
    context: DetectionContext,
    baseline: Baseline
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    for (const rule of this.rules) {
      try {
        if (rule.condition(data, context)) {
          anomalies.push({
            id: crypto.randomUUID(),
            type: this.mapRuleToType(rule.id),
            severity: rule.severity,
            confidence: 0.9, // Rules have high confidence
            timestamp: new Date(),
            description: rule.description,
            data: { rule: rule.id, ...data },
            context: null!,
            actions: []
          });
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }

    return anomalies;
  }

  private mapRuleToType(ruleId: string): AnomalyType {
    const mapping: Record<string, AnomalyType> = {
      'sql-injection': 'injection_attempt',
      'xss-attempt': 'injection_attempt',
      'path-traversal': 'injection_attempt',
      'api-abuse': 'resource_abuse',
      'data-exfiltration': 'data_breach',
      'brute-force': 'unauthorized_access',
      'privilege-escalation': 'permission_escalation',
      'unusual-time': 'suspicious_behavior',
      'geo-anomaly': 'suspicious_behavior',
      'content-manipulation': 'content_manipulation'
    };

    return mapping[ruleId] || 'suspicious_behavior';
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    // Haversine formula
    const R = 6371; // Earth radius in km

    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lon - loc1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(loc1.lat)) *
        Math.cos(this.deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async updateFromFalsePositive(anomaly: Anomaly) {
    // Disable or adjust rule that caused false positive
    const ruleId = anomaly.data.rule;
    const rule = this.rules.find(r => r.id === ruleId);

    if (rule) {
      // Could adjust threshold or disable rule
      console.log(`False positive for rule ${ruleId}`);
    }
  }
}
```

## Content Analyzer

```typescript
// src/services/anomaly/analyzers/content-analyzer.ts

class ContentAnalyzer {
  async analyze(content: string, metadata?: any): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Check for spam patterns
    const spamScore = await this.detectSpam(content);
    if (spamScore > 0.7) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'content_manipulation',
        severity: 'medium',
        confidence: spamScore,
        timestamp: new Date(),
        description: 'Spam-like content detected',
        data: { content: content.slice(0, 100), spamScore },
        context: null!,
        actions: []
      });
    }

    // Check for malicious links
    const maliciousLinks = await this.detectMaliciousLinks(content);
    if (maliciousLinks.length > 0) {
      anomalies.push({
        id: crypto.randomUUID(),
        type: 'content_manipulation',
        severity: 'high',
        confidence: 0.8,
        timestamp: new Date(),
        description: `${maliciousLinks.length} malicious links detected`,
        data: { links: maliciousLinks },
        context: null!,
        actions: []
      });
    }

    // Check for unusual language patterns
    const languageAnomaly = await this.detectLanguageAnomalies(content);
    if (languageAnomaly) {
      anomalies.push(languageAnomaly);
    }

    // Check for plagiarism
    if (metadata?.checkPlagiarism) {
      const plagiarismScore = await this.detectPlagiarism(content);
      if (plagiarismScore > 0.5) {
        anomalies.push({
          id: crypto.randomUUID(),
          type: 'content_manipulation',
          severity: 'low',
          confidence: plagiarismScore,
          timestamp: new Date(),
          description: 'Potential plagiarized content',
          data: { plagiarismScore },
          context: null!,
          actions: []
        });
      }
    }

    return anomalies;
  }

  private async detectSpam(content: string): Promise<number> {
    let score = 0;

    // Excessive caps
    const caps = (content.match(/[A-Z]/g) || []).length / content.length;
    if (caps > 0.3) score += 0.2;

    // Excessive punctuation
    const punct = (content.match(/[!?]/g) || []).length;
    if (punct > 5) score += 0.2;

    // Repetitive words
    const words = content.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words).size;
    if (uniqueWords / words.length < 0.5) score += 0.3;

    // Spam keywords
    const spamKeywords = ['buy now', 'click here', 'limited offer', 'act now'];
    for (const keyword of spamKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        score += 0.1;
      }
    }

    return Math.min(score, 1);
  }

  private async detectMaliciousLinks(content: string): Promise<string[]> {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlRegex) || [];

    const malicious: string[] = [];

    for (const url of urls) {
      // Check against known malicious domains
      if (await this.isKnownMalicious(url)) {
        malicious.push(url);
        continue;
      }

      // Check for suspicious patterns
      if (this.hasSuspiciousPattern(url)) {
        malicious.push(url);
      }
    }

    return malicious;
  }

  private async isKnownMalicious(url: string): Promise<boolean> {
    // In production, check against API like Google Safe Browsing
    const maliciousDomains = [
      'malware.com',
      'phishing.net',
      'scam.org'
    ];

    const domain = new URL(url).hostname;
    return maliciousDomains.some(d => domain.includes(d));
  }

  private hasSuspiciousPattern(url: string): boolean {
    // Suspicious URL patterns
    const suspicious = [
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address
      /[a-z0-9]{20,}/, // Long random string
      /\.tk$|\.ml$|\.ga$/, // Suspicious TLDs
      /%[0-9a-f]{2}/i, // Excessive URL encoding
    ];

    return suspicious.some(pattern => pattern.test(url));
  }

  private async detectLanguageAnomalies(content: string): Promise<Anomaly | null> {
    // Detect unusual language patterns using AI
    const prompt = `
      Analyze this text for unusual language patterns (bot-generated, gibberish, etc.):
      "${content.slice(0, 500)}"

      Is this text suspicious? (yes/no)
      Confidence (0-1):
      Reason:
    `;

    const response = await aiProvider.complete(prompt);

    if (response.toLowerCase().includes('yes')) {
      return {
        id: crypto.randomUUID(),
        type: 'content_manipulation',
        severity: 'low',
        confidence: parseFloat(response.match(/confidence:\s*([0-9.]+)/i)?.[1] || '0.5'),
        timestamp: new Date(),
        description: 'Unusual language patterns detected',
        data: { reason: response },
        context: null!,
        actions: []
      };
    }

    return null;
  }

  private async detectPlagiarism(content: string): Promise<number> {
    // Simple plagiarism detection via search
    // Take random snippet and search for it
    const snippet = this.extractRandomSnippet(content, 50);

    const results = await this.searchWeb(snippet);

    // If exact match found, likely plagiarized
    const exactMatches = results.filter(r =>
      r.content.includes(snippet)
    );

    return exactMatches.length > 0 ? 0.8 : 0;
  }

  private extractRandomSnippet(text: string, words: number): string {
    const allWords = text.split(/\s+/);
    const start = Math.floor(Math.random() * (allWords.length - words));
    return allWords.slice(start, start + words).join(' ');
  }
}
```

## Alert Manager

```typescript
// src/services/anomaly/alerts/alert-manager.ts

class AlertManager {
  private channels: AlertChannel[] = [];
  private history: Alert[] = [];

  addChannel(channel: AlertChannel) {
    this.channels.push(channel);
  }

  async send(anomaly: Anomaly) {
    const alert: Alert = {
      id: crypto.randomUUID(),
      anomaly,
      timestamp: new Date(),
      acknowledged: false
    };

    this.history.push(alert);

    // Send to all channels
    for (const channel of this.channels) {
      try {
        await channel.send(alert);
      } catch (error) {
        console.error(`Failed to send alert via ${channel.name}:`, error);
      }
    }

    // Emit event
    this.emit('alert:sent', alert);
  }

  async acknowledge(alertId: string) {
    const alert = this.history.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date();
    }
  }

  getUnacknowledged(): Alert[] {
    return this.history.filter(a => !a.acknowledged);
  }
}

// Alert channels
interface AlertChannel {
  name: string;
  send(alert: Alert): Promise<void>;
}

class BrowserNotificationChannel implements AlertChannel {
  name = 'Browser Notification';

  async send(alert: Alert) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification('Security Alert', {
        body: alert.anomaly.description,
        icon: '/icons/warning.png',
        tag: alert.id
      });
    }
  }
}

class ConsoleChannel implements AlertChannel {
  name = 'Console';

  async send(alert: Alert) {
    console.warn(`[ANOMALY] ${alert.anomaly.severity.toUpperCase()}: ${alert.anomaly.description}`);
  }
}

class WebhookChannel implements AlertChannel {
  name = 'Webhook';

  constructor(private url: string) {}

  async send(alert: Alert) {
    await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alert)
    });
  }
}
```

## UI Components

```typescript
// src/components/AnomalyDashboard.tsx

function AnomalyDashboard() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'unacked'>('all');

  const detector = useAnomalyDetector();

  useEffect(() => {
    const unsubscribe = detector.on('anomaly:detected', (anomaly) => {
      setAnomalies(prev => [anomaly, ...prev]);
    });

    return unsubscribe;
  }, []);

  const filtered = anomalies.filter(a => {
    if (filter === 'critical') return a.severity === 'critical';
    if (filter === 'unacked') return !a.acknowledged;
    return true;
  });

  return (
    <div className="anomaly-dashboard">
      <h2>Anomaly Detection</h2>

      <div className="filters">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All ({anomalies.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={filter === 'critical' ? 'active' : ''}
        >
          Critical ({anomalies.filter(a => a.severity === 'critical').length})
        </button>
        <button
          onClick={() => setFilter('unacked')}
          className={filter === 'unacked' ? 'active' : ''}
        >
          Unacknowledged ({anomalies.filter(a => !a.acknowledged).length})
        </button>
      </div>

      <div className="anomalies">
        {filtered.map(anomaly => (
          <AnomalyCard key={anomaly.id} anomaly={anomaly} />
        ))}
      </div>
    </div>
  );
}

function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500'
  };

  return (
    <div className={cn('anomaly-card', severityColors[anomaly.severity])}>
      <div className="header">
        <span className="type">{anomaly.type}</span>
        <span className="severity">{anomaly.severity}</span>
        <span className="confidence">{(anomaly.confidence * 100).toFixed(0)}%</span>
      </div>

      <p className="description">{anomaly.description}</p>

      <div className="actions">
        {anomaly.actions.map((action, i) => (
          <button
            key={i}
            onClick={() => executeAction(action)}
            className={action.urgency}
          >
            {action.type}: {action.description}
          </button>
        ))}
      </div>

      <div className="timestamp">
        {formatTimestamp(anomaly.timestamp)}
      </div>
    </div>
  );
}
```

## Przykłady użycia

```typescript
// Initialize detector
const detector = new AnomalyDetector();

// Add alert channels
detector.alertManager.addChannel(new BrowserNotificationChannel());
detector.alertManager.addChannel(new ConsoleChannel());
detector.alertManager.addChannel(new WebhookChannel('https://api.example.com/alerts'));

// Monitor user behavior
window.addEventListener('click', async (e) => {
  const anomalies = await detector.detect({
    action: 'click',
    element: e.target.tagName,
    timestamp: new Date(),
    location: window.location.href
  }, {
    baseline: await getBaseline(),
    limits: { maxApiCalls: 100 }
  });

  if (anomalies.length > 0) {
    console.log('Anomalies detected:', anomalies);
  }
});

// Monitor API calls
async function apiCall(endpoint: string, data: any) {
  const start = Date.now();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });

    const anomalies = await detector.detect({
      endpoint,
      method: 'POST',
      duration: Date.now() - start,
      bytesTransferred: JSON.stringify(data).length,
      timestamp: new Date()
    }, context);

    return response;
  } catch (error) {
    // Detect error patterns
    await detector.detect({
      endpoint,
      error: error.message,
      timestamp: new Date()
    }, context);

    throw error;
  }
}

// Get reports
const report = await detector.getReport({
  start: new Date('2025-01-01'),
  end: new Date()
});

console.log(`Total anomalies: ${report.summary.total}`);
console.log(`Critical: ${report.summary.bySeverity.critical}`);
console.log(`False positives: ${report.summary.falsePositives}`);
```

Ten system zapewnia kompleksowe wykrywanie anomalii z wieloma modelami, alertami i raportowaniem.
