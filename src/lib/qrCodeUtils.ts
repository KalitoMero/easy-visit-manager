
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
 * Generates a Google Charts API URL for a QR code
 */
export function generateQRCodeUrl(data: string, size: number = 150): string {
  const encodedData = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedData}&chs=${size}x${size}&choe=UTF-8`;
}
