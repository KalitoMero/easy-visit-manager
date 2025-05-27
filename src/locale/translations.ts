
export const translations = {
  de: {
    // Navigation
    firstName: "Vorname",
    lastName: "Nachname", 
    company: "Firma",
    contact: "Ansprechpartner",
    selfCheckIn: "Selbst anmelden",
    backToHome: "Zurück zur Startseite",
    continueToPolicy: "Weiter zu den Richtlinien",
    checkOut: "Abmelden",
    remove: "Entfernen",
    additionalVisitor: "Zusätzlicher Besucher",
    print: "Drucken",
    admin: "Admin",
    settings: "Einstellungen",
    visitors: "Besucher",
    activeVisitors: "Aktive Besucher",
    allVisitors: "Alle Besucher", 
    searchVisitors: "Besucher suchen",
    noVisitorsFound: "Keine Besucher gefunden",
    checkInSuccess: "Erfolgreich angemeldet",
    checkOutSuccess: "Erfolgreich abgemeldet",
    checkOutFailed: "Abmeldung fehlgeschlagen",
    
    // New keys for CheckInStep1
    error: "Fehler",
    success: "Erfolg", 
    visitor: "Besucher",
    checkIn: "Anmeldung",
    checkInDescription: "Bitte geben Sie Ihre Daten für die Anmeldung ein",
    addVisitor: "Besucher hinzufügen",
    mainVisitor: "Hauptbesucher",
    enterFirstName: "Vorname eingeben",
    enterLastName: "Nachname eingeben", 
    enterCompany: "Firma eingeben",
    enterContact: "Name des Ansprechpartners",
    processing: "Wird verarbeitet...",
    continue: "Weiter",
    
    // Additional keys from other components
    pageNotFound: "Seite nicht gefunden",
    backToHomeButton: "Zurück zur Startseite",
    successfullyCheckedOut: "Erfolgreich abgemeldet",
    thankYou: "Vielen Dank für Ihren Besuch!",
    safeJourney: "Wir wünschen Ihnen eine sichere Heimreise",
    visitorCheckOut: "Besucher-Abmeldung",
    enterVisitorNumber: "Bitte geben Sie Ihre Besuchernummer ein, um sich abzumelden.",
    visitorNumberLabel: "Besuchernummer",
    checkOutButton: "Abmelden",
    numberRequired: "Nummer erforderlich",
    invalidNumber: "Ungültige Nummer",
    visitorNotFound: "Besucher nicht gefunden",
    visitorPolicy: "Besucherrichtlinien",
    scrollToBottom: "Bitte scrollen Sie nach unten",
    scrollComplete: "Scrollen abgeschlossen",
    acceptAndContinue: "Akzeptieren und fortfahren",
    back: "Zurück",
    registrationSuccessful: "Anmeldung erfolgreich"
  },
  en: {
    // Navigation
    firstName: "First Name",
    lastName: "Last Name",
    company: "Company", 
    contact: "Contact Person",
    selfCheckIn: "Self Check-In",
    backToHome: "Back to Home",
    continueToPolicy: "Continue to Policy",
    checkOut: "Check Out",
    remove: "Remove",
    additionalVisitor: "Additional Visitor",
    print: "Print",
    admin: "Admin",
    settings: "Settings",
    visitors: "Visitors",
    activeVisitors: "Active Visitors",
    allVisitors: "All Visitors",
    searchVisitors: "Search Visitors", 
    noVisitorsFound: "No visitors found",
    checkInSuccess: "Successfully checked in",
    checkOutSuccess: "Successfully checked out",
    checkOutFailed: "Check-out failed",
    
    // New keys for CheckInStep1
    error: "Error",
    success: "Success",
    visitor: "Visitor", 
    checkIn: "Check-In",
    checkInDescription: "Please enter your details for check-in",
    addVisitor: "Add Visitor",
    mainVisitor: "Main Visitor",
    enterFirstName: "Enter first name",
    enterLastName: "Enter last name",
    enterCompany: "Enter company",
    enterContact: "Contact person name", 
    processing: "Processing...",
    continue: "Continue",
    
    // Additional keys from other components
    pageNotFound: "Page not found",
    backToHomeButton: "Back to Home",
    successfullyCheckedOut: "Successfully checked out",
    thankYou: "Thank you for your visit!",
    safeJourney: "We wish you a safe journey home",
    visitorCheckOut: "Visitor Check-Out",
    enterVisitorNumber: "Please enter your visitor number to check out.",
    visitorNumberLabel: "Visitor Number",
    checkOutButton: "Check Out",
    numberRequired: "Number required",
    invalidNumber: "Invalid number",
    visitorNotFound: "Visitor not found",
    visitorPolicy: "Visitor Policy",
    scrollToBottom: "Please scroll to the bottom",
    scrollComplete: "Scroll complete",
    acceptAndContinue: "Accept and Continue",
    back: "Back",
    registrationSuccessful: "Registration Successful"
  }
};

export type Language = 'de' | 'en';

// Default export: useTranslation hook
const useTranslation = (language: Language) => {
  return (key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  };
};

export default useTranslation;
