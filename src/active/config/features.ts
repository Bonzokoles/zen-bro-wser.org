/**
 * Feature Flags & Plan Limits Configuration
 * Defines what features are available for each plan tier
 */

export type PlanType = 'free' | 'pro' | 'enterprise' | 'monthly' | 'yearly' | 'lifetime';

/**
 * Tab limits per plan
 */
export const TAB_LIMITS: Record<PlanType, number> = {
    free: 5,
    pro: 50,
    enterprise: 999,
    monthly: 30,
    yearly: 100,
    lifetime: 999
};

/**
 * Feature availability per plan
 */
export const FEATURES = {
    // Basic features (all plans)
    basic_tabs: ['free', 'pro', 'enterprise'],
    basic_chat: ['free', 'pro', 'enterprise'],
    basic_search: ['free', 'pro', 'enterprise'],
    bookmarks: ['free', 'pro', 'enterprise'],
    history: ['free', 'pro', 'enterprise'],

    // Pro features
    unlimited_tabs: ['pro', 'enterprise'],
    advanced_chat: ['pro', 'enterprise'],
    advanced_search: ['pro', 'enterprise'],
    mcp_tools: ['pro', 'enterprise'],
    custom_themes: ['pro', 'enterprise'],
    music_player: ['pro', 'enterprise'],
    video_player: ['pro', 'enterprise'],
    widgets: ['pro', 'enterprise'],

    // Enterprise features
    priority_support: ['enterprise'],
    custom_branding: ['enterprise'],
    team_features: ['enterprise'],
    api_access: ['enterprise'],
    audit_logs: ['enterprise'],
    sso: ['enterprise']
} as const;

export type FeatureName = keyof typeof FEATURES;

/**
 * Check if a plan has access to a feature
 */
export function hasFeatureAccess(feature: FeatureName, plan: PlanType): boolean {
    const allowedPlans = FEATURES[feature];
    if (!allowedPlans) {
        console.warn(`[Features] Unknown feature: ${feature}`);
        return false;
    }
    return (allowedPlans as unknown as string[]).includes(plan);
}

/**
 * Get maximum tabs allowed for a plan
 */
export function getMaxTabs(plan: PlanType): number {
    return TAB_LIMITS[plan] || TAB_LIMITS.free;
}

/**
 * Get all features available for a plan
 */
export function getAvailableFeatures(plan: PlanType): FeatureName[] {
    return Object.entries(FEATURES)
        .filter(([_, allowedPlans]) => (allowedPlans as unknown as string[]).includes(plan))
        .map(([feature]) => feature as FeatureName);
}

/**
 * Plan display names
 */
export const PLAN_NAMES: Record<PlanType, string> = {
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
    monthly: 'Monthly',
    yearly: 'Yearly',
    lifetime: 'Lifetime'
};

/**
 * Plan descriptions
 */
export const PLAN_DESCRIPTIONS: Record<PlanType, string> = {
    monthly: 'Monthly subscription',
    yearly: 'Yearly subscription - save 20%',
    lifetime: 'One-time payment, forever',
    free: 'Perfect for getting started',
    pro: 'For power users and professionals',
    enterprise: 'For teams and organizations'
};

/**
 * Plan pricing (monthly in USD)
 */
export const PLAN_PRICING: Record<PlanType, number> = {
    free: 0,
    monthly: 9.99,
    yearly: 99.99,
    lifetime: 299.99,
    pro: 9.99,
    enterprise: 49.99
};

/**
 * Pricing information for UI display
 */
export const PRICING: Record<PlanType, { label: string; savings?: string }> = {
    free: {
        label: 'Free Forever'
    },
    monthly: {
        label: '$9.99/month'
    },
    yearly: {
        label: '$99.99/year',
        savings: 'Save 17%'
    },
    lifetime: {
        label: '$299.99 once',
        savings: 'Best value'
    },
    pro: {
        label: '$9.99/month',
        savings: 'Save 20% with annual'
    },
    enterprise: {
        label: '$49.99/month',
        savings: 'Contact for custom pricing'
    }
};

/**
 * Feature categories for UI grouping
 */
export const FEATURE_CATEGORIES = {
    browsing: ['basic_tabs', 'unlimited_tabs', 'bookmarks', 'history'],
    ai: ['basic_chat', 'advanced_chat', 'mcp_tools'],
    search: ['basic_search', 'advanced_search'],
    media: ['music_player', 'video_player', 'widgets'],
    customization: ['custom_themes', 'custom_branding'],
    enterprise: ['priority_support', 'team_features', 'api_access', 'audit_logs', 'sso']
} as const;

/**
 * Get features by category
 */
export function getFeaturesByCategory(category: keyof typeof FEATURE_CATEGORIES): FeatureName[] {
    return FEATURE_CATEGORIES[category] as unknown as FeatureName[];
}

/**
 * Check if user can open more tabs
 */
export function canOpenMoreTabs(currentTabCount: number, plan: PlanType): boolean {
    const maxTabs = getMaxTabs(plan);
    return currentTabCount < maxTabs;
}

/**
 * Get upgrade message for feature
 */
export function getUpgradeMessage(feature: FeatureName, currentPlan: PlanType): string {
    const allowedPlans = FEATURES[feature];
    if (!allowedPlans) return 'Feature not found';

    if ((allowedPlans as unknown as string[]).includes(currentPlan)) {
        return 'You already have access to this feature';
    }

    const requiredPlan = allowedPlans[0] as PlanType;
    return `Upgrade to ${PLAN_NAMES[requiredPlan]} to unlock this feature`;
}

export default {
    TAB_LIMITS,
    FEATURES,
    PLAN_NAMES,
    PLAN_DESCRIPTIONS,
    PLAN_PRICING,
    PRICING,
    FEATURE_CATEGORIES,
    hasFeatureAccess,
    getMaxTabs,
    getAvailableFeatures,
    getFeaturesByCategory,
    canOpenMoreTabs,
    getUpgradeMessage
};