
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
  // We're using dynamic import to avoid SSR issues
  const QRCode = await import('qrcode');
  
  try {
    // Generate QR code as data URL with adjusted default size
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    console.log("QR code generated successfully");
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return '';
  }
}
