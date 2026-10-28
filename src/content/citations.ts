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

export const PREISS_FISHER_2008: Citation = {
  text: 'Preiss D, Fisher J. A measure of confidence in Bland-Altman analysis for the interchangeability of two methods of measurement. J Clin Monit Comput. 2008;22(4):257-59.',
  url: 'https://doi.org/10.1007/s10877-008-9127-y',
};

export const WILKINSON_2023: Citation = {
  text: 'Wilkinson RD, Mazzo MR, Feeney DF. Rethinking the statistical analysis of neuromechanical data. Exerc Sport Sci Rev. 2023;51(1):43-50.',
  url: 'https://doi.org/10.1249/JES.0000000000000308',
};

export const ISO_80601_2_61: Citation = {
  text: 'International Organization for Standardization. ISO 80601-2-61:2019 Medical electrical equipment — Part 2-61: Particular requirements for basic safety and essential performance of pulse oximeter equipment. Geneva: ISO; 2019.',
  url: 'https://www.iso.org/standard/67963.html',
};

export const ISO_81060_2: Citation = {
  text: 'International Organization for Standardization. ISO 81060-2:2018/Amd 1:2020 Non-invasive sphygmomanometers — Part 2: Clinical investigation of intermittent automated measurement type. Geneva: ISO; 2020.',
  url: 'https://www.iso.org/standard/73339.html',
};


