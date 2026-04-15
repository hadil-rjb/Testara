export type AccountType = 'individual' | 'enterprise';
export type ThemePreference = 'light' | 'dark';
export type LanguagePreference = 'fr' | 'en';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  accountType: AccountType | string;
  onboardingCompleted: boolean;
  avatar?: string;
  themePreference: ThemePreference | string;
  languagePreference: LanguagePreference | string;
  isGoogleUser?: boolean;
  companyName?: string;
}
