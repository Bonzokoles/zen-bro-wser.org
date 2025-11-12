/**
 * License Manager - Simple license validation
 * Controls feature access based on license tier
 */

import type { PlanType } from '../../config/features';

export interface License {
    plan: PlanType;
    userId?: string;
    validUntil?: Date;
    features: string[];
}

class LicenseManager {
    private currentLicense: License = {
        plan: 'free',
        features: []
    };

    /**
     * Initialize license from localStorage or default to free
     */
    constructor() {
        this.loadLicense();
    }

    /**
     * Load license from localStorage
     */
    private loadLicense(): void {
        try {
            const stored = localStorage.getItem('zeno_license');
            if (stored) {
                const parsed = JSON.parse(stored);
                this.currentLicense = {
                    ...parsed,
                    validUntil: parsed.validUntil ? new Date(parsed.validUntil) : undefined
                };
            }
        } catch (error) {
            console.error('[LicenseManager] Failed to load license:', error);
            this.currentLicense = { plan: 'free', features: [] };
        }
    }

    /**
     * Save license to localStorage
     */
    private saveLicense(): void {
        try {
            localStorage.setItem('zeno_license', JSON.stringify(this.currentLicense));
        } catch (error) {
            console.error('[LicenseManager] Failed to save license:', error);
        }
    }

    /**
     * Get current license plan
     */
    getPlan(): PlanType {
        // Check if license is expired
        if (this.currentLicense.validUntil) {
            const now = new Date();
            if (now > this.currentLicense.validUntil) {
                console.warn('[LicenseManager] License expired, reverting to free');
                this.currentLicense.plan = 'free';
                this.saveLicense();
            }
        }

        return this.currentLicense.plan;
    }

    /**
     * Set license (for upgrades/downgrades)
     */
    setLicense(license: Partial<License>): void {
        this.currentLicense = {
            ...this.currentLicense,
            ...license,
            validUntil: license.validUntil ? new Date(license.validUntil) : undefined
        };
        this.saveLicense();
        console.log('[LicenseManager] License updated:', this.currentLicense.plan);
    }

    /**
     * Upgrade to a specific plan
     */
    upgradeTo(plan: PlanType, validUntil?: Date): void {
        this.setLicense({
            plan,
            validUntil,
            features: this.getFeaturesForPlan(plan)
        });
    }

    /**
     * Get features for a specific plan
     */
    private getFeaturesForPlan(plan: PlanType): string[] {
        const features: Record<PlanType, string[]> = {
            free: ['basic_tabs', 'basic_chat', 'basic_search'],
            pro: ['unlimited_tabs', 'advanced_chat', 'advanced_search', 'mcp_tools', 'custom_themes'],
            enterprise: ['unlimited_tabs', 'advanced_chat', 'advanced_search', 'mcp_tools', 'custom_themes', 'priority_support', 'custom_branding', 'team_features']
        };

        return features[plan] || features.free;
    }

    /**
     * Check if user has access to a specific feature
     */
    hasFeature(feature: string): boolean {
        return this.currentLicense.features.includes(feature);
    }

    /**
     * Get current license info
     */
    getLicense(): License {
        return { ...this.currentLicense };
    }

    /**
     * Reset to free plan
     */
    resetToFree(): void {
        this.setLicense({
            plan: 'free',
            features: this.getFeaturesForPlan('free'),
            validUntil: undefined,
            userId: undefined
        });
    }

    /**
     * Check if license is valid
     */
    isValid(): boolean {
        if (!this.currentLicense.validUntil) {
            return true; // No expiration = always valid (free plan)
        }

        return new Date() <= this.currentLicense.validUntil;
    }

    /**
     * Get days until license expires
     */
    getDaysUntilExpiry(): number | null {
        if (!this.currentLicense.validUntil) {
            return null;
        }

        const now = new Date();
        const diff = this.currentLicense.validUntil.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
}

// Export singleton instance
export const licenseManager = new LicenseManager();

/**
 * Helper function to get current license plan
 */
export function getLicensePlan(): PlanType {
    return licenseManager.getPlan();
}

/**
 * Helper function to check if user has a specific plan or higher
 */
export function hasMinimumPlan(requiredPlan: PlanType): boolean {
    const planHierarchy: Record<PlanType, number> = {
        free: 0,
        pro: 1,
        enterprise: 2
    };

    const currentPlan = licenseManager.getPlan();
    return planHierarchy[currentPlan] >= planHierarchy[requiredPlan];
}

// Export for testing
export default LicenseManager;
