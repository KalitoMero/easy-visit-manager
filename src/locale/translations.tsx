import { useMemo } from 'react';
import { useLanguageStore, Language } from '@/hooks/useLanguageStore';
import { create } from 'zustand';

// Define the translation keys
export type TranslationKey =
  'selfCheckInTitle' |
  'lastName' |
  'company' |
  'contact' |
  'continueToPolicy' |
  'orUse' |
  'groupCheckIn' |
  'backToHome' |
  'policyTitle' |
  'policyDescription' |
  'policyAccept' |
  'continueToSummary' |
  'visitorSummaryTitle' |
  'visitorDetails' |
  'visitorBadge' |
  'printBadge' |
  'visitorName' |
  'visitDate' |
  'visitTime' |
  'backToStart' |
  'checkOutTitle' |
  'enterVisitorNumber' |
  'enterVisitorNumberDescription' |
  'checkOut' |
  'thankYouTitle' |
  'thankYouDescription' |
  'backToHomePage' |
  'additionalVisitor' |
  'additionalVisitors' |
  'addVisitor' |
  'removeVisitor' |
  'admin' |
  // Added translation keys
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
  'backToHomeButton' |
  // Adding newly missing translations
  'scrollComplete' |
  'acceptAndContinue' |
  'registrationSuccessful' |
  'yourVisitorNumber' |
  'pleaseNote' |
  'contactInfo' |
  'viewPrintableBadge' |
  'thankYou';

type TranslationStore = {
  de: Record<TranslationKey, string>;
  en: Record<TranslationKey, string>;
};

export const translations: TranslationStore = {
  de: {
    selfCheckInTitle: 'Besucher-Anmeldung',
    lastName: 'Nachname',
    company: 'Firma',
    contact: 'Ansprechpartner',
    continueToPolicy: 'Weiter zur Richtlinie',
    orUse: 'oder nutze',
    groupCheckIn: 'Gruppenanmeldung',
    backToHome: 'Zurück zur Startseite',
    policyTitle: 'Besucherrichtlinie',
    policyDescription: 'Bitte lesen Sie die folgende Richtlinie sorgfältig durch und akzeptieren Sie diese.',
    policyAccept: 'Ich akzeptiere die Besucherrichtlinie',
    continueToSummary: 'Akzeptieren und Fortfahren',
    visitorSummaryTitle: 'Anmeldung abgeschlossen',
    visitorDetails: 'Besucherdetails',
    visitorBadge: 'Besucherausweis',
    printBadge: 'Ausweis drucken',
    visitorName: 'Name',
    visitDate: 'Besuchsdatum',
    visitTime: 'Besuchszeit',
    backToStart: 'Zurück zur Startseite',
    checkOutTitle: 'Besucher Abmeldung',
    enterVisitorNumber: 'Besuchernummer eingeben',
    enterVisitorNumberDescription: 'Bitte geben Sie Ihre Besuchernummer ein, um sich abzumelden',
    checkOut: 'Abmelden',
    thankYouTitle: 'Vielen Dank für Ihren Besuch',
    thankYouDescription: 'Sie wurden erfolgreich abgemeldet',
    backToHomePage: 'Zurück zur Startseite',
    additionalVisitor: 'Zusätzlicher Besucher',
    additionalVisitors: 'Weitere Besucher',
    addVisitor: 'Besucher hinzufügen',
    removeVisitor: 'Entfernen',
    admin: 'Administration',
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
    backToHomeButton: 'Zurück zur Startseite',
    scrollComplete: 'Scrollen abgeschlossen',
    acceptAndContinue: 'Akzeptieren und Fortfahren',
    registrationSuccessful: 'Anmeldung erfolgreich',
    yourVisitorNumber: 'Ihre Besuchernummer',
    pleaseNote: 'Ihre Besuchernummer lautet:',
    contactInfo: 'Wir informieren Ihren Ansprechpartner',
    viewPrintableBadge: 'Ausweis anzeigen und drucken',
    thankYou: 'Vielen Dank für Ihren Besuch'
  },
  en: {
    selfCheckInTitle: 'Visitor Check-In',
    lastName: 'Last name',
    company: 'Company',
    contact: 'Contact person',
    continueToPolicy: 'Continue to Policy',
    orUse: 'or use',
    groupCheckIn: 'Group Check-in',
    backToHome: 'Back to Home',
    policyTitle: 'Visitor Policy',
    policyDescription: 'Please read and accept the following policy.',
    policyAccept: 'I accept the visitor policy',
    continueToSummary: 'Accept and Continue',
    visitorSummaryTitle: 'Check-in Complete',
    visitorDetails: 'Visitor Details',
    visitorBadge: 'Visitor Badge',
    printBadge: 'Print Badge',
    visitorName: 'Name',
    visitDate: 'Visit Date',
    visitTime: 'Visit Time',
    backToStart: 'Back to Start',
    checkOutTitle: 'Visitor Check-out',
    enterVisitorNumber: 'Enter Visitor Number',
    enterVisitorNumberDescription: 'Please enter your visitor number to check out',
    checkOut: 'Check Out',
    thankYouTitle: 'Thank you for your visit',
    thankYouDescription: 'You have been successfully checked out',
    backToHomePage: 'Back to Home Page',
    additionalVisitor: 'Additional Visitor',
    additionalVisitors: 'Additional Visitors',
    addVisitor: 'Add Visitor',
    removeVisitor: 'Remove',
    admin: 'Administration',
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
    backToHomeButton: 'Back to Home',
    scrollComplete: 'Scrolling complete',
    acceptAndContinue: 'Accept and Continue',
    registrationSuccessful: 'Registration Successful',
    yourVisitorNumber: 'Your visitor number',
    pleaseNote: 'Your visitor number is:',
    contactInfo: 'We will inform your contact person',
    viewPrintableBadge: 'View and print badge',
    thankYou: 'Thank you for your visit'
  }
};

// Translation hook
export const useTranslation = (language: Language = 'de') => {
  const translation = useMemo(() => translations[language], [language]);

  return (key: TranslationKey) => {
    return translation[key] || `Missing translation for ${key} in ${language}`;
  };
};
