/**
 * Umbrella Brand Configuration
 *
 * Parameterized to allow instant replacement once the user selects the replacement
 * umbrella name for the site.
 */
export const BRAND_CONFIG = {
  /**
   * Umbrella Site Brand Name.
   */
  siteName: 'Open Wearable Validation',
  shortName: 'Open Wearable Validation',
  domain: 'openwearablevalidation.org',
  url: 'https://openwearablevalidation.org',
  heroHeadline: 'Measure Ground Truth. Validate With Confidence.',
  heroSubheadline: 'The open-source suite for wearable sensors and health algorithms.',
  eyebrow: 'OPEN-SOURCE VALIDATION',
  subtitle: 'Wearable Validation Suite',
} as const;

export type BrandConfig = typeof BRAND_CONFIG;
