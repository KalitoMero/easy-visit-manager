
import React from 'react';

export type TranslationKey = 
  // General
  | 'title'
  | 'welcome'
  | 'back'
  | 'next'
  | 'cancel'
  | 'save'
  | 'delete'
  | 'edit'
  | 'close'
  | 'loading'
  | 'add'
  | 'admin'
  | 'selfCheckIn'
  | 'acceptAndContinue'
  | 'print'
  | 'viewPrintableBadge'
  | 'badgePrintPreview'
  
  // Form fields
  | 'fullName'
  | 'email'
  | 'phone'
  | 'company'
  | 'message'
  | 'contactPerson'
  | 'reason'
  | 'visitorNumber'
  | 'date'
  | 'time'
  | 'submit'
  | 'name'
  | 'additionalVisitor'
  | 'contact'

  // Registration-related
  | 'checkIn'
  | 'checkOut'
  | 'checkInDetails'
  | 'checkOutDetails'
  | 'yourVisitorNumber'
  | 'contactInfo'
  | 'pleaseNote'
  | 'registrationSuccessful'
  | 'visitorNotFound'
  | 'requiredField'
  | 'invalidEmail'
  | 'invalidPhone'
  | 'nameRequired'
  | 'companyRequired'
  | 'contactRequired'
  | 'visitorNumberRequired'
  | 'backToHome'
  | 'scrollComplete'
  | 'policyCheckboxEnabled'
  | 'scrollToBottom'
  | 'visitorRegistration'
  | 'enterVisitorNumber'
  | 'visitorNumberLabel'
  | 'checkOutButton'
  | 'successfullyCheckedOut'
  | 'thankYou'
  | 'safeJourney'
  | 'pageNotFound'
  | 'backToHomeButton'
  | 'numberRequired'
  | 'invalidNumber'
  | 'checkOutFailed'

  // Policy-related
  | 'visitorPolicy'
  | 'acceptPolicy'
  | 'policyRequired'

  // Visitor management
  | 'activeVisitors'
  | 'recentVisitors'
  | 'visitorHistory'
  | 'addVisitor'
  | 'editVisitor'
  | 'deleteVisitor'
  | 'deleteVisitorConfirm'
  | 'noVisitors'
  | 'visitorDetails'
  | 'allVisitors'
  | 'searchVisitor'

  // Success/Error messages
  | 'operationSuccessful'
  | 'operationFailed'
  | 'addedSuccessfully'
  | 'updatedSuccessfully'
  | 'deletedSuccessfully'
  | 'checkInSuccessful'
  | 'checkOutSuccessful'
  | 'errorOccurred'
  | 'tryAgain'
  
  // Admin-related
  | 'dashboard'
  | 'settings'
  | 'users'
  | 'logs'
  | 'system'
  | 'login'
  | 'logout'
  | 'password'
  | 'forgotPassword'
  | 'resetPassword'
  | 'statistics';

