import {
  OpenWearableValidationLogo,
  OpenWearableValidationIcon,
  type OpenWearableValidationLogoProps,
} from './OpenWearableValidationLogo.tsx';

export type OpenValidationLogoProps = OpenWearableValidationLogoProps;

/**
 * OpenValidationLogo backwards compatibility re-export.
 * Canonical implementation is now OpenWearableValidationLogo.
 */
export const OpenValidationLogo = OpenWearableValidationLogo;
export const OpenValidationIcon = OpenWearableValidationIcon;

export {
  OpenWearableValidationLogo,
  OpenWearableValidationIcon,
  OpenWearableValidationLogo as SiteLogo,
  OpenWearableValidationIcon as SiteIcon,
};
