
/**
 * Generates a mailto: URL with pre-populated fields for visitor checkout
 */
export function generateCheckoutEmailUrl(visitorNumber: number): string {
  const recipient = "besucher@leuka.de";
  const subject = encodeURIComponent("Abmeldung");
  const body = encodeURIComponent(`Guten Tag, der Besucher mit der Nummer ${visitorNumber} verlässt soeben das Haus.`);
  
  return `mailto:${recipient}?subject=${subject}&body=${body}`;
}

// Cache for QR codes to prevent regenerating the same codes
const qrCodeCache: Record<string, string> = {};

/**
 * Generates a QR code as a data URL using the qrcode library
 * Optimized to use pre-cached QR codes when available
 */
export async function generateQRCodeDataUrl(data: string, size: number = 140): Promise<string> {
  // Return from cache if available
  const cacheKey = `${data}-${size}`;
  if (qrCodeCache[cacheKey]) {
    return qrCodeCache[cacheKey];
  }
  
  try {
    // Dynamically import QRCode library
    const QRCode = await import('qrcode');
    
    // Generate QR code as data URL with optimized settings
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H', // Higher error correction for better scanning
      rendererOpts: {
        quality: 0.8 // Slightly reduced quality for faster rendering
      }
    });
    
    // Cache the result
    qrCodeCache[cacheKey] = dataUrl;
    
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return '';
  }
}

/**
 * Pre-loads QR codes for a given list of visitor numbers
 * This helps ensure all QR codes are ready before printing
 */
export async function preloadQRCodes(visitorNumbers: number[]): Promise<void> {
  const promises = visitorNumbers.map(visitorNumber => {
    const checkoutUrl = generateCheckoutEmailUrl(visitorNumber);
    return generateQRCodeDataUrl(checkoutUrl);
  });
  
  await Promise.all(promises);
}

/**
 * Callback executed immediately without blocking
 */
export function ensureQRCodesLoaded(callback: () => void): void {
  // Call callback directly
  if (callback) callback();
}
