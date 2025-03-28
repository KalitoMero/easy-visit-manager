
import { Language } from "@/hooks/useLanguageStore";

// Typdefinition für Übersetzungen
export type TranslationKey = 
  // Index Seite
  | 'welcome'
  | 'welcomeMessage'
  | 'selfCheckIn'
  | 'checkOut'
  | 'admin'
  
  // Check-In Seite
  | 'visitorRegistration'
  | 'fullName'
  | 'company'
  | 'contact'
  | 'next'
  
  // Check-In Seite 2
  | 'visitorPolicy'
  | 'acceptPolicy'
  
  // Check-In Seite 3
  | 'registrationSuccessful'
  | 'yourVisitorNumber'
  | 'pleaseNote'
  | 'contactInfo'
  | 'backToHome'
  
  // Check-Out Seite
  | 'visitorCheckOut'
  | 'enterVisitorNumber'
  | 'visitorNumberLabel'
  | 'checkOutButton'
  
  // Check-Out Success
  | 'successfullyCheckedOut'
  | 'thankYou'
  | 'safeJourney'
  
  // Fehler
  | 'nameRequired'
  | 'companyRequired'
  | 'contactRequired'
  | 'policyRequired'
  | 'numberRequired'
  | 'invalidNumber'
  | 'checkOutFailed'
  
  // NotFound
  | 'pageNotFound'
  | 'backToHomeButton';

// Übersetzungsdaten
export const translations: Record<Language, Record<TranslationKey, string>> = {
  de: {
    // Index Seite
    welcome: 'Willkommen bei der Firma Leuka',
    welcomeMessage: 'Bitte nutzen Sie diese Besucheranmeldung, um sich selbstständig an- oder abzumelden. Bei Fragen wenden Sie sich bitte an die Rezeption.',
    selfCheckIn: 'Selbstständig anmelden',
    checkOut: 'Besuch abmelden',
    admin: 'Admin',
    
    // Check-In Seite
    visitorRegistration: 'Besucheranmeldung',
    fullName: 'Ihr vollständiger Name',
    company: 'Ihre Firma',
    contact: 'Ihr Ansprechpartner',
    next: 'Weiter',
    
    // Check-In Seite 2
    visitorPolicy: 'Besucherrichtlinie',
    acceptPolicy: 'Ich habe die Besucherrichtlinie gelesen und akzeptiere sie',
    
    // Check-In Seite 3
    registrationSuccessful: 'Anmeldung erfolgreich',
    yourVisitorNumber: 'Ihre Besuchernummer lautet:',
    pleaseNote: 'Bitte notieren Sie diese Nummer, um sich später abmelden zu können.',
    contactInfo: 'Ihr Ansprechpartner',
    backToHome: 'Zurück zur Startseite',
    
    // Check-Out Seite
    visitorCheckOut: 'Besucherabmeldung',
    enterVisitorNumber: 'Bitte geben Sie Ihre Besuchernummer ein, um sich abzumelden.',
    visitorNumberLabel: 'Besuchernummer',
    checkOutButton: 'Abmelden',
    
    // Check-Out Success
    successfullyCheckedOut: 'Erfolgreich abgemeldet',
    thankYou: 'Danke für Ihren Besuch bei der Leuka GmbH.',
    safeJourney: 'Wir wünschen Ihnen eine gute Heimreise!',
    
    // Fehler
    nameRequired: 'Bitte geben Sie Ihren Namen ein',
    companyRequired: 'Bitte geben Sie Ihre Firma ein',
    contactRequired: 'Bitte geben Sie Ihren Ansprechpartner ein',
    policyRequired: 'Um fortzufahren, müssen Sie die Besucherrichtlinien akzeptieren',
    numberRequired: 'Die Besuchernummer ist erforderlich',
    invalidNumber: 'Bitte geben Sie eine gültige Nummer ein',
    checkOutFailed: 'Die angegebene Besuchernummer wurde nicht gefunden oder ist bereits abgemeldet',
    
    // NotFound
    pageNotFound: 'Die angeforderte Seite wurde nicht gefunden',
    backToHomeButton: 'Zurück zur Startseite'
  },
  en: {
    // Index Page
    welcome: 'Welcome to Leuka Company',
    welcomeMessage: 'Please use this visitor registration to check in or check out independently. If you have any questions, please contact the reception.',
    selfCheckIn: 'Self Check-in',
    checkOut: 'Check-out',
    admin: 'Admin',
    
    // Check-In Page
    visitorRegistration: 'Visitor Registration',
    fullName: 'Your full name',
    company: 'Your company',
    contact: 'Your contact person',
    next: 'Next',
    
    // Check-In Page 2
    visitorPolicy: 'Visitor Policy',
    acceptPolicy: 'I have read and accept the visitor policy',
    
    // Check-In Page 3
    registrationSuccessful: 'Registration Successful',
    yourVisitorNumber: 'Your visitor number is:',
    pleaseNote: 'Please note this number to check out later.',
    contactInfo: 'Your contact person',
    backToHome: 'Back to Home',
    
    // Check-Out Page
    visitorCheckOut: 'Visitor Check-out',
    enterVisitorNumber: 'Please enter your visitor number to check out.',
    visitorNumberLabel: 'Visitor number',
    checkOutButton: 'Check out',
    
    // Check-Out Success
    successfullyCheckedOut: 'Successfully Checked Out',
    thankYou: 'Thank you for your visit to Leuka GmbH.',
    safeJourney: 'We wish you a safe journey home!',
    
    // Errors
    nameRequired: 'Please enter your name',
    companyRequired: 'Please enter your company',
    contactRequired: 'Please enter your contact person',
    policyRequired: 'To continue, you must accept the visitor policy',
    numberRequired: 'Visitor number is required',
    invalidNumber: 'Please enter a valid number',
    checkOutFailed: 'The specified visitor number was not found or is already checked out',
    
    // NotFound
    pageNotFound: 'The requested page was not found',
    backToHomeButton: 'Back to Home'
  }
};

// Hook für Übersetzungen
export const useTranslation = (language: Language) => {
  return (key: TranslationKey): string => {
    return translations[language][key];
  };
};
