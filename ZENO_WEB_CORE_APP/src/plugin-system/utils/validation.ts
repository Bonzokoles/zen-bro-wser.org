/**
 * Validation Utilities for Plugin Manifests
 */

import type { PluginManifest, PluginPermission } from '../api/plugin-api';

const VALID_PERMISSIONS: PluginPermission[] = [
  'network',
  'storage',
  'tabs',
  'bookmarks',
  'history',
  'notifications',
  'clipboard',
  'downloads',
  'settings',
];

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[\w.]+)?(\+[\w.]+)?$/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a plugin manifest for required fields and correct formats.
 */
export function validateManifest(manifest: unknown): ValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be a non-null object.'] };
  }

  const m = manifest as Record<string, unknown>;

  // Required string fields
  for (const field of ['id', 'name', 'version', 'description', 'author', 'license', 'entryPoint']) {
    if (!m[field] || typeof m[field] !== 'string' || !(m[field] as string).trim()) {
      errors.push(`Missing or invalid required field: "${field}".`);
    }
  }

  // id format: allow alphanumeric, dots, dashes, underscores
  if (typeof m['id'] === 'string' && !/^[a-zA-Z0-9._-]+$/.test(m['id'])) {
    errors.push('Plugin id must only contain alphanumerics, dots, dashes, or underscores.');
  }

  // version must be semver
  if (typeof m['version'] === 'string' && !SEMVER_REGEX.test(m['version'])) {
    errors.push(`Version "${m['version']}" is not valid SemVer (e.g. "1.0.0").`);
  }

  // permissions
  if (!Array.isArray(m['permissions'])) {
    errors.push('Field "permissions" must be an array.');
  } else {
    const invalid = (m['permissions'] as unknown[]).filter(
      (p) => !VALID_PERMISSIONS.includes(p as PluginPermission)
    );
    if (invalid.length > 0) {
      errors.push(`Unknown permissions: ${invalid.join(', ')}.`);
    }
  }

  // optional dependencies: must be Record<string, string>
  if (m['dependencies'] !== undefined) {
    if (typeof m['dependencies'] !== 'object' || Array.isArray(m['dependencies'])) {
      errors.push('Field "dependencies" must be an object mapping plugin ids to version ranges.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Checks that a SemVer string is at least as high as the minimum required.
 * Returns true if `version` >= `minVersion`.
 */
export function meetsMinVersion(version: string, minVersion: string): boolean {
  const parse = (v: string): number[] =>
    v.split('.').map((n) => parseInt(n, 10));

  const [ma, mi, pa] = parse(version);
  const [mia, mii, mip] = parse(minVersion);

  if (ma !== mia) return ma > mia;
  if (mi !== mii) return mi > mii;
  return pa >= mip;
}

/**
 * Strict cast of an unknown value to a PluginManifest if valid.
 */
export function castManifest(raw: unknown): PluginManifest {
  const result = validateManifest(raw);
  if (!result.valid) {
    throw new Error(`Invalid plugin manifest: ${result.errors.join('; ')}`);
  }
  return raw as PluginManifest;
}
