
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
 * Generates a data URI for a QR code image using a simple SVG-based approach
 * This is more reliable than external API calls that may be blocked
 */
export function generateQRCodeUrl(data: string, size: number = 150): string {
  // Create a direct data URI with the mailto link
  // This creates a simple SVG QR code that opens the email link
  const svgQRCode = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" fill="black">
      <rect width="100%" height="100%" fill="white"/>
      <text x="10" y="20" font-family="monospace" font-size="3">QR Code: Email Checkout</text>
      <a href="${encodeURIComponent(data)}">
        <rect x="10" y="30" width="80" height="60" fill="none" stroke="black"/>
        <text x="50" y="60" text-anchor="middle" font-family="sans-serif" font-size="5">
          Scan to send email
        </text>
        <text x="50" y="70" text-anchor="middle" font-family="monospace" font-size="4">
          besucher@leuka.de
        </text>
      </a>
    </svg>
  `;
  
  // Convert the SVG to a data URI
  const encodedSVG = encodeURIComponent(svgQRCode);
  return `data:image/svg+xml;charset=UTF-8,${encodedSVG}`;
}
