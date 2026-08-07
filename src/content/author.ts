/**
 * Single source of truth for author attribution.
 *
 * Bio claims are stated in the past tense and kept to what is independently
 * verifiable from the publication record and the author's own account. Nothing
 * here is inferred or embellished — if a detail is not confirmed, it does not
 * appear.
 */
export const AUTHOR = {
  name: 'Ross D. Wilkinson, PhD',
  scholarUrl: 'https://scholar.google.com/citations?user=y39yme4AAAAJ&hl=en',
  shortBio:
    'Research scientist turned software developer. Spent three and a half years as a Research Scientist at Google, running measurement-validation studies for Pixel Watch, including work supporting two FDA submissions.',
  credentialLine:
    'The methods in this toolkit come from working notebooks written for real validation studies, not from a textbook exercise.',
} as const;
