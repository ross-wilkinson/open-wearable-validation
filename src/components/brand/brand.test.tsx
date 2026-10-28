import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStudy } from '../../test/renderWithStudy.tsx';
import {
  OpenWearableValidationLogo,
  OpenWearableValidationIcon,
  OpenValidationLogo,
  OpenValidationIcon,
  SiteLogo,
} from './OpenWearableValidationLogo.tsx';
import { ValidationStudyDesignerLogo } from './ValidationStudyDesignerLogo.tsx';
import { MeridianLogo, MeridianIcon } from './MeridianLogo.tsx';
import { AgreekitLogo, AgreekitIcon } from './AgreekitLogo.tsx';
import { PulseBandHardwareGraphic } from './PulseBandHardwareGraphic.tsx';
import { HardwareChangeMatrix, HARDWARE_TIERS } from './HardwareChangeMatrix.tsx';
import { BrandShowcase } from './BrandShowcase.tsx';
import { BRAND_CONFIG } from '../../config/brand.ts';

describe('Brand Components', () => {
  describe('OpenWearableValidationLogo & SiteLogo', () => {
    it('renders vector SVG logo in icon-only mode with parameterized name', () => {
      renderWithStudy(<OpenWearableValidationLogo size={32} />);
      const svg = screen.getByRole('img', { name: new RegExp(`${BRAND_CONFIG.siteName} Logo`, 'i') });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('renders vector SVG logo with text wordmark and parameterized subtitle', () => {
      renderWithStudy(<OpenWearableValidationLogo size={40} showText />);
      expect(screen.getByText(BRAND_CONFIG.siteName)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(BRAND_CONFIG.subtitle, 'i'))).toBeInTheDocument();
    });

    it('supports custom title and subtitle overrides', () => {
      renderWithStudy(
        <SiteLogo size={44} showText title="PrecisionValidation" subtitle="CLINICAL ALGORITHM METROLOGY" />,
      );
      expect(screen.getByText('PrecisionValidation')).toBeInTheDocument();
      expect(screen.getByText('CLINICAL ALGORITHM METROLOGY')).toBeInTheDocument();
    });

    it('renders standalone OpenWearableValidationIcon', () => {
      renderWithStudy(<OpenWearableValidationIcon size={24} />);
      expect(screen.getByRole('img', { name: new RegExp(`${BRAND_CONFIG.siteName} Logo`, 'i') })).toBeInTheDocument();
    });

    it('supports backward-compatible OpenValidationLogo and OpenValidationIcon aliases', () => {
      renderWithStudy(<OpenValidationLogo size={28} showText />);
      expect(screen.getByText(BRAND_CONFIG.siteName)).toBeInTheDocument();
      renderWithStudy(<OpenValidationIcon size={20} />);
      expect(screen.getAllByRole('img', { name: new RegExp(`${BRAND_CONFIG.siteName} Logo`, 'i') }).length).toBeGreaterThan(0);
    });

    it('omits subtitle element when subtitle is empty string', () => {
      renderWithStudy(<OpenWearableValidationLogo size={32} showText subtitle="" />);
      expect(screen.getByText(BRAND_CONFIG.shortName)).toBeInTheDocument();
      expect(screen.queryByText(new RegExp(BRAND_CONFIG.subtitle, 'i'))).not.toBeInTheDocument();
    });

    it('passes custom className to SVG or container', () => {
      const { container: iconOnly } = renderWithStudy(
        <OpenWearableValidationLogo size={24} className="test-icon-custom-class" />,
      );
      expect(iconOnly.querySelector('svg.test-icon-custom-class')).toBeInTheDocument();

      const { container: withText } = renderWithStudy(
        <OpenWearableValidationLogo size={24} showText className="test-wrapper-custom-class" />,
      );
      expect(withText.querySelector('.test-wrapper-custom-class')).toBeInTheDocument();
    });
  });
  describe('ValidationStudyDesignerLogo', () => {
    it('renders vector SVG logo in icon-only mode', () => {
      renderWithStudy(<ValidationStudyDesignerLogo size={32} />);
      const svg = screen.getByRole('img', { name: /validation study designer logo/i });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('renders vector SVG logo with text wordmark', () => {
      renderWithStudy(<ValidationStudyDesignerLogo size={40} showText />);
      expect(screen.getByText('Validation Study Designer')).toBeInTheDocument();
      expect(screen.getByText(/wearable clinical suite/i)).toBeInTheDocument();
    });
  });

  describe('MeridianLogo & MeridianIcon', () => {
    it('renders Meridian Biosystems corporate brand mark with icon and subtitle', () => {
      renderWithStudy(<MeridianLogo size={40} showText subtitle="WEARABLE HEALTH TECHNOLOGIES" />);
      expect(screen.getByRole('img', { name: /meridian biosystems logo/i })).toBeInTheDocument();
      expect(screen.getByText('MERIDIAN')).toBeInTheDocument();
      expect(screen.getByText('BIOSYSTEMS')).toBeInTheDocument();
      expect(screen.getByText('WEARABLE HEALTH TECHNOLOGIES')).toBeInTheDocument();
    });

    it('renders standalone MeridianIcon', () => {
      renderWithStudy(<MeridianIcon size={28} />);
      expect(screen.getByRole('img', { name: /meridian biosystems logo/i })).toBeInTheDocument();
    });
  });

  describe('AgreekitLogo & AgreekitIcon', () => {
    it('renders vector SVG logo in icon-only mode', () => {
      renderWithStudy(<AgreekitLogo size={32} />);
      const svg = screen.getByRole('img', { name: /agreekit logo/i });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '32');
      expect(svg).toHaveAttribute('height', '32');
    });

    it('renders vector SVG logo with text wordmark and custom subtitle', () => {
      renderWithStudy(<AgreekitLogo size={36} showText subtitle="PYTHON PACKAGE" />);
      expect(screen.getByRole('img', { name: /agreekit logo/i })).toBeInTheDocument();
      expect(screen.getByText('agreekit')).toBeInTheDocument();
      expect(screen.getByText('PYTHON PACKAGE')).toBeInTheDocument();
    });

    it('renders standalone AgreekitIcon', () => {
      renderWithStudy(<AgreekitIcon size={24} />);
      expect(screen.getByRole('img', { name: /agreekit logo/i })).toBeInTheDocument();
    });
  });

  describe('PulseBandHardwareGraphic', () => {
    it('renders PulseBand 2 diagram and allows switching hardware subsystems', async () => {
      const user = userEvent.setup();
      renderWithStudy(<PulseBandHardwareGraphic mode="interactive" />);

      expect(
        screen.getByRole('heading', {
          name: /meridian pulseband 2 — multi-wavelength optical stack/i,
        }),
      ).toBeInTheDocument();

      // Optical PPG is default
      expect(screen.getByText(/multi-spectral optical array/i)).toBeInTheDocument();

      // Switch to 100Hz IMU
      await user.click(screen.getByRole('button', { name: /100hz imu/i }));
      expect(screen.getByText(/high-frequency 100 hz imu/i)).toBeInTheDocument();

      // Switch to DSP / MCU
      await user.click(screen.getByRole('button', { name: /dsp \/ mcu/i }));
      expect(screen.getByText(/ultra-low-power edge dsp/i)).toBeInTheDocument();

      // Switch to Chassis
      await user.click(screen.getByRole('button', { name: /chassis/i }));
      expect(screen.getByText(/curved sapphire lens/i)).toBeInTheDocument();
    });
  });

  describe('HardwareChangeMatrix', () => {
    it('renders all 4 validation tiers and switches active tier spotlight', async () => {
      const user = userEvent.setup();
      renderWithStudy(<HardwareChangeMatrix />);

      expect(screen.getByText(/validation tier decision matrix/i)).toBeInTheDocument();
      for (const tier of HARDWARE_TIERS) {
        expect(screen.getByRole('button', { name: tier.badge })).toBeInTheDocument();
      }

      // Default is Tier 0
      expect(screen.getByText(/tier 0: pure firmware \/ dsp update/i)).toBeInTheDocument();

      // Click Tier 2 (Optical Stack Revision)
      await user.click(screen.getByRole('button', { name: 'Tier 2' }));
      expect(screen.getByText(/tier 2: optical stack revision/i)).toBeInTheDocument();
      expect(screen.getAllByText('N = 40 – 60 subjects').length).toBeGreaterThan(0);
      expect(screen.getByText('$100,000 – $150,000')).toBeInTheDocument();
    });
  });

  describe('BrandShowcase', () => {
    it('renders colorblind-safe palette tokens and hardware components', () => {
      renderWithStudy(<BrandShowcase />);
      expect(screen.getByText(/brand identity system & hardware assets/i)).toBeInTheDocument();
      expect(screen.getByText('Series 1 (Blue)')).toBeInTheDocument();
      expect(screen.getByText('Series 8 (Red)')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {
          name: /meridian pulseband 2 — multi-wavelength optical stack/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
