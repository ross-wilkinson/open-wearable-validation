/**
 * Umbrella Brand Configuration
 *
 * Parameterized to allow instant replacement once the user selects the replacement
 * umbrella name for the site.
 */
export const BRAND_CONFIG = {
  /**
   * Umbrella Site Brand Name.
   * Parameterized to easily update once the final name replaces 'OpenValidation'.
   */
  siteName: 'Open Wearable Validation',
  shortName: 'Open Wearable Validation',
  heroHeadline: 'Measure Ground Truth. Validate With Confidence.',
  heroSubheadline: 'The open-source suite for wearable sensors and health algorithms.',
  eyebrow: 'OPEN-SOURCE VALIDATION',
  subtitle: 'Wearable Validation Suite',
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
