import type { Citation } from '../components/common/MethodsText.tsx';

/**
 * References for the methods the modules implement.
 *
 * Kept in one file rather than inline so that a citation appearing on two pages
 * cannot drift into two slightly different forms — the kind of inconsistency a
 * reviewer notices and a reader cannot resolve.
 *
 * Vancouver style, since these are aimed at clinical and regulatory documents.
 */
export const BLAND_ALTMAN_1986: Citation = {
  text: 'Bland JM, Altman DG. Statistical methods for assessing agreement between two methods of clinical measurement. Lancet. 1986;327(8476):307-10.',
  url: 'https://doi.org/10.1016/S0140-6736(86)90837-8',
};

export const BLAND_ALTMAN_1999: Citation = {
  text: 'Bland JM, Altman DG. Measuring agreement in method comparison studies. Stat Methods Med Res. 1999;8(2):135-60.',
  url: 'https://doi.org/10.1177/096228029900800204',
};

export const CHOW_2007: Citation = {
  text: 'Chow S-C, Wang H, Shao J. Sample Size Calculations in Clinical Research. 2nd ed. Boca Raton: Chapman & Hall/CRC; 2007. Section 3.1.9.',
};

export const SERFLING_1980: Citation = {
  text: 'Serfling RJ. Approximation Theorems of Mathematical Statistics. New York: Wiley; 1980. Section 2.3.3.',
};

export const CUMMING_2001: Citation = {
  text: 'Cumming G, Finch S. A primer on the understanding, use, and calculation of confidence intervals that are based on central and noncentral distributions. Educ Psychol Meas. 2001;61(4):532-74.',
  url: 'https://doi.org/10.1177/0013164401614002',
};

export const STEIGER_2004: Citation = {
  text: 'Steiger JH. Beyond the F test: effect size confidence intervals and tests of close fit in the analysis of variance and contrast analysis. Psychol Methods. 2004;9(2):164-82.',
  url: 'https://doi.org/10.1037/1082-989X.9.2.164',
};

export const BLAND_ALTMAN_2007: Citation = {
  text: 'Bland JM, Altman DG. Agreement between methods of measurement with multiple observations per individual. J Biopharm Stat. 2007;17(4):571-82.',
  url: 'https://doi.org/10.1080/10543400701329422',
};

export const ZOU_2013: Citation = {
  text: 'Zou GY. Confidence interval estimation for limits of agreement using paired data. Stat Med. 2013;32(23):3985-4000.',
  url: 'https://doi.org/10.1002/sim.5735',
};

