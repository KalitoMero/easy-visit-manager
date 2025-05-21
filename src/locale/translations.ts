
import { Language } from '@/hooks/useLanguageStore';

const translations = {
  en: {
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
    selfCheckInTitle: "Self Check-In",
    admin: "Admin",
    pageNotFound: "Page not found",
    backToHomeButton: "Back to Home",
    visitorNotFound: "Visitor not found",
    registrationSuccessful: "Registration Successful",
    scrollComplete: "Scroll Complete",
    scrollToBottom: "Scroll to bottom to continue",
    back: "Back",
    visitorPolicy: "Visitor Policy",
    acceptAndContinue: "Accept and Continue",
    successfullyCheckedOut: "Successfully Checked Out",
    thankYou: "Thank you for your visit!",
    safeJourney: "We wish you a safe journey home.",
    visitorCheckOut: "Visitor Check-Out",
    enterVisitorNumber: "Please enter your visitor number to check out.",
    visitorNumberLabel: "Visitor Number",
    checkOutButton: "Check Out",
    numberRequired: "Visitor number is required",
    invalidNumber: "Invalid visitor number",
    checkOutFailed: "Check-out failed. Visitor not found.",
  },
  de: {
    firstName: "Vorname",
    lastName: "Nachname",
    company: "Firma",
    contact: "Kontaktperson",
    selfCheckIn: "Selbst Anmelden",
    backToHome: "Zurück zur Startseite",
    continueToPolicy: "Weiter zur Richtlinie",
    checkOut: "Abmelden",
    remove: "Entfernen",
    additionalVisitor: "Zusätzlicher Besucher",
    selfCheckInTitle: "Self Check-In",
    admin: "Admin",
    pageNotFound: "Seite nicht gefunden",
    backToHomeButton: "Zurück zur Startseite",
    visitorNotFound: "Besucher nicht gefunden",
    registrationSuccessful: "Registrierung erfolgreich",
    scrollComplete: "Scrollen abgeschlossen",
    scrollToBottom: "Zum Fortfahren nach unten scrollen",
    back: "Zurück",
    visitorPolicy: "Besucherrichtlinie",
    acceptAndContinue: "Akzeptieren und Fortfahren",
    successfullyCheckedOut: "Erfolgreich abgemeldet",
    thankYou: "Vielen Dank für Ihren Besuch!",
    safeJourney: "Wir wünschen Ihnen eine gute Heimreise.",
    visitorCheckOut: "Besucher-Abmeldung",
    enterVisitorNumber: "Bitte geben Sie Ihre Besuchernummer ein, um sich abzumelden.",
    visitorNumberLabel: "Besuchernummer",
    checkOutButton: "Abmelden",
    numberRequired: "Besuchernummer ist erforderlich",
    invalidNumber: "Ungültige Besuchernummer",
    checkOutFailed: "Abmeldung fehlgeschlagen. Besucher nicht gefunden.",
  }
};

// Create and export useTranslation as default export
const useTranslation = (language: Language) => {
  return (key: keyof typeof translations.en) => {
    return translations[language]?.[key] || key;
  };
};

export default useTranslation;

// Also export translations for reference
export { translations };