const translations: { [key in 'de' | 'en']: Record<TranslationKey, string> } = {
  de: {
    title: 'Besucherverwaltungssystem',
    welcome: 'Willkommen',
    back: 'Zurück',
    next: 'Weiter',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    loading: 'Laden...',
    add: 'Hinzufügen',
    admin: 'Administration',
    selfCheckIn: 'Selbstanmeldung',
    acceptAndContinue: 'Akzeptieren & Weiter',
    print: 'Drucken',
    viewPrintableBadge: 'Besucherausweis anzeigen',
    badgePrintPreview: 'Druckvorschau Besucherausweis',
    
    // Form fields
    fullName: 'Vollständiger Name',
    email: 'E-Mail',
    phone: 'Telefon',
    company: 'Firma',
    message: 'Nachricht',
    contactPerson: 'Ansprechpartner',
    reason: 'Grund des Besuchs',
    visitorNumber: 'Besuchernummer',
    date: 'Datum',
    time: 'Uhrzeit',
    submit: 'Absenden',
    name: 'Name',
    additionalVisitor: 'Zusätzlicher Besucher',
    contact: 'Ansprechpartner',

    // Registration-related
    checkIn: 'Anmelden',
    checkOut: 'Abmelden',
    checkInDetails: 'Anmeldedetails',
    checkOutDetails: 'Abmeldedetails',
    yourVisitorNumber: 'Ihre Besuchernummer',
    contactInfo: 'Ihr Ansprechpartner',
    pleaseNote: 'Bitte notieren Sie sich Ihre Besuchernummer für den Check-out',
    registrationSuccessful: 'Anmeldung erfolgreich',
    visitorNotFound: 'Besucher nicht gefunden',
    requiredField: 'Pflichtfeld',
    invalidEmail: 'Ungültige E-Mail',
    invalidPhone: 'Ungültige Telefonnummer',
    nameRequired: 'Name ist erforderlich',
    companyRequired: 'Firma ist erforderlich',
    contactRequired: 'Ansprechpartner ist erforderlich',
    visitorNumberRequired: 'Besuchernummer ist erforderlich',
    backToHome: 'Zurück zur Startseite',
    scrollComplete: 'Scrollen abgeschlossen',
    policyCheckboxEnabled: 'Sie können nun fortfahren',
    scrollToBottom: 'Bitte scrollen Sie zum Ende',
    visitorRegistration: 'Besucheranmeldung',
    enterVisitorNumber: 'Geben Sie Ihre Besuchernummer ein',
    visitorNumberLabel: 'Besuchernummer',
    checkOutButton: 'Abmelden',
    successfullyCheckedOut: 'Erfolgreich abgemeldet',
    thankYou: 'Vielen Dank für Ihren Besuch',
    safeJourney: 'Wir wünschen Ihnen eine gute Heimreise',
    pageNotFound: 'Seite nicht gefunden',
    backToHomeButton: 'Zurück zur Startseite',
    numberRequired: 'Nummer ist erforderlich',
    invalidNumber: 'Ungültige Nummer',
    checkOutFailed: 'Abmeldung fehlgeschlagen',

    // Policy-related
    visitorPolicy: 'Besucherrichtlinie',
    acceptPolicy: 'Ich akzeptiere die Besucherrichtlinie',
    policyRequired: 'Bitte akzeptieren Sie die Besucherrichtlinie',

    // Visitor management
    activeVisitors: 'Aktive Besucher',
    recentVisitors: 'Aktuelle Besucher',
    visitorHistory: 'Besucherhistorie',
    addVisitor: 'Besucher hinzufügen',
    editVisitor: 'Besucher bearbeiten',
    deleteVisitor: 'Besucher löschen',
    deleteVisitorConfirm: 'Sind Sie sicher, dass Sie diesen Besucher löschen möchten?',
    noVisitors: 'Keine Besucher gefunden',
    visitorDetails: 'Besucherdetails',
    allVisitors: 'Alle Besucher',
    searchVisitor: 'Besucher suchen',

    // Success/Error messages
    operationSuccessful: 'Vorgang erfolgreich',
    operationFailed: 'Vorgang fehlgeschlagen',
    addedSuccessfully: 'Erfolgreich hinzugefügt',
    updatedSuccessfully: 'Erfolgreich aktualisiert',
    deletedSuccessfully: 'Erfolgreich gelöscht',
    checkInSuccessful: 'Anmeldung erfolgreich',
    checkOutSuccessful: 'Abmeldung erfolgreich',
    errorOccurred: 'Ein Fehler ist aufgetreten',
    tryAgain: 'Bitte versuchen Sie es erneut',
    
    // Admin-related
    dashboard: 'Dashboard',
    settings: 'Einstellungen',
    users: 'Benutzer',
    logs: 'Protokolle',
    system: 'System',
    login: 'Anmelden',
    logout: 'Abmelden',
    password: 'Passwort',
    forgotPassword: 'Passwort vergessen',
    resetPassword: 'Passwort zurücksetzen',
    statistics: 'Statistiken',
  },
  en: {
    title: 'Visitor Management System',
    welcome: 'Welcome',
    back: 'Back',
    next: 'Next',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    add: 'Add',
    admin: 'Administration',
    selfCheckIn: 'Self Check-In',
    acceptAndContinue: 'Accept & Next',
    print: 'Print',
    viewPrintableBadge: 'View Visitor Badge',
    badgePrintPreview: 'Visitor Badge Preview',
    
    // Form fields
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    message: 'Message',
    contactPerson: 'Contact Person',
    reason: 'Reason for Visit',
    visitorNumber: 'Visitor Number',
    date: 'Date',
    time: 'Time',
    submit: 'Submit',
    name: 'Name',
    additionalVisitor: 'Additional Visitor',
    contact: 'Contact Person',

    // Registration-related
    checkIn: 'Check In',
    checkOut: 'Check Out',
    checkInDetails: 'Check-In Details',
    checkOutDetails: 'Check-Out Details',
    yourVisitorNumber: 'Your Visitor Number',
    contactInfo: 'Your contact person',
    pleaseNote: 'Please note your visitor number for check-out',
    registrationSuccessful: 'Registration Successful',
    visitorNotFound: 'Visitor not found',
    requiredField: 'Required field',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone number',
    nameRequired: 'Name is required',
    companyRequired: 'Company is required',
    contactRequired: 'Contact person is required',
    visitorNumberRequired: 'Visitor number is required',
    backToHome: 'Back to Home',
    scrollComplete: 'Scroll complete',
    policyCheckboxEnabled: 'You can now proceed',
    scrollToBottom: 'Please scroll to the bottom',
    visitorRegistration: 'Visitor Registration',
    enterVisitorNumber: 'Enter your visitor number',
    visitorNumberLabel: 'Visitor Number',
    checkOutButton: 'Check Out',
    successfullyCheckedOut: 'Successfully checked out',
    thankYou: 'Thank you for your visit',
    safeJourney: 'We wish you a safe journey',
    pageNotFound: 'Page not found',
    backToHomeButton: 'Back to home',
    numberRequired: 'Number is required',
    invalidNumber: 'Invalid number',
    checkOutFailed: 'Check-out failed',

    // Policy-related
    visitorPolicy: 'Visitor Policy',
    acceptPolicy: 'I accept the visitor policy',
    policyRequired: 'Please accept the visitor policy',

    // Visitor management
    activeVisitors: 'Active Visitors',
    recentVisitors: 'Recent Visitors',
    visitorHistory: 'Visitor History',
    addVisitor: 'Add Visitor',
    editVisitor: 'Edit Visitor',
    deleteVisitor: 'Delete Visitor',
    deleteVisitorConfirm: 'Are you sure you want to delete this visitor?',
    noVisitors: 'No visitors found',
    visitorDetails: 'Visitor Details',
    allVisitors: 'All Visitors',
    searchVisitor: 'Search Visitor',

    // Success/Error messages
    operationSuccessful: 'Operation successful',
    operationFailed: 'Operation failed',
    addedSuccessfully: 'Added successfully',
    updatedSuccessfully: 'Updated successfully',
    deletedSuccessfully: 'Deleted successfully',
    checkInSuccessful: 'Check-in successful',
    checkOutSuccessful: 'Check-out successful',
    errorOccurred: 'An error occurred',
    tryAgain: 'Please try again',
    
    // Admin-related
    dashboard: 'Dashboard',
    settings: 'Settings',
    users: 'Users',
    logs: 'Logs',
    system: 'System',
    login: 'Login',
    logout: 'Logout',
    password: 'Password',
    forgotPassword: 'Forgot Password',
    resetPassword: 'Reset Password',
    statistics: 'Statistics',
  }
};

export const useTranslation = (language: 'de' | 'en') => {
  return (key: TranslationKey) => translations[language][key];
};
