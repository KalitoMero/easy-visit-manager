// Define all translatable keys to ensure type safety
export type TranslationKey = 
  // Common UI elements
  | 'checkIn'
  | 'checkOut' 
  | 'next'
  | 'back'
  | 'submit'
  | 'cancel'
  | 'confirm'
  | 'errorOccurred'
  | 'backToHome'
  | 'backToHomeButton'
  
  // Form fields
  | 'fullName'
  | 'name'
  | 'company'
  | 'contactPerson'
  | 'badgeNumber'
  | 'phoneNumber'
  | 'email'
  | 'visitorNumber'
  
  // Form labels & descriptions
  | 'formTitle'
  | 'formDescription'
  | 'enterYourDetails'
  | 'enterYourBadge'
  | 'policyAgreement'
  | 'policyTitle'
  | 'badgeHelpText'
  | 'requiredField'
  | 'checkInCompleteTitle'
  | 'checkInCompleteMessage'
  | 'yourVisitorPass'
  | 'checkOutPrompt'
  
  // Validation messages
  | 'nameRequired'
  | 'companyRequired'
  | 'contactRequired'
  | 'badgeNumberRequired'
  | 'badgeNumberInvalid'
  | 'agreementRequired'
  
  // Success messages
  | 'successfullyCheckedIn'
  | 'successfullyCheckedOut'
  | 'thankYou'
  | 'safeJourney'
  
  // Error messages
  | 'visitorNotFound'
  | 'pageNotFound'
  | 'invalidBadgeError'
  
  // Other
  | 'welcomeMessage';

// Define translations
export const translations = {
  de: {
    // Common UI elements
    checkIn: 'Anmelden',
    checkOut: 'Abmelden',
    next: 'Weiter',
    back: 'Zurück',
    submit: 'Absenden',
    cancel: 'Abbrechen',
    confirm: 'Bestätigen',
    errorOccurred: 'Ein Fehler ist aufgetreten',
    backToHome: 'Zurück zur Startseite',
    backToHomeButton: 'Zurück zur Startseite',
    
    // Form fields
    fullName: 'Vollständiger Name',
    name: 'Name',
    company: 'Firma',
    contactPerson: 'Ansprechpartner',
    badgeNumber: 'Besuchernummer',
    phoneNumber: 'Telefonnummer',
    email: 'E-Mail',
    visitorNumber: 'Besuchernummer',
    
    // Form labels & descriptions
    formTitle: 'Besucheranmeldung',
    formDescription: 'Bitte füllen Sie alle Felder aus, um sich anzumelden',
    enterYourDetails: 'Geben Sie Ihre Daten ein',
    enterYourBadge: 'Geben Sie Ihre Besuchernummer ein',
    policyAgreement: 'Ich habe die Besucherrichtlinien gelesen und akzeptiere sie',
    policyTitle: 'Besucherrichtlinien',
    badgeHelpText: 'Die Besuchernummer finden Sie auf Ihrem Besucherausweis',
    requiredField: 'Pflichtfeld',
    checkInCompleteTitle: 'Anmeldung abgeschlossen',
    checkInCompleteMessage: 'Sie wurden erfolgreich angemeldet',
    yourVisitorPass: 'Ihr Besucherausweis',
    checkOutPrompt: 'Geben Sie Ihre Besuchernummer ein, um sich abzumelden',
    
    // Validation messages
    nameRequired: 'Bitte geben Sie Ihren Namen ein',
    companyRequired: 'Bitte geben Sie Ihre Firma ein',
    contactRequired: 'Bitte geben Sie Ihren Ansprechpartner ein',
    badgeNumberRequired: 'Bitte geben Sie Ihre Besuchernummer ein',
    badgeNumberInvalid: 'Ungültige Besuchernummer',
    agreementRequired: 'Sie müssen den Richtlinien zustimmen, um fortzufahren',
    
    // Success messages
    successfullyCheckedIn: 'Erfolgreich angemeldet',
    successfullyCheckedOut: 'Erfolgreich abgemeldet',
    thankYou: 'Vielen Dank für Ihren Besuch',
    safeJourney: 'Gute Heimreise!',
    
    // Error messages
    visitorNotFound: 'Besucher nicht gefunden',
    pageNotFound: 'Seite nicht gefunden',
    invalidBadgeError: 'Ungültige Besuchernummer',
    
    // Other
    welcomeMessage: 'Willkommen bei unserem Besuchermanagementsystem',
  },
  en: {
    // Common UI elements
    checkIn: 'Check In',
    checkOut: 'Check Out',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    cancel: 'Cancel',
    confirm: 'Confirm',
    errorOccurred: 'An error occurred',
    backToHome: 'Back to Home',
    backToHomeButton: 'Back to Home',
    
    // Form fields
    fullName: 'Full Name',
    name: 'Name',
    company: 'Company',
    contactPerson: 'Contact Person',
    badgeNumber: 'Visitor Number',
    phoneNumber: 'Phone Number',
    email: 'Email',
    visitorNumber: 'Visitor Number',
    
    // Form labels & descriptions
    formTitle: 'Visitor Registration',
    formDescription: 'Please fill in all fields to register',
    enterYourDetails: 'Enter your details',
    enterYourBadge: 'Enter your visitor number',
    policyAgreement: 'I have read and accept the visitor policy',
    policyTitle: 'Visitor Policy',
    badgeHelpText: 'You can find the visitor number on your visitor badge',
    requiredField: 'Required field',
    checkInCompleteTitle: 'Check-in Complete',
    checkInCompleteMessage: 'You have been successfully registered',
    yourVisitorPass: 'Your Visitor Pass',
    checkOutPrompt: 'Enter your visitor number to check out',
    
    // Validation messages
    nameRequired: 'Please enter your name',
    companyRequired: 'Please enter your company',
    contactRequired: 'Please enter your contact person',
    badgeNumberRequired: 'Please enter your visitor number',
    badgeNumberInvalid: 'Invalid visitor number',
    agreementRequired: 'You must agree to the policy to proceed',
    
    // Success messages
    successfullyCheckedIn: 'Successfully Checked In',
    successfullyCheckedOut: 'Successfully Checked Out',
    thankYou: 'Thank you for your visit',
    safeJourney: 'Have a safe journey!',
    
    // Error messages
    visitorNotFound: 'Visitor not found',
    pageNotFound: 'Page not found',
    invalidBadgeError: 'Invalid visitor number',
    
    // Other
    welcomeMessage: 'Welcome to our Visitor Management System',
  }
};

export function useTranslation(language: 'de' | 'en') {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
}
