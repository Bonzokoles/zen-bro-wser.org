/**
 * Feature Configuration
 * Defines which features are available for each plan
 */

export type PlanType = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredPlan: PlanType;
}

/**
 * All available features in ZENO Browser
 */
export const FEATURES: Feature[] = [
  // FREE FEATURES
  {
    id: 'basic_browsing',
    name: 'Basic Browsing',
    description: 'Browse websites in iframe windows',
    icon: '🌐',
    requiredPlan: 'free'
  },
  {
    id: 'limited_tabs',
    name: 'Limited Tabs (5 max)',
    description: 'Open up to 5 tabs simultaneously',
    icon: '📑',
    requiredPlan: 'free'
  },
  {
    id: 'basic_bookmarks',
    name: 'Basic Bookmarks',
    description: 'Save and organize your favorite sites',
    icon: '⭐',
    requiredPlan: 'free'
  },
  {
    id: 'browsing_history',
    name: 'Browsing History',
    description: 'Keep track of visited pages',
    icon: '📜',
    requiredPlan: 'free'
  },
  {
    id: 'theme_switching',
    name: 'Theme Switching',
    description: 'Toggle between light and dark modes',
    icon: '🎨',
    requiredPlan: 'free'
  },

  // MONTHLY PLAN FEATURES
  {
    id: 'unlimited_tabs',
    name: 'Unlimited Tabs',
    description: 'Open as many tabs as you need',
    icon: '∞',
    requiredPlan: 'monthly'
  },
  {
    id: 'ai_assistant',
    name: 'AI Assistant',
    description: 'Chat with Claude, Gemini, and OpenAI',
    icon: '🤖',
    requiredPlan: 'monthly'
  },
  {
    id: 'advanced_bookmarks',
    name: 'Advanced Bookmarks',
    description: 'Folders, tags, import/export functionality',
    icon: '📁',
    requiredPlan: 'monthly'
  },
  {
    id: 'mcp_tools',
    name: 'MCP Tools Integration',
    description: 'Model Context Protocol tools and features',
    icon: '🔧',
    requiredPlan: 'monthly'
  },
  {
    id: 'ollama_integration',
    name: 'Local Ollama Models',
    description: 'Run AI models locally with Ollama',
    icon: '🦙',
    requiredPlan: 'monthly'
  },
  {
    id: 'custom_themes',
    name: 'Custom Themes',
    description: 'Create and save your own color schemes',
    icon: '🎨',
    requiredPlan: 'monthly'
  },

  // YEARLY PLAN FEATURES
  {
    id: 'music_player',
    name: 'Music Player (Webamp)',
    description: 'Classic Winamp-style player with skins',
    icon: '🎵',
    requiredPlan: 'yearly'
  },
  {
    id: 'advanced_search',
    name: 'Advanced Search',
    description: 'Powerful search with filters and sorting',
    icon: '🔍',
    requiredPlan: 'yearly'
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: '10,000 API requests per day',
    icon: '🔌',
    requiredPlan: 'yearly'
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: '24-hour response time',
    icon: '🚀',
    requiredPlan: 'yearly'
  },
  {
    id: 'team_features',
    name: 'Team Features',
    description: 'Share settings with up to 5 users',
    icon: '👥',
    requiredPlan: 'yearly'
  },
  {
    id: 'export_data',
    name: 'Data Export',
    description: 'Export all your data in JSON/HTML formats',
    icon: '📤',
    requiredPlan: 'yearly'
  },
  {
    id: 'sync_devices',
    name: 'Multi-Device Sync',
    description: 'Sync bookmarks and settings across devices',
    icon: '🔄',
    requiredPlan: 'yearly'
  },

  // LIFETIME PLAN FEATURES
  {
    id: 'beta_access',
    name: 'Beta Access',
    description: 'Early access to new features',
    icon: '🚀',
    requiredPlan: 'lifetime'
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Request custom API integrations',
    icon: '🔗',
    requiredPlan: 'lifetime'
  },
  {
    id: 'vip_support',
    name: 'VIP Support',
    description: 'Direct line to developers',
    icon: '⭐',
    requiredPlan: 'lifetime'
  },
  {
    id: 'unlimited_api',
    name: 'Unlimited API Access',
    description: 'No rate limits on API requests',
    icon: '∞',
    requiredPlan: 'lifetime'
  }
];

/**
 * Plan hierarchy for comparison
 */
export const PLAN_HIERARCHY: Record<PlanType, number> = {
  free: 0,
  monthly: 1,
  yearly: 2,
  lifetime: 3
};

/**
 * Check if a feature is available for a given plan
 */
export function hasFeatureAccess(userPlan: PlanType, featureId: string): boolean {
  const feature = FEATURES.find(f => f.id === featureId);
  if (!feature) return false;

  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[feature.requiredPlan];
}

/**
 * Get all features for a plan
 */
export function getFeaturesForPlan(plan: PlanType): Feature[] {
  return FEATURES.filter(feature =>
    PLAN_HIERARCHY[plan] >= PLAN_HIERARCHY[feature.requiredPlan]
  );
}

/**
 * Get features that user needs to upgrade for
 */
export function getLockedFeatures(userPlan: PlanType): Feature[] {
  return FEATURES.filter(feature =>
    PLAN_HIERARCHY[userPlan] < PLAN_HIERARCHY[feature.requiredPlan]
  );
}

/**
 * Tab limits per plan
 */
export const TAB_LIMITS: Record<PlanType, number> = {
  free: 5,
  monthly: 999,
  yearly: 999,
  lifetime: 999
};

/**
 * Pricing information
 */
export const PRICING = {
  free: {
    price: 0,
    currency: 'USD',
    interval: 'forever',
    label: 'Free Forever',
    savings: null
  },
  pro: {
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    label: '$9.99/month',
    savings: null
  },
  enterprise: {
    price: 49.99,
    currency: 'USD',
    interval: 'month',
    label: '$49.99/month',
    savings: null
  },
  monthly: {
    price: 5,
    currency: 'USD',
    interval: 'month',
    label: '$5/month',
    savings: null
  },
  yearly: {
    price: 50,
    currency: 'USD',
    interval: 'year',
    label: '$50/year',
    savings: 'Save 17% - Only $4.17/month!'
  },
  lifetime: {
    price: 199,
    currency: 'USD',
    interval: 'lifetime',
    label: '$199 one-time',
    savings: 'Best Value - Pay once, use forever!'
  }
};
