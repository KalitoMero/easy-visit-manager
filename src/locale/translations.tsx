
import { create } from 'zustand';
import { Language } from '@/hooks/useLanguageStore';

export type TranslationKey = 
  'selfCheckInTitle' | 
  'groupCheckInTitle' | 
  'lastName' | 
  'firstName' | 
  'company' | 
  'contact' | 
  'privacyPolicyTitle' |
  'privacyPolicyIntro' |
  'acceptPolicy' |
  'continueToPolicy' |
  'backToHome' |
  'continueRegistration' |
  'scrollComplete' |
  'pleaseScrollToAccept' |
  'acceptAndContinue' |
  'registrationSuccessful' | 
  'yourVisitorNumber' |
  'pleaseNote' |
  'viewPrintableBadge' |
  'contactInfo' |
  'checkOutTitle' |
  'enterVisitorNumber' |
  'checkOut' |
  'checkOutSuccess' |
  'thankYou' |
  'visitAgain' |
  'orUse' |
  'groupCheckIn' |
  'additionalVisitors' |
  'addVisitor' |
  'removeVisitor' |
  'admin' |
  // Adding the missing translation keys below
  'policyCheckboxEnabled' |
  'visitorNotFound' |
  'visitorPolicy' |
  'scrollToBottom' |
  'back' |
  'numberRequired' |
  'invalidNumber' |
  'checkOutFailed' |
  'visitorCheckOut' |
  'visitorNumberLabel' |
  'checkOutButton' |
  'successfullyCheckedOut' |
  'safeJourney' |
  'selfCheckIn' |
  'pageNotFound' |
  'backToHomeButton';

type TranslationStore = {
  de: Record<TranslationKey, string>;
  en: Record<TranslationKey, string>;
};

const translations: TranslationStore = {
  de: {
    selfCheckInTitle: 'Besucheranmeldung',
    groupCheckInTitle: 'Gruppenanmeldung',
    lastName: 'Nachname',
    firstName: 'Vorname',
    company: 'Firma',
    contact: 'Kontaktperson',
    privacyPolicyTitle: 'Besucherrichtlinien',
    privacyPolicyIntro: 'Bitte lesen Sie unsere Besucherrichtlinien:',
    acceptPolicy: 'Ich akzeptiere die Besucherrichtlinien',
    continueToPolicy: 'Weiter zu den Richtlinien',
    backToHome: 'Zurück zur Startseite',
    continueRegistration: 'Anmeldung fortsetzen',
    scrollComplete: 'Sie haben die Richtlinien vollständig gelesen',
    pleaseScrollToAccept: 'Bitte lesen Sie die Richtlinien vollständig durch, um fortzufahren',
    acceptAndContinue: 'Akzeptieren und fortfahren',
    registrationSuccessful: 'Anmeldung erfolgreich!',
    yourVisitorNumber: 'Ihre Besuchernummer ist',
    pleaseNote: 'Bitte merken Sie sich diese Nummer für die Abmeldung',
    viewPrintableBadge: 'Besucherausweis anzeigen',
    contactInfo: 'Ihre Kontaktperson',
    checkOutTitle: 'Besucher abmelden',
    enterVisitorNumber: 'Geben Sie Ihre Besuchernummer ein',
    checkOut: 'Abmelden',
    checkOutSuccess: 'Abmeldung erfolgreich',
    thankYou: 'Vielen Dank für Ihren Besuch!',
    visitAgain: 'Wir freuen uns auf ein Wiedersehen',
    orUse: 'Oder nutzen Sie die',
    groupCheckIn: 'Gruppenanmeldung',
    additionalVisitors: 'Weitere Besucher',
    addVisitor: 'Besucher hinzufügen',
    removeVisitor: 'Entfernen',
    admin: 'Administration',
    // Adding the missing translations here
    policyCheckboxEnabled: 'Die Checkbox für die Richtlinien ist nun aktiv',
    visitorNotFound: 'Besucher nicht gefunden',
    visitorPolicy: 'Besucherrichtlinien',
    scrollToBottom: 'Bitte nach unten scrollen',
    back: 'Zurück',
    numberRequired: 'Besuchernummer erforderlich',
    invalidNumber: 'Ungültige Besuchernummer',
    checkOutFailed: 'Abmeldung fehlgeschlagen',
    visitorCheckOut: 'Besucher Abmelden',
    visitorNumberLabel: 'Besuchernummer',
    checkOutButton: 'Abmelden',
    successfullyCheckedOut: 'Erfolgreich abgemeldet',
    safeJourney: 'Gute Heimreise',
    selfCheckIn: 'Selbstanmeldung',
    pageNotFound: 'Seite nicht gefunden',
    backToHomeButton: 'Zurück zur Startseite'
  },
  en: {
    selfCheckInTitle: 'Visitor Check-In',
    groupCheckInTitle: 'Group Check-In',
    lastName: 'Last Name',
    firstName: 'First Name',
    company: 'Company',
    contact: 'Contact Person',
    privacyPolicyTitle: 'Visitor Policy',
    privacyPolicyIntro: 'Please read our visitor policy:',
    acceptPolicy: 'I accept the visitor policy',
    continueToPolicy: 'Continue to Policy',
    backToHome: 'Back to Home',
    continueRegistration: 'Continue Registration',
    scrollComplete: 'You have completely read the policy',
    pleaseScrollToAccept: 'Please read the entire policy to continue',
    acceptAndContinue: 'Accept and Continue',
    registrationSuccessful: 'Registration Successful!',
    yourVisitorNumber: 'Your visitor number is',
    pleaseNote: 'Please note this number for checkout',
    viewPrintableBadge: 'View Visitor Badge',
    contactInfo: 'Your contact person',
    checkOutTitle: 'Visitor Check-Out',
    enterVisitorNumber: 'Enter your visitor number',
    checkOut: 'Check Out',
    checkOutSuccess: 'Checkout Successful',
    thankYou: 'Thank you for your visit!',
    visitAgain: 'We look forward to seeing you again',
    orUse: 'Or use',
    groupCheckIn: 'group check-in',
    additionalVisitors: 'Additional Visitors',
    addVisitor: 'Add Visitor',
    removeVisitor: 'Remove',
    admin: 'Administration',
    // Adding the missing translations here
    policyCheckboxEnabled: 'The policy checkbox is now enabled',
    visitorNotFound: 'Visitor not found',
    visitorPolicy: 'Visitor Policy',
    scrollToBottom: 'Please scroll down',
    back: 'Back',
    numberRequired: 'Visitor number required',
    invalidNumber: 'Invalid visitor number',
    checkOutFailed: 'Check-out failed',
    visitorCheckOut: 'Visitor Check-Out',
    visitorNumberLabel: 'Visitor Number',
    checkOutButton: 'Check Out',
    successfullyCheckedOut: 'Successfully Checked Out',
    safeJourney: 'Safe journey',
    selfCheckIn: 'Self Check-In',
    pageNotFound: 'Page not found',
    backToHomeButton: 'Back to Home'
  }
};

export const useTranslation = (language: Language = 'de') => {
  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
  
  return t;
};
