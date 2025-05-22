
/**
 * Generates a mailto: URL with pre-populated fields for visitor checkout
 */
export function generateCheckoutEmailUrl(visitorNumber: number): string {
  const recipient = "besucher@leuka.de";
  const subject = encodeURIComponent("Abmeldung");
  const body = encodeURIComponent(`Guten Tag, der Besucher mit der Nummer ${visitorNumber} verlässt soeben das Haus.`);
  
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

/**
 * Generates a QR code as a data URL using the qrcode library
 */
export async function generateQRCodeDataUrl(data: string, size: number = 140): Promise<string> {
  try {
    // Dynamisch die QRCode-Bibliothek importieren
    const QRCode = await import('qrcode');
    
    // QR-Code als Data-URL generieren mit optimierten Einstellungen
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // Höhere Fehlerkorrektur für besseres Scannen
    });
    
    return dataUrl;
  } catch (error) {
    console.error("Fehler beim Generieren des QR-Codes:", error);
    return '';
  }
}

/**
 * Callback sofort ausführen ohne zu blockieren
 */
export function ensureQRCodesLoaded(callback: () => void): void {
  // Callback direkt aufrufen
  if (callback) callback();
}
